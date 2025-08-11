import { FriendServiceImpl } from '../../../src/services/friendService';
import { User, FriendRequest, FriendRecommendation } from '../../../src/types';

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

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
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
}));

jest.mock('../../../src/services/firebase', () => ({
  db: {},
}));

describe('FriendService', () => {
  let friendService: FriendServiceImpl;
  const mockUserId = 'test-user-id';
  const mockFriendId = 'friend-user-id';

  beforeEach(() => {
    friendService = new FriendServiceImpl();
    jest.clearAllMocks();
  });

  describe('sendFriendRequest', () => {
    it('should send a friend request successfully', async () => {
      // Arrange
      const mockRequestData = {
        fromUserId: mockUserId,
        toUserId: mockFriendId,
        message: 'Hello!',
        status: 'pending',
        createdAt: new Date(),
      };

      mockAddDoc.mockResolvedValue({ id: 'request-id' });
      mockGetDocs.mockResolvedValue({ empty: false });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      await friendService.sendFriendRequest(mockUserId, mockFriendId, 'Hello!');

      // Assert
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fromUserId: mockUserId,
          toUserId: mockFriendId,
          message: 'Hello!',
          status: 'pending',
        })
      );
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
        .mockResolvedValueOnce({ empty: false }) // hasPendingRequest
        .mockResolvedValueOnce({ empty: false }); // areFriends
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act & Assert
      await expect(
        friendService.sendFriendRequest(mockUserId, mockFriendId)
      ).rejects.toThrow('既にフレンドです');
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
  });

  describe('getFriends', () => {
    it('should return friends list', async () => {
      // Arrange
      const mockFriendships = [
        { data: () => ({ friendId: 'friend1' }) },
        { data: () => ({ friendId: 'friend2' }) },
      ];

      const mockUserData = {
        displayName: 'Test User',
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
      };

      mockGetDocs.mockResolvedValue({ docs: mockFriendships });
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.getFriends(mockUserId);

      // Assert
      expect(result).toHaveLength(2);
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
            createdAt: new Date(),
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({ docs: mockRequests });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});
      mockOrderBy.mockReturnValue({});

      // Act
      const result = await friendService.getFriendRequests(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].message).toBe('Hello!');
    });
  });

  describe('areFriends', () => {
    it('should return true if users are friends', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ empty: false });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

      // Act
      const result = await friendService.areFriends(mockUserId, mockFriendId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if users are not friends', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ empty: true });
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});

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
});
