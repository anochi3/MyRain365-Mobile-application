
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../shared/global.styles';

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
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

/////       <Tabs.Screen
//         name="water"
//         options={{
//           title: 'Water',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="water" size={size} color={color} />
//           ),
//         }}
//       />
//
//       <Tabs.Screen
//         name="quality"
//         options={{
//           title: 'Quality',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons
//               name="flask-outline"
//               size={size}
//               color={color}
//             />
//           ),
//         }}
//       />
//
//       <Tabs.Screen
//         name="costs"
//         options={{
//           title: 'Costs',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons
//               name="cash-outline"
//               size={size}
//               color={color}
//             />
//           ),
//         }}
//       />
//
//       <Tabs.Screen
//         name="compare"
//         options={{
//           title: 'Compare',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons
//               name="swap-horizontal-outline"
//               size={size}
//               color={color}
//             />
//           ),
//         }}
      />
    </Tabs>
  );
}
