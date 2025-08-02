import '../../../__tests__/__mocks__/firebase';
import { mockLike, mockLikes, mockLikeStats } from '../../__mocks__/sampleData';
import { useLikeStore } from '../../../src/stores/likeStore';

// Jest の型を手動でインポート
/// <reference types="jest" />

describe('LikeStore', () => {
  beforeEach(() => {
    // ストアをリセット
    useLikeStore.getState().reset();
  });

  describe('初期状態', () => {
    it('should have correct initial state', () => {
      const state = useLikeStore.getState();
      
      expect(state.likes).toEqual({});
      expect(state.userLikes).toEqual({});
      expect(state.helpfulCounts).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setLikes', () => {
    it('should set likes for a story', () => {
      const storyId = 'test-story-1';
      const likes = mockLikes.filter(like => like.storyId === storyId);
      
      useLikeStore.getState().setLikes(storyId, likes);
      
      const state = useLikeStore.getState();
      expect(state.likes[storyId]).toEqual(likes);
    });
  });

  describe('setUserLike', () => {
    it('should set user like status for a story', () => {
      const storyId = 'test-story-1';
      const isLiked = true;
      
      useLikeStore.getState().setUserLike(storyId, isLiked);
      
      const state = useLikeStore.getState();
      expect(state.userLikes[storyId]).toBe(isLiked);
    });
  });

  describe('setHelpfulCount', () => {
    it('should set helpful count for a story', () => {
      const storyId = 'test-story-1';
      const count = 5;
      
      useLikeStore.getState().setHelpfulCount(storyId, count);
      
      const state = useLikeStore.getState();
      expect(state.helpfulCounts[storyId]).toBe(count);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      useLikeStore.getState().setLoading(true);
      
      const state = useLikeStore.getState();
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set error state', () => {
      const errorMessage = 'テストエラー';
      useLikeStore.getState().setError(errorMessage);
      
      const state = useLikeStore.getState();
      expect(state.error).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      // まずエラーを設定
      useLikeStore.getState().setError('テストエラー');
      
      // エラーをクリア
      useLikeStore.getState().setError(null);
      
      const state = useLikeStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('addLike', () => {
    it('should add like and update state', async () => {
      const storyId = 'test-story-1';
      const userId = 'test-user-id';
      
      // モックの設定
      const mockLikeService = {
        addLike: jest.fn().mockResolvedValue(undefined),
        getHelpfulCount: jest.fn().mockResolvedValue(3),
        isLikedByUser: jest.fn().mockResolvedValue(true)
      };
      
      // サービスをモック化
      jest.doMock('../../../src/services/likeService', () => ({
        likeService: mockLikeService
      }));
      
      // 初期状態を設定
      useLikeStore.getState().setHelpfulCount(storyId, 2);
      useLikeStore.getState().setUserLike(storyId, false);
      
      await useLikeStore.getState().addLike(storyId, userId);
      
      const state = useLikeStore.getState();
      expect(state.helpfulCounts[storyId]).toBe(3);
      expect(state.userLikes[storyId]).toBe(true);
    });

    it('should handle error when adding like fails', async () => {
      const storyId = 'test-story-1';
      const userId = 'test-user-id';
      
      // エラーを投げるモック
      const mockLikeService = {
        addLike: jest.fn().mockRejectedValue(new Error('Firebase error'))
      };
      
      jest.doMock('../../../src/services/likeService', () => ({
        likeService: mockLikeService
      }));
      
      await useLikeStore.getState().addLike(storyId, userId);
      
      const state = useLikeStore.getState();
      expect(state.error).toBe('Firebase error');
    });
  });

  describe('removeLike', () => {
    it('should remove like and update state', async () => {
      const storyId = 'test-story-1';
      const userId = 'test-user-id';
      
      // モックの設定
      const mockLikeService = {
        removeLike: jest.fn().mockResolvedValue(undefined),
        getHelpfulCount: jest.fn().mockResolvedValue(1),
        isLikedByUser: jest.fn().mockResolvedValue(false)
      };
      
      jest.doMock('../../../src/services/likeService', () => ({
        likeService: mockLikeService
      }));
      
      // 初期状態を設定
      useLikeStore.getState().setHelpfulCount(storyId, 2);
      useLikeStore.getState().setUserLike(storyId, true);
      
      await useLikeStore.getState().removeLike(storyId, userId);
      
      const state = useLikeStore.getState();
      expect(state.helpfulCounts[storyId]).toBe(1);
      expect(state.userLikes[storyId]).toBe(false);
    });

    it('should handle error when removing like fails', async () => {
      const storyId = 'test-story-1';
      const userId = 'test-user-id';
      
      const mockLikeService = {
        removeLike: jest.fn().mockRejectedValue(new Error('Firebase error'))
      };
      
      jest.doMock('../../../src/services/likeService', () => ({
        likeService: mockLikeService
      }));
      
      await useLikeStore.getState().removeLike(storyId, userId);
      
      const state = useLikeStore.getState();
      expect(state.error).toBe('Firebase error');
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      // まず状態を変更
      useLikeStore.getState().setLikes('test-story-1', mockLikes);
      useLikeStore.getState().setUserLike('test-story-1', true);
      useLikeStore.getState().setHelpfulCount('test-story-1', 5);
      useLikeStore.getState().setLoading(true);
      useLikeStore.getState().setError('テストエラー');
      
      // リセット
      useLikeStore.getState().reset();
      
      const state = useLikeStore.getState();
      expect(state.likes).toEqual({});
      expect(state.userLikes).toEqual({});
      expect(state.helpfulCounts).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('状態の整合性', () => {
    it('should maintain consistency between likes and counts', () => {
      const storyId = 'test-story-1';
      const likes = mockLikes.filter(like => like.storyId === storyId);
      
      useLikeStore.getState().setLikes(storyId, likes);
      useLikeStore.getState().setHelpfulCount(storyId, likes.length);
      
      const state = useLikeStore.getState();
      expect(state.likes[storyId]).toHaveLength(likes.length);
      expect(state.helpfulCounts[storyId]).toBe(likes.length);
    });
  });
}); 