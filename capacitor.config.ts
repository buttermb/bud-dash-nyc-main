import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.65e491242bb14ef2904b5dcf255784da',
  appName: 'bud-dash-nyc',
  webDir: 'dist',
  server: {
    url: 'https://65e49124-2bb1-4ef2-904b-5dcf255784da.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      enableBackgroundLocation: true
    }
  }
};

export default config;
