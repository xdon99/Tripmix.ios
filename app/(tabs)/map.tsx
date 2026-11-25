import { CategoryBadge } from '@/src/components/CategoryBadge';
import { GoogleMapView } from '@/src/components/GoogleMapView';
import { tripPreviewLabel } from '@/src/logic/explore';
import { useTripStore } from '@/src/state/Store';
import { colors, spacing } from '@/src/theme';
import { ChevronLeft, Copy, Crosshair, Plus, CheckCircle2, Star } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TripMapScreen() {
  const insets = useSafeAreaInsets();
  const { state, switchTab, dispatch } = useTripStore();
  const trip = state.trips.find((item) => item.id === state.selectedTripId) ?? state.trips[0];
  if (!trip) return null;
  const activePin = trip.stops.find((stop) => stop.id === state.selectedMapPinId);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: 120 + insets.bottom }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.nav}>
        <Pressable onPress={() => switchTab('explore')} style={styles.backBtn} accessibilityLabel="Back to Explore">
          <ChevronLeft color={colors.slate700} size={20} />
        </Pressable>
        <View style={styles.navTitle}>
          <Text style={styles.title} numberOfLines={1}>
            {trip.title}
          </Text>
          <Text style={styles.subtitle}>
            by {trip.authorHandle} • {trip.days} Days
          </Text>
        </View>
        <Pressable onPress={() => dispatch({ type: 'copyFullTrip', tripId: trip.id })} style={styles.copyAll}>
          <Copy color="#FFFFFF" size={12} />
          <Text style={styles.copyAllText}>Copy All</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tripPills}>
        {state.trips.map((item) => {
          const active = item.id === trip.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => dispatch({ type: 'selectTrip', tripId: item.id })}
              style={[styles.tripPill, active ? styles.tripPillActive : styles.tripPillIdle]}>
              <Text style={[styles.tripPillText, { color: active ? colors.indigo700 : colors.slate500 }]}>
                {tripPreviewLabel(item.title)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.map}>
        <GoogleMapView
          tripId={trip.id}
          markers={trip.stops}
          selectedId={state.selectedMapPinId}
          onSelectMarker={(stopId) => dispatch({ type: 'selectMapPin', stopId })}
          showRoute
          showLegend
        />
        {activePin ? (
          <View style={styles.popover}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.popoverTitleRow}>
                <Text style={styles.popoverName} numberOfLines={1}>
                  {activePin.name}
                </Text>
                <View style={styles.costChip}>
                  <Text style={styles.costChipText}>${activePin.cost}</Text>
                </View>
              </View>
              <Text style={styles.popoverReview} numberOfLines={1}>
                {activePin.review}
              </Text>
            </View>
            <Pressable
              onPress={() => dispatch({ type: 'copyStopToJourney', tripId: trip.id, stopId: activePin.id })}
              style={styles.remixBtn}>
              <Text style={styles.remixBtnText}>+ Remix</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.list}>
        <View style={styles.listHeader}>
          <Text style={styles.listKicker}>Pinned Spots & Reviews</Text>
          <Text style={styles.listHint}>Tap + to copy to Day {state.journeyActiveDay}</Text>
        </View>
        {trip.stops.map((stop) => {
          const copied = state.myJourney.some((item) => item.id === stop.id);
          const selected = state.selectedMapPinId === stop.id;
          return (
            <View key={stop.id} style={[styles.stopCard, selected && styles.stopCardSelected]}>
              <View style={styles.stopTop}>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.stopMeta}>
                    <CategoryBadge category={stop.category} />
                    <Text style={styles.stopWhen}>
                      Day {stop.day} • {stop.time}
                    </Text>
                  </View>
                  <Text style={styles.stopName}>{stop.name}</Text>
                </View>
                <View style={styles.stopCostCol}>
                  <Text style={styles.stopCost}>${stop.cost}</Text>
                  <View style={styles.ratingRow}>
                    <Star color={colors.amber400} fill={colors.amber400} size={12} />
                    <Text style={styles.rating}>{stop.rating}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.reviewBox}>
                <Text style={styles.reviewText}>“{stop.review}”</Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => dispatch({ type: 'selectMapPin', stopId: stop.id })}
                  style={styles.highlightBtn}>
                  <Crosshair color={colors.slate500} size={14} />
                  <Text style={styles.highlightText}>Highlight Pin</Text>
                </Pressable>
                <Pressable
                  onPress={() => dispatch({ type: 'copyStopToJourney', tripId: trip.id, stopId: stop.id })}
                  style={[styles.copyBtn, copied ? styles.copyBtnDone : styles.copyBtnFresh]}>
                  {copied ? (
                    <CheckCircle2 color="#047857" size={14} />
                  ) : (
                    <Plus color="#FFFFFF" size={14} />
                  )}
                  <Text style={[styles.copyBtnText, { color: copied ? '#047857' : '#FFFFFF' }]}>
                    {copied ? 'Copied to My Trip' : 'Remix to My Trip'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  nav: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { flex: 1, minWidth: 0, alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '800', color: colors.slate900 },
  subtitle: { fontSize: 10, color: colors.slate500, marginTop: 1 },
  copyAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.indigo,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  copyAllText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  tripPills: { paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  tripPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  tripPillActive: { backgroundColor: colors.indigo100, borderColor: '#C7D2FE' },
  tripPillIdle: { backgroundColor: colors.white, borderColor: 'rgba(226,232,240,0.6)' },
  tripPillText: { fontSize: 11, fontWeight: '600' },
  map: {
    marginHorizontal: 16,
    height: 224,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    backgroundColor: colors.mapBase,
  },
  popover: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  popoverTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  popoverName: { fontSize: 12, fontWeight: '800', color: colors.slate900, flexShrink: 1 },
  costChip: { backgroundColor: colors.emerald100, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  costChipText: { fontSize: 10, fontWeight: '700', color: colors.emerald700 },
  popoverReview: { fontSize: 10, color: colors.slate600, marginTop: 2 },
  remixBtn: {
    backgroundColor: colors.indigo,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  remixBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  list: { paddingHorizontal: spacing.screenX - 4, paddingTop: 16, gap: 12 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listKicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.slate500,
  },
  listHint: { fontSize: 11, fontWeight: '600', color: colors.indigo },
  stopCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
    gap: 10,
  },
  stopCardSelected: { borderColor: '#818CF8', borderWidth: 1, shadowColor: colors.indigo, shadowOpacity: 0.12 },
  stopTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  stopMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  stopWhen: { fontSize: 10, fontWeight: '600', color: colors.slate400 },
  stopName: { fontSize: 14, fontWeight: '800', color: colors.slate900 },
  stopCostCol: { alignItems: 'flex-end' },
  stopCost: { fontSize: 14, fontWeight: '800', color: colors.slate900 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  rating: { fontSize: 10, fontWeight: '700', color: colors.amber500 },
  reviewBox: {
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate100,
    borderRadius: 12,
    padding: 10,
  },
  reviewText: { fontSize: 12, color: colors.slate600, lineHeight: 18 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  highlightBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  highlightText: { fontSize: 11, fontWeight: '600', color: colors.slate500 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  copyBtnFresh: { backgroundColor: colors.indigo },
  copyBtnDone: { backgroundColor: colors.emerald50, borderWidth: 1, borderColor: '#A7F3D0' },
  copyBtnText: { fontSize: 12, fontWeight: '700' },
});
