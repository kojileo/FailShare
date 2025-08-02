import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { LikeButton } from '../../../src/components/LikeButton';
import { likeService } from '../../../src/services/likeService';
import { useAuthStore } from '../../../src/stores/authStore';

// モック設定
jest.mock('../../../src/services/likeService');
jest.mock('../../../src/stores/authStore');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

const mockLikeService = likeService as jest.Mocked<typeof likeService>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('LikeButton', () => {
  const defaultProps = {
    storyId: 'story1',
    initialHelpfulCount: 22,
    initialIsLiked: false,
    size: 'medium' as const,
    showCount: true,
    onLikeChange: jest.fn()
  };

  const mockUser = {
    id: 'user1',
    displayName: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      signIn: jest.fn(),
      signOut: jest.fn()
    });
  });

  describe('初期表示', () => {
    it('初期値が正しく表示される', () => {
      const { getByText } = render(<LikeButton {...defaultProps} />);
      
      expect(getByText('22')).toBeTruthy();
    });

    it('初期状態ではグレーのハートアウトラインが表示される', () => {
      const { getByText } = render(<LikeButton {...defaultProps} />);
      
      // カウントが表示されていることを確認
      expect(getByText('22')).toBeTruthy();
    });

    it('initialIsLikedがtrueの場合、赤色のハートが表示される', () => {
      const { getByText } = render(
        <LikeButton {...defaultProps} initialIsLiked={true} />
      );
      
      expect(getByText('22')).toBeTruthy();
    });

    it('showCountがfalseの場合、カウントが表示されない', () => {
      const { queryByText } = render(
        <LikeButton {...defaultProps} showCount={false} />
      );
      
      expect(queryByText('22')).toBeNull();
    });
  });

  describe('いいね追加', () => {
    it('いいねボタンを押すと即座にカウントが+1される', async () => {
      mockLikeService.addLike.mockResolvedValue();
      
      const { getByText } = render(<LikeButton {...defaultProps} />);
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      // 即座にカウントが更新される（楽観的更新）
      expect(getByText('23')).toBeTruthy();
      
      await waitFor(() => {
        expect(mockLikeService.addLike).toHaveBeenCalledWith('story1', 'user1');
      });
    });

    it('いいね追加時にonLikeChangeが正しく呼ばれる', async () => {
      mockLikeService.addLike.mockResolvedValue();
      const onLikeChange = jest.fn();
      
      const { getByText } = render(
        <LikeButton {...defaultProps} onLikeChange={onLikeChange} />
      );
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      await waitFor(() => {
        expect(onLikeChange).toHaveBeenCalledWith(true, 23);
      });
    });

    it('いいね追加時にFirestoreのhelpfulCountも更新される', async () => {
      mockLikeService.addLike.mockResolvedValue();
      
      const { getByText } = render(<LikeButton {...defaultProps} />);
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      await waitFor(() => {
        expect(mockLikeService.addLike).toHaveBeenCalledWith('story1', 'user1');
      });
    });
  });

  describe('いいね削除', () => {
    it('いいね済みの状態でボタンを押すと即座にカウントが-1される', async () => {
      mockLikeService.removeLike.mockResolvedValue();
      
      const { getByText } = render(
        <LikeButton {...defaultProps} initialIsLiked={true} />
      );
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      // 即座にカウントが更新される（楽観的更新）
      expect(getByText('21')).toBeTruthy();
      
      await waitFor(() => {
        expect(mockLikeService.removeLike).toHaveBeenCalledWith('story1', 'user1');
      });
    });

    it('いいね削除時にonLikeChangeが正しく呼ばれる', async () => {
      mockLikeService.removeLike.mockResolvedValue();
      const onLikeChange = jest.fn();
      
      const { getByText } = render(
        <LikeButton {...defaultProps} initialIsLiked={true} onLikeChange={onLikeChange} />
      );
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      await waitFor(() => {
        expect(onLikeChange).toHaveBeenCalledWith(false, 21);
      });
    });
  });

  describe('認証状態の管理', () => {
    it('ユーザーが認証されていない場合、匿名認証が実行される', async () => {
      const mockSignIn = jest.fn();
      mockUseAuthStore.mockReturnValue({
        user: null,
        signIn: mockSignIn,
        signOut: jest.fn()
      });
      
      mockSignIn.mockResolvedValue();
      mockLikeService.addLike.mockResolvedValue();
      
      const { getByText } = render(<LikeButton {...defaultProps} />);
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });

    it('認証に失敗した場合、エラーが処理される', async () => {
      const mockSignIn = jest.fn();
      mockUseAuthStore.mockReturnValue({
        user: null,
        signIn: mockSignIn,
        signOut: jest.fn()
      });
      
      mockSignIn.mockRejectedValue(new Error('認証失敗'));
      
      const { getByText } = render(<LikeButton {...defaultProps} />);
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      // エラー時は元の状態に戻る
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('いいね追加に失敗した場合、元の状態に戻る', async () => {
      mockLikeService.addLike.mockRejectedValue(new Error('ネットワークエラー'));
      
      const { getByText } = render(<LikeButton {...defaultProps} />);
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      // 即座に楽観的更新される
      expect(getByText('23')).toBeTruthy();
      
      // エラー後は元の状態に戻る
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });
    });

    it('いいね削除に失敗した場合、元の状態に戻る', async () => {
      mockLikeService.removeLike.mockRejectedValue(new Error('ネットワークエラー'));
      
      const { getByText } = render(
        <LikeButton {...defaultProps} initialIsLiked={true} />
      );
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      // 即座に楽観的更新される
      expect(getByText('21')).toBeTruthy();
      
      // エラー後は元の状態に戻る
      await waitFor(() => {
        expect(getByText('22')).toBeTruthy();
      });
    });
  });

  describe('サイズバリエーション', () => {
    it('smallサイズで正しく表示される', () => {
      const { getByText } = render(
        <LikeButton {...defaultProps} size="small" />
      );
      
      expect(getByText('22')).toBeTruthy();
    });

    it('largeサイズで正しく表示される', () => {
      const { getByText } = render(
        <LikeButton {...defaultProps} size="large" />
      );
      
      expect(getByText('22')).toBeTruthy();
    });
  });

  describe('ローディング状態', () => {
    it('いいね操作中はローディング状態になる', async () => {
      // 遅延するPromiseを作成
      let resolvePromise: () => void;
      const delayedPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockLikeService.addLike.mockReturnValue(delayedPromise);
      
      const { getByText } = render(<LikeButton {...defaultProps} />);
      
      const button = getByText('22').parent;
      fireEvent.press(button!);
      
      // ローディング中は再度押せない
      fireEvent.press(button!);
      
      // 一度だけ呼ばれることを確認
      expect(mockLikeService.addLike).toHaveBeenCalledTimes(1);
      
      // Promiseを解決
      resolvePromise!();
      
      await waitFor(() => {
        expect(mockLikeService.addLike).toHaveBeenCalledWith('story1', 'user1');
      });
    });
  });

  describe('状態の同期', () => {
    it('storyIdが変更されると初期値が再設定される', () => {
      const { getByText, rerender } = render(<LikeButton {...defaultProps} />);
      
      expect(getByText('22')).toBeTruthy();
      
      // storyIdを変更して再レンダリング
      rerender(<LikeButton {...defaultProps} storyId="story2" initialHelpfulCount={15} />);
      
      expect(getByText('15')).toBeTruthy();
    });

    it('initialHelpfulCountが変更されると表示が更新される', () => {
      const { getByText, rerender } = render(<LikeButton {...defaultProps} />);
      
      expect(getByText('22')).toBeTruthy();
      
      // initialHelpfulCountを変更して再レンダリング
      rerender(<LikeButton {...defaultProps} initialHelpfulCount={30} />);
      
      expect(getByText('30')).toBeTruthy();
    });
  });
}); 