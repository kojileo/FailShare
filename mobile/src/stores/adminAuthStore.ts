import { create } from 'zustand';
import { AdminAuthState, AdminProfile } from '../types';
import { adminAuthService } from '../services/adminAuthService';

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  signIn: async (adminId: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('🔐 [AdminAuthStore] ログイン開始:', { adminId });
      
      const admin = await adminAuthService.signIn(adminId, password);
      
      set({ 
        admin, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
      console.log('✅ [AdminAuthStore] ログイン成功:', admin.displayName);
    } catch (error) {
      console.error('❌ [AdminAuthStore] ログインエラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
      set({ 
        error: errorMessage,
        isLoading: false,
        admin: null,
        isAuthenticated: false
      });
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const { admin } = get();
      
      if (admin) {
        console.log('🔄 [AdminAuthStore] ログアウト開始:', admin.id);
        await adminAuthService.signOut(admin.id);
      }
      
      set({ 
        admin: null, 
        isAuthenticated: false 
      });
      
      console.log('✅ [AdminAuthStore] ログアウト成功');
    } catch (error) {
      console.error('❌ [AdminAuthStore] ログアウトエラー:', error);
      // ログアウトエラーでも状態はクリア
      set({ 
        admin: null, 
        isAuthenticated: false 
      });
      throw error;
    }
  },
  
  setError: (error: string | null) => {
    set({ error });
  }
}));
