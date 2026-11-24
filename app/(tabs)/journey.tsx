import { CategoryBadge } from '@/src/components/CategoryBadge';
import { TargetSlider } from '@/src/components/TargetSlider';
import { calculateBudget } from '@/src/logic/budget';
import { nextJourneyDay } from '@/src/logic/categoryStyles';
import { useTripStore } from '@/src/state/Store';
import { colors, radii, spacing } from '@/src/theme';
import { JOURNEY_DAYS } from '@/src/types';
import { BellRing, Check, PlusCircle, Wallet, X } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { state, switchTab, dispatch } = useTripStore();
  const budget = calculateBudget(state);
  const dayItems = state.myJourney.filter((item) => item.day === state.journeyActiveDay);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: 120 + insets.bottom,
        paddingHorizontal: spacing.screenX,
        gap: 20,
      }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Custom Remixed Plan</Text>
          <Text style={styles.title}>My Journey</Text>
        </View>
        <Pressable onPress={() => switchTab('explore')} style={styles.addFeed}>
          <Text style={styles.addFeedText}>+ Add From Feed</Text>
        </Pressable>
      </View>

      <View style={styles.budgetCard}>
        <View style={styles.budgetHead}>
          <View style={styles.budgetHeadLeft}>
            <View style={styles.walletIcon}>
              <Wallet color={colors.emerald700} size={16} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Live Trip Budget</Text>
              <Text style={styles.cardHint}>Auto-calculated from copied stops</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text>
              <Text style={[styles.spent, budget.isOverBudget && { color: colors.rose600 }]}>
                ${budget.totalSpent}
              </Text>
              <Text style={styles.target}> / ${budget.targetBudget}</Text>
            </Text>
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${budget.pct}%`,
                  backgroundColor: budget.isOverBudget ? colors.rose : undefined,
                },
                !budget.isOverBudget && styles.progressOk,
              ]}
            />
          </View>
          <View style={styles.progressMeta}>
            <Text style={[styles.buffer, { color: budget.isOverBudget ? colors.rose600 : colors.emerald600 }]}>
              {budget.isOverBudget
                ? `Over target by $${budget.overBy}`
                : `$${budget.remaining} remaining buffer`}
            </Text>
            <Text style={styles.pct}>{budget.pct}% of target</Text>
          </View>
        </View>

        <View style={styles.adjustRow}>
          <Text style={styles.adjustLabel}>Adjust Target:</Text>
          <TargetSlider
            value={state.targetBudget}
            onChange={(value) => dispatch({ type: 'setTargetBudget', value })}
          />
        </View>

        <View style={styles.catGrid}>
          <MiniPill label="Hotels" value={budget.hotelCost} bg="#EEF2FF" color={colors.indigo} />
          <MiniPill label="Food/Shop" value={budget.foodShopCost} bg="#FFFBEB" color={colors.amber700} />
          <MiniPill label="Activity" value={budget.activityCost} bg="#FFF1F2" color={colors.rose600} />
          <MiniPill label="Add-ons" value={budget.addonsCost} bg="#ECFDF5" color={colors.emerald700} />
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <View style={styles.dayRow}>
          <View style={styles.dayPills}>
            {JOURNEY_DAYS.map((day) => {
              const active = state.journeyActiveDay === day;
              return (
                <Pressable
                  key={day}
                  onPress={() => dispatch({ type: 'setJourneyDay', day })}
                  style={[styles.dayPill, active ? styles.dayActive : styles.dayIdle]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#FFFFFF' : colors.slate600 }}>
                    Day {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={() => dispatch({ type: 'addCustomStop', now: Date.now() })} style={styles.customBtn}>
            <PlusCircle color={colors.indigo} size={14} />
            <Text style={styles.customBtnText}>Custom Stop</Text>
          </Pressable>
        </View>

        {dayItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No stops planned for Day {state.journeyActiveDay} yet.</Text>
            <Pressable onPress={() => switchTab('explore')} style={styles.browseBtn}>
              <Text style={styles.browseBtnText}>Browse & Copy Stops</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {dayItems.map((item) => {
              const nextDay = nextJourneyDay(item.day);
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                    <View style={styles.itemMeta}>
                      <CategoryBadge category={item.category} compact />
                      <Text style={styles.from}>from {item.sourceAuthor}</Text>
                    </View>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemTime}>
                      {item.time}  •  <Text style={styles.itemCost}>${item.cost}</Text>
                    </Text>
                  </View>
                  <View style={styles.itemActions}>
                    <Pressable
                      onPress={() => dispatch({ type: 'moveJourneyItemDay', itemId: item.id })}
                      style={styles.moveBtn}
                      accessibilityLabel={`Move to Day ${nextDay}`}>
                      <Text style={styles.moveBtnText}>→ D{nextDay}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => dispatch({ type: 'removeJourneyItem', itemId: item.id })}
                      style={styles.removeBtn}
                      accessibilityLabel="Remove stop">
                      <X color={colors.rose} size={14} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.reminders}>
        <View style={styles.reminderHead}>
          <View style={styles.bellIcon}>
            <BellRing color={colors.amber600} size={16} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Smart Reminders & Add-ons</Text>
            <Text style={styles.cardHint}>Tap to include essentials in your trip & budget</Text>
          </View>
        </View>
        <View style={{ gap: 8 }}>
          {state.smartReminders.map((rem) => (
            <Pressable
              key={rem.id}
              onPress={() => dispatch({ type: 'toggleReminder', remId: rem.id })}
              style={[styles.remRow, rem.checked ? styles.remOn : styles.remOff]}>
              <View style={styles.remLeft}>
                <View style={[styles.check, rem.checked ? styles.checkOn : styles.checkOff]}>
                  {rem.checked ? <Check color="#FFFFFF" size={14} /> : null}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={[styles.remTitle, rem.checked && { textDecorationLine: 'line-through', opacity: 0.75 }]}
                    numberOfLines={1}>
                    {rem.title}
                  </Text>
                  <Text style={styles.remSub} numberOfLines={1}>
                    {rem.subtitle}
                  </Text>
                </View>
              </View>
              <View style={[styles.remBadge, rem.estCost > 0 ? styles.remCost : styles.remFree]}>
                <Text style={[styles.remBadgeText, { color: rem.estCost > 0 ? colors.slate800 : colors.indigo700 }]}>
                  {rem.estCost > 0 ? `+$${rem.estCost}` : rem.badge}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MiniPill({ label, value, bg, color }: { label: string; value: number; bg: string; color: string }) {
  return (
    <View style={[styles.mini, { backgroundColor: bg }]}>
      <Text style={[styles.miniLabel, { color }]}>{label}</Text>
      <Text style={styles.miniValue}>${value}</Text>
    </View>
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
    color: colors.emerald600,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.slate900, letterSpacing: -0.4 },
  addFeed: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.indigo50,
    borderWidth: 1,
    borderColor: colors.indigo100,
  },
  addFeedText: { fontSize: 12, fontWeight: '700', color: colors.indigo700 },
  budgetCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
    gap: 14,
  },
  budgetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.emerald100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 12, fontWeight: '800', color: colors.slate900 },
  cardHint: { fontSize: 10, color: colors.slate400, marginTop: 1 },
  spent: { fontSize: 18, fontWeight: '800', color: colors.slate900 },
  target: { fontSize: 12, fontWeight: '500', color: colors.slate400 },
  progressTrack: { height: 10, backgroundColor: colors.slate100, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressOk: { backgroundColor: '#10B981' },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  buffer: { fontSize: 10, fontWeight: '600' },
  pct: { fontSize: 10, fontWeight: '600', color: colors.slate400 },
  adjustRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustLabel: { fontSize: 10, fontWeight: '700', color: colors.slate500 },
  catGrid: { flexDirection: 'row', gap: 6, paddingTop: 4 },
  mini: { flex: 1, padding: 8, borderRadius: 12, alignItems: 'center' },
  miniLabel: { fontSize: 9, fontWeight: '600' },
  miniValue: { fontSize: 12, fontWeight: '800', color: colors.slate900, marginTop: 2 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayPills: { flexDirection: 'row', gap: 6 },
  dayPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  dayActive: { backgroundColor: colors.slate900 },
  dayIdle: { backgroundColor: colors.white, borderWidth: 1, borderColor: 'rgba(226,232,240,0.8)' },
  customBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  customBtnText: { fontSize: 12, fontWeight: '700', color: colors.indigo },
  empty: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.slate300,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 12, fontWeight: '600', color: colors.slate500, textAlign: 'center' },
  browseBtn: { backgroundColor: colors.indigo, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  browseBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  from: { fontSize: 10, color: colors.slate400, fontWeight: '500' },
  itemName: { fontSize: 12, fontWeight: '800', color: colors.slate900 },
  itemTime: { fontSize: 10, color: colors.slate500 },
  itemCost: { fontWeight: '700', color: colors.slate800 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moveBtn: { backgroundColor: colors.slate100, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12 },
  moveBtnText: { fontSize: 10, fontWeight: '700', color: colors.slate600 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 12,
    backgroundColor: colors.rose50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminders: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
    gap: 12,
  },
  reminderHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bellIcon: {
    width: 28,
    height: 28,
    borderRadius: 12,
    backgroundColor: colors.amber100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remRow: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  remOn: { backgroundColor: 'rgba(236,253,245,0.6)', borderColor: '#A7F3D0' },
  remOff: { backgroundColor: 'rgba(248,250,252,0.7)', borderColor: 'rgba(226,232,240,0.7)' },
  remLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  check: { width: 20, height: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.emerald },
  checkOff: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.slate300 },
  remTitle: { fontSize: 12, fontWeight: '700', color: colors.slate900 },
  remSub: { fontSize: 10, color: colors.slate500, marginTop: 1 },
  remBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  remCost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.slate200 },
  remFree: { backgroundColor: colors.indigo100 },
  remBadgeText: { fontSize: 10, fontWeight: '800' },
});
