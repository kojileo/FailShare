import { create } from 'zustand';
import { 
  AdminSupportStore,
  AdminSupportRequest,
  AdminProfile,
  AdminSupportMessage,
  AdminSupportSession,
  EmotionType
} from '../types';
import { adminSupportService } from '../services/adminSupportService';
import { realtimeManager } from '../utils/realtimeManager';

export const useAdminSupportStore = create<AdminSupportStore>((set, get) => ({
  // 状態
  currentSession: null,
  supportMessages: [],
  availableAdmins: [],
  userRequests: [],
  isLoading: false,
  isWaitingForAdmin: false,
  error: null,

  // ユーザー向けActions
  getActiveSession: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const session = await adminSupportService.getActiveSession(userId);
      
      if (session) {
        set({ currentSession: session, isLoading: false });
        console.log('✅ アクティブセッション取得完了:', session.id);
        
        // セッションのメッセージを監視開始
        get().subscribeToSession(session.id);
      } else {
        set({ currentSession: null, isLoading: false });
        console.log('ℹ️ アクティブセッションなし');
      }
    } catch (error) {
      console.error('❌ アクティブセッション取得エラー:', error);
      set({ 
        error: 'セッション情報の取得に失敗しました',
        isLoading: false
      });
    }
  },

  requestSupport: async (userId: string, message: string, emotion: EmotionType) => {
    try {
      set({ isLoading: true, error: null, isWaitingForAdmin: true });

      // サポートリクエストを作成（pending状態で保存）
      const requestId = await adminSupportService.requestSupport(userId, message, emotion);
      
      console.log('🆘 サポートリクエスト作成完了:', requestId);
      console.log('⏳ 管理者の対応を待機中...');

      set({ 
        isLoading: false, 
        isWaitingForAdmin: true 
      });
    } catch (error) {
      console.error('❌ サポートリクエストエラー:', error);
      set({ 
        error: 'サポートリクエストの送信に失敗しました',
        isLoading: false,
        isWaitingForAdmin: false
      });
    }
  },

  sendMessage: async (sessionId: string, userId: string, message: string) => {
    try {
      set({ error: null });

      // 楽観的更新：ユーザーメッセージを即座に追加
      const userMessage: AdminSupportMessage = {
        id: `temp-${Date.now()}`,
        supportRequestId: sessionId,
        senderId: userId,
        senderType: 'user',
        content: message,
        messageType: 'text',
        timestamp: new Date(),
        readBy: [userId]
      };

      set(state => ({
        supportMessages: [...state.supportMessages, userMessage]
      }));

      // サーバーにメッセージを送信
      await adminSupportService.addMessage(sessionId, userId, 'user', message);

      console.log('💬 ユーザーメッセージ送信完了');
    } catch (error) {
      console.error('❌ メッセージ送信エラー:', error);
      set({ error: 'メッセージの送信に失敗しました' });
    }
  },

  endSession: async (sessionId: string) => {
    try {
      const { currentSession } = get();
      if (!currentSession) return;

      await adminSupportService.endSession(sessionId, currentSession.adminId);
      
      set({ 
        currentSession: { ...currentSession, status: 'completed', endedAt: new Date() }
      });

      console.log('✅ セッション終了完了');
    } catch (error) {
      console.error('❌ セッション終了エラー:', error);
      set({ error: 'セッションの終了に失敗しました' });
    }
  },

  rateSession: async (sessionId: string, rating: number) => {
    try {
      await adminSupportService.rateSession(sessionId, rating);
      
      const { currentSession } = get();
      if (currentSession) {
        set({ 
          currentSession: { ...currentSession, userSatisfactionRating: rating }
        });
      }

      console.log('✅ セッション評価完了:', rating);
    } catch (error) {
      console.error('❌ セッション評価エラー:', error);
      set({ error: 'セッションの評価に失敗しました' });
    }
  },

  // 管理者向けActions
  getPendingRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const requests = await adminSupportService.getPendingRequests();
      set({ userRequests: requests, isLoading: false });
      
      console.log('📋 待機中リクエスト取得完了:', requests.length);
    } catch (error) {
      console.error('❌ 待機中リクエスト取得エラー:', error);
      set({ 
        error: '待機中リクエストの取得に失敗しました',
        isLoading: false
      });
    }
  },

  getAvailableAdmins: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const admins = await adminSupportService.getAvailableAdmins();
      set({ availableAdmins: admins, isLoading: false });
      
      console.log('👥 管理者リスト取得完了:', admins.length);
    } catch (error) {
      console.error('❌ 管理者取得エラー:', error);
      set({ 
        error: '管理者情報の取得に失敗しました',
        isLoading: false
      });
    }
  },

  assignRequest: async (requestId: string, adminId: string) => {
    try {
      await adminSupportService.assignRequest(requestId, adminId);
      console.log('✅ リクエスト割り当て完了');
    } catch (error) {
      console.error('❌ リクエスト割り当てエラー:', error);
      set({ error: 'リクエストの割り当てに失敗しました' });
    }
  },

  startSession: async (requestId: string, adminId: string) => {
    try {
      const sessionId = await adminSupportService.startSession(requestId, adminId);
      await get().loadSession(sessionId);
      
      console.log('✅ セッション開始完了:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('❌ セッション開始エラー:', error);
      set({ error: 'セッションの開始に失敗しました' });
      throw error;
    }
  },

  sendAdminMessage: async (sessionId: string, adminId: string, message: string, isPrivate = false) => {
    try {
      set({ error: null });

      // 楽観的更新：管理者メッセージを即座に追加
      const adminMessage: AdminSupportMessage = {
        id: `temp-admin-${Date.now()}`,
        supportRequestId: sessionId,
        senderId: adminId,
        senderType: 'admin',
        content: message,
        messageType: 'text',
        isPrivate,
        timestamp: new Date(),
        readBy: [adminId]
      };

      set(state => ({
        supportMessages: [...state.supportMessages, adminMessage]
      }));

      // サーバーにメッセージを送信
      await adminSupportService.addMessage(sessionId, adminId, 'admin', message, 'text', isPrivate);

      console.log('💬 管理者メッセージ送信完了');
    } catch (error) {
      console.error('❌ 管理者メッセージ送信エラー:', error);
      set({ error: 'メッセージの送信に失敗しました' });
    }
  },

  addAdminNote: async (sessionId: string, adminId: string, note: string) => {
    try {
      await adminSupportService.addMessage(sessionId, adminId, 'admin', note, 'note', true);
      console.log('📝 管理者ノート追加完了');
    } catch (error) {
      console.error('❌ 管理者ノート追加エラー:', error);
      set({ error: '管理者ノートの追加に失敗しました' });
    }
  },

  updateAdminStatus: async (adminId: string, status: AdminProfile['status']) => {
    try {
      await adminSupportService.updateAdminStatus(adminId, status);
      
      // ローカル状態を更新
      set(state => ({
        availableAdmins: state.availableAdmins.map(admin =>
          admin.id === adminId 
            ? { ...admin, status, isOnline: status !== 'offline', lastActiveAt: new Date() }
            : admin
        )
      }));

      console.log('✅ 管理者ステータス更新完了:', status);
    } catch (error) {
      console.error('❌ 管理者ステータス更新エラー:', error);
      set({ error: '管理者ステータスの更新に失敗しました' });
    }
  },

  // 共通Actions
  loadSession: async (sessionId: string) => {
    try {
      set({ isLoading: true, error: null });

      // セッション情報を取得（実装は簡略化）
      const session: AdminSupportSession = {
        id: sessionId,
        userId: 'user-id', // 実際の実装では取得する
        adminId: 'admin-id', // 実際の実装では取得する
        status: 'active',
        startedAt: new Date(),
        messages: [],
        tags: []
      };

      set({ 
        currentSession: session,
        isLoading: false
      });

      // メッセージのリアルタイム監視を開始
      get().subscribeToSession(sessionId);

      console.log('✅ セッション読み込み完了:', sessionId);
    } catch (error) {
      console.error('❌ セッション読み込みエラー:', error);
      set({ 
        error: 'セッション情報の取得に失敗しました',
        isLoading: false
      });
    }
  },

  subscribeToSession: (sessionId: string) => {
    const unsubscribe = adminSupportService.subscribeToSessionMessages(
      sessionId,
      (messages) => {
        set({ supportMessages: messages });
      }
    );

    // リアルタイムマネージャーに登録
    const listenerKey = `admin-support-session-${sessionId}`;
    realtimeManager.addListener(listenerKey, unsubscribe, 'adminSupport');

    return () => {
      realtimeManager.removeListener(listenerKey);
    };
  },

  subscribeToRequests: (userId?: string) => {
    if (!userId) return () => {};

    const unsubscribe = adminSupportService.subscribeToUserRequests(
      userId,
      (requests) => {
        set({ userRequests: requests });
      }
    );

    // リアルタイムマネージャーに登録
    const listenerKey = `admin-support-requests-${userId}`;
    realtimeManager.addListener(listenerKey, unsubscribe, 'adminSupport');

    return () => {
      realtimeManager.removeListener(listenerKey);
    };
  },

  // ユーティリティActions
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setWaitingForAdmin: (waiting: boolean) => {
    set({ isWaitingForAdmin: waiting });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set({
      currentSession: null,
      supportMessages: [],
      availableAdmins: [],
      userRequests: [],
      isLoading: false,
      isWaitingForAdmin: false,
      error: null
    });
  }
}));
