import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme, Pressable } from 'react-native';
import { HapticEvent } from '../utils/haptics';

import DashboardNavigator from './DashboardNavigator';
import LearnNavigator from './LearnNavigator';
import SocialNavigator from './SocialNavigator';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const isDark = useColorScheme() === 'dark';
  const theme = {
    bg: isDark ? '#18181b' : '#ffffff',
    border: isDark ? '#27272a' : '#e4e4e7',
    active: '#0ea5e9',
    inactive: isDark ? '#71717a' : '#a1a1aa',
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
          
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'LearnTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'SocialTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardNavigator} options={{ title: 'Home' }} listeners={{ tabPress: () => HapticEvent.tabPress() }} />
      <Tab.Screen name="LearnTab" component={LearnNavigator} options={{ title: 'Learn' }} listeners={{ tabPress: () => HapticEvent.tabPress() }} />
      <Tab.Screen name="SocialTab" component={SocialNavigator} options={{ title: 'Chat' }} listeners={{ tabPress: () => HapticEvent.tabPress() }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Profile' }} listeners={{ tabPress: () => HapticEvent.tabPress() }} />
    </Tab.Navigator>
  );
}
