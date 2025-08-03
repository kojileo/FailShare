import { commentService } from '../../../src/services/commentService';

// Firebase Firestoreのモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  doc: jest.fn(),
  increment: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

jest.mock('../../../src/services/firebase', () => ({
  db: {},
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
  const mockIncrement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // モック関数を設定
    const firebaseFirestore = require('firebase/firestore');
    firebaseFirestore.collection = mockCollection;
    firebaseFirestore.addDoc = mockAddDoc;
    firebaseFirestore.getDocs = mockGetDocs;
    firebaseFirestore.deleteDoc = mockDeleteDoc;
    firebaseFirestore.updateDoc = mockUpdateDoc;
    firebaseFirestore.onSnapshot = mockOnSnapshot;
    firebaseFirestore.query = mockQuery;
    firebaseFirestore.where = mockWhere;
    firebaseFirestore.orderBy = mockOrderBy;
    firebaseFirestore.limit = mockLimit;
    firebaseFirestore.startAfter = mockStartAfter;
    firebaseFirestore.doc = mockDoc;
    firebaseFirestore.increment = mockIncrement;
    
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
    mockIncrement.mockReturnValue('increment-value');
  });

  describe('addComment', () => {
    it('コメントを正常に投稿できる', async () => {
      const storyId = 'test-story-id';
      const authorId = 'test-user-id';
      const content = 'テストコメント';

      await commentService.addComment(storyId, authorId, content);

      expect(mockCollection).toHaveBeenCalledWith({}, 'comments');
      expect(mockAddDoc).toHaveBeenCalledWith('comments-collection', {
        storyId,
        authorId,
        content: content.trim(),
        createdAt: expect.any(Object),
        isHelpful: false,
      });
    });

    it('空のコメントは投稿できない', async () => {
      await expect(commentService.addComment('test-story-id', 'test-user-id', ''))
        .rejects.toThrow('コメント内容を入力してください');
    });

    it('500文字を超えるコメントは投稿できない', async () => {
      const longContent = 'a'.repeat(501);
      await expect(commentService.addComment('test-story-id', 'test-user-id', longContent))
        .rejects.toThrow('コメントは500文字以内で入力してください');
    });
  });

  describe('getComments', () => {
    it('コメントを正常に取得できる', async () => {
      const comments = await commentService.getComments('test-story-id');

      expect(mockCollection).toHaveBeenCalledWith({}, 'comments');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('storyId', '==', 'test-story-id');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toBe('テストコメント');
    });

    it('デフォルトのページサイズでコメントを取得できる', async () => {
      await commentService.getComments('test-story-id');

      expect(mockLimit).toHaveBeenCalledWith(20);
    });
  });

  describe('deleteComment', () => {
    it('コメントを正常に削除できる', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'test-comment-id',
          data: () => ({ 
            authorId: 'test-user-id',
            storyId: 'test-story-id'
          }),
          ref: { id: 'test-comment-id' },
        }],
      });

      await commentService.deleteComment('test-comment-id', 'test-user-id');

      expect(mockCollection).toHaveBeenCalledWith({}, 'comments');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('__name__', '==', 'test-comment-id');
      expect(mockWhere).toHaveBeenCalledWith('authorId', '==', 'test-user-id');
      expect(mockDeleteDoc).toHaveBeenCalledWith({ id: 'test-comment-id' });
    });

    it('存在しないコメントは削除できない', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        docs: [],
      });

      await expect(commentService.deleteComment('non-existent-id', 'test-user-id'))
        .rejects.toThrow('コメントが見つからないか、削除権限がありません');
    });
  });

  describe('updateComment', () => {
    it('コメントを正常に更新できる', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'test-comment-id',
          data: () => ({ authorId: 'test-user-id' }),
          ref: { id: 'test-comment-id' },
        }],
      });

      await commentService.updateComment('test-comment-id', 'test-user-id', '更新されたコメント');

      expect(mockCollection).toHaveBeenCalledWith({}, 'comments');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('__name__', '==', 'test-comment-id');
      expect(mockWhere).toHaveBeenCalledWith('authorId', '==', 'test-user-id');
      expect(mockUpdateDoc).toHaveBeenCalledWith({ id: 'test-comment-id' }, {
        content: '更新されたコメント',
        updatedAt: expect.any(Object),
      });
    });

    it('空のコメントは更新できない', async () => {
      await expect(commentService.updateComment('test-comment-id', 'test-user-id', ''))
        .rejects.toThrow('コメント内容を入力してください');
    });

    it('500文字を超えるコメントは更新できない', async () => {
      const longContent = 'a'.repeat(501);
      await expect(commentService.updateComment('test-comment-id', 'test-user-id', longContent))
        .rejects.toThrow('コメントは500文字以内で入力してください');
    });
  });

  describe('getCommentCount', () => {
    it('コメント数を正常に取得できる', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        size: 5,
        docs: [],
      });

      const count = await commentService.getCommentCount('test-story-id');

      expect(mockCollection).toHaveBeenCalledWith({}, 'comments');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('storyId', '==', 'test-story-id');
      expect(count).toBe(5);
    });
  });

  describe('subscribeToComments', () => {
    it('コメントのリアルタイム監視を開始できる', () => {
      const callback = jest.fn();
      const unsubscribe = commentService.subscribeToComments('test-story-id', callback);

      expect(mockCollection).toHaveBeenCalledWith({}, 'comments');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('storyId', '==', 'test-story-id');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockOnSnapshot).toHaveBeenCalledWith('query-result', expect.any(Function), expect.any(Function));
      expect(typeof unsubscribe).toBe('function');
    });

    it('コールバックが正しく呼ばれる', () => {
      const callback = jest.fn();
      let snapshotCallback: any;

      mockOnSnapshot.mockImplementation((query, cb) => {
        snapshotCallback = cb;
        return () => {};
      });

      commentService.subscribeToComments('test-story-id', callback);

      // モックデータでコールバックを呼び出し
      snapshotCallback({
        docs: [{
          id: 'test-comment-id',
          data: () => ({
            storyId: 'test-story-id',
            authorId: 'test-user-id',
            content: 'テストコメント',
            createdAt: { toDate: () => new Date() },
            isHelpful: false,
          }),
        }],
      });

      expect(callback).toHaveBeenCalledWith([{
        id: 'test-comment-id',
        storyId: 'test-story-id',
        authorId: 'test-user-id',
        content: 'テストコメント',
        createdAt: expect.any(Date),
        isHelpful: false,
      }]);
    });
  });

  describe('getCommentsWithPagination', () => {
    it('ページネーション付きでコメントを取得できる', async () => {
      const lastComment = {
        id: 'last-comment-id',
        storyId: 'test-story-id',
        authorId: 'test-user-id',
        content: '最後のコメント',
        createdAt: new Date(),
        isHelpful: false,
      };

      // getCommentDocumentのモックを設定
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'last-comment-id',
          data: () => ({
            storyId: 'test-story-id',
            authorId: 'test-user-id',
            content: '最後のコメント',
            createdAt: { toDate: () => new Date() },
            isHelpful: false,
          }),
        }],
      });

      await commentService.getCommentsWithPagination('test-story-id', lastComment, 10);

      expect(mockCollection).toHaveBeenCalledWith({}, 'comments');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('storyId', '==', 'test-story-id');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockStartAfter).toHaveBeenCalledWith(expect.any(Object));
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('最後のコメントがない場合でも正常に動作する', async () => {
      await commentService.getCommentsWithPagination('test-story-id', undefined, 10);

      expect(mockCollection).toHaveBeenCalledWith({}, 'comments');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('storyId', '==', 'test-story-id');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(10);
    });
  });

  describe('エラーハンドリング', () => {
    it('Firebaseエラーが適切に処理される', async () => {
      mockAddDoc.mockRejectedValue(new Error('Firebase error'));

      await expect(commentService.addComment('test-story-id', 'test-user-id', 'test'))
        .rejects.toThrow('Firebase error');
    });

    it('ネットワークエラーが適切に処理される', async () => {
      mockGetDocs.mockRejectedValue(new Error('Network error'));

      await expect(commentService.getComments('test-story-id'))
        .rejects.toThrow('Network error');
    });
  });

  describe('バリデーション', () => {
    it('storyIdが空の場合、エラーが発生する', async () => {
      await expect(commentService.addComment('', 'test-user-id', 'test'))
        .rejects.toThrow('ストーリーIDが必要です');
    });

    it('authorIdが空の場合、エラーが発生する', async () => {
      await expect(commentService.addComment('test-story-id', '', 'test'))
        .rejects.toThrow('ユーザーIDが必要です');
    });

    it('contentがnullの場合、エラーが発生する', async () => {
      await expect(commentService.addComment('test-story-id', 'test-user-id', null as any))
        .rejects.toThrow('コメント内容を入力してください');
    });

    it('contentがundefinedの場合、エラーが発生する', async () => {
      await expect(commentService.addComment('test-story-id', 'test-user-id', undefined as any))
        .rejects.toThrow('コメント内容を入力してください');
    });
  });

  describe('データ変換', () => {
    it('FirestoreのTimestampが正しくDateに変換される', async () => {
      const mockDate = new Date('2024-01-01T10:00:00Z');
      mockGetDocs.mockResolvedValue({
        empty: false,
        size: 1,
        docs: [{
          id: 'test-comment-id',
          data: () => ({
            storyId: 'test-story-id',
            authorId: 'test-user-id',
            content: 'テストコメント',
            createdAt: { toDate: () => mockDate },
            isHelpful: false,
          }),
        }],
      });

      const comments = await commentService.getComments('test-story-id');

      expect(comments[0].createdAt).toEqual(mockDate);
    });

    it('isHelpfulフィールドが正しく処理される', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        size: 1,
        docs: [{
          id: 'test-comment-id',
          data: () => ({
            storyId: 'test-story-id',
            authorId: 'test-user-id',
            content: 'テストコメント',
            createdAt: { toDate: () => new Date() },
            isHelpful: true,
          }),
        }],
      });

      const comments = await commentService.getComments('test-story-id');

      expect(comments[0].isHelpful).toBe(true);
    });
  });
}); 