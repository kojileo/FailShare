import { auth, db } from './firebase';
import { signInAnonymously, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// AsyncStorageからユーザー情報を取得
const getUserFromStorage = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      // 日付フィールドをDateオブジェクトに変換
      return {
        ...user,
        joinedAt: user.joinedAt ? new Date(user.joinedAt) : new Date(),
        lastActive: user.lastActive ? new Date(user.lastActive) : new Date()
      };
    }
    return null;
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    return null;
  }
};

// AsyncStorageにユーザー情報を保存
const saveUserToStorage = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  } catch (error) {
    console.error('ユーザー情報保存エラー:', error);
  }
};

// AsyncStorageからユーザー情報を削除
const removeUserFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('ユーザー情報削除エラー:', error);
  }
};

// 匿名ニックネーム生成
const generateAnonymousNickname = (): string => {
  const adjectives = [
    'がんばり屋', 'まじめ', 'やさしい', 'おもしろい', 'しっかり者',
    'チャレンジ精神', 'ポジティブ', 'がんこ', 'のんびり', 'せっかち'
  ];
  const nouns = [
    'ぱんだ', 'うさぎ', 'ねこ', 'いぬ', 'きつね', 'りす', 'ぺんぎん',
    'らいおん', 'ぞう', 'きりん', 'さる', 'とら', 'しか', 'くま'
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}な${randomNoun}${randomNumber}`;
};

// 匿名プロフィール生成
const generateAnonymousProfile = async (userId: string): Promise<User> => {
  const profile: User = {
    id: userId,
    displayName: generateAnonymousNickname(),
    avatar: `avatar_${Math.floor(Math.random() * 10) + 1}.png`,
    joinedAt: new Date(),
    lastActive: new Date(),
    stats: {
      totalPosts: 0,
      totalComments: 0,
      helpfulVotes: 0,
      learningPoints: 0
    }
  };

  // Firestoreに保存
  await setDoc(doc(db, 'anonymousUsers', userId), {
    ...profile,
    joinedAt: serverTimestamp(),
    lastActive: serverTimestamp()
  });

  return profile;
};

// 匿名サインイン
export const signInAnonymous = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    const userId = result.user.uid;

    // 既存のプロフィールを確認
    const profileDoc = await getDoc(doc(db, 'anonymousUsers', userId));
    
    if (profileDoc.exists()) {
      // 既存ユーザーの場合、最終アクティブ時刻を更新
      await updateDoc(doc(db, 'anonymousUsers', userId), {
        lastActive: serverTimestamp()
      });
      
      const data = profileDoc.data();
      const user = {
        ...data,
        joinedAt: data.joinedAt.toDate(),
        lastActive: new Date()
      } as User;
      
      // AsyncStorageに保存
      await saveUserToStorage(user);
      return user;
    } else {
      // 新規ユーザーの場合、プロフィールを作成
      const user = await generateAnonymousProfile(userId);
      // AsyncStorageに保存
      await saveUserToStorage(user);
      return user;
    }
  } catch (error) {
    console.error('匿名サインインエラー:', error);
    throw error;
  }
};

// サインアウト
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    // AsyncStorageからもユーザー情報を削除
    await removeUserFromStorage();
  } catch (error) {
    console.error('サインアウトエラー:', error);
    throw error;
  }
};

// 認証状態の監視
export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

// AsyncStorageからユーザー情報を取得（初期化時用）
export const getStoredUser = async (): Promise<User | null> => {
  return await getUserFromStorage();
};

// ユーザープロフィールの取得
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const profileDoc = await getDoc(doc(db, 'anonymousUsers', userId));
    
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      return {
        ...data,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        lastActive: data.lastActive?.toDate() || new Date()
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error('ユーザープロフィール取得エラー:', error);
    return null;
  }
}; 