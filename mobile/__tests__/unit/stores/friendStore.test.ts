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
    });
  });

  describe('sendFriendRequest', () => {
    it('should send friend request successfully', async () => {
      // Arrange
      mockFriendService.sendFriendRequest.mockResolvedValue();

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        await result.current.sendFriendRequest('from-user', 'to-user', 'Hello!');
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.sendFriendRequest).toHaveBeenCalledWith(
        'from-user',
        'to-user',
        'Hello!'
      );
    });

    it('should handle error when sending friend request fails', async () => {
      // Arrange
      const errorMessage = 'Failed to send request';
      mockFriendService.sendFriendRequest.mockRejectedValue(new Error(errorMessage));

      // Act
      const { result } = renderHook(() => useFriendStore());
      
      await act(async () => {
        try {
          await result.current.sendFriendRequest('from-user', 'to-user');
        } catch (error) {
          // エラーは期待される動作
        }
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept friend request successfully', async () => {
      // Arrange
      mockFriendService.acceptFriendRequest.mockResolvedValue();

      // 初期状態でリクエストを設定
      const { result } = renderHook(() => useFriendStore());
      
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
      expect(result.current.friendRequests).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.acceptFriendRequest).toHaveBeenCalledWith('request1');
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject friend request successfully', async () => {
      // Arrange
      mockFriendService.rejectFriendRequest.mockResolvedValue();

      // 初期状態でリクエストを設定
      const { result } = renderHook(() => useFriendStore());
      
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
      expect(result.current.friendRequests).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.rejectFriendRequest).toHaveBeenCalledWith('request1');
    });
  });

  describe('removeFriend', () => {
    it('should remove friend successfully', async () => {
      // Arrange
      mockFriendService.removeFriend.mockResolvedValue();

      // 初期状態でフレンドを設定
      const { result } = renderHook(() => useFriendStore());
      
      act(() => {
        result.current.friends = [
          {
            id: 'friend1',
            displayName: 'Friend 1',
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
          },
        ];
      });

      // Act
      await act(async () => {
        await result.current.removeFriend('user-id', 'friend1');
      });

      // Assert
      expect(result.current.friends).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFriendService.removeFriend).toHaveBeenCalledWith('user-id', 'friend1');
    });
  });

  describe('loadRecommendations', () => {
    it('should load recommendations successfully', async () => {
      // Arrange
      const mockRecommendations: FriendRecommendation[] = [
        {
          userId: 'user1',
          displayName: 'User 1',
          avatar: '',
          commonInterests: ['恋愛', '仕事'],
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
  });

  describe('setLoading and setError', () => {
    it('should set loading state', () => {
      // Act
      const { result } = renderHook(() => useFriendStore());
      
      act(() => {
        result.current.setLoading(true);
      });

      // Assert
      expect(result.current.isLoading).toBe(true);
    });

    it('should set error state', () => {
      // Act
      const { result } = renderHook(() => useFriendStore());
      
      act(() => {
        result.current.setError('Test error');
      });

      // Assert
      expect(result.current.error).toBe('Test error');
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      // Arrange
      const { result } = renderHook(() => useFriendStore());
      
      // 初期状態を変更
      act(() => {
        result.current.setLoading(true);
        result.current.setError('Test error');
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
});
