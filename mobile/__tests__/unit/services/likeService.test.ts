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
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() }))
  }
}));

// Firebase db のモック
jest.mock('../../../src/services/firebase', () => ({
  db: {}
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
  increment
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
      
      // addDocの成功をモック
      mockAddDoc.mockResolvedValueOnce({ id: 'like1' } as any);
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValueOnce(undefined);
      mockIncrement.mockReturnValue({} as any);

      await likeService.addLike(storyId, userId);

      expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), {
        storyId,
        userId,
        createdAt: expect.anything()
      });
      
      // FirestoreのhelpfulCountも更新されることを確認
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'stories', storyId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        'metadata.helpfulCount': expect.anything()
      });
    });

    it('should throw error if already liked', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      // 既存のいいねがあることをモック
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 1,
        docs: [{
          id: 'existing-like',
          data: () => ({ storyId, userId }),
          metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
          exists: () => true as any,
          get: jest.fn(),
          ref: {} as any
        }],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      await expect(likeService.addLike(storyId, userId)).rejects.toThrow('既にいいね済みです');
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
      
      // collectionのモック
      mockCollection.mockReturnValue({} as any);
      
      // addDocの成功をモック
      mockAddDoc.mockResolvedValueOnce({ id: 'like1' } as any);
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValueOnce(undefined);
      mockIncrement.mockReturnValue({} as any);

      await likeService.addLike(storyId, userId);

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'stories', storyId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        'metadata.helpfulCount': expect.anything()
      });
    });
  });

  describe('getHelpfulCount', () => {
    it('should return correct like count', async () => {
      const storyId = 'story1';

      // 3つのいいねがあることをモック
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 3,
        docs: [
          {
            id: 'like1',
            data: () => ({ storyId, userId: 'user1' }),
            metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
            exists: () => true as any,
            get: jest.fn(),
            ref: {} as any
          },
          {
            id: 'like2',
            data: () => ({ storyId, userId: 'user2' }),
            metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
            exists: () => true as any,
            get: jest.fn(),
            ref: {} as any
          },
          {
            id: 'like3',
            data: () => ({ storyId, userId: 'user3' }),
            metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
            exists: () => true as any,
            get: jest.fn(),
            ref: {} as any
          }
        ],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      const count = await likeService.getHelpfulCount(storyId);

      expect(count).toBe(3);
    });

    it('should return 0 when no likes exist', async () => {
      const storyId = 'story1';

      // いいねがないことをモック
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

      const count = await likeService.getHelpfulCount(storyId);

      expect(count).toBe(0);
    });
  });

  describe('isLikedByUser', () => {
    it('should return true when user has liked the story', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      // いいねがあることをモック
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 1,
        docs: [{
          id: 'like1',
          data: () => ({ storyId, userId }),
          metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
          exists: () => true as any,
          get: jest.fn(),
          ref: {} as any
        }],
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

      // いいねがないことをモック
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

  describe('removeLike', () => {
    it('いいね削除時にFirestoreのhelpfulCountが-1される', async () => {
      const storyId = 'story1';
      const userId = 'user1';

      // 既存のいいねがあることをモック
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 1,
        docs: [{
          id: 'existing-like',
          data: () => ({ storyId, userId }),
          metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
          exists: () => true as any,
          get: jest.fn(),
          ref: {} as any
        }],
        metadata: { fromCache: false, hasPendingWrites: false, isEqual: jest.fn() },
        query: {} as any,
        forEach: jest.fn(),
        docChanges: jest.fn(),
        toJSON: jest.fn()
      } as any);

      // deleteDocの成功をモック
      mockDeleteDoc.mockResolvedValueOnce(undefined);
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValueOnce(undefined);
      mockIncrement.mockReturnValue({} as any);

      await likeService.removeLike(storyId, userId);

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'stories', storyId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        'metadata.helpfulCount': expect.anything()
      });
    });
  });
}); 