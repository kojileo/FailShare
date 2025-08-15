import { chatService } from '../../../src/services/chatService';
import { db } from '../../../src/services/firebase';
import { Chat, ChatMessage, ChatPreview } from '../../../src/types';

// Firebaseのモック
jest.mock('../../../src/services/firebase', () => ({
  db: {},
}));

// Firestoreのモック
const mockAddDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockOnSnapshot = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockWriteBatch = jest.fn();
const mockServerTimestamp = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: mockAddDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  onSnapshot: mockOnSnapshot,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  writeBatch: mockWriteBatch,
  serverTimestamp: mockServerTimestamp,
}));

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
        expect.anything(),
        expect.objectContaining({
          participants: participants.sort(),
          createdAt: 'timestamp',
          updatedAt: 'timestamp',
        })
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
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          participants: ['user1', 'user2'],
          unreadCount: { user1: 0, user2: 0 },
        }),
      });

      const result = await chatService.sendMessage('chat123', 'user1', 'Hello!');

      expect(result).toBeDefined();
      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
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
      expect(result[0].content).toBe('Hello');
      expect(result[1].content).toBe('Hi there');
    });
  });

  describe('markChatAsRead', () => {
    it('should mark chat as read successfully', async () => {
      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn(),
      };

      mockWriteBatch.mockReturnValue(mockBatch);
      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => [],
      });

      await chatService.markChatAsRead('chat123', 'user1');

      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
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
