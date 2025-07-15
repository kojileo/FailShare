import { auth, db } from './firebase';
import { signInAnonymously, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@FailShare:onboarding_completed';
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

// ユーザーのFirestoreデータを削除する関数
const deleteUserData = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const batch = writeBatch(db);
    
    // 1. ユーザーの投稿を削除
    const storiesQuery = query(
      collection(db, 'stories'),
      where('authorId', '==', userId)
    );
    
    const storiesSnapshot = await getDocs(storiesQuery);
    storiesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 2. ユーザーのコメントを削除（将来実装予定）
    // TODO: 将来的にコメント機能が実装された際の削除処理
    /*
    const commentsQuery = query(
      collection(db, 'comments'),
      where('authorId', '==', userId)
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    */
    
    // 3. ユーザーの学習記録を削除（将来実装予定）
    // TODO: 将来的に学習記録機能が実装された際の削除処理
    /*
    const learningRecordsQuery = query(
      collection(db, 'learningRecords'),
      where('userId', '==', userId)
    );
    
    const learningRecordsSnapshot = await getDocs(learningRecordsQuery);
    learningRecordsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    */
    
    // 4. ユーザーの支援アクション（いいね・共感）を削除（将来実装予定）
    // TODO: 将来的に支援アクション機能が実装された際の削除処理
    /*
    const supportActionsQuery = query(
      collection(db, 'supportActions'),
      where('fromUser', '==', userId)
    );
    
    const supportActionsSnapshot = await getDocs(supportActionsQuery);
    supportActionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    */
    
    // 5. ユーザープロフィールを削除
    const userDocRef = doc(db, 'anonymousUsers', userId);
    batch.delete(userDocRef);
    
    // 6. バッチ処理を実行
    await batch.commit();
    
    const deletedCount = storiesSnapshot.size + 1; // 投稿数 + ユーザープロフィール
    console.log(`ユーザー ${userId} のデータを削除しました (${deletedCount}件)`);
    
    return { success: true };
  } catch (error) {
    console.error('ユーザーデータ削除エラー:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
    };
  }
};

// サインアウト
export const signOutUser = async (): Promise<{ success: boolean; dataDeleted: boolean; error?: string }> => {
  try {
    const currentUser = auth.currentUser;
    let dataDeleted = false;
    let deleteError: string | undefined;
    
    // 現在のユーザーのFirestoreデータを削除
    if (currentUser) {
      const deleteResult = await deleteUserData(currentUser.uid);
      dataDeleted = deleteResult.success;
      if (!deleteResult.success) {
        deleteError = deleteResult.error;
      }
    }
    
    // Firebase認証からサインアウト
    await signOut(auth);
    
    // AsyncStorageからもユーザー情報を削除
    await removeUserFromStorage();
    
    console.log('サインアウト完了（関連データも削除）');
    
    return { 
      success: true, 
      dataDeleted, 
      error: deleteError 
    };
  } catch (error) {
    console.error('サインアウトエラー:', error);
    return { 
      success: false, 
      dataDeleted: false, 
      error: error instanceof Error ? error.message : 'サインアウトに失敗しました' 
    };
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

// プロフィール更新
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'anonymousUsers', userId);
    
    // 更新データを準備
    const updateData: any = {
      ...updates,
      lastActive: serverTimestamp()
    };
    
    // 日付フィールドはTimestampとして保存
    if (updates.joinedAt) {
      updateData.joinedAt = Timestamp.fromDate(updates.joinedAt);
    }
    
    // Firestoreを更新
    await updateDoc(userDocRef, updateData);
    
    // 更新後のプロフィールを取得
    const updatedProfile = await getUserProfile(userId);
    
    // AsyncStorageも更新
    if (updatedProfile) {
      await saveUserToStorage(updatedProfile);
    }
    
    return updatedProfile;
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    throw new Error('プロフィールの更新に失敗しました');
  }
};

// ニックネーム変更
export const updateDisplayName = async (userId: string, newDisplayName: string): Promise<User | null> => {
  if (!newDisplayName.trim()) {
    throw new Error('ニックネームは必須です');
  }
  
  if (newDisplayName.length > 20) {
    throw new Error('ニックネームは20文字以内で入力してください');
  }
  
  return await updateUserProfile(userId, { displayName: newDisplayName.trim() });
};

// アバター変更
export const updateAvatar = async (userId: string, newAvatar: string): Promise<User | null> => {
  if (!newAvatar.trim()) {
    throw new Error('アバターは必須です');
  }
  
  return await updateUserProfile(userId, { avatar: newAvatar.trim() });
};

// 新しいランダムニックネーム生成
export const generateNewNickname = (): string => {
  return generateAnonymousNickname();
};

// オンボーディング状態管理
export const getOnboardingStatus = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(ONBOARDING_KEY);
    return status === 'true';
  } catch (error) {
    console.error('オンボーディング状態取得エラー:', error);
    return false;
  }
};

export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('オンボーディング状態保存エラー:', error);
    throw error;
  }
};

export const clearOnboardingStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('オンボーディング状態削除エラー:', error);
    throw error;
  }
}; 