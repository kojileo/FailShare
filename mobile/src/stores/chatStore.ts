import { create } from 'zustand';
import { chatService } from '../services/chatService';
import { ChatStore, Chat, ChatMessage } from '../types';

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  chatPreviews: [],
  currentChat: null,
  currentChatMessages: [],
  isLoading: false,
  error: null,

  // Actions
  loadUserChats: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const chats = await chatService.getUserChats(userId);
      set({ chats, isLoading: false });
    } catch (error) {
      console.error('チャット読み込みエラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'チャットの読み込みに失敗しました',
        isLoading: false 
      });
    }
  },

  loadChat: async (chatId: string) => {
    try {
      set({ isLoading: true, error: null });
      const chat = await chatService.getChat(chatId);
      set({ currentChat: chat, isLoading: false });
    } catch (error) {
      console.error('チャット詳細読み込みエラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'チャットの読み込みに失敗しました',
        isLoading: false 
      });
    }
  },

  loadChatMessages: async (chatId: string) => {
    try {
      set({ isLoading: true, error: null });
      const messages = await chatService.getChatMessages(chatId);
      set({ currentChatMessages: messages, isLoading: false });
    } catch (error) {
      console.error('メッセージ読み込みエラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'メッセージの読み込みに失敗しました',
        isLoading: false 
      });
    }
  },

  sendMessage: async (chatId: string, senderId: string, content: string) => {
    try {
      set({ error: null });
      
      // 楽観的更新
      const newMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        chatId,
        senderId,
        content,
        messageType: 'text',
        createdAt: new Date(),
        isRead: false,
        isEdited: false
      };

      const currentMessages = get().currentChatMessages;
      set({ 
        currentChatMessages: [...currentMessages, newMessage]
      });

      // 実際の送信
      await chatService.sendMessage(chatId, senderId, content);
      
      // 楽観的更新を削除して実際のメッセージに置き換え
      const updatedMessages = await chatService.getChatMessages(chatId);
      set({ currentChatMessages: updatedMessages });
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      
      // 楽観的更新を元に戻す
      const currentMessages = get().currentChatMessages;
      const filteredMessages = currentMessages.filter(msg => !msg.id.startsWith('temp-'));
      set({ 
        currentChatMessages: filteredMessages,
        error: error instanceof Error ? error.message : 'メッセージの送信に失敗しました'
      });
    }
  },

  editMessage: async (messageId: string, content: string) => {
    try {
      set({ error: null });
      
      // 楽観的更新
      const currentMessages = get().currentChatMessages;
      const updatedMessages = currentMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, content, isEdited: true, editedAt: new Date() }
          : msg
      );
      set({ currentChatMessages: updatedMessages });

      // 実際の編集
      await chatService.editMessage(messageId, content);
    } catch (error) {
      console.error('メッセージ編集エラー:', error);
      
      // 楽観的更新を元に戻す
      const messages = await chatService.getChatMessages(get().currentChat?.id || '');
      set({ 
        currentChatMessages: messages,
        error: error instanceof Error ? error.message : 'メッセージの編集に失敗しました'
      });
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      set({ error: null });
      
      // 楽観的更新
      const currentMessages = get().currentChatMessages;
      const filteredMessages = currentMessages.filter(msg => msg.id !== messageId);
      set({ currentChatMessages: filteredMessages });

      // 実際の削除
      await chatService.deleteMessage(messageId);
    } catch (error) {
      console.error('メッセージ削除エラー:', error);
      
      // 楽観的更新を元に戻す
      const messages = await chatService.getChatMessages(get().currentChat?.id || '');
      set({ 
        currentChatMessages: messages,
        error: error instanceof Error ? error.message : 'メッセージの削除に失敗しました'
      });
    }
  },

  markChatAsRead: async (chatId: string, userId: string) => {
    try {
      set({ error: null });
      await chatService.markChatAsRead(chatId, userId);
      
      // チャットプレビューの未読数を更新
      const currentPreviews = get().chatPreviews;
      const updatedPreviews = currentPreviews.map(preview => 
        preview.chatId === chatId 
          ? { ...preview, unreadCount: 0 }
          : preview
      );
      set({ chatPreviews: updatedPreviews });
    } catch (error) {
      console.error('チャット既読エラー:', error);
      // エラーを無視して続行（ユーザー体験を優先）
      console.warn('既読処理に失敗しましたが、チャット機能は継続します');
    }
  },

  setCurrentChat: (chat: Chat | null) => {
    set({ currentChat: chat });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set({
      chats: [],
      chatPreviews: [],
      currentChat: null,
      currentChatMessages: [],
      isLoading: false,
      error: null
    });
  },

  // リアルタイム更新
  subscribeToChat: (chatId: string) => {
    return chatService.subscribeToChat(chatId, (chat) => {
      set({ currentChat: chat });
    });
  },

  subscribeToUserChats: (userId: string) => {
    return chatService.subscribeToUserChats(userId, async (chats) => {
      set({ chats });
      
      // チャットプレビューも更新
      try {
        const previews = await chatService.getChatPreview(userId);
        set({ chatPreviews: previews });
      } catch (error) {
        console.error('チャットプレビュー更新エラー:', error);
      }
    });
  }
}));
