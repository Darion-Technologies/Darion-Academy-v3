import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import InstructorDashboardScreen from '../screens/instructor/InstructorDashboardScreen';
import CourseManagementScreen from '../screens/instructor/CourseManagementScreen';
import QAInboxScreen from '../screens/instructor/QAInboxScreen';
import ReplyQAScreen from '../screens/instructor/ReplyQAScreen';
import AnnouncementCreateScreen from '../screens/instructor/AnnouncementCreateScreen';

const Stack = createNativeStackNavigator();

export default function InstructorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InstructorDashboard" component={InstructorDashboardScreen} />
      <Stack.Screen name="CourseManagement" component={CourseManagementScreen} />
      <Stack.Screen name="QAInbox" component={QAInboxScreen} />
      <Stack.Screen name="ReplyQA" component={ReplyQAScreen} />
      <Stack.Screen name="AnnouncementCreate" component={AnnouncementCreateScreen} />
    </Stack.Navigator>
  );
}
