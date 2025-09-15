import { adminAuthService } from '../../../src/services/adminAuthService';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../src/services/firebase';

// Firebase モック
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

jest.mock('../../../src/services/firebase', () => ({
  db: {}
}));

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;

describe('AdminAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('管理者ログインが成功する', async () => {
      const adminId = 'admin-123';
      const password = 'password123';
      const mockAdminData = {
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        password: 'password123',
        specialties: ['技術', 'カスタマーサポート'],
        responseTimeAvg: 25,
        satisfactionScore: 4.8,
        activeChats: 2,
        maxConcurrentChats: 5
      };

      const mockDocRef = { id: adminId };
      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockAdminData
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await adminAuthService.signIn(adminId, password);

      expect(mockDoc).toHaveBeenCalledWith(db, 'adminProfiles', adminId);
      expect(mockGetDoc).toHaveBeenCalledWith(mockDocRef);
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        lastLoginAt: 'mock-timestamp',
        isOnline: true,
        status: 'available',
        lastActiveAt: 'mock-timestamp'
      });

      expect(result).toEqual({
        id: adminId,
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available',
        specialties: ['技術', 'カスタマーサポート'],
        responseTimeAvg: 25,
        satisfactionScore: 4.8,
        activeChats: 2,
        maxConcurrentChats: 5,
        lastActiveAt: expect.any(Date)
      });
    });

    it('管理者が見つからない場合にエラーを投げる', async () => {
      const adminId = 'nonexistent-admin';
      const password = 'password123';

      const mockDocRef = { id: adminId };
      const mockDocSnapshot = {
        exists: () => false
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);

      await expect(adminAuthService.signIn(adminId, password))
        .rejects.toThrow('管理者が見つかりません');
    });

    it('パスワードが間違っている場合にエラーを投げる', async () => {
      const adminId = 'admin-123';
      const password = 'wrong-password';
      const mockAdminData = {
        displayName: 'テスト管理者',
        password: 'correct-password'
      };

      const mockDocRef = { id: adminId };
      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockAdminData
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);

      await expect(adminAuthService.signIn(adminId, password))
        .rejects.toThrow('パスワードが間違っています');
    });
  });

  describe('signOut', () => {
    it('管理者ログアウトが成功する', async () => {
      const adminId = 'admin-123';
      const mockDocRef = { id: adminId };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await adminAuthService.signOut(adminId);

      expect(mockDoc).toHaveBeenCalledWith(db, 'adminProfiles', adminId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        isOnline: false,
        status: 'offline',
        lastActiveAt: 'mock-timestamp'
      });
    });
  });

  describe('getAdminProfile', () => {
    it('管理者プロファイルを取得する', async () => {
      const adminId = 'admin-123';
      const mockAdminData = {
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available',
        specialties: ['技術'],
        responseTimeAvg: 30,
        satisfactionScore: 4.5,
        activeChats: 1,
        maxConcurrentChats: 5,
        lastActiveAt: { toDate: () => new Date('2024-01-01') }
      };

      const mockDocRef = { id: adminId };
      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockAdminData
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);

      const result = await adminAuthService.getAdminProfile(adminId);

      expect(result).toEqual({
        id: undefined,
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available',
        specialties: ['技術'],
        responseTimeAvg: 30,
        satisfactionScore: 4.5,
        activeChats: 1,
        maxConcurrentChats: 5,
        lastActiveAt: new Date('2024-01-01')
      });
    });

    it('管理者が見つからない場合にnullを返す', async () => {
      const adminId = 'nonexistent-admin';
      const mockDocRef = { id: adminId };
      const mockDocSnapshot = {
        exists: () => false
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);

      const result = await adminAuthService.getAdminProfile(adminId);

      expect(result).toBeNull();
    });
  });

  describe('checkAdminPermission', () => {
    it('管理者権限をチェックする', () => {
      const admin = {
        id: 'admin-123',
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

      expect(adminAuthService.checkAdminPermission(admin, 'read')).toBe(true);
      expect(adminAuthService.checkAdminPermission(admin, 'write')).toBe(true);
      expect(adminAuthService.checkAdminPermission(admin, 'support')).toBe(true);
      expect(adminAuthService.checkAdminPermission(admin, 'manage')).toBe(false);
      expect(adminAuthService.checkAdminPermission(admin, 'delete')).toBe(false);
    });
  });
});
