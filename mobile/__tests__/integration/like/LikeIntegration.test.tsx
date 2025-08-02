import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../../src/screens/HomeScreen';
import StoryDetailScreen from '../../../src/screens/StoryDetailScreen';
import { likeService } from '../../../src/services/likeService';
import { storyService } from '../../../src/services/storyService';
import { useAuthStore } from '../../../src/stores/authStore';

// モック設定
jest.mock('../../../src/services/likeService');
jest.mock('../../../src/services/storyService');
jest.mock('../../../src/stores/authStore');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

const mockLikeService = likeService as jest.Mocked<typeof likeService>;
const mockStoryService = storyService as jest.Mocked<typeof storyService>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

const Stack = createNativeStackNavigator();

const TestApp = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('いいね機能統合テスト', () => {
  const mockUser = {
    id: 'user1',
    displayName: 'Test User',
    email: 'test@example.com'
  };

  const mockStories = [
    {
      id: 'story1',
      authorId: 'user1',
      content: {
        title: 'テストストーリー1',
        category: { main: '仕事' as const, sub: '転職' as const },
        situation: 'テスト状況1',
        action: 'テスト行動1',
        result: 'テスト結果1',
        learning: 'テスト学び1',
        emotion: '後悔' as const
      },
      metadata: {
        createdAt: new Date(),
        viewCount: 10,
        helpfulCount: 22,
        commentCount: 5,
        tags: ['仕事', '転職', '後悔']
      }
    },
    {
      id: 'story2',
      authorId: 'user2',
      content: {
        title: 'テストストーリー2',
        category: { main: '人間関係' as const, sub: '上司' as const },
        situation: 'テスト状況2',
        action: 'テスト行動2',
        result: 'テスト結果2',
        learning: 'テスト学び2',
        emotion: '恥ずかしい' as const
      },
      metadata: {
        createdAt: new Date(),
        viewCount: 15,
        helpfulCount: 28,
        commentCount: 8,
        tags: ['人間関係', '上司', '恥ずかしい']
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      signIn: jest.fn(),
      signOut: jest.fn()
    });

    mockStoryService.getStories.mockResolvedValue({
      stories: mockStories,
      lastDocument: undefined,
      lastVisible: null
    });

    mockLikeService.addLike.mockResolvedValue();
    mockLikeService.removeLike.mockResolvedValue();
    mockLikeService.isLikedByUser.mockResolvedValue(false);
  });

  describe('ホームスクリーンでのいいね機能', () => {
    it('ホームスクリーンでいいねボタンが正しく表示される', async () => {
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
        expect(getByText('28')).toBeTruthy();
      });
    });

    it('ホームスクリーンでいいねを追加できる', async () => {
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      fireEvent.press(likeButton!);

      await waitFor(() => {
        expect(mockLikeService.addLike).toHaveBeenCalledWith('story1', 'user1');
      });
    });

    it('ホームスクリーンでいいねを削除できる', async () => {
      mockLikeService.isLikedByUser.mockResolvedValue(true);
      
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      fireEvent.press(likeButton!);

      await waitFor(() => {
        expect(mockLikeService.removeLike).toHaveBeenCalledWith('story1', 'user1');
      });
    });

    it('ホームスクリーンでいいね状態が正しく同期される', async () => {
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      fireEvent.press(likeButton!);

      // 楽観的更新で即座にカウントが変わる
      await waitFor(() => {
        expect(getByText('23')).toBeTruthy();
      });
    });
  });

  describe('詳細画面でのいいね機能', () => {
    it('詳細画面でいいねボタンが正しく表示される', async () => {
      mockStoryService.getStories.mockResolvedValue({
        stories: [mockStories[0]],
        lastDocument: undefined,
        lastVisible: null
      });

      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      // 詳細画面に遷移
      const storyCard = getByText('テストストーリー1').parent;
      fireEvent.press(storyCard!);

      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });
    });

    it('詳細画面でいいねを追加できる', async () => {
      mockStoryService.getStories.mockResolvedValue({
        stories: [mockStories[0]],
        lastDocument: undefined,
        lastVisible: null
      });

      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      // 詳細画面に遷移
      const storyCard = getByText('テストストーリー1').parent;
      fireEvent.press(storyCard!);

      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      fireEvent.press(likeButton!);

      await waitFor(() => {
        expect(mockLikeService.addLike).toHaveBeenCalledWith('story1', 'user1');
      });
    });
  });

  describe('画面間のいいね状態同期', () => {
    it('ホームスクリーンでいいねした後、詳細画面でも同じ状態が表示される', async () => {
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      // ホームスクリーンでいいね
      const likeButton = getByText('22').parent;
      fireEvent.press(likeButton!);

      await waitFor(() => {
        expect(getByText('23')).toBeTruthy();
      });

      // 詳細画面に遷移
      const storyCard = getByText('テストストーリー1').parent;
      fireEvent.press(storyCard!);

      // 詳細画面でも同じカウントが表示される
      await waitFor(() => {
        expect(getByText('23')).toBeTruthy();
      });
    });
  });

  describe('認証状態の管理', () => {
    it('未認証ユーザーがいいねを押すと匿名認証が実行される', async () => {
      const mockSignIn = jest.fn();
      mockUseAuthStore.mockReturnValue({
        user: null,
        signIn: mockSignIn,
        signOut: jest.fn()
      });

      mockSignIn.mockResolvedValue();
      
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      fireEvent.press(likeButton!);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });

    it('認証に失敗した場合、エラーが適切に処理される', async () => {
      const mockSignIn = jest.fn();
      mockUseAuthStore.mockReturnValue({
        user: null,
        signIn: mockSignIn,
        signOut: jest.fn()
      });

      mockSignIn.mockRejectedValue(new Error('認証失敗'));
      
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      fireEvent.press(likeButton!);

      // エラー後も元の状態が維持される
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('いいね追加に失敗した場合、元の状態に戻る', async () => {
      mockLikeService.addLike.mockRejectedValue(new Error('ネットワークエラー'));
      
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      fireEvent.press(likeButton!);

      // 楽観的更新で即座にカウントが変わる
      await waitFor(() => {
        expect(getByText('23')).toBeTruthy();
      });

      // エラー後は元の状態に戻る
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });
    });

    it('いいね削除に失敗した場合、元の状態に戻る', async () => {
      mockLikeService.isLikedByUser.mockResolvedValue(true);
      mockLikeService.removeLike.mockRejectedValue(new Error('ネットワークエラー'));
      
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      fireEvent.press(likeButton!);

      // 楽観的更新で即座にカウントが変わる
      await waitFor(() => {
        expect(getByText('21')).toBeTruthy();
      });

      // エラー後は元の状態に戻る
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });
    });
  });

  describe('パフォーマンス', () => {
    it('複数のいいね操作が連続で実行できる', async () => {
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      
      // 連続でいいね操作を実行
      fireEvent.press(likeButton!);
      fireEvent.press(likeButton!);
      fireEvent.press(likeButton!);

      // 最後の状態が正しく表示される
      await waitFor(() => {
        expect(getByText('25')).toBeTruthy();
      });
    });

    it('ローディング中は重複操作が防止される', async () => {
      // 遅延するPromiseを作成
      let resolvePromise: () => void;
      const delayedPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockLikeService.addLike.mockReturnValue(delayedPromise);
      
      const { getByText } = render(<TestApp />);
      
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });

      const likeButton = getByText('22').parent;
      
      // 最初の操作
      fireEvent.press(likeButton!);
      
      // ローディング中の重複操作
      fireEvent.press(likeButton!);
      fireEvent.press(likeButton!);

      // 一度だけ呼ばれることを確認
      expect(mockLikeService.addLike).toHaveBeenCalledTimes(1);
      
      // Promiseを解決
      resolvePromise!();
      
      await waitFor(() => {
        expect(mockLikeService.addLike).toHaveBeenCalledWith('story1', 'user1');
      });
    });
  });
}); 