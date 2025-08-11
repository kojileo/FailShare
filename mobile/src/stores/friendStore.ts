import { create } from 'zustand';
import { 
  User, 
  FriendRequest, 
  FriendRecommendation, 
  FriendStore 
} from '../types';
import { friendService } from '../services/friendService';

export const useFriendStore = create<FriendStore>((set, get) => ({
  friends: [],
  friendRequests: [],
  sentRequests: [],
  blockedUsers: [],
  recommendations: [],
  isLoading: false,
  error: null,
  
  // Actions
  loadFriends: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const friends = await friendService.getFriends(userId);
      set({ friends, isLoading: false });
    } catch (error) {
      console.error('フレンド読み込みエラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'フレンドの読み込みに失敗しました',
        isLoading: false,
        friends: [] // エラー時は空配列を設定
      });
    }
  },

  loadFriendRequests: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const requests = await friendService.getFriendRequests(userId);
      set({ friendRequests: requests, isLoading: false });
    } catch (error) {
      console.error('フレンドリクエスト読み込みエラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'フレンドリクエストの読み込みに失敗しました',
        isLoading: false,
        friendRequests: [] // エラー時は空配列を設定
      });
    }
  },

  loadSentRequests: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const requests = await friendService.getSentFriendRequests(userId);
      set({ sentRequests: requests, isLoading: false });
    } catch (error) {
      console.error('送信済みフレンドリクエスト読み込みエラー:', error);
      set({ 
        error: error instanceof Error ? error.message : '送信済みフレンドリクエストの読み込みに失敗しました',
        isLoading: false,
        sentRequests: [] // エラー時は空配列を設定
      });
    }
  },

  loadBlockedUsers: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const blockedUsers = await friendService.getBlockedUsers(userId);
      set({ blockedUsers, isLoading: false });
    } catch (error) {
      console.error('ブロックユーザー読み込みエラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'ブロックユーザーの読み込みに失敗しました',
        isLoading: false 
      });
    }
  },

  loadRecommendations: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const recommendations = await friendService.getFriendRecommendations(userId);
      set({ recommendations, isLoading: false });
    } catch (error) {
      console.error('フレンド推薦読み込みエラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'フレンド推薦の読み込みに失敗しました',
        isLoading: false,
        recommendations: [] // エラー時は空配列を設定
      });
    }
  },

  sendFriendRequest: async (fromUserId: string, toUserId: string, message?: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendService.sendFriendRequest(fromUserId, toUserId, message);
      
      // 送信済みリクエストを更新
      const currentState = get();
      const newRequest: FriendRequest = {
        id: `temp-${Date.now()}`, // 一時的なID
        fromUserId,
        toUserId,
        message: message || '',
        status: 'pending',
        createdAt: new Date()
      };
      
      set({ 
        sentRequests: [newRequest, ...currentState.sentRequests],
        isLoading: false 
      });
    } catch (error) {
      console.error('フレンドリクエスト送信エラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'フレンドリクエストの送信に失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendService.acceptFriendRequest(requestId);
      
      // リクエストリストから削除
      const currentState = get();
      const updatedRequests = currentState.friendRequests.filter(
        request => request.id !== requestId
      );
      
      set({ 
        friendRequests: updatedRequests,
        isLoading: false 
      });
      
      // フレンドリストを再読み込み（実際の実装ではリアルタイム更新を使用）
      // ここでは簡易的に実装
    } catch (error) {
      console.error('フレンドリクエスト承認エラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'フレンドリクエストの承認に失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },

  rejectFriendRequest: async (requestId: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendService.rejectFriendRequest(requestId);
      
      // リクエストリストから削除
      const currentState = get();
      const updatedRequests = currentState.friendRequests.filter(
        request => request.id !== requestId
      );
      
      set({ 
        friendRequests: updatedRequests,
        isLoading: false 
      });
    } catch (error) {
      console.error('フレンドリクエスト拒否エラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'フレンドリクエストの拒否に失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },

  removeFriend: async (userId: string, friendId: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendService.removeFriend(userId, friendId);
      
      // フレンドリストから削除
      const currentState = get();
      const updatedFriends = currentState.friends.filter(
        friend => friend.id !== friendId
      );
      
      set({ 
        friends: updatedFriends,
        isLoading: false 
      });
    } catch (error) {
      console.error('フレンド削除エラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'フレンドの削除に失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },

  blockUser: async (userId: string, blockedUserId: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendService.blockUser(userId, blockedUserId);
      
      // フレンドリストから削除（ブロック時はフレンド関係も解除される）
      const currentState = get();
      const updatedFriends = currentState.friends.filter(
        friend => friend.id !== blockedUserId
      );
      
      // ブロックユーザーリストに追加
      const blockedUser = currentState.friends.find(friend => friend.id === blockedUserId);
      if (blockedUser) {
        set({ 
          friends: updatedFriends,
          blockedUsers: [...currentState.blockedUsers, blockedUser],
          isLoading: false 
        });
      } else {
        set({ 
          friends: updatedFriends,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('ユーザーブロックエラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'ユーザーのブロックに失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },

  unblockUser: async (userId: string, blockedUserId: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendService.unblockUser(userId, blockedUserId);
      
      // ブロックユーザーリストから削除
      const currentState = get();
      const updatedBlockedUsers = currentState.blockedUsers.filter(
        user => user.id !== blockedUserId
      );
      
      set({ 
        blockedUsers: updatedBlockedUsers,
        isLoading: false 
      });
    } catch (error) {
      console.error('ユーザーブロック解除エラー:', error);
      set({ 
        error: error instanceof Error ? error.message : 'ユーザーのブロック解除に失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  
  // リアルタイム更新の購読
  subscribeToFriends: (userId: string) => {
    return friendService.subscribeToFriends(userId, (friends) => {
      set({ friends });
    });
  },
  
  subscribeToFriendRequests: (userId: string) => {
    return friendService.subscribeToFriendRequests(userId, (requests) => {
      set({ friendRequests: requests });
    });
  },
  
  reset: () => set({ 
    friends: [], 
    friendRequests: [], 
    sentRequests: [], 
    blockedUsers: [], 
    recommendations: [], 
    isLoading: false, 
    error: null 
  }),
}));
