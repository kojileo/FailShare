import { auth, db } from './firebase';
import { signInAnonymously, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '../types';

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
      return {
        ...data,
        joinedAt: data.joinedAt.toDate(),
        lastActive: new Date()
      } as User;
    } else {
      // 新規ユーザーの場合、プロフィールを作成
      return await generateAnonymousProfile(userId);
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
  } catch (error) {
    console.error('サインアウトエラー:', error);
    throw error;
  }
};

// 認証状態の監視
export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

// ユーザープロフィールの取得
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const profileDoc = await getDoc(doc(db, 'anonymousUsers', userId));
    
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      return {
        ...data,
        joinedAt: data.joinedAt.toDate(),
        lastActive: data.lastActive.toDate()
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error('ユーザープロフィール取得エラー:', error);
    return null;
  }
}; 