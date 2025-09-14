import { create } from 'zustand';
import { 
  ConversationState, 
  ConversationMessage, 
  AIUserProfile, 
  AIAvatarStore 
} from '../types';
import { aiAvatarService } from '../services/aiAvatarService';
import { realtimeManager } from '../utils/realtimeManager';

export const useAIAvatarStore = create<AIAvatarStore>((set, get) => ({
  // 状態
  currentConversation: null,
  conversationMessages: [],
  userProfile: null,
  isLoading: false,
  isTyping: false,
  error: null,

  // Actions
  startConversation: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const conversationId = await aiAvatarService.startConversation(userId);
      
      // 対話状態を取得
      const conversationState: ConversationState = {
        id: conversationId,
        userId,
        status: 'active',
        lastActivity: new Date(),
        messageCount: 0,
        averageEmotion: 'その他',
        topics: []
      };

      set({ 
        currentConversation: conversationState,
        conversationMessages: [],
        isLoading: false 
      });

      // リアルタイム監視を開始
      get().subscribeToConversation(conversationId);

      console.log('🤖 AI対話開始:', conversationId);
    } catch (error) {
      console.error('AI対話開始エラー:', error);
      set({ 
        error: '対話を開始できませんでした',
        isLoading: false 
      });
    }
  },

  sendMessage: async (conversationId: string, userId: string, message: string) => {
    try {
      set({ isTyping: true, error: null });

      // ユーザーメッセージを即座に追加（楽観的更新）
      const userMessage: ConversationMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: userId,
        senderType: 'user',
        content: message,
        timestamp: new Date(),
        metadata: {
          advice: null,
          sentiment: 'neutral',
          keywords: [],
          avatarExpression: null
        }
      };

      set(state => ({
        conversationMessages: [...state.conversationMessages, userMessage]
      }));

      // AI応答を取得
      const aiResponse = await aiAvatarService.sendMessage(conversationId, userId, message);

      // AI応答を追加
      const aiMessage: ConversationMessage = {
        id: aiResponse.id,
        conversationId: aiResponse.conversationId,
        senderId: 'ai',
        senderType: 'ai',
        content: aiResponse.message,
        emotion: aiResponse.emotion,
        timestamp: aiResponse.timestamp,
        metadata: {
          advice: aiResponse.advice || null,
          sentiment: 'positive',
          keywords: [],
          avatarExpression: null
        }
      };

      set(state => ({
        conversationMessages: [...state.conversationMessages, aiMessage],
        isTyping: false
      }));

      // ユーザープロファイルを更新
      await get().updateUserProfileFromConversation(userId, message, aiResponse.emotion);

      console.log('🤖 AI応答受信:', aiResponse.message);
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      set({ 
        error: 'メッセージの送信に失敗しました',
        isTyping: false 
      });
    }
  },

  endConversation: async () => {
    try {
      const { currentConversation } = get();
      if (!currentConversation) return;

      await aiAvatarService.endConversation(currentConversation.id);
      
      set({ 
        currentConversation: null,
        conversationMessages: [],
        isTyping: false 
      });

      console.log('🤖 AI対話終了:', currentConversation.id);
    } catch (error) {
      console.error('対話終了エラー:', error);
      set({ error: '対話を終了できませんでした' });
    }
  },

  loadConversationHistory: async (conversationId: string) => {
    try {
      set({ isLoading: true, error: null });

      const messages = await aiAvatarService.getConversationHistory(conversationId);
      
      set({ 
        conversationMessages: messages,
        isLoading: false 
      });

      console.log('🤖 対話履歴読み込み完了:', messages.length, '件');
    } catch (error) {
      console.error('対話履歴読み込みエラー:', error);
      set({ 
        error: '対話履歴を読み込めませんでした',
        isLoading: false 
      });
    }
  },

  updateUserProfile: async (profile: AIUserProfile) => {
    try {
      await aiAvatarService.updateUserProfile(profile.userId, profile);
      
      set({ userProfile: profile });
      
      console.log('🤖 ユーザープロファイル更新完了');
    } catch (error) {
      console.error('プロファイル更新エラー:', error);
      set({ error: 'プロファイルの更新に失敗しました' });
    }
  },

  // 内部メソッド
  updateUserProfileFromConversation: async (userId: string, message: string, emotion: string) => {
    try {
      const { userProfile } = get();
      
      // 既存のプロファイルを取得または新規作成
      let profile = userProfile || {
        userId,
        preferredTopics: [],
        communicationStyle: 'friendly' as const,
        emotionalTendencies: [],
        conversationHistory: [],
        lastUpdated: new Date()
      };

      // 感情の傾向を更新
      if (!profile.emotionalTendencies.includes(emotion as any)) {
        profile.emotionalTendencies.push(emotion as any);
      }

      // 対話履歴を更新（最新10件まで保持）
      profile.conversationHistory.push(message);
      if (profile.conversationHistory.length > 10) {
        profile.conversationHistory = profile.conversationHistory.slice(-10);
      }

      // プロファイルを更新
      profile.lastUpdated = new Date();
      await get().updateUserProfile(profile);

    } catch (error) {
      console.error('プロファイル自動更新エラー:', error);
    }
  },

  // リアルタイム更新
  subscribeToConversation: (conversationId: string) => {
    const key = `ai-conversation-${conversationId}`;
    
    const unsubscribe = aiAvatarService.subscribeToConversation(conversationId, (message) => {
      set(state => {
        // 重複チェック
        const exists = state.conversationMessages.some(msg => msg.id === message.id);
        if (exists) return state;

        return {
          conversationMessages: [...state.conversationMessages, message]
        };
      });
    });

    // リアルタイムマネージャーに登録
    realtimeManager.registerListener(key, unsubscribe, 'AI対話');

    return () => {
      realtimeManager.removeListener(key);
    };
  },

  // ユーティリティ
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setTyping: (typing: boolean) => set({ isTyping: typing }),
  setError: (error: string | null) => set({ error }),
  
  reset: () => set({
    currentConversation: null,
    conversationMessages: [],
    userProfile: null,
    isLoading: false,
    isTyping: false,
    error: null
  })
}));
