import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardHomeScreen from '../screens/dashboard/DashboardHomeScreen';
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import TaskDetailScreen from '../screens/dashboard/TaskDetailScreen';
import ActivityHistoryScreen from '../screens/dashboard/ActivityHistoryScreen';
import GlobalSearchScreen from '../screens/dashboard/GlobalSearchScreen';

const Stack = createNativeStackNavigator();

export default function DashboardNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardHomeScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
      <Stack.Screen name="GlobalSearch" component={GlobalSearchScreen} />
    </Stack.Navigator>
  );
}
