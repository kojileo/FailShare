import { renderHook, act } from '@testing-library/react-hooks';
import { useChatStore } from '../../../src/stores/chatStore';
import { chatService } from '../../../src/services/chatService';
import { Chat, ChatMessage, ChatPreview } from '../../../src/types';

// チャットサービスのモック
jest.mock('../../../src/services/chatService');

const mockChatService = chatService as jest.Mocked<typeof chatService>;

describe('ChatStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ストアをリセット
    act(() => {
      useChatStore.getState().reset();
    });
  });

  describe('loadUserChats', () => {
    it('should load user chats successfully', async () => {
      const mockChats: Chat[] = [
        {
          id: 'chat1',
          participants: ['user1', 'user2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          unreadCount: { user1: 0, user2: 0 },
        },
      ];

      mockChatService.getUserChats.mockResolvedValue(mockChats);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.loadUserChats('user1');
      });

      expect(result.current.chats).toEqual(mockChats);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle error when loading fails', async () => {
      const error = new Error('Failed to load chats');
      mockChatService.getUserChats.mockRejectedValue(error);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.loadUserChats('user1');
      });

      expect(result.current.error).toBe('Failed to load chats');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('loadChat', () => {
    it('should load chat successfully', async () => {
      const mockChat: Chat = {
        id: 'chat1',
        participants: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
        unreadCount: { user1: 0, user2: 0 },
      };

      mockChatService.getChat.mockResolvedValue(mockChat);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.loadChat('chat1');
      });

      expect(result.current.currentChat).toEqual(mockChat);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('loadChatMessages', () => {
    it('should load chat messages successfully', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          content: 'Hello',
          messageType: 'text',
          createdAt: new Date(),
          isRead: false,
          isEdited: false,
        },
      ];

      mockChatService.getChatMessages.mockResolvedValue(mockMessages);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.loadChatMessages('chat1');
      });

      expect(result.current.currentChatMessages).toEqual(mockMessages);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('sendMessage', () => {
    it('should send message with optimistic update', async () => {
      mockChatService.sendMessage.mockResolvedValue('msg1');
      mockChatService.getChatMessages.mockResolvedValue([
        {
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          content: 'Hello',
          messageType: 'text',
          createdAt: new Date(),
          isRead: false,
          isEdited: false,
        },
      ]);

      const { result } = renderHook(() => useChatStore());

      // 初期状態を設定
      act(() => {
        result.current.setCurrentChat({
          id: 'chat1',
          participants: ['user1', 'user2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          unreadCount: { user1: 0, user2: 0 },
        });
      });

      await act(async () => {
        await result.current.sendMessage('chat1', 'user1', 'Hello');
      });

      expect(mockChatService.sendMessage).toHaveBeenCalledWith('chat1', 'user1', 'Hello');
      expect(result.current.currentChatMessages).toHaveLength(1);
      expect(result.current.currentChatMessages[0].content).toBe('Hello');
    });

    it('should handle error and revert optimistic update', async () => {
      const error = new Error('Failed to send message');
      mockChatService.sendMessage.mockRejectedValue(error);

      const { result } = renderHook(() => useChatStore());

      // 初期状態を設定
      act(() => {
        result.current.setCurrentChat({
          id: 'chat1',
          participants: ['user1', 'user2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          unreadCount: { user1: 0, user2: 0 },
        });
        result.current.currentChatMessages = [
          {
            id: 'existing-msg',
            chatId: 'chat1',
            senderId: 'user1',
            content: 'Existing message',
            messageType: 'text',
            createdAt: new Date(),
            isRead: false,
            isEdited: false,
          },
        ];
      });

      await act(async () => {
        await result.current.sendMessage('chat1', 'user1', 'Hello');
      });

      expect(result.current.error).toBe('Failed to send message');
      // エラーが設定されていることを確認
      expect(result.current.error).toBe('Failed to send message');
    });
  });

  describe('editMessage', () => {
    it('should edit message with optimistic update', async () => {
      mockChatService.editMessage.mockResolvedValue();

      const { result } = renderHook(() => useChatStore());

      // 初期状態を設定
      act(() => {
        result.current.currentChatMessages = [
          {
            id: 'msg1',
            chatId: 'chat1',
            senderId: 'user1',
            content: 'Original message',
            messageType: 'text',
            createdAt: new Date(),
            isRead: false,
            isEdited: false,
          },
        ];
      });

      await act(async () => {
        await result.current.editMessage('msg1', 'Edited message');
      });

      expect(mockChatService.editMessage).toHaveBeenCalledWith('msg1', 'Edited message');
      expect(result.current.currentChatMessages[0].content).toBe('Edited message');
      expect(result.current.currentChatMessages[0].isEdited).toBe(true);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message with optimistic update', async () => {
      mockChatService.deleteMessage.mockResolvedValue();

      const { result } = renderHook(() => useChatStore());

      // 初期状態を設定
      act(() => {
        result.current.currentChatMessages = [
          {
            id: 'msg1',
            chatId: 'chat1',
            senderId: 'user1',
            content: 'Message to delete',
            messageType: 'text',
            createdAt: new Date(),
            isRead: false,
            isEdited: false,
          },
        ];
      });

      await act(async () => {
        await result.current.deleteMessage('msg1');
      });

      expect(mockChatService.deleteMessage).toHaveBeenCalledWith('msg1');
      expect(result.current.currentChatMessages).toHaveLength(0);
    });
  });

  describe('markChatAsRead', () => {
    it('should mark chat as read and update previews', async () => {
      mockChatService.markChatAsRead.mockResolvedValue();

      const { result } = renderHook(() => useChatStore());

      // 初期状態を設定
      act(() => {
        result.current.chatPreviews = [
          {
            chatId: 'chat1',
            friendId: 'user2',
            friendName: 'Friend',
            friendAvatar: '',
            unreadCount: 5,
            isOnline: false,
          },
        ];
      });

      await act(async () => {
        await result.current.markChatAsRead('chat1', 'user1');
      });

      expect(mockChatService.markChatAsRead).toHaveBeenCalledWith('chat1', 'user1');
      expect(result.current.chatPreviews[0].unreadCount).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockChatService.markChatAsRead.mockRejectedValue(new Error('Permission denied'));

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.markChatAsRead('chat1', 'user1');
      });

      expect(consoleSpy).toHaveBeenCalledWith('既読処理に失敗しましたが、チャット機能は継続します');
      consoleSpy.mockRestore();
    });
  });

  describe('setCurrentChat', () => {
    it('should set current chat', () => {
      const { result } = renderHook(() => useChatStore());

      const mockChat: Chat = {
        id: 'chat1',
        participants: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
        unreadCount: { user1: 0, user2: 0 },
      };

      act(() => {
        result.current.setCurrentChat(mockChat);
      });

      expect(result.current.currentChat).toEqual(mockChat);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useChatStore());

      // 状態を変更
      act(() => {
        result.current.setCurrentChat({
          id: 'chat1',
          participants: ['user1', 'user2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          unreadCount: { user1: 0, user2: 0 },
        });
        result.current.setError('Some error');
        result.current.setLoading(true);
      });

      // リセット
      act(() => {
        result.current.reset();
      });

      expect(result.current.chats).toEqual([]);
      expect(result.current.chatPreviews).toEqual([]);
      expect(result.current.currentChat).toBeNull();
      expect(result.current.currentChatMessages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
