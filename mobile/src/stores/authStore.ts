import { create } from 'zustand';
import { User } from '../types';
import { signInAnonymous, signOutUser, onAuthStateChanged, getUserProfile } from '../services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isSignedIn: false,
  error: null,
  
  setUser: (user) => set({ user, isSignedIn: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  signIn: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await signInAnonymous();
      set({ user, isSignedIn: true, isLoading: false });
    } catch (error) {
      console.error('サインインエラー:', error);
      set({ 
        error: 'サインインに失敗しました。もう一度お試しください。',
        isLoading: false 
      });
    }
  },
  
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await signOutUser();
      set({ user: null, isSignedIn: false, isLoading: false });
    } catch (error) {
      console.error('サインアウトエラー:', error);
      set({ 
        error: 'サインアウトに失敗しました。',
        isLoading: false 
      });
    }
  },
  
  initializeAuth: () => {
    set({ isLoading: true });
    
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
  }
})); 