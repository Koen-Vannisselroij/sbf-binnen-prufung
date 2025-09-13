import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.sbfbinnen',
  appName: 'sbf-binnen-trainer',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;

