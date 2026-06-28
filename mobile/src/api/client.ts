import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { DeviceEventEmitter } from 'react-native';

// Dynamically determine the backend URL based on the Expo bundler's IP address
// This ensures physical devices on the same Wi-Fi can reach the laptop's Next.js server.
const hostUri = Constants.expoConfig?.hostUri;
export const localIp = hostUri ? hostUri.split(':')[0] : '127.0.0.1';

export const NEXT_JS_URL = `http://${localIp}:3001`;

export const apiClient = axios.create({
  baseURL: NEXT_JS_URL,
  timeout: 15000, // 15s — server makes multiple DB round-trips
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to inject the JWT token on every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error reading token from SecureStore:', error);
  }
  return config;
});

// Intercept responses:
// 1. Retry network-level failures (ECONNABORTED, ECONNRESET, timeout, "Network Error")
//    up to 2 times with 500ms / 1000ms backoff. These are transient LAN issues.
// 2. Emit logout event on 401.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    const isNetworkError =
      !error.response && (
        error.code === 'ECONNABORTED' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ERR_NETWORK' ||
        error.message === 'Network Error'
      );

    if (isNetworkError && config && (config._retryCount ?? 0) < 2) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      const delay = config._retryCount * 500;
      console.warn(`[API] Network error, retrying (attempt ${config._retryCount})...`);
      await new Promise((r) => setTimeout(r, delay));
      return apiClient(config);
    }

    if (error.response?.status === 401) {
      console.warn('API returned 401 Unauthorized. Triggering logout.');
      DeviceEventEmitter.emit('onUnauthorized');
    }

    return Promise.reject(error);
  }
);

