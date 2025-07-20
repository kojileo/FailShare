import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// Firebase設定を環境変数から取得（Web環境対応）
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebase?.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebase?.appId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// 🐛 Debug: 環境情報をコンソールに出力
console.log('🔧 Firebase Environment Debug Info:');
console.log('  Environment:', process.env.EXPO_PUBLIC_ENVIRONMENT);
console.log('  App ID:', firebaseConfig.appId);
console.log('  Project ID:', firebaseConfig.projectId);
console.log('  Firebase Config Valid:', !!firebaseConfig.apiKey);
console.log('=====================================');

// 🛠️ 開発環境での匿名ユーザー管理
if (process.env.EXPO_PUBLIC_ENVIRONMENT === 'development') {
  // 5秒後に統計表示（初期化完了を待つ）
  setTimeout(async () => {
    try {
      const { getAnonymousUserStats } = await import('./authService');
      await getAnonymousUserStats();
    } catch (error) {
      console.error('開発環境統計取得エラー:', error);
    }
  }, 5000);
}

// Firebase設定の検証
const validateFirebaseConfig = () => {
  const requiredFields = [
    { key: 'apiKey', envVar: 'EXPO_PUBLIC_FIREBASE_API_KEY' },
    { key: 'authDomain', envVar: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN' },
    { key: 'projectId', envVar: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID' },
    { key: 'appId', envVar: 'EXPO_PUBLIC_FIREBASE_APP_ID' }
  ];
  
  const missingFields = requiredFields.filter(field => !firebaseConfig[field.key as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('Firebase設定が不完全です。以下の項目を設定してください:');
    missingFields.forEach(field => {
      console.error(`- ${field.envVar}: ${firebaseConfig[field.key as keyof typeof firebaseConfig] || 'undefined'}`);
    });
    console.error('現在の設定:', JSON.stringify(firebaseConfig, null, 2));
    console.error('Process env check:', {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '設定済み' : 'なし',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? '設定済み' : 'なし',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? '設定済み' : 'なし',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? '設定済み' : 'なし',
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

// 認証状態の永続化設定（Web環境での改善）
try {
  if (typeof window !== 'undefined') {
    // Web環境でのみSessionStorage永続化を使用
    import('firebase/auth').then(({ setPersistence, browserSessionPersistence }) => {
      setPersistence(auth, browserSessionPersistence).catch((error) => {
        console.warn('Firebase persistence設定エラー:', error);
      });
    });
  }
} catch (error) {
  console.warn('Firebase認証設定の初期化エラー:', error);
}

export default app; 