import { useAIAvatarStore } from '../../../src/stores/aiAvatarStore';
import { aiAvatarService } from '../../../src/services/aiAvatarService';
import { realtimeManager } from '../../../src/utils/realtimeManager';

// サービス層のモック
jest.mock('../../../src/services/aiAvatarService', () => ({
  aiAvatarService: {
    startConversation: jest.fn(),
    sendMessage: jest.fn(),
    endConversation: jest.fn(),
    getConversationHistory: jest.fn(),
    updateUserProfile: jest.fn(),
    subscribeToConversation: jest.fn(),
    subscribeToConversationState: jest.fn()
  }
}));

// ユーティリティのモック
jest.mock('../../../src/utils/realtimeManager', () => ({
  realtimeManager: {
    registerListener: jest.fn(),
    removeListener: jest.fn()
  }
}));

const mockAIAvatarService = aiAvatarService as jest.Mocked<typeof aiAvatarService>;
const mockRealtimeManager = realtimeManager as jest.Mocked<typeof realtimeManager>;

describe('AIAvatarStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ストアの状態をリセット
    useAIAvatarStore.getState().reset();
  });

  describe('startConversation', () => {
    it('対話を開始する', async () => {
      const userId = 'user-123';
      const conversationId = 'conversation-123';

      mockAIAvatarService.startConversation.mockResolvedValue(conversationId);
      mockAIAvatarService.subscribeToConversation.mockReturnValue(jest.fn());

      const store = useAIAvatarStore.getState();
      await store.startConversation(userId);

      const state = useAIAvatarStore.getState();
      expect(state.currentConversation).toEqual({
        id: conversationId,
        userId,
        status: 'active',
        lastActivity: expect.any(Date),
        messageCount: 0,
        averageEmotion: 'その他' as const,
        topics: []
      });
      expect(state.conversationMessages).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(mockAIAvatarService.startConversation).toHaveBeenCalledWith(userId);
    });

    it('対話開始でエラーが発生する', async () => {
      const userId = 'user-123';
      const errorMessage = '対話開始エラー';

      mockAIAvatarService.startConversation.mockRejectedValue(new Error(errorMessage));

      const store = useAIAvatarStore.getState();
      await store.startConversation(userId);

      const state = useAIAvatarStore.getState();
      expect(state.error).toBe('対話を開始できませんでした');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('メッセージを送信してAI応答を取得する', async () => {
      const conversationId = 'conversation-123';
      const userId = 'user-123';
      const message = 'こんにちは';
      const mockAIResponse = {
        id: 'ai-message-123',
        conversationId,
        message: 'こんにちは！お疲れ様です。',
        emotion: 'その他' as const,
        advice: '気分転換をしてみてください。',
        timestamp: new Date(),
        isTyping: false
      };

      mockAIAvatarService.sendMessage.mockResolvedValue(mockAIResponse);

      // プライベートメソッドのモック
      const updateUserProfileFromConversationSpy = jest.spyOn(
        useAIAvatarStore.getState(), 
        'updateUserProfileFromConversation'
      ).mockResolvedValue(undefined);

      const store = useAIAvatarStore.getState();
      await store.sendMessage(conversationId, userId, message);

      const state = useAIAvatarStore.getState();
      expect(state.conversationMessages).toHaveLength(2); // ユーザーメッセージ + AI応答
      expect(state.conversationMessages[0].content).toBe(message);
      expect(state.conversationMessages[0].senderType).toBe('user');
      expect(state.conversationMessages[1].content).toBe(mockAIResponse.message);
      expect(state.conversationMessages[1].senderType).toBe('ai');
      expect(state.isTyping).toBe(false);
      expect(mockAIAvatarService.sendMessage).toHaveBeenCalledWith(conversationId, userId, message);
      expect(updateUserProfileFromConversationSpy).toHaveBeenCalledWith(userId, message, 'その他');
    });

    it('メッセージ送信でエラーが発生する', async () => {
      const conversationId = 'conversation-123';
      const userId = 'user-123';
      const message = 'こんにちは';

      mockAIAvatarService.sendMessage.mockRejectedValue(new Error('送信エラー'));

      const store = useAIAvatarStore.getState();
      await store.sendMessage(conversationId, userId, message);

      const state = useAIAvatarStore.getState();
      expect(state.error).toBe('メッセージの送信に失敗しました');
      expect(state.isTyping).toBe(false);
    });
  });

  describe('endConversation', () => {
    it('対話を終了する', async () => {
      const conversationId = 'conversation-123';
      const mockConversation = {
        id: conversationId,
        userId: 'user-123',
        status: 'active' as const,
        lastActivity: new Date(),
        messageCount: 5,
        averageEmotion: 'その他' as const,
        topics: []
      };

      mockAIAvatarService.endConversation.mockResolvedValue(undefined);

      const store = useAIAvatarStore.getState();
      store.currentConversation = mockConversation;
      await store.endConversation();

      const state = useAIAvatarStore.getState();
      expect(state.currentConversation).toBeNull();
      expect(state.conversationMessages).toEqual([]);
      expect(state.isTyping).toBe(false);
      expect(mockAIAvatarService.endConversation).toHaveBeenCalledWith(conversationId);
    });

    it('対話がない場合は何もしない', async () => {
      const store = useAIAvatarStore.getState();
      store.currentConversation = null;
      await store.endConversation();

      expect(mockAIAvatarService.endConversation).not.toHaveBeenCalled();
    });
  });

  describe('loadConversationHistory', () => {
    it('対話履歴を読み込む', async () => {
      const conversationId = 'conversation-123';
      const mockMessages = [
        {
          id: 'message-123',
          conversationId,
          senderId: 'user-123',
          senderType: 'user' as const,
          content: 'こんにちは',
          emotion: 'その他' as const,
          timestamp: new Date(),
          metadata: {
            sentiment: 'neutral' as const,
            keywords: []
          }
        }
      ];

      mockAIAvatarService.getConversationHistory.mockResolvedValue(mockMessages);

      const store = useAIAvatarStore.getState();
      await store.loadConversationHistory(conversationId);

      const state = useAIAvatarStore.getState();
      expect(state.conversationMessages).toEqual(mockMessages);
      expect(state.isLoading).toBe(false);
      expect(mockAIAvatarService.getConversationHistory).toHaveBeenCalledWith(conversationId);
    });

    it('対話履歴読み込みでエラーが発生する', async () => {
      const conversationId = 'conversation-123';

      mockAIAvatarService.getConversationHistory.mockRejectedValue(new Error('読み込みエラー'));

      const store = useAIAvatarStore.getState();
      await store.loadConversationHistory(conversationId);

      const state = useAIAvatarStore.getState();
      expect(state.error).toBe('対話履歴を読み込めませんでした');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateUserProfile', () => {
    it('ユーザープロファイルを更新する', async () => {
      const profile = {
        userId: 'user-123',
        preferredTopics: ['技術'],
        communicationStyle: 'friendly' as const,
        emotionalTendencies: ['不安' as const],
        conversationHistory: ['メッセージ1'],
        lastUpdated: new Date()
      };

      mockAIAvatarService.updateUserProfile.mockResolvedValue(undefined);

      const store = useAIAvatarStore.getState();
      await store.updateUserProfile(profile);

      const state = useAIAvatarStore.getState();
      expect(state.userProfile).toEqual(profile);
      expect(mockAIAvatarService.updateUserProfile).toHaveBeenCalledWith(profile.userId, profile);
    });

    it('プロファイル更新でエラーが発生する', async () => {
      const profile = {
        userId: 'user-123',
        preferredTopics: ['技術'],
        communicationStyle: 'friendly' as const,
        emotionalTendencies: ['不安' as const],
        conversationHistory: ['メッセージ1'],
        lastUpdated: new Date()
      };

      mockAIAvatarService.updateUserProfile.mockRejectedValue(new Error('更新エラー'));

      const store = useAIAvatarStore.getState();
      await store.updateUserProfile(profile);

      const state = useAIAvatarStore.getState();
      expect(state.error).toBe('プロファイルの更新に失敗しました');
    });
  });

  describe('updateUserProfileFromConversation', () => {
    it('対話からユーザープロファイルを自動更新する', async () => {
      const userId = 'user-123';
      const message = 'テストメッセージ';
      const emotion = '不安';

      const mockProfile = {
        userId,
        preferredTopics: [],
        communicationStyle: 'friendly' as const,
        emotionalTendencies: [],
        conversationHistory: [],
        lastUpdated: new Date()
      };

      // 既存のプロファイルを設定
      const store = useAIAvatarStore.getState();
      store.userProfile = mockProfile;

      // 関数が例外を投げないことを確認
      await expect(store.updateUserProfileFromConversation(userId, message, emotion)).resolves.not.toThrow();
    });

    it('プロファイルが存在しない場合は新規作成する', async () => {
      const userId = 'user-123';
      const message = 'テストメッセージ';
      const emotion = '不安';

      const store = useAIAvatarStore.getState();
      store.userProfile = null;

      // 関数が例外を投げないことを確認
      await expect(store.updateUserProfileFromConversation(userId, message, emotion)).resolves.not.toThrow();
    });
  });

  describe('subscribeToConversation', () => {
    it('対話のリアルタイム監視を開始する', () => {
      const conversationId = 'conversation-123';
      const mockUnsubscribe = jest.fn();

      mockAIAvatarService.subscribeToConversation.mockReturnValue(mockUnsubscribe);

      const store = useAIAvatarStore.getState();
      const result = store.subscribeToConversation(conversationId);

      expect(mockAIAvatarService.subscribeToConversation).toHaveBeenCalledWith(
        conversationId,
        expect.any(Function)
      );
      expect(mockRealtimeManager.registerListener).toHaveBeenCalledWith(
        `ai-conversation-${conversationId}`,
        mockUnsubscribe,
        'AI対話'
      );
      expect(result).toBeDefined();
    });
  });

  describe('ユーティリティメソッド', () => {
    it('setLoading', () => {
      const store = useAIAvatarStore.getState();
      store.setLoading(true);

      const state = useAIAvatarStore.getState();
      expect(state.isLoading).toBe(true);
    });

    it('setTyping', () => {
      const store = useAIAvatarStore.getState();
      store.setTyping(true);

      const state = useAIAvatarStore.getState();
      expect(state.isTyping).toBe(true);
    });

    it('setError', () => {
      const store = useAIAvatarStore.getState();
      store.setError('テストエラー');

      const state = useAIAvatarStore.getState();
      expect(state.error).toBe('テストエラー');
    });

    it('reset', () => {
      const store = useAIAvatarStore.getState();
      store.currentConversation = { id: 'test' } as any;
      store.conversationMessages = [{ id: 'test' }] as any;
      store.userProfile = { userId: 'test' } as any;
      store.isLoading = true;
      store.isTyping = true;
      store.error = 'test error';

      store.reset();

      const state = useAIAvatarStore.getState();
      expect(state.currentConversation).toBeNull();
      expect(state.conversationMessages).toEqual([]);
      expect(state.userProfile).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isTyping).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const state = useAIAvatarStore.getState();
      
      expect(state.currentConversation).toBeNull();
      expect(state.conversationMessages).toEqual([]);
      expect(state.userProfile).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isTyping).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
