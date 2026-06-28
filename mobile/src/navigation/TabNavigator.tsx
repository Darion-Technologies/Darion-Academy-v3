import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import DashboardScreen from '../screens/DashboardScreen';
import CoursesScreen from '../screens/CoursesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const isDark = useColorScheme() === 'dark';
  const theme = {
    bg: isDark ? '#18181b' : '#ffffff',
    border: isDark ? '#27272a' : '#e4e4e7',
    active: '#0ea5e9',
    inactive: isDark ? '#71717a' : '#a1a1aa',
  };

  const hapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarButton: (props) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
            style={({ pressed }) => [
              props.style,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Courses') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} listeners={{ tabPress: hapticFeedback }} />
      <Tab.Screen name="Courses" component={CoursesScreen} listeners={{ tabPress: hapticFeedback }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} listeners={{ tabPress: hapticFeedback }} />
      <Tab.Screen name="Profile" component={ProfileScreen} listeners={{ tabPress: hapticFeedback }} />
    </Tab.Navigator>
  );
}
