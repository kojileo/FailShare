import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// Firebase設定を環境変数から取得
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey,
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain,
  projectId: Constants.expoConfig?.extra?.firebase?.projectId,
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.firebase?.appId,
};

// Firebase設定の検証
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('Firebase設定が不完全です。以下の項目を.envファイルで設定してください:');
    missingFields.forEach(field => {
      console.error(`- EXPO_PUBLIC_FIREBASE_${field.toUpperCase().replace(/([A-Z])/g, '_$1')}`);
    });
    throw new Error('Firebase設定が不完全です');
  }
};

// 設定検証の実行
validateFirebaseConfig();

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firebase サービスの初期化
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 