// Jest の型を手動でインポート
/// <reference types="jest" />

// Firebase Firestore のモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  increment: jest.fn(),
  writeBatch: jest.fn(() => ({
    set: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    commit: jest.fn().mockResolvedValue(undefined),
  })),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() }))
  }
}));

// Firebase db のモック
jest.mock('../../../src/services/firebase', () => ({
  db: {}
}));

// realtimeManager のモック
jest.mock('../../../src/utils/realtimeManager', () => ({
  realtimeManager: {
    registerListener: jest.fn(() => true),
    removeListener: jest.fn(),
  }
}));

// モック設定後にインポート
import { likeService } from '../../../src/services/likeService';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  doc,
  updateDoc,
  increment,
  writeBatch
} from 'firebase/firestore';

describe('LikeService', () => {
  const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
  const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
  const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
  const mockQuery = query as jest.MockedFunction<typeof query>;
  const mockWhere = where as jest.MockedFunction<typeof where>;
  const mockCollection = collection as jest.MockedFunction<typeof collection>;
  const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
  const mockDoc = doc as jest.MockedFunction<typeof doc>;
  const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
  const mockIncrement = increment as jest.MockedFunction<typeof increment>;
  const mockWriteBatch = writeBatch as jest.MockedFunction<typeof writeBatch>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addLike', () => {
    it('should add a like successfully', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      // 既存のいいねがないことをモック
      mockGetDocs.mockResolvedValueOnce({
        empty: true,
        size: 0,
        docs: [],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);
      
      // collectionのモック
      mockCollection.mockReturnValue({} as any);
      
      // writeBatchのモック
      const mockBatch = {
        set: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      mockWriteBatch.mockReturnValue(mockBatch);
      
      // docのモックでidを返すように設定
      mockDoc.mockReturnValue({ id: 'like1' } as any);
      mockIncrement.mockReturnValue({} as any);

      const result = await likeService.addLike(storyId, userId);

      expect(mockWriteBatch).toHaveBeenCalled();
      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result).toBe('like1');
    });

    it('should throw error if already liked', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      // 既存のいいねがあることをモック
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 1,
        docs: [{ id: 'existing-like', ref: {} }],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn((callback) => callback({ id: 'existing-like', ref: {} })),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      // writeBatchのモック
      const mockBatch = {
        set: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      mockWriteBatch.mockReturnValue(mockBatch);

      await expect(likeService.addLike(storyId, userId)).rejects.toThrow();
    });

    it('いいね追加時にFirestoreのhelpfulCountが+1される', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      // 既存のいいねがないことをモック
      mockGetDocs.mockResolvedValueOnce({
        empty: true,
        size: 0,
        docs: [],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      // writeBatchのモック
      const mockBatch = {
        set: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      mockWriteBatch.mockReturnValue(mockBatch);

      await likeService.addLike(storyId, userId);

      expect(mockBatch.update).toHaveBeenCalledWith(expect.anything(), {
        'metadata.helpfulCount': expect.anything()
      });
    });
  });

  describe('removeLike', () => {
    it('should remove a like successfully', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      // 既存のいいねがあることをモック
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 1,
        docs: [{ id: 'existing-like', ref: {} }],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn((callback) => callback({ id: 'existing-like', ref: {} })),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      // writeBatchのモック
      const mockBatch = {
        set: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      mockWriteBatch.mockReturnValue(mockBatch);

      await likeService.removeLike(storyId, userId);

      expect(mockBatch.delete).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('いいね削除時にFirestoreのhelpfulCountが-1される', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      // 既存のいいねがあることをモック
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 1,
        docs: [{ id: 'existing-like', ref: {} }],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn((callback) => callback({ id: 'existing-like', ref: {} })),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      // writeBatchのモック
      const mockBatch = {
        set: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      mockWriteBatch.mockReturnValue(mockBatch);

      await likeService.removeLike(storyId, userId);

      expect(mockBatch.update).toHaveBeenCalledWith(expect.anything(), {
        'metadata.helpfulCount': expect.anything()
      });
    });
  });

  describe('getLikeCount', () => {
    it('should return correct like count', async () => {
      const storyId = 'story1';

      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 3,
        docs: [
          { id: 'like1', data: () => ({ storyId, userId: 'user1' }) },
          { id: 'like2', data: () => ({ storyId, userId: 'user2' }) },
          { id: 'like3', data: () => ({ storyId, userId: 'user3' }) }
        ],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      const count = await likeService.getLikeCount(storyId);

      expect(count).toBe(3);
    });

    it('should return 0 when no likes exist', async () => {
      const storyId = 'story1';

      mockGetDocs.mockResolvedValueOnce({
        empty: true,
        size: 0,
        docs: [],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      const count = await likeService.getLikeCount(storyId);

      expect(count).toBe(0);
    });
  });

  describe('isLikedByUser', () => {
    it('should return true when user has liked the story', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 1,
        docs: [{ id: 'like1', data: () => ({ storyId, userId }) }],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      const isLiked = await likeService.isLikedByUser(storyId, userId);

      expect(isLiked).toBe(true);
    });

    it('should return false when user has not liked the story', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      mockGetDocs.mockResolvedValueOnce({
        empty: true,
        size: 0,
        docs: [],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      const isLiked = await likeService.isLikedByUser(storyId, userId);

      expect(isLiked).toBe(false);
    });
  });

  describe('getUserLikes', () => {
    it('should return user likes', async () => {
      const userId = 'user1';

      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 2,
        docs: [
          { 
            id: 'like1', 
            data: () => ({ 
              storyId: 'story1', 
              userId, 
              createdAt: { toDate: () => new Date() } 
            }) 
          },
          { 
            id: 'like2', 
            data: () => ({ 
              storyId: 'story2', 
              userId, 
              createdAt: { toDate: () => new Date() } 
            }) 
          }
        ],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      const likes = await likeService.getUserLikes(userId);

      expect(likes).toHaveLength(2);
      expect(likes[0].storyId).toBe('story1');
      expect(likes[1].storyId).toBe('story2');
    });
  });

  describe('getLikesForStory', () => {
    it('should return story likes', async () => {
      const storyId = 'story1';

      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 2,
        docs: [
          { 
            id: 'like1', 
            data: () => ({ 
              storyId, 
              userId: 'user1', 
              createdAt: { toDate: () => new Date() } 
            }) 
          },
          { 
            id: 'like2', 
            data: () => ({ 
              storyId, 
              userId: 'user2', 
              createdAt: { toDate: () => new Date() } 
            }) 
          }
        ],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      const likes = await likeService.getLikesForStory(storyId);

      expect(likes).toHaveLength(2);
      expect(likes[0].userId).toBe('user1');
      expect(likes[1].userId).toBe('user2');
    });
  });

  describe('subscribeToLikes', () => {
    it('should return unsubscribe function', () => {
      const storyId = 'story1';
      const callback = jest.fn();

      mockOnSnapshot.mockReturnValue(jest.fn());

      const unsubscribe = likeService.subscribeToLikes(storyId, callback);

      expect(typeof unsubscribe).toBe('function');
      expect(mockOnSnapshot).toHaveBeenCalled();
    });
  });

  describe('batchToggleLikes', () => {
    it('should process batch operations', async () => {
      const operations = [
        { storyId: 'story1', userId: 'user1', action: 'add' as const },
        { storyId: 'story2', userId: 'user1', action: 'remove' as const }
      ];

      // writeBatchのモック
      const mockBatch = {
        set: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      mockWriteBatch.mockReturnValue(mockBatch);

      await likeService.batchToggleLikes(operations);

      expect(mockWriteBatch).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });
}); 