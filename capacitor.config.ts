import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.darionacademy.app',
  appName: 'Darion Academy',
  webDir: 'public',
  server: {
    url: 'http://localhost:3001/m/login',
    cleartext: true
  }
};

export default config;
