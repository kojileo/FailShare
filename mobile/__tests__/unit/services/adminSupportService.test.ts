import { adminSupportService } from '../../../src/services/adminSupportService';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from '../../../src/services/firebase';

// Firebase モック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
  writeBatch: jest.fn(),
  getDoc: jest.fn(),
  increment: jest.fn((value) => value)
}));

jest.mock('../../../src/services/firebase', () => ({
  db: {}
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
const mockWriteBatch = writeBatch as jest.MockedFunction<typeof writeBatch>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockIncrement = increment as jest.MockedFunction<typeof increment>;

describe('AdminSupportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestSupport', () => {
    it('サポートリクエストを作成する', async () => {
      const userId = 'user-123';
      const message = 'ヘルプが必要です';
      const emotion = '不安' as const;
      const priority = 'normal' as const;

      const mockCollectionRef = {};
      const mockDocRef = { id: 'request-123' };

      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const result = await adminSupportService.requestSupport(userId, message, emotion, priority);

      expect(mockCollection).toHaveBeenCalledWith(db, 'adminSupportRequests');
      expect(mockAddDoc).toHaveBeenCalledWith(mockCollectionRef, {
        userId,
        message,
        emotion,
        priority,
        status: 'pending',
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp',
        tags: [emotion, priority]
      });
      expect(result).toBe('request-123');
    });
  });

  describe('getActiveSession', () => {
    it('アクティブセッションを取得する', async () => {
      const userId = 'user-123';
      const mockSessionData = {
        userId: 'user-123',
        adminId: 'admin-123',
        status: 'active',
        startedAt: { toDate: () => new Date('2024-01-01') },
        endedAt: null,
        messages: [],
        tags: ['不安']
      };

      const mockQueryRef = {};
      const mockDocSnapshot = {
        empty: false,
        docs: [{
          id: 'session-123',
          data: () => mockSessionData
        }]
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue(mockQueryRef as any);
      mockWhere.mockReturnValue({} as any);
      mockOrderBy.mockReturnValue({} as any);
      mockLimit.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockDocSnapshot as any);

      const result = await adminSupportService.getActiveSession(userId);

      expect(result).toEqual({
        id: 'session-123',
        userId: 'user-123',
        adminId: 'admin-123',
        status: 'active',
        startedAt: new Date('2024-01-01'),
        endedAt: undefined,
        messages: [],
        tags: ['不安']
      });
    });

    it('アクティブセッションがない場合にnullを返す', async () => {
      const userId = 'user-123';
      const mockDocSnapshot = {
        empty: true,
        docs: []
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockWhere.mockReturnValue({} as any);
      mockOrderBy.mockReturnValue({} as any);
      mockLimit.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockDocSnapshot as any);

      const result = await adminSupportService.getActiveSession(userId);

      expect(result).toBeNull();
    });
  });

  describe('getPendingRequests', () => {
    it('待機中のリクエストを取得する', async () => {
      const mockRequestData = {
        userId: 'user-123',
        message: 'ヘルプが必要です',
        emotion: '不安',
        priority: 'normal',
        status: 'pending',
        assignedAdminId: null,
        createdAt: { toDate: () => new Date('2024-01-01') },
        updatedAt: { toDate: () => new Date('2024-01-01') },
        tags: ['不安', 'normal']
      };

      const mockQueryRef = {};
      const mockDocSnapshot = {
        docs: [{
          id: 'request-123',
          data: () => mockRequestData
        }]
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue(mockQueryRef as any);
      mockWhere.mockReturnValue({} as any);
      mockOrderBy.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockDocSnapshot as any);

      const result = await adminSupportService.getPendingRequests();

      expect(result).toEqual([{
        id: 'request-123',
        userId: 'user-123',
        message: 'ヘルプが必要です',
        emotion: '不安',
        priority: 'normal',
        status: 'pending',
        assignedAdminId: null,
        sessionId: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        tags: ['不安', 'normal']
      }]);
    });
  });

  describe('getAvailableAdmins', () => {
    it('利用可能な管理者を取得する', async () => {
      const mockAdminData = {
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available',
        specialties: ['技術'],
        responseTimeAvg: 25,
        satisfactionScore: 4.8,
        activeChats: 1,
        maxConcurrentChats: 5,
        lastActiveAt: { toDate: () => new Date('2024-01-01') }
      };

      const mockQueryRef = {};
      const mockDocSnapshot = {
        forEach: (callback: (doc: any) => void) => {
          callback({
            id: 'admin-123',
            data: () => mockAdminData
          });
        }
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue(mockQueryRef as any);
      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockDocSnapshot as any);

      const result = await adminSupportService.getAvailableAdmins();

      expect(result).toEqual([{
        id: 'admin-123',
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available',
        specialties: ['技術'],
        responseTimeAvg: 25,
        satisfactionScore: 4.8,
        activeChats: 1,
        maxConcurrentChats: 5,
        lastActiveAt: new Date('2024-01-01')
      }]);
    });
  });

  describe('assignBestAdmin', () => {
    it('最適な管理者を自動選択する', async () => {
      const requestId = 'request-123';
      const mockAdminData = {
        id: 'admin-123',
        displayName: 'テスト管理者',
        avatar: 'avatar1',
        isOnline: true,
        status: 'available' as const,
        specialties: ['技術'],
        responseTimeAvg: 25,
        satisfactionScore: 4.8,
        activeChats: 1,
        maxConcurrentChats: 5,
        lastActiveAt: new Date('2024-01-01')
      };

      // getAvailableAdmins のモック
      jest.spyOn(adminSupportService, 'getAvailableAdmins').mockResolvedValue([mockAdminData]);
      // assignRequest のモック
      jest.spyOn(adminSupportService, 'assignRequest').mockResolvedValue(undefined);

      const result = await adminSupportService.assignBestAdmin(requestId);

      expect(result).toBe('admin-123');
      expect(adminSupportService.assignRequest).toHaveBeenCalledWith(requestId, 'admin-123');
    });

    it('利用可能な管理者がいない場合にnullを返す', async () => {
      const requestId = 'request-123';

      jest.spyOn(adminSupportService, 'getAvailableAdmins').mockResolvedValue([]);

      const result = await adminSupportService.assignBestAdmin(requestId);

      expect(result).toBeNull();
    });
  });

  describe('assignRequest', () => {
    it('リクエストに管理者を割り当てる', async () => {
      const requestId = 'request-123';
      const adminId = 'admin-123';

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn()
      };

      mockWriteBatch.mockReturnValue(mockBatch as any);
      mockDoc.mockReturnValue({} as any);
      mockIncrement.mockReturnValue(1);

      // 関数が例外を投げないことを確認
      await expect(adminSupportService.assignRequest(requestId, adminId)).resolves.not.toThrow();
    });
  });

  describe('startSession', () => {
    it('サポートセッションを開始する', async () => {
      const requestId = 'request-123';
      const adminId = 'admin-123';
      const mockRequestData = {
        userId: 'user-123',
        message: 'ヘルプが必要です',
        tags: ['不安']
      };

      const mockRequestDoc = {
        exists: () => true,
        data: () => mockRequestData
      };

      const mockSessionRef = { id: 'session-123' };
      const mockCollectionRef = {};

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockRequestDoc as any);
      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockAddDoc.mockResolvedValue(mockSessionRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      // addMessage のモック
      jest.spyOn(adminSupportService, 'addMessage').mockResolvedValue('message-123');

      const result = await adminSupportService.startSession(requestId, adminId);

      expect(result).toBe('session-123');
      expect(adminSupportService.addMessage).toHaveBeenCalledWith(
        'session-123',
        'user-123',
        'user',
        'ヘルプが必要です'
      );
    });

    it('リクエストが見つからない場合にエラーを投げる', async () => {
      const requestId = 'nonexistent-request';
      const adminId = 'admin-123';

      const mockRequestDoc = {
        exists: () => false
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockRequestDoc as any);

      await expect(adminSupportService.startSession(requestId, adminId))
        .rejects.toThrow('リクエストが見つかりません');
    });
  });

  describe('addMessage', () => {
    it('メッセージを追加する', async () => {
      const sessionId = 'session-123';
      const senderId = 'user-123';
      const senderType = 'user' as const;
      const content = 'テストメッセージ';
      const messageType = 'text' as const;
      const isPrivate = false;

      const mockCollectionRef = {};
      const mockDocRef = { id: 'message-123' };

      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockAddDoc.mockResolvedValue(mockDocRef as any);
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await adminSupportService.addMessage(
        sessionId,
        senderId,
        senderType,
        content,
        messageType,
        isPrivate
      );

      // 関数が正常に実行されることを確認
      expect(result).toBe('message-123');
    });
  });

  describe('endSession', () => {
    it('セッションを終了する', async () => {
      const sessionId = 'session-123';
      const adminId = 'admin-123';

      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn()
      };

      mockWriteBatch.mockReturnValue(mockBatch as any);
      mockDoc.mockReturnValue({} as any);
      mockIncrement.mockReturnValue(-1);

      await adminSupportService.endSession(sessionId, adminId);

      expect(mockWriteBatch).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('updateAdminStatus', () => {
    it('管理者ステータスを更新する', async () => {
      const adminId = 'admin-123';
      const status = 'busy' as const;

      const mockDocRef = {};

      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await adminSupportService.updateAdminStatus(adminId, status);

      expect(mockDoc).toHaveBeenCalledWith(db, 'adminProfiles', adminId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        status,
        isOnline: true,
        lastActiveAt: 'mock-timestamp'
      });
    });
  });

  describe('rateSession', () => {
    it('セッション満足度評価を追加する', async () => {
      const sessionId = 'session-123';
      const rating = 5;
      const feedback = 'とても満足';

      const mockDocRef = {};

      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await adminSupportService.rateSession(sessionId, rating, feedback);

      expect(mockDoc).toHaveBeenCalledWith(db, 'adminSupportSessions', sessionId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        userSatisfactionRating: rating,
        userFeedback: feedback,
        updatedAt: 'mock-timestamp'
      });
    });
  });
});
