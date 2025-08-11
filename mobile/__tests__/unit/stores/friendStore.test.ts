import { renderHook, act } from '@testing-library/react-hooks';
import { useFriendStore } from '../../../src/stores/friendStore';
import { friendService } from '../../../src/services/friendService';
import { User, FriendRequest, FriendRecommendation } from '../../../src/types';

// friendServiceのモック
jest.mock('../../../src/services/friendService');

const mockFriendService = friendService as jest.Mocked<typeof friendService>;

describe('FriendStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ストアをリセット
    act(() => {
      useFriendStore.getState().reset();
    });
  });

  describe('loadFriends', () => {
    it('should load friends successfully', async () => {
      // Arrange
      const mockFriends: User[] = [
        {
          id: 'friend1',
          displayName: 'Friend 1',
          avatar: '',
          joinedAt: new Date(),
          lastActive: new Date(),
          stats: {
            totalPosts: 5,
            totalComments: 10,
            helpfulVotes: 20,
            learningPoints: 15,
            totalLikes: 30,
            receivedLikes: 25,
            friendsCount: 8,
            communitiesCount: 2,
          },
        },
      ];

      mockFriendService.getFriends.mockResolvedValue(mockFriends);

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadFriends('user-id');
      });

      // Assert
      expect(result.current.friends).toEqual(mockFriends);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.getFriends).toHaveBeenCalledWith('user-id');
    });

    it('should handle error when loading friends fails', async () => {
      // Arrange
      const errorMessage = 'Failed to load friends';
      mockFriendService.getFriends.mockRejectedValue(new Error(errorMessage));

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadFriends('user-id');
      });

      // Assert
      expect(result.current.friends).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('loadFriendRequests', () => {
    it('should load friend requests successfully', async () => {
      // Arrange
      const mockRequests: FriendRequest[] = [
        {
          id: 'request1',
          fromUserId: 'user1',
          toUserId: 'user2',
          message: 'Hello!',
          status: 'pending',
          createdAt: new Date(),
        },
      ];

      mockFriendService.getFriendRequests.mockResolvedValue(mockRequests);

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadFriendRequests('user-id');
      });

      // Assert
      expect(result.current.friendRequests).toEqual(mockRequests);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.getFriendRequests).toHaveBeenCalledWith('user-id');
    });

    it('should handle error when loading friend requests fails', async () => {
      // Arrange
      const errorMessage = 'Failed to load friend requests';
      mockFriendService.getFriendRequests.mockRejectedValue(new Error(errorMessage));

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadFriendRequests('user-id');
      });

      // Assert
      expect(result.current.friendRequests).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('loadSentRequests', () => {
    it('should load sent requests successfully', async () => {
      // Arrange
      const mockSentRequests: FriendRequest[] = [
        {
          id: 'sent1',
          fromUserId: 'user1',
          toUserId: 'user2',
          message: 'Hello!',
          status: 'pending',
          createdAt: new Date(),
        },
      ];

      mockFriendService.getSentFriendRequests.mockResolvedValue(mockSentRequests);

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadSentRequests('user-id');
      });

      // Assert
      expect(result.current.sentRequests).toEqual(mockSentRequests);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.getSentFriendRequests).toHaveBeenCalledWith('user-id');
    });

    it('should handle error when loading sent requests fails', async () => {
      // Arrange
      const errorMessage = 'Failed to load sent requests';
      mockFriendService.getSentFriendRequests.mockRejectedValue(new Error(errorMessage));

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadSentRequests('user-id');
      });

      // Assert
      expect(result.current.sentRequests).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('loadBlockedUsers', () => {
    it('should load blocked users successfully', async () => {
      // Arrange
      const mockBlockedUsers: User[] = [
        {
          id: 'blocked1',
          displayName: 'Blocked User',
          avatar: '',
          joinedAt: new Date(),
          lastActive: new Date(),
          stats: {
            totalPosts: 1,
            totalComments: 2,
            helpfulVotes: 3,
            learningPoints: 2,
            totalLikes: 5,
            receivedLikes: 3,
            friendsCount: 0,
            communitiesCount: 0,
          },
        },
      ];

      mockFriendService.getBlockedUsers.mockResolvedValue(mockBlockedUsers);

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadBlockedUsers('user-id');
      });

      // Assert
      expect(result.current.blockedUsers).toEqual(mockBlockedUsers);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.getBlockedUsers).toHaveBeenCalledWith('user-id');
    });

    it('should handle error when loading blocked users fails', async () => {
      // Arrange
      const errorMessage = 'Failed to load blocked users';
      mockFriendService.getBlockedUsers.mockRejectedValue(new Error(errorMessage));

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadBlockedUsers('user-id');
      });

      // Assert
      expect(result.current.blockedUsers).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('loadRecommendations', () => {
    it('should load recommendations successfully', async () => {
      // Arrange
      const mockRecommendations: FriendRecommendation[] = [
        {
          userId: 'rec1',
          displayName: 'Recommended User',
          avatar: '',
          commonInterests: ['interest1', 'interest2'],
          mutualFriends: 3,
          score: 85,
        },
      ];

      mockFriendService.getFriendRecommendations.mockResolvedValue(mockRecommendations);

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadRecommendations('user-id');
      });

      // Assert
      expect(result.current.recommendations).toEqual(mockRecommendations);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.getFriendRecommendations).toHaveBeenCalledWith('user-id');
    });

    it('should handle error when loading recommendations fails', async () => {
      // Arrange
      const errorMessage = 'Failed to load recommendations';
      mockFriendService.getFriendRecommendations.mockRejectedValue(new Error(errorMessage));

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.loadRecommendations('user-id');
      });

      // Assert
      expect(result.current.recommendations).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('sendFriendRequest', () => {
    it('should send friend request successfully', async () => {
      // Arrange
      mockFriendService.sendFriendRequest.mockResolvedValue();

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.sendFriendRequest('user1', 'user2', 'Hello!');
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.sendFriendRequest).toHaveBeenCalledWith('user1', 'user2', 'Hello!');
      expect(result.current.sentRequests).toHaveLength(1);
      expect(result.current.sentRequests[0].fromUserId).toBe('user1');
      expect(result.current.sentRequests[0].toUserId).toBe('user2');
      expect(result.current.sentRequests[0].message).toBe('Hello!');
    });

    it('should handle error when sending friend request fails', async () => {
      // Arrange
      const errorMessage = 'Failed to send request';
      mockFriendService.sendFriendRequest.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await expect(result.current.sendFriendRequest('user1', 'user2', 'Hello!')).rejects.toThrow(errorMessage);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept friend request successfully', async () => {
      // Arrange
      mockFriendService.acceptFriendRequest.mockResolvedValue();
      const { result } = renderHook(() => useFriendStore());
      
      // 初期状態にリクエストを設定
      act(() => {
        result.current.friendRequests = [
          {
            id: 'request1',
            fromUserId: 'user1',
            toUserId: 'user2',
            message: 'Hello!',
            status: 'pending',
            createdAt: new Date(),
          },
        ];
      });

      // Act
      await act(async () => {
        await result.current.acceptFriendRequest('request1');
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.acceptFriendRequest).toHaveBeenCalledWith('request1');
      expect(result.current.friendRequests).toHaveLength(0);
    });

    it('should handle error when accepting friend request fails', async () => {
      // Arrange
      const errorMessage = 'Failed to accept request';
      mockFriendService.acceptFriendRequest.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await expect(result.current.acceptFriendRequest('request1')).rejects.toThrow(errorMessage);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject friend request successfully', async () => {
      // Arrange
      mockFriendService.rejectFriendRequest.mockResolvedValue();
      const { result } = renderHook(() => useFriendStore());
      
      // 初期状態にリクエストを設定
      act(() => {
        result.current.friendRequests = [
          {
            id: 'request1',
            fromUserId: 'user1',
            toUserId: 'user2',
            message: 'Hello!',
            status: 'pending',
            createdAt: new Date(),
          },
        ];
      });

      // Act
      await act(async () => {
        await result.current.rejectFriendRequest('request1');
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.rejectFriendRequest).toHaveBeenCalledWith('request1');
      expect(result.current.friendRequests).toHaveLength(0);
    });

    it('should handle error when rejecting friend request fails', async () => {
      // Arrange
      const errorMessage = 'Failed to reject request';
      mockFriendService.rejectFriendRequest.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await expect(result.current.rejectFriendRequest('request1')).rejects.toThrow(errorMessage);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('removeFriend', () => {
    it('should remove friend successfully', async () => {
      // Arrange
      mockFriendService.removeFriend.mockResolvedValue();
      const { result } = renderHook(() => useFriendStore());
      
      // 初期状態にフレンドを設定
      act(() => {
        result.current.friends = [
          {
            id: 'friend1',
            displayName: 'Friend 1',
            avatar: '',
            joinedAt: new Date(),
            lastActive: new Date(),
            stats: {
              totalPosts: 5,
              totalComments: 10,
              helpfulVotes: 20,
              learningPoints: 15,
              totalLikes: 30,
              receivedLikes: 25,
              friendsCount: 8,
              communitiesCount: 2,
            },
          },
        ];
      });

      // Act
      await act(async () => {
        await result.current.removeFriend('user1', 'friend1');
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.removeFriend).toHaveBeenCalledWith('user1', 'friend1');
      expect(result.current.friends).toHaveLength(0);
    });

    it('should handle error when removing friend fails', async () => {
      // Arrange
      const errorMessage = 'Failed to remove friend';
      mockFriendService.removeFriend.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await expect(result.current.removeFriend('user1', 'friend1')).rejects.toThrow(errorMessage);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('blockUser', () => {
    it('should block user successfully', async () => {
      // Arrange
      mockFriendService.blockUser.mockResolvedValue();
      const { result } = renderHook(() => useFriendStore());
      
      const friendToBlock = {
        id: 'friend1',
        displayName: 'Friend 1',
        avatar: '',
        joinedAt: new Date(),
        lastActive: new Date(),
        stats: {
          totalPosts: 5,
          totalComments: 10,
          helpfulVotes: 20,
          learningPoints: 15,
          totalLikes: 30,
          receivedLikes: 25,
          friendsCount: 8,
          communitiesCount: 2,
        },
      };

      // 初期状態にフレンドを設定
      act(() => {
        result.current.friends = [friendToBlock];
      });

      // Act
      await act(async () => {
        await result.current.blockUser('user1', 'friend1');
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.blockUser).toHaveBeenCalledWith('user1', 'friend1');
      expect(result.current.friends).toHaveLength(0);
      expect(result.current.blockedUsers).toHaveLength(1);
      expect(result.current.blockedUsers[0].id).toBe('friend1');
    });

    it('should handle error when blocking user fails', async () => {
      // Arrange
      const errorMessage = 'Failed to block user';
      mockFriendService.blockUser.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await expect(result.current.blockUser('user1', 'friend1')).rejects.toThrow(errorMessage);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully', async () => {
      // Arrange
      mockFriendService.unblockUser.mockResolvedValue();
      const { result } = renderHook(() => useFriendStore());
      
      const blockedUser = {
        id: 'blocked1',
        displayName: 'Blocked User',
        avatar: '',
        joinedAt: new Date(),
        lastActive: new Date(),
        stats: {
          totalPosts: 1,
          totalComments: 2,
          helpfulVotes: 3,
          learningPoints: 2,
          totalLikes: 5,
          receivedLikes: 3,
          friendsCount: 0,
          communitiesCount: 0,
        },
      };

      // 初期状態にブロックユーザーを設定
      act(() => {
        result.current.blockedUsers = [blockedUser];
      });

      // Act
      await act(async () => {
        await result.current.unblockUser('user1', 'blocked1');
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.unblockUser).toHaveBeenCalledWith('user1', 'blocked1');
      expect(result.current.blockedUsers).toHaveLength(0);
    });

    it('should handle error when unblocking user fails', async () => {
      // Arrange
      const errorMessage = 'Failed to unblock user';
      mockFriendService.unblockUser.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await expect(result.current.unblockUser('user1', 'blocked1')).rejects.toThrow(errorMessage);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('subscribeToFriends', () => {
    it('should subscribe to friends updates', () => {
      // Arrange
      const mockUnsubscribe = jest.fn();
      mockFriendService.subscribeToFriends.mockImplementation((userId, callback) => {
        return mockUnsubscribe;
      });

      // Act
      const { result } = renderHook(() => useFriendStore());
      const unsubscribe = result.current.subscribeToFriends('user1');

      // Assert
      expect(mockFriendService.subscribeToFriends).toHaveBeenCalledWith('user1', expect.any(Function));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('subscribeToFriendRequests', () => {
    it('should subscribe to friend requests updates', () => {
      // Arrange
      const mockUnsubscribe = jest.fn();
      mockFriendService.subscribeToFriendRequests.mockImplementation((userId, callback) => {
        return mockUnsubscribe;
      });

      // Act
      const { result } = renderHook(() => useFriendStore());
      const unsubscribe = result.current.subscribeToFriendRequests('user1');

      // Assert
      expect(mockFriendService.subscribeToFriendRequests).toHaveBeenCalledWith('user1', expect.any(Function));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      // Act
      const { result } = renderHook(() => useFriendStore());
      
      act(() => {
        result.current.setLoading(true);
      });

      // Assert
      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error state', () => {
      // Act
      const { result } = renderHook(() => useFriendStore());
      
      act(() => {
        result.current.setError('Test error');
      });

      // Assert
      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      // Arrange
      const { result } = renderHook(() => useFriendStore());
      
      // 初期状態を変更
      act(() => {
        result.current.friends = [{ id: 'test' } as User];
        result.current.friendRequests = [{ id: 'test' } as FriendRequest];
        result.current.sentRequests = [{ id: 'test' } as FriendRequest];
        result.current.blockedUsers = [{ id: 'test' } as User];
        result.current.recommendations = [{ userId: 'test' } as FriendRecommendation];
        result.current.isLoading = true;
        result.current.error = 'Test error';
      });

      // Act
      act(() => {
        result.current.reset();
      });

      // Assert
      expect(result.current.friends).toEqual([]);
      expect(result.current.friendRequests).toEqual([]);
      expect(result.current.sentRequests).toEqual([]);
      expect(result.current.blockedUsers).toEqual([]);
      expect(result.current.recommendations).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('リアルタイム更新のコールバック', () => {
    it('should update friends when subscription callback is called', () => {
      // Arrange
      let friendsCallback: ((friends: User[]) => void) | null = null;
      mockFriendService.subscribeToFriends.mockImplementation((userId, callback) => {
        friendsCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useFriendStore());
      result.current.subscribeToFriends('user1');

      const mockFriends: User[] = [
        {
          id: 'friend1',
          displayName: 'Friend 1',
          avatar: '',
          joinedAt: new Date(),
          lastActive: new Date(),
          stats: {
            totalPosts: 5,
            totalComments: 10,
            helpfulVotes: 20,
            learningPoints: 15,
            totalLikes: 30,
            receivedLikes: 25,
            friendsCount: 8,
            communitiesCount: 2,
          },
        },
      ];

      // Act
      act(() => {
        if (friendsCallback) {
          friendsCallback(mockFriends);
        }
      });

      // Assert
      expect(result.current.friends).toEqual(mockFriends);
    });

    it('should update friend requests when subscription callback is called', () => {
      // Arrange
      let requestsCallback: ((requests: FriendRequest[]) => void) | null = null;
      mockFriendService.subscribeToFriendRequests.mockImplementation((userId, callback) => {
        requestsCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useFriendStore());
      result.current.subscribeToFriendRequests('user1');

      const mockRequests: FriendRequest[] = [
        {
          id: 'request1',
          fromUserId: 'user1',
          toUserId: 'user2',
          message: 'Hello!',
          status: 'pending',
          createdAt: new Date(),
        },
      ];

      // Act
      act(() => {
        if (requestsCallback) {
          requestsCallback(mockRequests);
        }
      });

      // Assert
      expect(result.current.friendRequests).toEqual(mockRequests);
    });
  });
});
