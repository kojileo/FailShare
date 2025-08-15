import { chatService } from '../../../src/services/chatService';
import { db } from '../../../src/services/firebase';
import { Chat, ChatMessage, ChatPreview } from '../../../src/types';

// Firebaseのモック
jest.mock('../../../src/services/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  writeBatch: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Firestoreのモック
const mockAddDoc = jest.mocked(require('firebase/firestore').addDoc);
const mockGetDoc = jest.mocked(require('firebase/firestore').getDoc);
const mockGetDocs = jest.mocked(require('firebase/firestore').getDocs);
const mockUpdateDoc = jest.mocked(require('firebase/firestore').updateDoc);
const mockDeleteDoc = jest.mocked(require('firebase/firestore').deleteDoc);
const mockOnSnapshot = jest.mocked(require('firebase/firestore').onSnapshot);
const mockQuery = jest.mocked(require('firebase/firestore').query);
const mockWhere = jest.mocked(require('firebase/firestore').where);
const mockOrderBy = jest.mocked(require('firebase/firestore').orderBy);
const mockLimit = jest.mocked(require('firebase/firestore').limit);
const mockWriteBatch = jest.mocked(require('firebase/firestore').writeBatch);
const mockServerTimestamp = jest.mocked(require('firebase/firestore').serverTimestamp);
const mockDoc = jest.mocked(require('firebase/firestore').doc);
const mockCollection = jest.mocked(require('firebase/firestore').collection);

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createChat', () => {
    it('should create a new chat successfully', async () => {
      const participants = ['user1', 'user2'];
      const mockDocRef = { id: 'chat123' };
      
      mockAddDoc.mockResolvedValue(mockDocRef);
      mockServerTimestamp.mockReturnValue('timestamp');

      const result = await chatService.createChat(participants);

      expect(result).toBe('chat123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        undefined,
        {
          participants: participants.sort(),
          createdAt: 'timestamp',
          updatedAt: 'timestamp',
          unreadCount: { user1: 0, user2: 0 },
        }
      );
    });

    it('should throw error when chat creation fails', async () => {
      mockAddDoc.mockRejectedValue(new Error('Database error'));

      await expect(chatService.createChat(['user1', 'user2']))
        .rejects.toThrow('チャットの作成に失敗しました');
    });
  });

  describe('getChat', () => {
    it('should return chat when it exists', async () => {
      const mockChatData = {
        participants: ['user1', 'user2'],
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
        unreadCount: { user1: 0, user2: 0 },
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'chat123',
        data: () => mockChatData,
      });

      const result = await chatService.getChat('chat123');

      expect(result).toEqual(expect.objectContaining({
        id: 'chat123',
        participants: ['user1', 'user2'],
      }));
    });

    it('should return null when chat does not exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await chatService.getChat('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockBatch = {
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn(),
      };

      mockWriteBatch.mockReturnValue(mockBatch);
      mockDoc.mockReturnValue('mock-doc-ref');
      mockCollection.mockReturnValue('mock-collection-ref');
      // doc(collection(db, 'messages'))の戻り値を設定
      mockDoc.mockReturnValueOnce({ id: 'msg123' });
      // 最初の呼び出し（メッセージ作成時）
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          participants: ['user1', 'user2'],
          unreadCount: { user1: 0, user2: 0 },
        }),
      });
      // 2番目の呼び出し（チャット情報取得時）
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          participants: ['user1', 'user2'],
          unreadCount: { user1: 0, user2: 0 },
        }),
      });

      const result = await chatService.sendMessage('chat123', 'user1', 'Hello!');

      expect(result).toBe('msg123');
      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should handle send message error', async () => {
      mockWriteBatch.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(chatService.sendMessage('chat123', 'user1', 'Hello!'))
        .rejects.toThrow('メッセージの送信に失敗しました');
    });
  });

  describe('getChatMessages', () => {
    it('should return messages in correct order', async () => {
      const mockMessages = [
        {
          id: 'msg1',
          data: () => ({
            chatId: 'chat123',
            senderId: 'user1',
            content: 'Hello',
            messageType: 'text',
            createdAt: { toDate: () => new Date('2023-01-01T10:00:00Z') },
            isRead: false,
            isEdited: false,
          }),
        },
        {
          id: 'msg2',
          data: () => ({
            chatId: 'chat123',
            senderId: 'user2',
            content: 'Hi there',
            messageType: 'text',
            createdAt: { toDate: () => new Date('2023-01-01T10:01:00Z') },
            isRead: false,
            isEdited: false,
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => mockMessages.forEach(callback),
      });

      const result = await chatService.getChatMessages('chat123');

      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('Hi there');
      expect(result[1].content).toBe('Hello');
    });
  });

  describe('markChatAsRead', () => {
    it('should mark chat as read successfully', async () => {
      await chatService.markChatAsRead('chat123', 'user1');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        { 'unreadCount.user1': 0 }
      );
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockUpdateDoc.mockRejectedValue(new Error('Permission denied'));

      await chatService.markChatAsRead('chat123', 'user1');

      expect(consoleSpy).toHaveBeenCalledWith('既読処理に失敗しましたが、チャット機能は継続します');
      consoleSpy.mockRestore();
    });
  });

  describe('subscribeToChatMessages', () => {
    it('should return unsubscribe function', () => {
      const mockUnsubscribe = jest.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = chatService.subscribeToChatMessages('chat123', jest.fn());

      expect(typeof unsubscribe).toBe('function');
      expect(mockOnSnapshot).toHaveBeenCalled();
    });
  });
});
