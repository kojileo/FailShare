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
      
      // 🆕 新規サインインまたは復元
      console.log('🔐 匿名認証を開始...');
      const user = await signInAnonymous();
      
      // オンボーディング状態を確認
      const onboardingCompleted = await getOnboardingStatus();
      
      console.log('✅ 認証成功:', user.id);
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
      throw error; // エラーを再スローして呼び出し元でキャッチできるようにする
    }
  },
  
  signOut: async () => {
    try {
      console.log('🔄 [AuthStore] サインアウト処理開始');
      set({ isLoading: true, error: null });
      
      console.log('📞 [AuthStore] authService.signOutUser()を呼び出し中...');
      const result = await signOutUser();
      console.log('📋 [AuthStore] signOutUser結果:', result);
      
      if (result.success) {
        console.log('✅ [AuthStore] サインアウト成功、ステート更新中...');
        set({ user: null, isSignedIn: false, isLoading: false });
        
        // データ削除の結果をログに記録
        if (result.dataDeleted) {
          console.log('🗑️ [AuthStore] ユーザーデータが正常に削除されました');
        } else if (result.error) {
          console.warn('⚠️ [AuthStore] データ削除でエラーが発生しました:', result.error);
        }
        console.log('✅ [AuthStore] サインアウト処理完了');
      } else {
        console.error('❌ [AuthStore] サインアウトエラー:', result.error);
        set({ 
          error: result.error || 'サインアウトに失敗しました。',
          isLoading: false 
        });
        throw new Error(result.error || 'サインアウトに失敗しました。');
      }
    } catch (error) {
      console.error('💥 [AuthStore] signOut内でエラーキャッチ:', error);
      set({ 
        error: error instanceof Error ? error.message : 'サインアウトに失敗しました。',
        isLoading: false 
      });
      throw error; // エラーを再スローしてProfileScreenでキャッチできるようにする
    }
  },
  
  initializeAuth: () => {
    set({ isLoading: true });
    
    // まずAsyncStorageから保存されたユーザー情報を取得
    const initializeFromStorage = async () => {
      try {
        const storedUser = await getStoredUser();
        if (storedUser) {
          // オンボーディング状態も同時に取得
          const onboardingCompleted = await getOnboardingStatus();
          set({ 
            user: storedUser, 
            isSignedIn: true, 
            isOnboardingCompleted: onboardingCompleted,
            isLoading: false 
          });
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
          // オンボーディング状態も同時に取得
          const onboardingCompleted = await getOnboardingStatus();
          set({ 
            user: userProfile, 
            isSignedIn: true, 
            isOnboardingCompleted: onboardingCompleted,
            isLoading: false 
          });
        } else {
          set({ user: null, isSignedIn: false, isOnboardingCompleted: false, isLoading: false });
        }
      } else {
        // Firebase認証ユーザーが存在しない場合
        set({ user: null, isSignedIn: false, isOnboardingCompleted: false, isLoading: false });
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