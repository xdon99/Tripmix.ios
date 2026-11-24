import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Compass, Map, Plus } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTripStore } from '../state/Store';
import { colors } from '../theme';
import type { TabName } from '../types';

type TabRoute = { key: string; name: string };

type AppTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigateToTab: (routeKey: string) => void;
};


const ITEMS: { name: string; tab: TabName; label: string }[] = [
  { name: 'index', tab: 'explore', label: 'Explore' },
  { name: 'map', tab: 'mapview', label: 'Trip Map' },
  { name: 'share', tab: 'share', label: 'Pin & Share' },
  { name: 'journey', tab: 'journey', label: 'My Journey' },
];

export function AppTabBar({ state, navigateToTab }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const { state: appState, switchTab } = useTripStore();
  const bottomPad = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPad }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
      )}
      <View style={styles.row}>
        {ITEMS.map((item) => {
          const route = state.routes.find((entry) => entry.name === item.name);
          const focused = route ? state.routes[state.index]?.key === route.key : false;
          const color = item.tab === 'share' ? colors.slate500 : focused ? colors.indigo : colors.slate400;

          return (
            <Pressable
              key={item.name}
              onPress={() => {
                switchTab(item.tab);
                if (route) {
                  navigateToTab(route.key);
                }
              }}
              style={[styles.item, item.tab === 'share' && styles.shareItem]}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={item.label}>
              {item.tab === 'share' ? (
                <>
                  <LinearGradient
                    colors={['#4F46E5', '#8B5CF6']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shareBtn}>
                    <Plus color="#FFFFFF" size={24} strokeWidth={2.4} />
                  </LinearGradient>
                  <Text style={[styles.label, { color: colors.slate500, marginTop: 4 }]}>{item.label}</Text>
                </>
              ) : (
                <>
                  <View>
                    {item.tab === 'explore' ? (
                      <Compass color={color} size={20} />
                    ) : item.tab === 'mapview' ? (
                      <Map color={color} size={20} />
                    ) : (
                      <Briefcase color={color} size={20} />
                    )}
                    {item.tab === 'journey' ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{appState.myJourney.length}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.label, { color }]}>{item.label}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(226,232,240,0.8)',
    backgroundColor: colors.glass,
    paddingTop: 8,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  shareItem: {
    top: -10,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
