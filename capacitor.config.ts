import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.waypoint.app',
  appName: 'Waypoint',
  webDir: 'public',
  server: {
    url: 'https://waypoint-tasks.vercel.app',
    cleartext: true
  }
};

export default config;
