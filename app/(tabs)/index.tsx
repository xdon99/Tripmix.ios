import { TripCard } from '@/src/components/TripCard';
import { filterTrips } from '@/src/logic/explore';
import { useTripStore } from '@/src/state/Store';
import { colors, spacing } from '@/src/theme';
import { CATEGORY_FILTERS } from '@/src/types';
import { LinearGradient } from 'expo-linear-gradient';
import { GitFork, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { state, switchTab, openItinerary, dispatch } = useTripStore();
  const [query, setQuery] = useState('');
  const trips = useMemo(
    () => filterTrips(state.trips, state.selectedCategoryFilter, query),
    [state.trips, state.selectedCategoryFilter, query],
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: 120 + insets.bottom,
        paddingHorizontal: spacing.screenX,
        gap: 20,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Tripmix Social</Text>
          <Text style={styles.title}>Explore Trips</Text>
        </View>
        <Pressable onPress={() => switchTab('journey')} style={styles.myTripBtn}>
          <View style={styles.liveDot} />
          <Text style={styles.myTripText}>My Trip ({state.myJourney.length})</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Search color={colors.slate400} size={16} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Tokyo, hotels, ramen, hidden bars..."
          placeholderTextColor={colors.slate400}
          style={styles.search}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        {CATEGORY_FILTERS.map((cat) => {
          const active = state.selectedCategoryFilter === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => dispatch({ type: 'setCategoryFilter', filter: cat })}
              style={[styles.pill, active ? styles.pillActive : styles.pillIdle]}>
              <Text style={[styles.pillText, { color: active ? '#FFFFFF' : colors.slate600 }]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.bannerKicker}>
            <GitFork color="#C7D2FE" size={14} />
            <Text style={styles.bannerKickerText}>Mix & Match Mode</Text>
          </View>
          <Text style={styles.bannerBody}>
            Tap any shared itinerary to cherry-pick hotels, shops & spots into your own trip.
          </Text>
        </View>
        <Pressable onPress={() => openItinerary('tokyo')} style={styles.tryBtn}>
          <Text style={styles.tryBtnText}>Try It</Text>
        </Pressable>
      </LinearGradient>

      <View style={{ gap: 16 }}>
        {trips.length === 0 ? (
          <Text style={styles.empty}>No matching trips or spots found.</Text>
        ) : (
          trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onPress={() => openItinerary(trip.id)} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.indigo,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.slate900,
    letterSpacing: -0.4,
  },
  myTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.emerald,
  },
  myTripText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate700,
  },
  searchWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  search: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
    borderRadius: 16,
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 10,
    fontSize: 12,
    color: colors.slate800,
  },
  pills: {
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: colors.slate900,
  },
  pillIdle: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.7)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  banner: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerKicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerKickerText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  bannerBody: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  tryBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tryBtnText: {
    color: colors.indigo700,
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 32,
    fontSize: 12,
    color: colors.slate400,
  },
});
