import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { colors } from '@/shared/global.styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

type TabBarIconProps = {
  color: ColorValue;
  size: number;
  focused: boolean;
};

function tabIcon(active: IconName, inactive: IconName) {
  return function TabBarIcon({ color, size, focused }: TabBarIconProps) {
    return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
  };
}

export default function TabLayout() {
  return (
    <Tabs
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
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Overview', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="building"
        options={{ title: 'Locate', tabBarIcon: tabIcon('map', 'map-outline') }}
      />
    </Tabs>
  );
}
