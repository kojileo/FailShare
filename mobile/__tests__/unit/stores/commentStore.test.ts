import { useCommentStore } from '../../../src/stores/commentStore';
import { commentService } from '../../../src/services/commentService';
import { Comment } from '../../../src/types';

// commentServiceのモック
jest.mock('../../../src/services/commentService');

const mockCommentService = commentService as jest.Mocked<typeof commentService>;

describe('CommentStore', () => {
  const mockComment: Comment = {
    id: 'test-comment-id',
    storyId: 'test-story-id',
    authorId: 'test-user-id',
    content: 'テストコメント',
    createdAt: new Date(),
    isHelpful: false,
  };

  const mockComments: Comment[] = [
    mockComment,
    {
      id: 'test-comment-id-2',
      storyId: 'test-story-id',
      authorId: 'test-user-id-2',
      content: 'テストコメント2',
      createdAt: new Date(),
      isHelpful: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useCommentStore.getState().reset();
  });

  describe('loadComments', () => {
    it('コメントを正常に読み込める', async () => {
      mockCommentService.getComments.mockResolvedValue(mockComments);

      await useCommentStore.getState().loadComments('test-story-id');

      expect(mockCommentService.getComments).toHaveBeenCalledWith('test-story-id', 20);
      expect(useCommentStore.getState().comments['test-story-id']).toEqual(mockComments);
      expect(useCommentStore.getState().isLoading['test-story-id']).toBe(false);
      expect(useCommentStore.getState().error['test-story-id']).toBeNull();
    });

    it('エラー時に適切にエラー状態を設定する', async () => {
      const errorMessage = 'コメントの読み込みに失敗しました';
      mockCommentService.getComments.mockRejectedValue(new Error(errorMessage));

      await useCommentStore.getState().loadComments('test-story-id');

      expect(useCommentStore.getState().error['test-story-id']).toBe(errorMessage);
      expect(useCommentStore.getState().isLoading['test-story-id']).toBe(false);
    });

    it('インデックスエラーの場合、ユーザーフレンドリーなメッセージを表示する', async () => {
      const indexError = new Error('The query requires an index');
      mockCommentService.getComments.mockRejectedValue(indexError);

      await useCommentStore.getState().loadComments('test-story-id');

      expect(useCommentStore.getState().error['test-story-id']).toBe('コメントの読み込みに時間がかかっています。しばらくお待ちください。');
    });
  });

  describe('loadMoreComments', () => {
    it('追加のコメントを正常に読み込める', async () => {
      const existingComments = [mockComment];
      const moreComments = [mockComments[1]];
      
      useCommentStore.getState().setComments('test-story-id', existingComments);
      mockCommentService.getCommentsWithPagination.mockResolvedValue(moreComments);

      await useCommentStore.getState().loadMoreComments('test-story-id');

      expect(mockCommentService.getCommentsWithPagination).toHaveBeenCalledWith('test-story-id', expect.any(Object), 20);
      expect(useCommentStore.getState().comments['test-story-id']).toEqual([...existingComments, ...moreComments]);
    });

    it('コメントがない場合はhasMoreをfalseに設定する', async () => {
      mockCommentService.getCommentsWithPagination.mockResolvedValue([]);

      await useCommentStore.getState().loadMoreComments('test-story-id');

      expect(useCommentStore.getState().hasMore['test-story-id']).toBeUndefined();
    });
  });

  describe('addComment', () => {
    it('コメントを正常に投稿できる', async () => {
      mockCommentService.addComment.mockResolvedValue('new-comment-id');
      const initialState = useCommentStore.getState();
      const initialComments = initialState.comments['test-story-id'] || [];

      await useCommentStore.getState().addComment('test-story-id', 'test-user-id', '新しいコメント');

      expect(mockCommentService.addComment).toHaveBeenCalledWith('test-story-id', 'test-user-id', '新しいコメント');
      
      const finalState = useCommentStore.getState();
      const finalComments = finalState.comments['test-story-id'] || [];
      
      // 楽観的更新が行われていることを確認
      expect(finalComments.length).toBeGreaterThan(initialComments.length);
      expect(finalComments[0].content).toBe('新しいコメント');
    });

    it('エラー時に楽観的更新を元に戻す', async () => {
      const errorMessage = 'コメントの投稿に失敗しました';
      mockCommentService.addComment.mockRejectedValue(new Error(errorMessage));
      
      const initialState = useCommentStore.getState();
      const initialComments = initialState.comments['test-story-id'] || [];

      await useCommentStore.getState().addComment('test-story-id', 'test-user-id', '新しいコメント');

      const finalState = useCommentStore.getState();
      const finalComments = finalState.comments['test-story-id'] || [];
      
      // 楽観的更新が元に戻されていることを確認
      expect(finalComments).toEqual(initialComments);
      expect(finalState.error['test-story-id']).toBe(errorMessage);
    });
  });

  describe('deleteComment', () => {
    it('コメントを正常に削除できる', async () => {
      useCommentStore.getState().setComments('test-story-id', mockComments);
      mockCommentService.deleteComment.mockResolvedValue();

      await useCommentStore.getState().deleteComment('test-comment-id', 'test-user-id', 'test-story-id');

      expect(mockCommentService.deleteComment).toHaveBeenCalledWith('test-comment-id', 'test-user-id');
      
      const finalState = useCommentStore.getState();
      const finalComments = finalState.comments['test-story-id'] || [];
      
      // コメントが削除されていることを確認
      expect(finalComments.length).toBe(1);
      expect(finalComments.find(c => c.id === 'test-comment-id')).toBeUndefined();
    });

    it('エラー時に楽観的更新を元に戻す', async () => {
      const errorMessage = 'コメントの削除に失敗しました';
      mockCommentService.deleteComment.mockRejectedValue(new Error(errorMessage));
      
      useCommentStore.getState().setComments('test-story-id', mockComments);
      const initialComments = [...mockComments];

      await useCommentStore.getState().deleteComment('test-comment-id', 'test-user-id', 'test-story-id');

      const finalState = useCommentStore.getState();
      const finalComments = finalState.comments['test-story-id'] || [];
      
      // 楽観的更新が元に戻されていることを確認
      expect(finalComments).toEqual(initialComments);
      expect(finalState.error['test-story-id']).toBe(errorMessage);
    });
  });

  describe('updateComment', () => {
    it('コメントを正常に更新できる', async () => {
      useCommentStore.getState().setComments('test-story-id', mockComments);
      mockCommentService.updateComment.mockResolvedValue();

      await useCommentStore.getState().updateComment('test-comment-id', 'test-user-id', '更新されたコメント', 'test-story-id');

      expect(mockCommentService.updateComment).toHaveBeenCalledWith('test-comment-id', 'test-user-id', '更新されたコメント');
      
      const finalState = useCommentStore.getState();
      const finalComments = finalState.comments['test-story-id'] || [];
      const updatedComment = finalComments.find(c => c.id === 'test-comment-id');
      
      expect(updatedComment?.content).toBe('更新されたコメント');
    });

    it('エラー時に楽観的更新を元に戻す', async () => {
      const errorMessage = 'コメントの更新に失敗しました';
      mockCommentService.updateComment.mockRejectedValue(new Error(errorMessage));
      
      useCommentStore.getState().setComments('test-story-id', mockComments);
      const initialComments = [...mockComments];

      await useCommentStore.getState().updateComment('test-comment-id', 'test-user-id', '更新されたコメント', 'test-story-id');

      const finalState = useCommentStore.getState();
      const finalComments = finalState.comments['test-story-id'] || [];
      
      // 楽観的更新が元に戻されていることを確認
      expect(finalComments).toEqual(initialComments);
      expect(finalState.error['test-story-id']).toBe(errorMessage);
    });
  });

  describe('subscribeToComments', () => {
    it('リアルタイム監視を開始できる', () => {
      const mockUnsubscribe = jest.fn();
      mockCommentService.subscribeToComments.mockReturnValue(mockUnsubscribe);

      const unsubscribe = useCommentStore.getState().subscribeToComments('test-story-id');

      expect(mockCommentService.subscribeToComments).toHaveBeenCalledWith('test-story-id', expect.any(Function));
      expect(typeof unsubscribe).toBe('function');
    });

    it('コールバックが呼ばれた時にコメントを更新する', () => {
      let callback: (comments: Comment[]) => void;
      mockCommentService.subscribeToComments.mockImplementation((storyId, cb) => {
        callback = cb;
        return jest.fn();
      });

      useCommentStore.getState().subscribeToComments('test-story-id');

      // コールバックを呼び出してコメントを更新
      callback!(mockComments);

      expect(useCommentStore.getState().comments['test-story-id']).toEqual(mockComments);
    });
  });

  describe('state management', () => {
    it('setCommentsでコメントを設定できる', () => {
      useCommentStore.getState().setComments('test-story-id', mockComments);

      expect(useCommentStore.getState().comments['test-story-id']).toEqual(mockComments);
    });

    it('setLoadingでローディング状態を設定できる', () => {
      useCommentStore.getState().setLoading('test-story-id', true);

      expect(useCommentStore.getState().isLoading['test-story-id']).toBe(true);
    });

    it('setErrorでエラー状態を設定できる', () => {
      const errorMessage = 'テストエラー';
      useCommentStore.getState().setError('test-story-id', errorMessage);

      expect(useCommentStore.getState().error['test-story-id']).toBe(errorMessage);
    });

    it('setHasMoreでhasMore状態を設定できる', () => {
      useCommentStore.getState().setHasMore('test-story-id', false);

      expect(useCommentStore.getState().hasMore['test-story-id']).toBe(false);
    });

    it('resetStoryで特定のストーリーの状態をリセットできる', () => {
      // 初期状態を設定
      useCommentStore.getState().setComments('test-story-id', mockComments);
      useCommentStore.getState().setLoading('test-story-id', true);
      useCommentStore.getState().setError('test-story-id', 'エラー');
      useCommentStore.getState().setHasMore('test-story-id', false);

      useCommentStore.getState().resetStory('test-story-id');

      expect(useCommentStore.getState().comments['test-story-id']).toBeUndefined();
      expect(useCommentStore.getState().isLoading['test-story-id']).toBeUndefined();
      expect(useCommentStore.getState().error['test-story-id']).toBeUndefined();
      expect(useCommentStore.getState().hasMore['test-story-id']).toBeUndefined();
    });

    it('resetで全体の状態をリセットできる', () => {
      // 初期状態を設定
      useCommentStore.getState().setComments('test-story-id', mockComments);
      useCommentStore.getState().setLoading('test-story-id', true);

      useCommentStore.getState().reset();

      expect(useCommentStore.getState().comments).toEqual({});
      expect(useCommentStore.getState().isLoading).toEqual({});
      expect(useCommentStore.getState().error).toEqual({});
      expect(useCommentStore.getState().hasMore).toEqual({});
    });
  });
}); 