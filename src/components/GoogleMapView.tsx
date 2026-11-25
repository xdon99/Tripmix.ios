import { categoryIcons } from '@/src/components/icons';
import { StylizedMapBackground } from '@/src/components/StylizedMap';
import { getCategoryStyle } from '@/src/logic/categoryStyles';
import { boundsForTrip, getGoogleMapsApiKey, latLngToPercent } from '@/src/logic/mapProjection';
import type { PinCoords } from '@/src/types';
import { colors } from '@/src/theme';
import { MapPin } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppWebView } from '@/src/components/AppWebView';
import type { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import {
  buildGoogleMapHtml,
  buildMapUpdateScript,
  parseMapToAppMessage,
  type GoogleMapMarkerInput,
} from './googleMapHtml';

export type GoogleMapViewProps = {
  tripId: string;
  markers: GoogleMapMarkerInput[];
  selectedId?: string | null;
  onSelectMarker?: (id: string) => void;
  interactive?: 'browse' | 'drop-pin';
  dropPin?: PinCoords | null;
  onDropPin?: (coords: PinCoords) => void;
  showRoute?: boolean;
  showLegend?: boolean;
};

export function GoogleMapView({
  tripId,
  markers,
  selectedId = null,
  onSelectMarker,
  interactive = 'browse',
  dropPin = null,
  onDropPin,
  showRoute = false,
  showLegend = false,
}: GoogleMapViewProps) {
  const apiKey = getGoogleMapsApiKey();
  const webRef = useRef<WebView>(null);
  const dropPinMode = interactive === 'drop-pin';
  const state = useMemo(
    () => ({
      tripId,
      markers,
      selectedId,
      dropPinMode,
      dropPin,
      showRoute,
    }),
    [tripId, markers, selectedId, dropPinMode, dropPin, showRoute],
  );
  const initialStateRef = useRef(state);

  const html = useMemo(() => {
    if (!apiKey) return null;
    return buildGoogleMapHtml({ ...initialStateRef.current, apiKey });
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey) return;
    webRef.current?.injectJavaScript(buildMapUpdateScript(state));
  }, [apiKey, state]);

  const onMessage = (event: WebViewMessageEvent) => {
    const message = parseMapToAppMessage(event.nativeEvent.data);
    if (!message) return;
    if (message.type === 'select') {
      onSelectMarker?.(message.id);
      return;
    }
    if (message.type === 'drop') {
      onDropPin?.(latLngToPercent(message, boundsForTrip(tripId)));
    }
  };

  if (!apiKey || !html) {
    return (
      <FallbackMap
        markers={markers}
        selectedId={selectedId}
        onSelectMarker={onSelectMarker}
        dropPinMode={dropPinMode}
        dropPin={dropPin}
        onDropPin={onDropPin}
        showRoute={showRoute}
        showLegend={showLegend}
      />
    );
  }

  return (
    <View style={styles.fill}>
      <AppWebView
        ref={webRef}
        source={{ html, baseUrl: 'https://maps.googleapis.com' }}
        style={styles.fill}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        onMessage={onMessage}
      />
      {showLegend ? <MapLegend /> : null}
    </View>
  );
}

type FallbackProps = {
  markers: GoogleMapMarkerInput[];
  selectedId: string | null;
  onSelectMarker?: (id: string) => void;
  dropPinMode: boolean;
  dropPin: PinCoords | null;
  onDropPin?: (coords: PinCoords) => void;
  showRoute: boolean;
  showLegend: boolean;
};

function FallbackMap({
  markers,
  selectedId,
  onSelectMarker,
  dropPinMode,
  dropPin,
  onDropPin,
  showRoute,
}: FallbackProps) {
  const [mapSize, setMapSize] = useState({ width: 1, height: 1 });
  const routePoints = showRoute
    ? markers.map((stop) => `${stop.x * 4},${stop.y * 2.4}`).join(' ')
    : undefined;
  const viewBox = dropPinMode ? '0 0 400 160' : '0 0 400 240';

  const body = (
    <>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <StylizedMapBackground viewBox={viewBox} routePoints={routePoints} />
      </View>
      {markers.map((stop, index) => {
        const style = getCategoryStyle(stop.category);
        const Icon = categoryIcons[style.icon];
        const selected = selectedId === stop.id;
        return (
          <Pressable
            key={stop.id}
            onPress={() => onSelectMarker?.(stop.id)}
            style={[styles.pin, { left: `${stop.x}%`, top: `${stop.y}%` }]}>
            <View
              style={[
                styles.pinBubble,
                { backgroundColor: style.pinBg },
                selected && { transform: [{ scale: 1.25 }], borderWidth: 4, borderColor: style.ring },
              ]}>
              <Text style={styles.pinIndex}>{index + 1}</Text>
              <Icon color="#FFFFFF" size={12} />
            </View>
            <View style={styles.pinLabel}>
              <Text style={styles.pinLabelText} numberOfLines={1}>
                {stop.name}
              </Text>
            </View>
          </Pressable>
        );
      })}
      {dropPinMode && dropPin ? (
        <View
          pointerEvents="none"
          style={[styles.userPin, { left: `${dropPin.x}%`, top: `${dropPin.y}%` }]}>
          <View style={styles.userPinBubble}>
            <MapPin color="#FFFFFF" size={12} />
            <Text style={styles.userPinText}>Pinned Here</Text>
          </View>
          <View style={styles.userPinTip} />
        </View>
      ) : null}
      <View style={styles.banner} pointerEvents="none">
        <Text style={styles.bannerText}>
          {dropPinMode
            ? 'Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to show Google Maps. You can still drop a pin here.'
            : 'Google Maps needs a Maps JavaScript API key in EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. Pin actions still work on this stand-in map until a key is added.'}
        </Text>
      </View>
    </>
  );

  if (!dropPinMode) {
    return <View style={styles.fill}>{body}</View>;
  }

  return (
    <Pressable
      style={styles.fill}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setMapSize({ width, height });
      }}
      onPress={(event) => {
        const { locationX, locationY } = event.nativeEvent;
        onDropPin?.({
          x: (locationX / mapSize.width) * 100,
          y: (locationY / mapSize.height) * 100,
        });
      }}>
      {body}
    </Pressable>
  );
}

function MapLegend() {
  return (
    <View style={styles.legend}>
      <LegendDot color={colors.indigo} label="Hotel" />
      <LegendDot color={colors.amber500} label="Shop/Food" />
      <LegendDot color={colors.rose} label="Activity" />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  legend: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.84)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    flexDirection: 'row',
    gap: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 9, fontWeight: '700', color: colors.slate700 },
  pin: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -24 }, { translateY: -18 }],
    zIndex: 10,
  },
  pinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pinIndex: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  pinLabel: {
    marginTop: 2,
    backgroundColor: 'rgba(15,23,42,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 84,
  },
  pinLabelText: { color: '#FFFFFF', fontSize: 9, fontWeight: '600' },
  userPin: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -40 }, { translateY: -28 }],
    zIndex: 10,
  },
  userPinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.indigo,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  userPinText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  userPinTip: {
    width: 8,
    height: 8,
    backgroundColor: colors.indigo,
    transform: [{ rotate: '45deg' }, { translateY: -4 }],
  },
  banner: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 10,
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 15,
  },
  bannerText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600', lineHeight: 14 },
});
