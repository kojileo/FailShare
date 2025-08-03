import { commentService } from '../../../src/services/commentService';
import { db } from '../../../src/services/firebase';

// Firebaseのモック
jest.mock('../../../src/services/firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe('CommentService', () => {
  const mockCollection = jest.fn();
  const mockAddDoc = jest.fn();
  const mockGetDocs = jest.fn();
  const mockDeleteDoc = jest.fn();
  const mockUpdateDoc = jest.fn();
  const mockOnSnapshot = jest.fn();
  const mockQuery = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockLimit = jest.fn();
  const mockStartAfter = jest.fn();
  const mockDoc = jest.fn();
  const mockTimestamp = {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Firebase Firestoreのモック設定
    const mockFirestore = {
      collection,
      addDoc,
      getDocs,
      deleteDoc,
      updateDoc,
      onSnapshot,
      query,
      where,
      orderBy,
      limit,
      startAfter,
      doc,
      Timestamp: mockTimestamp,
    };

    // 各メソッドのモック実装
    mockCollection.mockReturnValue('comments-collection');
    mockAddDoc.mockResolvedValue({ id: 'test-comment-id' });
    mockGetDocs.mockResolvedValue({
      empty: false,
      size: 1,
      docs: [
        {
          id: 'test-comment-id',
          data: () => ({
            storyId: 'test-story-id',
            authorId: 'test-user-id',
            content: 'テストコメント',
            createdAt: { toDate: () => new Date() },
            isHelpful: false,
          }),
          ref: { id: 'test-comment-id' },
        },
      ],
    });
    mockDeleteDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
    mockOnSnapshot.mockReturnValue(() => {});
    mockQuery.mockReturnValue('query-result');
    mockWhere.mockReturnValue('where-result');
    mockOrderBy.mockReturnValue('orderby-result');
    mockLimit.mockReturnValue('limit-result');
    mockStartAfter.mockReturnValue('startafter-result');
    mockDoc.mockReturnValue('doc-reference');

    // グローバルなFirebase関数をモック
    global.firebase = {
      firestore: mockFirestore,
    } as any;
  });

  describe('addComment', () => {
    it('コメントを正常に投稿できる', async () => {
      const storyId = 'test-story-id';
      const authorId = 'test-user-id';
      const content = 'テストコメント';

      await commentService.addComment(storyId, authorId, content);

      expect(mockCollection).toHaveBeenCalledWith(db, 'comments');
      expect(mockAddDoc).toHaveBeenCalledWith('comments-collection', {
        storyId,
        authorId,
        content: content.trim(),
        createdAt: expect.any(Object),
        isHelpful: false,
      });
    });

    it('空のコメントは投稿できない', async () => {
      const storyId = 'test-story-id';
      const authorId = 'test-user-id';
      const content = '';

      await expect(commentService.addComment(storyId, authorId, content))
        .rejects.toThrow('コメント内容を入力してください');
    });

    it('500文字を超えるコメントは投稿できない', async () => {
      const storyId = 'test-story-id';
      const authorId = 'test-user-id';
      const content = 'a'.repeat(501);

      await expect(commentService.addComment(storyId, authorId, content))
        .rejects.toThrow('コメントは500文字以内で入力してください');
    });
  });

  describe('getComments', () => {
    it('コメントを正常に取得できる', async () => {
      const storyId = 'test-story-id';
      const pageSize = 20;

      const comments = await commentService.getComments(storyId, pageSize);

      expect(comments).toHaveLength(1);
      expect(comments[0]).toEqual({
        id: 'test-comment-id',
        storyId: 'test-story-id',
        authorId: 'test-user-id',
        content: 'テストコメント',
        createdAt: expect.any(Date),
        isHelpful: false,
      });
    });

    it('デフォルトのページサイズでコメントを取得できる', async () => {
      const storyId = 'test-story-id';

      await commentService.getComments(storyId);

      expect(mockLimit).toHaveBeenCalledWith(20);
    });
  });

  describe('deleteComment', () => {
    it('コメントを正常に削除できる', async () => {
      const commentId = 'test-comment-id';
      const authorId = 'test-user-id';

      await commentService.deleteComment(commentId, authorId);

      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('存在しないコメントは削除できない', async () => {
      mockGetDocs.mockResolvedValueOnce({ empty: true });

      const commentId = 'test-comment-id';
      const authorId = 'test-user-id';

      await expect(commentService.deleteComment(commentId, authorId))
        .rejects.toThrow('コメントが見つからないか、削除権限がありません');
    });
  });

  describe('updateComment', () => {
    it('コメントを正常に更新できる', async () => {
      const commentId = 'test-comment-id';
      const authorId = 'test-user-id';
      const content = '更新されたコメント';

      await commentService.updateComment(commentId, authorId, content);

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-reference', {
        content: content.trim(),
        updatedAt: expect.any(Object),
      });
    });

    it('空のコメントは更新できない', async () => {
      const commentId = 'test-comment-id';
      const authorId = 'test-user-id';
      const content = '';

      await expect(commentService.updateComment(commentId, authorId, content))
        .rejects.toThrow('コメント内容を入力してください');
    });

    it('500文字を超えるコメントは更新できない', async () => {
      const commentId = 'test-comment-id';
      const authorId = 'test-user-id';
      const content = 'a'.repeat(501);

      await expect(commentService.updateComment(commentId, authorId, content))
        .rejects.toThrow('コメントは500文字以内で入力してください');
    });
  });

  describe('getCommentCount', () => {
    it('コメント数を正常に取得できる', async () => {
      const storyId = 'test-story-id';

      const count = await commentService.getCommentCount(storyId);

      expect(count).toBe(1);
    });
  });

  describe('subscribeToComments', () => {
    it('コメントのリアルタイム監視を開始できる', () => {
      const storyId = 'test-story-id';
      const callback = jest.fn();

      const unsubscribe = commentService.subscribeToComments(storyId, callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });
});

// Firebase Firestore関数のモック
const collection = jest.fn();
const addDoc = jest.fn();
const getDocs = jest.fn();
const deleteDoc = jest.fn();
const updateDoc = jest.fn();
const onSnapshot = jest.fn();
const query = jest.fn();
const where = jest.fn();
const orderBy = jest.fn();
const limit = jest.fn();
const startAfter = jest.fn();
const doc = jest.fn(); 