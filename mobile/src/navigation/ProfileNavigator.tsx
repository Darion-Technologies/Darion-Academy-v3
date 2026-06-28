import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyProfileScreen from '../screens/profile/MyProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MyNotesScreen from '../screens/profile/MyNotesScreen';
import NoteDetailScreen from '../screens/profile/NoteDetailScreen';
import SubscriptionScreen from '../screens/profile/SubscriptionScreen';
import PaymentHistoryScreen from '../screens/profile/PaymentHistoryScreen';
import AppPreferencesScreen from '../screens/profile/AppPreferencesScreen';
import NotificationSettingsScreen from '../screens/profile/NotificationSettingsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import AboutAppScreen from '../screens/profile/AboutAppScreen';

const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyNotes" component={MyNotesScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="AppPreferences" component={AppPreferencesScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="AboutApp" component={AboutAppScreen} />
    </Stack.Navigator>
  );
}
