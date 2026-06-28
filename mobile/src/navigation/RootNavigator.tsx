import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import InstructorNavigator from './InstructorNavigator';

// Modals
import DailyGoalModal from '../screens/dashboard/DailyGoalModal';
import NoteTakerModal from '../screens/learn/NoteTakerModal';
import CertificateShareModal from '../screens/learn/CertificateShareModal';

import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { userToken, isLoading, loadToken } = useAuthStore();

  React.useEffect(() => {
    loadToken();
  }, [loadToken]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#09090b" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken == null ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Instructor" component={InstructorNavigator} />
          
          {/* Modals are full screen and animated from bottom */}
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="DailyGoalModal" component={DailyGoalModal} />
            <Stack.Screen name="NoteTakerModal" component={NoteTakerModal} />
            <Stack.Screen name="CertificateShareModal" component={CertificateShareModal} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
