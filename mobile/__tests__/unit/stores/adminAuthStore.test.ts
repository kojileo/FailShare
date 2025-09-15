import { useAdminAuthStore } from '../../../src/stores/adminAuthStore';
import { adminAuthService } from '../../../src/services/adminAuthService';

// サービス層のモック
jest.mock('../../../src/services/adminAuthService', () => ({
  adminAuthService: {
    signIn: jest.fn(),
    signOut: jest.fn()
  }
}));

const mockAdminAuthService = adminAuthService as jest.Mocked<typeof adminAuthService>;

describe('AdminAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ストアの状態をリセット
    useAdminAuthStore.getState().setError(null);
  });

  describe('signIn', () => {
    it('管理者ログインが成功する', async () => {
      const adminId = 'admin-123';
      const password = 'password123';
      const mockAdmin = {
        id: adminId,
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available' as const,
        specialties: ['技術'],
        responseTimeAvg: 25,
        satisfactionScore: 4.8,
        activeChats: 1,
        maxConcurrentChats: 5,
        lastActiveAt: new Date()
      };

      mockAdminAuthService.signIn.mockResolvedValue(mockAdmin);

      const store = useAdminAuthStore.getState();
      await store.signIn(adminId, password);

      const state = useAdminAuthStore.getState();
      expect(state.admin).toEqual(mockAdmin);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockAdminAuthService.signIn).toHaveBeenCalledWith(adminId, password);
    });

    it('管理者ログインが失敗する', async () => {
      const adminId = 'admin-123';
      const password = 'wrong-password';
      const errorMessage = 'パスワードが間違っています';

      mockAdminAuthService.signIn.mockRejectedValue(new Error(errorMessage));

      const store = useAdminAuthStore.getState();
      
      await expect(store.signIn(adminId, password)).rejects.toThrow(errorMessage);

      const state = useAdminAuthStore.getState();
      expect(state.admin).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('ログイン中はローディング状態になる', async () => {
      const adminId = 'admin-123';
      const password = 'password123';

      // 非同期処理を遅延させる
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockAdminAuthService.signIn.mockReturnValue(promise as any);

      const store = useAdminAuthStore.getState();
      const signInPromise = store.signIn(adminId, password);

      // ローディング状態を確認
      let state = useAdminAuthStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      // プロミスを解決
      const mockAdmin = {
        id: adminId,
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available' as const,
        specialties: [],
        responseTimeAvg: 30,
        satisfactionScore: 4.5,
        activeChats: 0,
        maxConcurrentChats: 5,
        lastActiveAt: new Date()
      };
      resolvePromise!(mockAdmin);
      await signInPromise;

      // 完了後の状態を確認
      state = useAdminAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('signOut', () => {
    it('管理者ログアウトが成功する', async () => {
      const adminId = 'admin-123';
      const mockAdmin = {
        id: adminId,
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available' as const,
        specialties: [],
        responseTimeAvg: 30,
        satisfactionScore: 4.5,
        activeChats: 0,
        maxConcurrentChats: 5,
        lastActiveAt: new Date()
      };

      // まずログイン状態にする
      const store = useAdminAuthStore.getState();
      store.admin = mockAdmin;
      store.isAuthenticated = true;

      mockAdminAuthService.signOut.mockResolvedValue(undefined);

      await store.signOut();

      const state = useAdminAuthStore.getState();
      expect(state.admin).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(mockAdminAuthService.signOut).toHaveBeenCalledWith(adminId);
    });

    it('管理者がnullの場合でもログアウト処理が完了する', async () => {
      const store = useAdminAuthStore.getState();
      store.admin = null;
      store.isAuthenticated = false;

      await store.signOut();

      const state = useAdminAuthStore.getState();
      expect(state.admin).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(mockAdminAuthService.signOut).not.toHaveBeenCalled();
    });

    it('ログアウトエラーが発生しても状態はクリアされる', async () => {
      const adminId = 'admin-123';
      const mockAdmin = {
        id: adminId,
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available' as const,
        specialties: [],
        responseTimeAvg: 30,
        satisfactionScore: 4.5,
        activeChats: 0,
        maxConcurrentChats: 5,
        lastActiveAt: new Date()
      };

      const store = useAdminAuthStore.getState();
      store.admin = mockAdmin;
      store.isAuthenticated = true;

      mockAdminAuthService.signOut.mockRejectedValue(new Error('ログアウトエラー'));

      await expect(store.signOut()).rejects.toThrow('ログアウトエラー');

      const state = useAdminAuthStore.getState();
      expect(state.admin).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setError', () => {
    it('エラーメッセージを設定する', () => {
      const store = useAdminAuthStore.getState();
      const errorMessage = 'テストエラー';

      store.setError(errorMessage);

      const state = useAdminAuthStore.getState();
      expect(state.error).toBe(errorMessage);
    });

    it('エラーをクリアする', () => {
      const store = useAdminAuthStore.getState();
      store.setError('テストエラー');
      store.setError(null);

      const state = useAdminAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const state = useAdminAuthStore.getState();
      
      expect(state.admin).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
