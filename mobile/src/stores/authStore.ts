import { create } from 'zustand';
import { User } from '../types';
import { signInAnonymous, signOutUser, onAuthStateChanged, getUserProfile, getStoredUser, getOnboardingStatus, setOnboardingCompleted, cleanupDuplicateUsers, getAnonymousUserStats } from '../services/authService';
import { auth } from '../services/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isOnboardingCompleted: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  // 🛠️ 開発環境用デバッグ機能
  cleanupDuplicates: () => Promise<{ cleaned: number; total: number }>;
  showStats: () => Promise<void>;
  initializeAuth: () => () => void;
  completeOnboarding: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isSignedIn: false,
  isOnboardingCompleted: false,
  error: null,
  
  setUser: (user) => set({ user, isSignedIn: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  signIn: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // 🛡️ 既にサインインしているかチェック
      const currentState = get();
      if (currentState.isSignedIn && currentState.user) {
        console.log('🔄 既にサインイン済み、重複処理をスキップ');
        set({ isLoading: false });
        return;
      }
      
      // 🔍 Firebase認証状態もチェック  
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        console.log('🔄 Firebase認証済み、プロフィール取得のみ実行');
        const user = await getUserProfile(auth.currentUser.uid);
        if (user) {
          const onboardingCompleted = await getOnboardingStatus();
          set({ 
            user, 
            isSignedIn: true, 
            isOnboardingCompleted: onboardingCompleted,
            isLoading: false 
          });
          return;
        }
      }
      
      // 🆕 新規サインインまたは復元
      const user = await signInAnonymous();
      
      // オンボーディング状態を確認
      const onboardingCompleted = await getOnboardingStatus();
      
      set({ 
        user, 
        isSignedIn: true, 
        isOnboardingCompleted: onboardingCompleted,
        isLoading: false 
      });
    } catch (error) {
      console.error('サインインエラー:', error);
      set({ 
        error: 'サインインに失敗しました。もう一度お試しください。',
        isLoading: false 
      });
    }
  },
  
  signOut: async () => {
    set({ isLoading: true, error: null });
    const result = await signOutUser();
    
    if (result.success) {
      set({ user: null, isSignedIn: false, isLoading: false });
      
      // データ削除の結果をログに記録
      if (result.dataDeleted) {
        console.log('ユーザーデータが正常に削除されました');
      } else if (result.error) {
        console.warn('データ削除でエラーが発生しました:', result.error);
      }
    } else {
      console.error('サインアウトエラー:', result.error);
      set({ 
        error: result.error || 'サインアウトに失敗しました。',
        isLoading: false 
      });
    }
  },
  
  initializeAuth: () => {
    set({ isLoading: true });
    
    // まずAsyncStorageから保存されたユーザー情報を取得
    const initializeFromStorage = async () => {
      try {
        const storedUser = await getStoredUser();
        if (storedUser) {
          set({ user: storedUser, isSignedIn: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('AsyncStorageからのユーザー情報取得エラー:', error);
        set({ isLoading: false });
      }
    };
    
    // 初期化実行
    initializeFromStorage();
    
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase認証ユーザーが存在する場合、プロフィールを取得
        const userProfile = await getUserProfile(firebaseUser.uid);
        if (userProfile) {
          set({ user: userProfile, isSignedIn: true, isLoading: false });
        } else {
          set({ user: null, isSignedIn: false, isLoading: false });
        }
      } else {
        // Firebase認証ユーザーが存在しない場合
        set({ user: null, isSignedIn: false, isLoading: false });
      }
    });
    
    // クリーンアップ関数を返す
    return unsubscribe;
  },
  
  completeOnboarding: async () => {
    try {
      await setOnboardingCompleted();
      set({ isOnboardingCompleted: true });
    } catch (error) {
      console.error('オンボーディング完了エラー:', error);
      throw error;
    }
  },

  // 🛠️ 開発環境用デバッグ機能
  cleanupDuplicates: async () => {
    return await cleanupDuplicateUsers();
  },

  showStats: async () => {
    await getAnonymousUserStats();
  },
})); 