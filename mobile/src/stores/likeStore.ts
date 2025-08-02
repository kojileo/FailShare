import { create } from 'zustand';
import { Like, LikeStore as ILikeStore } from '../types';
import { likeService } from '../services/likeService';

interface LikeState {
  likes: { [storyId: string]: Like[] };
  userLikes: { [storyId: string]: boolean };
  helpfulCounts: { [storyId: string]: number };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addLike: (storyId: string, userId: string) => Promise<void>;
  removeLike: (storyId: string, userId: string) => Promise<void>;
  setLikes: (storyId: string, likes: Like[]) => void;
  setUserLike: (storyId: string, isLiked: boolean) => void;
  setHelpfulCount: (storyId: string, count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  
  // 追加の便利メソッド
  loadLikeStats: (storyIds: string[], userId: string) => Promise<void>;
  toggleLike: (storyId: string, userId: string) => Promise<void>;
  getHelpfulCount: (storyId: string) => number;
  isLikedByUser: (storyId: string) => boolean;
  initializeStoryLike: (storyId: string, initialHelpfulCount: number, initialIsLiked?: boolean) => void;
}

export const useLikeStore = create<LikeState>((set, get) => ({
  likes: {},
  userLikes: {},
  helpfulCounts: {},
  isLoading: false,
  error: null,

  addLike: async (storyId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await likeService.addLike(storyId, userId);
      
      // 状態を更新
      const [newHelpfulCount, isLiked] = await Promise.all([
        likeService.getHelpfulCount(storyId),
        likeService.isLikedByUser(storyId, userId)
      ]);
      
      set((state) => ({
        helpfulCounts: {
          ...state.helpfulCounts,
          [storyId]: newHelpfulCount
        },
        userLikes: {
          ...state.userLikes,
          [storyId]: isLiked
        },
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'いいねの追加に失敗しました';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  removeLike: async (storyId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await likeService.removeLike(storyId, userId);
      
      // 状態を更新
      const [newHelpfulCount, isLiked] = await Promise.all([
        likeService.getHelpfulCount(storyId),
        likeService.isLikedByUser(storyId, userId)
      ]);
      
      set((state) => ({
        helpfulCounts: {
          ...state.helpfulCounts,
          [storyId]: newHelpfulCount
        },
        userLikes: {
          ...state.userLikes,
          [storyId]: isLiked
        },
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'いいねの削除に失敗しました';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setLikes: (storyId: string, likes: Like[]) => {
    set((state) => ({
      likes: {
        ...state.likes,
        [storyId]: likes
      }
    }));
  },

  setUserLike: (storyId: string, isLiked: boolean) => {
    set((state) => ({
      userLikes: {
        ...state.userLikes,
        [storyId]: isLiked
      }
    }));
  },

  setHelpfulCount: (storyId: string, count: number) => {
    set((state) => ({
      helpfulCounts: {
        ...state.helpfulCounts,
        [storyId]: count
      }
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set({
      likes: {},
      userLikes: {},
      helpfulCounts: {},
      isLoading: false,
      error: null
    });
  },

  // 追加の便利メソッド
  loadLikeStats: async (storyIds: string[], userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const stats = await likeService.getLikeStatsForStories(storyIds, userId);
      
      set((state) => {
        const newHelpfulCounts = { ...state.helpfulCounts };
        const newUserLikes = { ...state.userLikes };
        
        Object.entries(stats).forEach(([storyId, stat]) => {
          newHelpfulCounts[storyId] = stat.helpfulCount;
          newUserLikes[storyId] = stat.isLikedByCurrentUser;
        });
        
        console.log('📊 いいね統計読み込み完了:', stats);
        
        return {
          helpfulCounts: newHelpfulCounts,
          userLikes: newUserLikes,
          isLoading: false
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'いいね統計の読み込みに失敗しました';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  toggleLike: async (storyId: string, userId: string) => {
    const state = get();
    const isCurrentlyLiked = state.userLikes[storyId];
    
    console.log(`🔄 toggleLike [${storyId}]:`, { isCurrentlyLiked, currentCount: state.helpfulCounts[storyId] });
    
    if (isCurrentlyLiked) {
      await state.removeLike(storyId, userId);
    } else {
      await state.addLike(storyId, userId);
    }
    
    // 操作完了後の状態をログ出力
    const finalState = get();
    console.log(`✅ toggleLike完了 [${storyId}]:`, { 
      finalIsLiked: finalState.userLikes[storyId], 
      finalCount: finalState.helpfulCounts[storyId] 
    });
  },

  getHelpfulCount: (storyId: string) => {
    const state = get();
    // ストアに値が設定されている場合はそれを返す、そうでなければundefinedを返す
    return state.helpfulCounts[storyId] !== undefined ? state.helpfulCounts[storyId] : undefined;
  },

  isLikedByUser: (storyId: string) => {
    const state = get();
    return state.userLikes[storyId] || false;
  },

  // 初期化メソッド
  initializeStoryLike: (storyId: string, initialHelpfulCount: number, initialIsLiked: boolean = false) => {
    const state = get();
    if (state.helpfulCounts[storyId] === undefined) {
      console.log(`🎯 ストーリー初期化 [${storyId}]:`, { initialHelpfulCount, initialIsLiked });
      set((state) => ({
        helpfulCounts: {
          ...state.helpfulCounts,
          [storyId]: initialHelpfulCount
        },
        userLikes: {
          ...state.userLikes,
          [storyId]: initialIsLiked
        }
      }));
    }
  }
})); 