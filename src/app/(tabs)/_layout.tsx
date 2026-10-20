/** Bottom tab bar from the Figma: Locate, Results, My tank, Alerts, Settings (filled icon when active). */
import { Tabs } from 'expo-router';
import {
  Bell,
  ChartBar,
  DropHalfBottom,
  GearSix,
  MapTrifold,
  type Icon,
} from 'phosphor-react-native';
import type { ColorValue } from 'react-native';

import { colors, fonts } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

type TabBarIconProps = {
  color: ColorValue;
  size: number;
  focused: boolean;
};

function tabIcon(IconComponent: Icon) {
  return function TabBarIcon({ color, focused }: TabBarIconProps) {
    return <IconComponent size={24} color={String(color)} weight={focused ? 'fill' : 'regular'} />;
  };
}

export default function TabLayout() {
  const { s } = useI18n();

  return (
    <Tabs
      initialRouteName="results"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.buttons,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.cardBorder,
          height: 76,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.medium,
        },
      }}
    >
      <Tabs.Screen
        name="building"
        options={{ title: s.tabs.locate, tabBarIcon: tabIcon(MapTrifold) }}
      />
      <Tabs.Screen
        name="results"
        options={{ title: s.tabs.results, tabBarIcon: tabIcon(ChartBar) }}
      />
      <Tabs.Screen
        name="tank"
        options={{ title: s.tabs.tank, tabBarIcon: tabIcon(DropHalfBottom) }}
      />
      <Tabs.Screen name="alerts" options={{ title: s.tabs.alerts, tabBarIcon: tabIcon(Bell) }} />
      <Tabs.Screen
        name="settings"
        options={{ title: s.tabs.settings, tabBarIcon: tabIcon(GearSix) }}
      />
    </Tabs>
  );
}
