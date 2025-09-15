import { useAdminSupportStore } from '../../../src/stores/adminSupportStore';
import { adminSupportService } from '../../../src/services/adminSupportService';
import { realtimeManager } from '../../../src/utils/realtimeManager';

// サービス層のモック
jest.mock('../../../src/services/adminSupportService', () => ({
  adminSupportService: {
    getActiveSession: jest.fn(),
    requestSupport: jest.fn(),
    addMessage: jest.fn(),
    endSession: jest.fn(),
    rateSession: jest.fn(),
    getPendingRequests: jest.fn(),
    getAvailableAdmins: jest.fn(),
    assignRequest: jest.fn(),
    startSession: jest.fn(),
    updateAdminStatus: jest.fn(),
    subscribeToSessionMessages: jest.fn(),
    subscribeToUserRequests: jest.fn()
  }
}));

// ユーティリティのモック
jest.mock('../../../src/utils/realtimeManager', () => ({
  realtimeManager: {
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
}));

const mockAdminSupportService = adminSupportService as jest.Mocked<typeof adminSupportService>;
const mockRealtimeManager = realtimeManager as jest.Mocked<typeof realtimeManager>;

describe('AdminSupportStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ストアの状態をリセット
    useAdminSupportStore.getState().reset();
  });

  describe('getActiveSession', () => {
    it('アクティブセッションを取得する', async () => {
      const userId = 'user-123';
      const mockSession = {
        id: 'session-123',
        userId: 'user-123',
        adminId: 'admin-123',
        status: 'active' as const,
        startedAt: new Date('2024-01-01'),
        endedAt: undefined,
        messages: [],
        tags: ['不安']
      };

      mockAdminSupportService.getActiveSession.mockResolvedValue(mockSession);
      mockAdminSupportService.subscribeToSessionMessages.mockReturnValue(jest.fn());

      const store = useAdminSupportStore.getState();
      await store.getActiveSession(userId);

      const state = useAdminSupportStore.getState();
      expect(state.currentSession).toEqual(mockSession);
      expect(state.isLoading).toBe(false);
      expect(mockAdminSupportService.getActiveSession).toHaveBeenCalledWith(userId);
    });

    it('アクティブセッションがない場合', async () => {
      const userId = 'user-123';

      mockAdminSupportService.getActiveSession.mockResolvedValue(null);

      const store = useAdminSupportStore.getState();
      await store.getActiveSession(userId);

      const state = useAdminSupportStore.getState();
      expect(state.currentSession).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('エラーが発生した場合', async () => {
      const userId = 'user-123';
      const errorMessage = 'セッション取得エラー';

      mockAdminSupportService.getActiveSession.mockRejectedValue(new Error(errorMessage));

      const store = useAdminSupportStore.getState();
      await store.getActiveSession(userId);

      const state = useAdminSupportStore.getState();
      expect(state.error).toBe('セッション情報の取得に失敗しました');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('requestSupport', () => {
    it('サポートリクエストを作成する', async () => {
      const userId = 'user-123';
      const message = 'ヘルプが必要です';
      const emotion = '不安' as const;

      mockAdminSupportService.requestSupport.mockResolvedValue('request-123');

      const store = useAdminSupportStore.getState();
      await store.requestSupport(userId, message, emotion);

      const state = useAdminSupportStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isWaitingForAdmin).toBe(true);
      expect(mockAdminSupportService.requestSupport).toHaveBeenCalledWith(userId, message, emotion);
    });

    it('サポートリクエスト作成でエラーが発生する', async () => {
      const userId = 'user-123';
      const message = 'ヘルプが必要です';
      const emotion = '不安' as const;

      mockAdminSupportService.requestSupport.mockRejectedValue(new Error('リクエストエラー'));

      const store = useAdminSupportStore.getState();
      await store.requestSupport(userId, message, emotion);

      const state = useAdminSupportStore.getState();
      expect(state.error).toBe('サポートリクエストの送信に失敗しました');
      expect(state.isLoading).toBe(false);
      expect(state.isWaitingForAdmin).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('ユーザーメッセージを送信する', async () => {
      const sessionId = 'session-123';
      const userId = 'user-123';
      const message = 'テストメッセージ';

      mockAdminSupportService.addMessage.mockResolvedValue('message-123');

      const store = useAdminSupportStore.getState();
      await store.sendMessage(sessionId, userId, message);

      const state = useAdminSupportStore.getState();
      expect(state.supportMessages).toHaveLength(1);
      expect(state.supportMessages[0].content).toBe(message);
      expect(state.supportMessages[0].senderType).toBe('user');
      expect(mockAdminSupportService.addMessage).toHaveBeenCalledWith(sessionId, userId, 'user', message);
    });

    it('メッセージ送信でエラーが発生する', async () => {
      const sessionId = 'session-123';
      const userId = 'user-123';
      const message = 'テストメッセージ';

      mockAdminSupportService.addMessage.mockRejectedValue(new Error('送信エラー'));

      const store = useAdminSupportStore.getState();
      await store.sendMessage(sessionId, userId, message);

      const state = useAdminSupportStore.getState();
      expect(state.error).toBe('メッセージの送信に失敗しました');
    });
  });

  describe('endSession', () => {
    it('セッションを終了する', async () => {
      const sessionId = 'session-123';
      const mockSession = {
        id: sessionId,
        userId: 'user-123',
        adminId: 'admin-123',
        status: 'active' as const,
        startedAt: new Date(),
        endedAt: undefined,
        messages: [],
        tags: []
      };

      mockAdminSupportService.endSession.mockResolvedValue(undefined);

      const store = useAdminSupportStore.getState();
      store.currentSession = mockSession;
      await store.endSession(sessionId);

      const state = useAdminSupportStore.getState();
      expect(state.currentSession?.status).toBe('completed');
      expect(state.currentSession?.endedAt).toBeInstanceOf(Date);
      expect(mockAdminSupportService.endSession).toHaveBeenCalledWith(sessionId, 'admin-123');
    });

    it('セッションがない場合は何もしない', async () => {
      const sessionId = 'session-123';

      const store = useAdminSupportStore.getState();
      store.currentSession = null;
      await store.endSession(sessionId);

      expect(mockAdminSupportService.endSession).not.toHaveBeenCalled();
    });
  });

  describe('rateSession', () => {
    it('セッションを評価する', async () => {
      const sessionId = 'session-123';
      const rating = 5;
      const mockSession = {
        id: sessionId,
        userId: 'user-123',
        adminId: 'admin-123',
        status: 'active' as const,
        startedAt: new Date(),
        endedAt: undefined,
        messages: [],
        tags: []
      };

      mockAdminSupportService.rateSession.mockResolvedValue(undefined);

      const store = useAdminSupportStore.getState();
      store.currentSession = mockSession;
      await store.rateSession(sessionId, rating);

      const state = useAdminSupportStore.getState();
      expect(state.currentSession?.userSatisfactionRating).toBe(rating);
      expect(mockAdminSupportService.rateSession).toHaveBeenCalledWith(sessionId, rating);
    });
  });

  describe('getPendingRequests', () => {
    it('待機中のリクエストを取得する', async () => {
      const mockRequests = [
        {
          id: 'request-123',
          userId: 'user-123',
          message: 'ヘルプが必要です',
          emotion: '不安' as const,
          priority: 'normal' as const,
          status: 'pending' as const,
          assignedAdminId: null,
          sessionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['不安', 'normal']
        }
      ];

      mockAdminSupportService.getPendingRequests.mockResolvedValue(mockRequests);

      const store = useAdminSupportStore.getState();
      await store.getPendingRequests();

      const state = useAdminSupportStore.getState();
      expect(state.userRequests).toEqual(mockRequests);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('getAvailableAdmins', () => {
    it('利用可能な管理者を取得する', async () => {
      const mockAdmins = [
        {
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
          lastActiveAt: new Date()
        }
      ];

      mockAdminSupportService.getAvailableAdmins.mockResolvedValue(mockAdmins);

      const store = useAdminSupportStore.getState();
      await store.getAvailableAdmins();

      const state = useAdminSupportStore.getState();
      expect(state.availableAdmins).toEqual(mockAdmins);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('assignRequest', () => {
    it('リクエストに管理者を割り当てる', async () => {
      const requestId = 'request-123';
      const adminId = 'admin-123';

      mockAdminSupportService.assignRequest.mockResolvedValue(undefined);

      const store = useAdminSupportStore.getState();
      await store.assignRequest(requestId, adminId);

      expect(mockAdminSupportService.assignRequest).toHaveBeenCalledWith(requestId, adminId);
    });
  });

  describe('startSession', () => {
    it('セッションを開始する', async () => {
      const requestId = 'request-123';
      const adminId = 'admin-123';
      const sessionId = 'session-123';

      mockAdminSupportService.startSession.mockResolvedValue(sessionId);
      mockAdminSupportService.subscribeToSessionMessages.mockReturnValue(jest.fn());

      // loadSession のモック
      const store = useAdminSupportStore.getState();
      const loadSessionSpy = jest.spyOn(store, 'loadSession').mockResolvedValue(undefined);

      await store.startSession(requestId, adminId);

      expect(mockAdminSupportService.startSession).toHaveBeenCalledWith(requestId, adminId);
      expect(loadSessionSpy).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('sendAdminMessage', () => {
    it('管理者メッセージを送信する', async () => {
      const sessionId = 'session-123';
      const adminId = 'admin-123';
      const message = '管理者からのメッセージ';

      mockAdminSupportService.addMessage.mockResolvedValue('message-123');

      const store = useAdminSupportStore.getState();
      await store.sendAdminMessage(sessionId, adminId, message);

      const state = useAdminSupportStore.getState();
      expect(state.supportMessages).toHaveLength(1);
      expect(state.supportMessages[0].content).toBe(message);
      expect(state.supportMessages[0].senderType).toBe('admin');
      expect(mockAdminSupportService.addMessage).toHaveBeenCalledWith(
        sessionId, 
        adminId, 
        'admin', 
        message, 
        'text', 
        false
      );
    });
  });

  describe('addAdminNote', () => {
    it('管理者ノートを追加する', async () => {
      const sessionId = 'session-123';
      const adminId = 'admin-123';
      const note = '管理者ノート';

      mockAdminSupportService.addMessage.mockResolvedValue('note-123');

      const store = useAdminSupportStore.getState();
      await store.addAdminNote(sessionId, adminId, note);

      expect(mockAdminSupportService.addMessage).toHaveBeenCalledWith(
        sessionId, 
        adminId, 
        'admin', 
        note, 
        'note', 
        true
      );
    });
  });

  describe('updateAdminStatus', () => {
    it('管理者ステータスを更新する', async () => {
      const adminId = 'admin-123';
      const status = 'busy' as const;

      mockAdminSupportService.updateAdminStatus.mockResolvedValue(undefined);

      const store = useAdminSupportStore.getState();
      store.availableAdmins = [
        {
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
        }
      ];

      await store.updateAdminStatus(adminId, status);

      const state = useAdminSupportStore.getState();
      expect(state.availableAdmins[0].status).toBe(status);
      expect(state.availableAdmins[0].isOnline).toBe(true);
      expect(mockAdminSupportService.updateAdminStatus).toHaveBeenCalledWith(adminId, status);
    });
  });

  describe('subscribeToSession', () => {
    it('セッションのリアルタイム監視を開始する', () => {
      const sessionId = 'session-123';
      const mockUnsubscribe = jest.fn();

      mockAdminSupportService.subscribeToSessionMessages.mockReturnValue(mockUnsubscribe);

      const store = useAdminSupportStore.getState();
      const result = store.subscribeToSession(sessionId);

      expect(mockAdminSupportService.subscribeToSessionMessages).toHaveBeenCalledWith(
        sessionId,
        expect.any(Function)
      );
      expect(mockRealtimeManager.addListener).toHaveBeenCalledWith(
        `admin-support-session-${sessionId}`,
        mockUnsubscribe,
        'adminSupport'
      );
      expect(result).toBe(mockUnsubscribe);
    });
  });

  describe('subscribeToRequests', () => {
    it('ユーザーリクエストのリアルタイム監視を開始する', () => {
      const userId = 'user-123';
      const mockUnsubscribe = jest.fn();

      mockAdminSupportService.subscribeToUserRequests.mockReturnValue(mockUnsubscribe);

      const store = useAdminSupportStore.getState();
      const result = store.subscribeToRequests(userId);

      expect(mockAdminSupportService.subscribeToUserRequests).toHaveBeenCalledWith(
        userId,
        expect.any(Function)
      );
      expect(mockRealtimeManager.addListener).toHaveBeenCalledWith(
        `admin-support-requests-${userId}`,
        mockUnsubscribe,
        'adminSupport'
      );
      expect(result).toBe(mockUnsubscribe);
    });

    it('userIdが未指定の場合は空の関数を返す', () => {
      const store = useAdminSupportStore.getState();
      const result = store.subscribeToRequests();

      expect(result).toBeInstanceOf(Function);
      expect(mockAdminSupportService.subscribeToUserRequests).not.toHaveBeenCalled();
    });
  });

  describe('ユーティリティメソッド', () => {
    it('setLoading', () => {
      const store = useAdminSupportStore.getState();
      store.setLoading(true);

      const state = useAdminSupportStore.getState();
      expect(state.isLoading).toBe(true);
    });

    it('setWaitingForAdmin', () => {
      const store = useAdminSupportStore.getState();
      store.setWaitingForAdmin(true);

      const state = useAdminSupportStore.getState();
      expect(state.isWaitingForAdmin).toBe(true);
    });

    it('setError', () => {
      const store = useAdminSupportStore.getState();
      store.setError('テストエラー');

      const state = useAdminSupportStore.getState();
      expect(state.error).toBe('テストエラー');
    });

    it('reset', () => {
      const store = useAdminSupportStore.getState();
      store.currentSession = { id: 'test' } as any;
      store.supportMessages = [{ id: 'test' }] as any;
      store.availableAdmins = [{ id: 'test' }] as any;
      store.userRequests = [{ id: 'test' }] as any;
      store.isLoading = true;
      store.isWaitingForAdmin = true;
      store.error = 'test error';

      store.reset();

      const state = useAdminSupportStore.getState();
      expect(state.currentSession).toBeNull();
      expect(state.supportMessages).toEqual([]);
      expect(state.availableAdmins).toEqual([]);
      expect(state.userRequests).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isWaitingForAdmin).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
