import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { StoryDetailScreen } from '../../../src/screens/StoryDetailScreen';
import { useAuthStore } from '../../../src/stores/authStore';
import { useCommentStore } from '../../../src/stores/commentStore';
import { storyService } from '../../../src/services/storyService';

// モック
jest.mock('../../../src/stores/authStore');
jest.mock('../../../src/stores/commentStore');
jest.mock('../../../src/services/storyService');
jest.mock('@react-navigation/native-stack', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: { storyId: 'test-story-id' },
  }),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseCommentStore = useCommentStore as jest.MockedFunction<typeof useCommentStore>;
const mockStoryService = storyService as jest.Mocked<typeof storyService>;

describe('CommentFeature E2E', () => {
  const mockUser = {
    id: 'test-user-id',
    displayName: 'テストユーザー',
    avatar: 'https://example.com/avatar.jpg',
    joinedAt: new Date(),
    lastActive: new Date(),
    stats: {
      totalPosts: 5,
      totalComments: 10,
      helpfulVotes: 20,
      learningPoints: 15,
      totalLikes: 30,
      receivedLikes: 25,
    },
  };

  const mockStory = {
    id: 'test-story-id',
    authorId: 'test-author-id',
    content: {
      title: 'テスト投稿',
      category: { main: '恋愛', sub: 'デート' },
      situation: 'デートの状況',
      action: '取った行動',
      result: '結果',
      learning: '学んだこと',
      emotion: '後悔',
    },
    metadata: {
      createdAt: new Date(),
      viewCount: 100,
      helpfulCount: 5,
      commentCount: 3,
      tags: ['テスト', 'デート'],
    },
  };

  const mockComments = [
    {
      id: 'comment-1',
      storyId: 'test-story-id',
      authorId: 'test-user-id',
      content: '素晴らしい投稿です！',
      createdAt: new Date(),
      isHelpful: false,
    },
    {
      id: 'comment-2',
      storyId: 'test-story-id',
      authorId: 'other-user-id',
      content: '参考になりました',
      createdAt: new Date(),
      isHelpful: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // AuthStoreのモック
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    // CommentStoreのモック
    mockUseCommentStore.mockReturnValue({
      comments: { 'test-story-id': mockComments },
      isLoading: { 'test-story-id': false },
      error: { 'test-story-id': null },
      hasMore: { 'test-story-id': false },
      loadComments: jest.fn(),
      loadMoreComments: jest.fn(),
      addComment: jest.fn(),
      deleteComment: jest.fn(),
      updateComment: jest.fn(),
      subscribeToComments: jest.fn(() => jest.fn()),
      setComments: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      setHasMore: jest.fn(),
      resetStory: jest.fn(),
      reset: jest.fn(),
    });

    // StoryServiceのモック
    mockStoryService.getStories.mockResolvedValue({
      stories: [mockStory],
    });
  });

  describe('コメント表示機能', () => {
    it('コメントボタンをタップするとコメントセクションが表示される', async () => {
      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByText('コメント')).toBeTruthy();
        expect(screen.getByText('素晴らしい投稿です！')).toBeTruthy();
        expect(screen.getByText('参考になりました')).toBeTruthy();
      });
    });

    it('コメントセクションでコメント数が正しく表示される', async () => {
      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByText('コメント (2)')).toBeTruthy();
      });
    });

    it('コメントがない場合は空の状態が表示される', async () => {
      mockUseCommentStore.mockReturnValue({
        ...mockUseCommentStore(),
        comments: { 'test-story-id': [] },
      });

      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByText('まだコメントがありません')).toBeTruthy();
        expect(screen.getByText('最初のコメントを投稿してみましょう！')).toBeTruthy();
      });
    });
  });

  describe('コメント投稿機能', () => {
    it('コメント入力欄が表示される', async () => {
      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('コメントを入力...（500文字以内）')).toBeTruthy();
        expect(screen.getByText('投稿')).toBeTruthy();
      });
    });

    it('空のコメントは投稿できない', async () => {
      const mockAddComment = jest.fn();
      mockUseCommentStore.mockReturnValue({
        ...mockUseCommentStore(),
        addComment: mockAddComment,
      });

      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        const submitButton = screen.getByText('投稿');
        fireEvent.press(submitButton);
      });

      expect(mockAddComment).not.toHaveBeenCalled();
    });

    it('有効なコメントを投稿できる', async () => {
      const mockAddComment = jest.fn();
      mockUseCommentStore.mockReturnValue({
        ...mockUseCommentStore(),
        addComment: mockAddComment,
      });

      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('コメントを入力...（500文字以内）');
        const submitButton = screen.getByText('投稿');

        fireEvent.changeText(input, '新しいコメントです');
        fireEvent.press(submitButton);
      });

      expect(mockAddComment).toHaveBeenCalledWith('test-story-id', 'test-user-id', '新しいコメントです');
    });
  });

  describe('コメント編集機能', () => {
    it('自分のコメントに編集ボタンが表示される', async () => {
      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByText('素晴らしい投稿です！')).toBeTruthy();
        // 編集ボタンが表示されることを確認
        expect(screen.getByTestId('edit-button')).toBeTruthy();
      });
    });

    it('他のユーザーのコメントには編集ボタンが表示されない', async () => {
      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByText('参考になりました')).toBeTruthy();
        // 編集ボタンが表示されないことを確認
        expect(screen.queryByTestId('edit-button')).toBeNull();
      });
    });
  });

  describe('コメント削除機能', () => {
    it('自分のコメントに削除ボタンが表示される', async () => {
      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByText('素晴らしい投稿です！')).toBeTruthy();
        // 削除ボタンが表示されることを確認
        expect(screen.getByTestId('delete-button')).toBeTruthy();
      });
    });

    it('他のユーザーのコメントには削除ボタンが表示されない', async () => {
      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByText('参考になりました')).toBeTruthy();
        // 削除ボタンが表示されないことを確認
        expect(screen.queryByTestId('delete-button')).toBeNull();
      });
    });
  });

  describe('コメントのリアルタイム更新', () => {
    it('新しいコメントがリアルタイムで表示される', async () => {
      const mockSubscribeToComments = jest.fn(() => jest.fn());
      mockUseCommentStore.mockReturnValue({
        ...mockUseCommentStore(),
        subscribeToComments: mockSubscribeToComments,
      });

      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      expect(mockSubscribeToComments).toHaveBeenCalledWith('test-story-id', expect.any(Function));
    });
  });

  describe('エラーハンドリング', () => {
    it('コメント読み込みエラーが適切に処理される', async () => {
      mockUseCommentStore.mockReturnValue({
        ...mockUseCommentStore(),
        error: { 'test-story-id': 'コメントの読み込みに失敗しました' },
      });

      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByText('コメントの読み込みに失敗しました')).toBeTruthy();
        expect(screen.getByText('再試行')).toBeTruthy();
      });
    });

    it('ローディング状態が適切に表示される', async () => {
      mockUseCommentStore.mockReturnValue({
        ...mockUseCommentStore(),
        isLoading: { 'test-story-id': true },
        comments: { 'test-story-id': [] },
      });

      render(<StoryDetailScreen />);

      await waitFor(() => {
        expect(screen.getByText('テスト投稿')).toBeTruthy();
      });

      const commentButton = screen.getByText('3');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(screen.getByText('コメントを読み込み中...')).toBeTruthy();
      });
    });
  });
}); 