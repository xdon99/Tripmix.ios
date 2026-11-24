import { AppTabBar } from '@/src/components/AppTabBar';
import { colors } from '@/src/theme';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Explore' }} />
      <Tabs.Screen name="map" options={{ title: 'Trip Map' }} />
      <Tabs.Screen name="share" options={{ title: 'Pin & Share' }} />
      <Tabs.Screen name="journey" options={{ title: 'My Journey' }} />
    </Tabs>
  );
}
