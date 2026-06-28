import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';

// How foreground notifications look while the app is open
if (Constants.appOwnership !== 'expo') {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    // Ignore require error if package is missing
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (Constants.appOwnership === 'expo') {
    console.warn('Push notifications are not supported in Expo Go (SDK 53+). Please use a development build.');
    return null;
  }

  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices.');
    return null;
  }

  // Ask for permission
  const Notifications = require('expo-notifications');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission denied.');
    return null;
  }

  // Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Darion Academy',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1e88e5',
    });
  }

  try {
    // In Expo Go, projectId is auto-detected.
    // For standalone/EAS builds it reads from app.json extra.eas.projectId.
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (err) {
    console.error('Failed to get Expo push token:', err);
    return null;
  }
}

export async function registerTokenWithServer(token: string): Promise<void> {
  try {
    await apiClient.post('/api/mobile/push-token', { token });
  } catch (err) {
    console.error('Failed to register push token:', err);
  }
}

export async function unregisterTokenFromServer(token: string): Promise<void> {
  try {
    await apiClient.delete('/api/mobile/push-token', { data: { token } });
  } catch (err) {
    console.error('Failed to unregister push token:', err);
  }
}
