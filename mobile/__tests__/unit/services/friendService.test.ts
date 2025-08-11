// Firebase Firestoreのモック
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockGetDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockOnSnapshot = jest.fn();
const mockWriteBatch = jest.fn();
const mockServerTimestamp = jest.fn();
const mockIncrement = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDocs: mockGetDocs,
  getDoc: mockGetDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  onSnapshot: mockOnSnapshot,
  writeBatch: mockWriteBatch,
  serverTimestamp: mockServerTimestamp,
  increment: mockIncrement,
}));

jest.mock('../../../src/services/firebase', () => ({
  db: {},
}));

import { FriendServiceImpl } from '../../../src/services/friendService';
import { User, FriendRequest, FriendRecommendation } from '../../../src/types';

describe('FriendService', () => {
  let friendService: FriendServiceImpl;
  const mockUserId = 'test-user-id';
  const mockFriendId = 'friend-user-id';

  beforeEach(() => {
    friendService = new FriendServiceImpl();
    jest.clearAllMocks();
    
    // 基本的なモック設定
    mockDoc.mockReturnValue({ id: 'mock-doc-id' });
    mockCollection.mockReturnValue({ id: 'mock-collection-id' });
    mockServerTimestamp.mockReturnValue('mock-timestamp');
    mockIncrement.mockReturnValue('mock-increment');
  });

  describe('sendFriendRequest', () => {
    it('should send a friend request successfully', async () => {
      // Arrange
      mockAddDoc.mockResolvedValue({ id: 'request-id' });
      mockGetDocs.mockResolvedValue({ empty: true }); // 既存のリクエストがない
      mockGetDoc.mockResolvedValue({ // areFriends = false
        exists: () => false,
      });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      await friendService.sendFriendRequest(mockUserId, mockFriendId, 'Hello!');

      // Assert
      expect(mockAddDoc).toHaveBeenCalled();
    });

    it('should throw error if request already exists', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ empty: false });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act & Assert
      await expect(
        friendService.sendFriendRequest(mockUserId, mockFriendId)
      ).rejects.toThrow('既にフレンドリクエストを送信済みです');
    });

    it('should throw error if users are already friends', async () => {
      // Arrange
      mockGetDocs
        .mockResolvedValueOnce({ empty: true }) // hasPendingRequest = false
      mockGetDoc.mockResolvedValue({ // areFriends = true
        exists: () => true,
        data: () => ({ status: 'accepted' }),
      });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act & Assert
      await expect(
        friendService.sendFriendRequest(mockUserId, mockFriendId)
      ).rejects.toThrow('既にフレンドです');
    });

    it('should throw error if trying to send request to self', async () => {
      // Act & Assert
      await expect(
        friendService.sendFriendRequest(mockUserId, mockUserId)
      ).rejects.toThrow('自分自身にフレンドリクエストを送信できません');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept friend request successfully', async () => {
      // Arrange
      const mockRequestData = {
        fromUserId: mockUserId,
        toUserId: mockFriendId,
        status: 'pending',
      };

      const mockBatch = {
        update: jest.fn(),
        set: jest.fn(),
        commit: jest.fn(),
      };

      mockWriteBatch.mockReturnValue(mockBatch);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockRequestData,
      });

      // Act
      await friendService.acceptFriendRequest('request-id');

      // Assert
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.set).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
      
      // フレンドシップが適切なドキュメントIDで作成されることを確認
      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.anything(), // doc()の呼び出し
        expect.objectContaining({
          userId: mockUserId,
          friendId: mockFriendId,
          status: 'accepted'
        })
      );
      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.anything(), // doc()の呼び出し
        expect.objectContaining({
          userId: mockFriendId,
          friendId: mockUserId,
          status: 'accepted'
        })
      );
    });

    it('should throw error if request does not exist', async () => {
      // Arrange
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      // Act & Assert
      await expect(
        friendService.acceptFriendRequest('request-id')
      ).rejects.toThrow('フレンドリクエストが見つかりません');
    });

    it('should throw error if request is already processed', async () => {
      // Arrange
      const mockRequestData = {
        fromUserId: mockUserId,
        toUserId: mockFriendId,
        status: 'accepted', // 既に処理済み
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockRequestData,
      });

      // Act & Assert
      await expect(
        friendService.acceptFriendRequest('request-id')
      ).rejects.toThrow('このリクエストは既に処理済みです');
    });
  });

  describe('getFriends', () => {
    it('should return friends list', async () => {
      // Arrange
      const mockFriendships = [
        { data: () => ({ friendId: 'friend1' }) },
      ];

      const mockUserData = {
        displayName: 'Test User',
        avatar: '',
        joinedAt: { toDate: () => new Date() },
        lastActive: { toDate: () => new Date() },
        stats: {
          totalPosts: 0,
          totalComments: 0,
          helpfulVotes: 0,
          learningPoints: 0,
          totalLikes: 0,
          receivedLikes: 0,
          friendsCount: 0,
          communitiesCount: 0,
        },
      };

      mockGetDocs.mockResolvedValue({ docs: mockFriendships }); // friendships
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.getFriends(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].displayName).toBe('Test User');
    });

    it('should return empty array when no friends', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ docs: [] });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.getFriends(mockUserId);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('getFriendRequests', () => {
    it('should return friend requests', async () => {
      // Arrange
      const mockRequests = [
        {
          id: 'request1',
          data: () => ({
            fromUserId: 'user1',
            toUserId: mockUserId,
            message: 'Hello!',
            status: 'pending',
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({ docs: mockRequests });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.getFriendRequests(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].message).toBe('Hello!');
    });
  });

  describe('getSentFriendRequests', () => {
    it('should return sent friend requests', async () => {
      // Arrange
      const mockRequests = [
        {
          id: 'request1',
          data: () => ({
            fromUserId: mockUserId,
            toUserId: 'user1',
            message: 'Hello!',
            status: 'pending',
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({ docs: mockRequests });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.getSentFriendRequests(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].message).toBe('Hello!');
      expect(result[0].fromUserId).toBe(mockUserId);
    });

    it('should return empty array when no sent requests', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ docs: [] });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.getSentFriendRequests(mockUserId);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('areFriends', () => {
    it('should return true if users are friends', async () => {
      // Arrange
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'accepted' }),
      });

      // Act
      const result = await friendService.areFriends(mockUserId, mockFriendId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if users are not friends', async () => {
      // Arrange
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      // Act
      const result = await friendService.areFriends(mockUserId, mockFriendId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false if friendship exists but not accepted', async () => {
      // Arrange
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'pending' }),
      });

      // Act
      const result = await friendService.areFriends(mockUserId, mockFriendId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getFriendRecommendations', () => {
    it('should return friend recommendations', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user1',
          data: () => ({
            displayName: 'User 1',
            avatar: '',
            joinedAt: new Date(),
            lastActive: new Date(),
            stats: {
              totalPosts: 0,
              totalComments: 0,
              helpfulVotes: 0,
              learningPoints: 0,
              totalLikes: 0,
              receivedLikes: 0,
              friendsCount: 0,
              communitiesCount: 0,
            },
          }),
        },
      ];

      mockGetDocs
        .mockResolvedValueOnce({ docs: [] }) // getFriends
        .mockResolvedValueOnce({ docs: [] }) // getBlockedUsers
        .mockResolvedValueOnce({ docs: mockUsers }); // getAllUsers

      // Act
      const result = await friendService.getFriendRecommendations(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].displayName).toBe('User 1');
    });
  });

  describe('removeFriend', () => {
    it('should remove friend successfully', async () => {
      // Arrange
      const mockBatch = {
        delete: jest.fn(),
        update: jest.fn(),
        commit: jest.fn(),
      };

      mockWriteBatch.mockReturnValue(mockBatch);

      // Act
      await friendService.removeFriend(mockUserId, mockFriendId);

      // Assert
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
      
      // 適切なドキュメントIDでフレンドシップが削除されることを確認
      expect(mockBatch.delete).toHaveBeenCalledWith(
        expect.anything() // doc()の呼び出し
      );
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject friend request successfully', async () => {
      // Arrange
      mockUpdateDoc.mockResolvedValue(undefined);

      // Act
      await friendService.rejectFriendRequest('request-id');

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'rejected'
        })
      );
    });
  });

  describe('blockUser', () => {
    it('should block user successfully', async () => {
      // Arrange
      const mockBatch = {
        delete: jest.fn(),
        update: jest.fn(),
        commit: jest.fn(),
      };

      mockWriteBatch.mockReturnValue(mockBatch);
      mockAddDoc.mockResolvedValue({ id: 'block-id' });

      // Act
      await friendService.blockUser(mockUserId, mockFriendId);

      // Assert
      expect(mockBatch.delete).toHaveBeenCalledTimes(2); // フレンドシップ削除
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: mockUserId,
          blockedUserId: mockFriendId
        })
      );
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully', async () => {
      // Arrange
      const mockBlocks = [
        { ref: { id: 'block1' } },
      ];

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn(),
      };

      // QuerySnapshotオブジェクトを適切にモック
      mockGetDocs.mockResolvedValue({ 
        docs: mockBlocks,
        forEach: (callback: (doc: any) => void) => {
          mockBlocks.forEach(callback);
        }
      });
      mockWriteBatch.mockReturnValue(mockBatch);
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      await friendService.unblockUser(mockUserId, mockFriendId);

      // Assert
      expect(mockBatch.delete).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('hasPendingRequest', () => {
    it('should return true if pending request exists', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ empty: false });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.hasPendingRequest(mockUserId, mockFriendId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if no pending request exists', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ empty: true });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.hasPendingRequest(mockUserId, mockFriendId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isBlocked', () => {
    it('should return true if user is blocked', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ empty: false });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.isBlocked(mockUserId, mockFriendId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user is not blocked', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ empty: true });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.isBlocked(mockUserId, mockFriendId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('subscribeToFriends', () => {
    it('should subscribe to friends updates', () => {
      // Arrange
      const mockCallback = jest.fn();
      const mockSnapshot = {
        docs: [
          { data: () => ({ friendId: 'friend1' }) },
        ],
      };

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback(mockSnapshot);
        return jest.fn(); // unsubscribe function
      });

      // Act
      const unsubscribe = friendService.subscribeToFriends(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle empty friends list', () => {
      // Arrange
      const mockCallback = jest.fn();
      const mockSnapshot = { docs: [] };

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback(mockSnapshot);
        return jest.fn();
      });

      // Act
      friendService.subscribeToFriends(mockUserId, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith([]);
    });
  });

  describe('subscribeToFriendRequests', () => {
    it('should subscribe to friend requests updates', () => {
      // Arrange
      const mockCallback = jest.fn();
      const mockSnapshot = {
        docs: [
          {
            id: 'request1',
            data: () => ({
              fromUserId: 'user1',
              toUserId: mockUserId,
              message: 'Hello!',
              status: 'pending',
              createdAt: { toDate: () => new Date() },
            }),
          },
        ],
      };

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback(mockSnapshot);
        return jest.fn(); // unsubscribe function
      });

      // Act
      const unsubscribe = friendService.subscribeToFriendRequests(mockUserId, mockCallback);

      // Assert
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'request1',
            message: 'Hello!'
          })
        ])
      );
    });
  });

  describe('getBlockedUsers', () => {
    it('should return blocked users list', async () => {
      // Arrange
      const mockBlocks = [
        { data: () => ({ blockedUserId: 'blocked1' }) },
      ];

      const mockUserData = {
        displayName: 'Blocked User',
        avatar: '',
        joinedAt: { toDate: () => new Date() },
        lastActive: { toDate: () => new Date() },
        stats: {
          totalPosts: 0,
          totalComments: 0,
          helpfulVotes: 0,
          learningPoints: 0,
          totalLikes: 0,
          receivedLikes: 0,
          friendsCount: 0,
          communitiesCount: 0,
        },
      };

      mockGetDocs.mockResolvedValue({ docs: mockBlocks }); // blocks
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.getBlockedUsers(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].displayName).toBe('Blocked User');
    });

    it('should return empty array when no blocked users', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ docs: [] });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.getBlockedUsers(mockUserId);

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
