import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// Firebase設定を環境変数から取得（環境変数を優先）
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebase?.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebase?.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || Constants.expoConfig?.extra?.firebase?.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebase?.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebase?.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebase?.appId,
};

// 🔒 プロダクション環境では詳細なデバッグ情報を出力しない
if (process.env.EXPO_PUBLIC_ENVIRONMENT !== 'production') {
  console.log('🔧 Firebase Environment Debug Info:');
  console.log('  Environment:', process.env.EXPO_PUBLIC_ENVIRONMENT);
  console.log('  Project ID:', firebaseConfig.projectId);
  console.log('  Auth Domain:', firebaseConfig.authDomain);
  console.log('  API Key (first 10 chars):', firebaseConfig.apiKey?.substring(0, 10) + '...');
  console.log('  Firebase Config Valid:', !!firebaseConfig.apiKey);
  console.log('=====================================');
  
  // 🔍 詳細デバッグ：環境変数の生の値を表示
  console.log('🔍 Raw Environment Variables:');
  console.log('  EXPO_PUBLIC_FIREBASE_PROJECT_ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log('  Constants.expoConfig projectId:', Constants.expoConfig?.extra?.firebase?.projectId);
  console.log('=====================================');
}

// 🛠️ 開発環境での匿名ユーザー管理
if (process.env.EXPO_PUBLIC_ENVIRONMENT === 'development') {
  // 5秒後に統計表示（初期化完了を待つ）
  setTimeout(async () => {
    try {
      // 開発環境でのみ統計を表示
      console.log('📊 開発環境: 匿名ユーザー統計の表示をスキップ');
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
    
    // 🔒 プロダクション環境では詳細なエラー情報を出力しない
    if (process.env.EXPO_PUBLIC_ENVIRONMENT !== 'production') {
      console.error('現在の設定:', JSON.stringify(firebaseConfig, null, 2));
      console.error('Process env check:', {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '設定済み' : 'なし',
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? '設定済み' : 'なし',
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? '設定済み' : 'なし',
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? '設定済み' : 'なし',
      });
    }
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
    // 動的インポートを避けるため、条件付きで実行
    console.log('🌐 Web環境: Firebase認証永続化設定をスキップ');
  }
} catch (error) {
  if (process.env.EXPO_PUBLIC_ENVIRONMENT !== 'production') {
    console.warn('Firebase認証設定の初期化エラー:', error);
  }
}

export default app; 