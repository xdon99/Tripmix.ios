import { BadgeCheck, CopyPlus, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../theme';
import type { Trip } from '../types';

type Props = {
  trip: Trip;
  onPress: () => void;
};

export function TripCard({ trip, onPress }: Props) {
  const [coverFailed, setCoverFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const coverFallback = `https://placehold.co/600x360/4f46e5/ffffff?text=${encodeURIComponent(trip.title)}`;
  const avatarFallback = 'https://placehold.co/80x80/e2e8f0/475569?text=User';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }] }]}>
      <View style={styles.coverWrap}>
        <Image
          source={{ uri: coverFailed ? coverFallback : trip.cover }}
          onError={() => setCoverFailed(true)}
          style={styles.cover}
        />
        <View style={styles.coverShade} />
        <View style={styles.topBadges}>
          <View style={styles.glassPill}>
            <Text style={styles.glassPillText}>
              {trip.days} Days • {trip.stops.length} Pinned Stops
            </Text>
          </View>
          <View style={styles.budgetPill}>
            <Text style={styles.budgetPillText}>~${trip.totalBudget}</Text>
          </View>
        </View>
        <View style={styles.titleOverlay}>
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {trip.subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.authorRow}>
          <Image
            source={{ uri: avatarFailed ? avatarFallback : trip.avatar }}
            onError={() => setAvatarFailed(true)}
            style={styles.avatar}
          />
          <View>
            <View style={styles.authorName}>
              <Text style={styles.author}>{trip.author}</Text>
              <BadgeCheck color={colors.indigo} size={14} />
            </View>
            <Text style={styles.city}>{trip.cityLabel}</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <View style={styles.ratingChip}>
            <Star color={colors.amber400} fill={colors.amber400} size={12} />
            <Text style={styles.ratingText}>{trip.rating}</Text>
          </View>
          <View style={styles.remixChip}>
            <CopyPlus color={colors.indigo} size={12} />
            <Text style={styles.remixText}>{trip.remixes}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.7)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  coverWrap: {
    height: 176,
    backgroundColor: colors.slate200,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2,6,23,0.28)',
  },
  topBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassPill: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  glassPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate900,
  },
  budgetPill: {
    backgroundColor: colors.emerald,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  budgetPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  titleOverlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  subtitle: {
    color: '#E2E8F0',
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate200,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  authorName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  author: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
  },
  city: {
    fontSize: 10,
    color: colors.slate400,
    marginTop: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.amber50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.amber600,
  },
  remixChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.indigo50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  remixText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.indigo,
  },
});
