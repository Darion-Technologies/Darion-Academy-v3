import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { zustandStorage } from './storage';
import {
  registerForPushNotifications,
  registerTokenWithServer,
  unregisterTokenFromServer,
} from '../services/notifications';

interface AuthState {
  userToken: string | null;
  isLoading: boolean;
  expoPushToken: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userToken: null,
      isLoading: true,
      expoPushToken: null,

      loadToken: async () => {
        try {
          const token = await SecureStore.getItemAsync('userToken');
          if (token) {
            set({ userToken: token });
            const pushToken = await registerForPushNotifications();
            if (pushToken) {
              set({ expoPushToken: pushToken });
              await registerTokenWithServer(pushToken);
            }
          }
        } catch (e) {
          console.error('Failed to load token', e);
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (token: string) => {
        try {
          await SecureStore.setItemAsync('userToken', token);
          set({ userToken: token });
          const pushToken = await registerForPushNotifications();
          if (pushToken) {
            set({ expoPushToken: pushToken });
            await registerTokenWithServer(pushToken);
          }
        } catch (e) {
          console.error('Failed to save token', e);
        }
      },

      logout: async () => {
        try {
          const { expoPushToken } = get();
          if (expoPushToken) {
            await unregisterTokenFromServer(expoPushToken);
            set({ expoPushToken: null });
          }
          await SecureStore.deleteItemAsync('userToken');
          set({ userToken: null });
        } catch (e) {
          console.error('Failed to delete token', e);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ userToken: state.userToken, expoPushToken: state.expoPushToken }),
    }
  )
);
