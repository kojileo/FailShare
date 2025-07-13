import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定（後で実際の値に置き換える）
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firebase サービスの初期化
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 