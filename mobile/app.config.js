import 'dotenv/config';

const getConfig = () => {
  const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
  
  const baseConfig = {
    expo: {
      name: getAppName(environment),
      slug: "failshare-mobile",
      version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
      orientation: "portrait",
      icon: getAppIcon(environment),
      userInterfaceStyle: "light",
      newArchEnabled: true,
      splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      platforms: ["ios", "android", "web"],
      assetBundlePatterns: ["**/*"],
      ios: {
        supportsTablet: true,
        bundleIdentifier: getBundleIdentifier(environment)
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff"
        },
        edgeToEdgeEnabled: true,
        package: getPackageName(environment)
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      extra: {
        environment: environment,
        eas: {
          projectId: "4a25afc0-0568-4055-9552-9060554a7bd4"
        },
        firebase: {
          apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        }
      }
    }
  };

  return baseConfig;
};

const getAppName = (environment) => {
  if (environment === 'development') return 'FailShare (Dev)';
  if (environment === 'staging') return 'FailShare (Staging)';
  return 'FailShare';
};

const getAppIcon = (environment) => {
  // For now, use the same icon for all environments
  // You can create different icons later (icon-dev.png, icon-staging.png)
  return './assets/icon.png';
};

const getBundleIdentifier = (environment) => {
  const base = 'com.failshare';
  if (environment === 'development') return `${base}.dev`;
  if (environment === 'staging') return `${base}.staging`;
  return base;
};

const getPackageName = (environment) => {
  const base = 'com.failshare';
  if (environment === 'development') return `${base}.dev`;
  if (environment === 'staging') return `${base}.staging`;
  return base;
};

export default getConfig(); 