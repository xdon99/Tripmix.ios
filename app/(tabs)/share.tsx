import { categoryIcons } from '@/src/components/icons';
import { StylizedMapBackground } from '@/src/components/StylizedMap';
import { useTripStore } from '@/src/state/Store';
import { colors, radii, spacing } from '@/src/theme';
import { SPOT_CATEGORIES } from '@/src/types';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Send, Star, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const { state, switchTab, dispatch } = useTripStore();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('45');
  const [review, setReview] = useState('');
  const [mapSize, setMapSize] = useState({ width: 1, height: 1 });

  const onMapPress = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const x = (locationX / mapSize.width) * 100;
    const y = (locationY / mapSize.height) * 100;
    dispatch({ type: 'dropPin', x, y });
  };

  const onPublish = () => {
    if (!name.trim() || !review.trim()) return;
    const parsed = Number(cost);
    dispatch({
      type: 'publishNewSpot',
      name,
      cost: Number.isFinite(parsed) ? parsed : 0,
      review,
      now: Date.now(),
    });
    setName('');
    setCost('45');
    setReview('');
    switchTab('mapview');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: 120 + insets.bottom,
        paddingHorizontal: spacing.screenX,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Contribute to Community</Text>
          <Text style={styles.title}>Pin & Review Spot</Text>
        </View>
        <Pressable onPress={() => switchTab('explore')} style={styles.closeBtn} accessibilityLabel="Close">
          <X color={colors.slate600} size={16} />
        </Pressable>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={styles.step}>1. Spot Category</Text>
        <View style={styles.catRow}>
          {SPOT_CATEGORIES.map((cat) => {
            const active = state.newReviewCategory === cat.id;
            const Icon = categoryIcons[cat.icon];
            return (
              <Pressable
                key={cat.id}
                onPress={() => dispatch({ type: 'setReviewCategory', category: cat.id })}
                style={[styles.catBtn, active ? styles.catActive : styles.catIdle]}>
                <Icon color={active ? '#FFFFFF' : colors.slate600} size={16} />
                <Text style={[styles.catLabel, { color: active ? '#FFFFFF' : colors.slate600 }]}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <View style={styles.stepRow}>
          <Text style={styles.step}>2. Tap Map to Drop Pin</Text>
          <Text style={styles.coords}>
            Lat 35.{state.newPinCoords.y}°, Lon 139.{state.newPinCoords.x}°
          </Text>
        </View>
        <Pressable
          onPress={onMapPress}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setMapSize({ width, height });
          }}
          style={styles.map}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <StylizedMapBackground viewBox="0 0 400 160" />
          </View>
          <View
            pointerEvents="none"
            style={[
              styles.userPin,
              { left: `${state.newPinCoords.x}%`, top: `${state.newPinCoords.y}%` },
            ]}>
            <View style={styles.userPinBubble}>
              <MapPin color="#FFFFFF" size={12} />
              <Text style={styles.userPinText}>Pinned Here</Text>
            </View>
            <View style={styles.userPinTip} />
          </View>
        </Pressable>
      </View>

      <View style={styles.form}>
        <View>
          <Text style={styles.fieldLabel}>Place / Hotel / Activity Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Park Hyatt Rooftop Bar or Ichiran Shibuya"
            placeholderTextColor={colors.slate400}
            style={styles.input}
          />
        </View>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Estimated Cost ($)</Text>
            <TextInput
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
              style={[styles.input, { fontWeight: '700' }]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Your Rating</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= state.newReviewRating;
                return (
                  <Pressable
                    key={star}
                    onPress={() => dispatch({ type: 'setReviewRating', rating: star })}
                    accessibilityLabel={`Rate ${star} stars`}>
                    <Star
                      size={20}
                      color={filled ? colors.amber400 : colors.slate300}
                      fill={filled ? colors.amber400 : 'transparent'}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>Your Review & Insider Tips</Text>
          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Share what to order, best time to visit, or room tips..."
            placeholderTextColor={colors.slate400}
            style={[styles.input, { minHeight: 64, textAlignVertical: 'top' }]}
            multiline
          />
        </View>

        <Pressable onPress={onPublish}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.publish}>
            <Send color="#FFFFFF" size={14} />
            <Text style={styles.publishText}>Publish Pin & Share to Community</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.indigo,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.slate900, letterSpacing: -0.4 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(226,232,240,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  coords: { fontSize: 10, fontWeight: '600', color: colors.indigo },
  catRow: { flexDirection: 'row', gap: 8 },
  catBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  catActive: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  catIdle: { backgroundColor: colors.white, borderColor: 'rgba(226,232,240,0.8)' },
  catLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  map: {
    height: 144,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate300,
    backgroundColor: colors.mapBase,
  },
  userPin: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -40 }, { translateY: -28 }],
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
  form: {
    backgroundColor: colors.white,
    borderRadius: radii.cardLg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
    gap: 14,
  },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: colors.slate600, marginBottom: 4 },
  input: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    fontSize: 12,
    color: colors.slate800,
  },
  row2: { flexDirection: 'row', gap: 12 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 },
  publish: {
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  publishText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
