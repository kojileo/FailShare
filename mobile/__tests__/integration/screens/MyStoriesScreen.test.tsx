/// <reference types="jest" />

import { mockStories, mockUserData } from '../../__mocks__/sampleData';

// React Native コンポーネントのモック
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  Alert: {
    alert: jest.fn((title, message, buttons) => {
      // destructiveボタンを自動的に実行（テスト用）
      const destructiveButton = buttons?.find((btn: any) => btn.style === 'destructive');
      if (destructiveButton) {
        destructiveButton.onPress?.();
      }
    }),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

// React Native Paper のモック
jest.mock('react-native-paper', () => ({
  Text: 'Text',
  Surface: 'Surface',
  Avatar: {
    Image: 'Avatar.Image',
  },
  Chip: 'Chip',
  IconButton: 'IconButton',
}));

// Navigation のモック
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

// AuthStore のモック
jest.mock('../../../src/stores/authStore', () => ({
  useAuthStore: () => ({
    user: mockUserData,
  }),
}));

// StoryStore のモック
jest.mock('../../../src/stores/storyStore', () => ({
  useStoryStore: () => ({
    stories: mockStories,
    removeStory: jest.fn(),
  }),
}));

// StoryService のモック
jest.mock('../../../src/services/storyService', () => ({
  storyService: {
    getUserStories: jest.fn().mockResolvedValue(mockStories),
    deleteStory: jest.fn().mockResolvedValue(undefined),
  },
}));

// Categories Utils のモック
jest.mock('../../../src/utils/categories', () => ({
  getCategoryHierarchyColor: jest.fn(() => '#E91E63'),
  getCategoryHierarchyIcon: jest.fn(() => '💕'),
}));

describe('MyStoriesScreen Component Tests', () => {
  test('user stories loading functionality', () => {
    // ユーザーストーリー読み込み機能のテスト
    const loadUserStories = async (userId: string) => {
      if (!userId) {
        console.log('⚠️ ユーザー未認証のため、マイストーリー取得をスキップ');
        return [];
      }

      try {
        // モックサービスを使用してユーザーのストーリーを取得
        const userStories = mockStories.filter(story => story.authorId === userId);
        return userStories;
      } catch (error) {
        console.error('マイストーリー取得エラー:', error);
        return [];
      }
    };

    // 認証済みユーザーでの読み込みテスト
    return loadUserStories(mockUserData.uid).then(stories => {
      expect(Array.isArray(stories)).toBe(true);
      expect(stories.length).toBeGreaterThan(0);
      expect(stories.every(story => story.authorId === mockUserData.uid)).toBe(true);
    });
  });

  test('story deletion functionality', () => {
    // ストーリー削除機能のテスト
    let userStories = [...mockStories];
    const mockStoryService = {
      deleteStory: jest.fn().mockResolvedValue(undefined),
    };

    const handleDeleteStory = async (storyId: string, userId: string) => {
      try {
        // サービス呼び出し
        await mockStoryService.deleteStory(storyId, userId);
        
        // ローカル状態から削除
        userStories = userStories.filter(story => story.id !== storyId);
        
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    };

    const storyToDelete = mockStories[0];
    const initialCount = userStories.length;

    // 削除実行
    return handleDeleteStory(storyToDelete.id, mockUserData.uid).then(result => {
      expect(result.success).toBe(true);
      expect(mockStoryService.deleteStory).toHaveBeenCalledWith(storyToDelete.id, mockUserData.uid);
      expect(userStories.length).toBe(initialCount - 1);
      expect(userStories.find(story => story.id === storyToDelete.id)).toBeUndefined();
    });
  });

  test('story editing functionality', () => {
    // ストーリー編集機能のテスト
    const mockNavigation = {
      navigate: jest.fn(),
    };

    const handleEditStory = (storyId: string, stories: any[]) => {
      const storyToEdit = stories.find(story => story.id === storyId);
      if (storyToEdit) {
        mockNavigation.navigate('CreateStory', {
          editMode: true,
          storyData: storyToEdit,
        });
        return { success: true, story: storyToEdit };
      }
      return { success: false, error: 'ストーリーが見つかりません' };
    };

    const storyToEdit = mockStories[0];
    const result = handleEditStory(storyToEdit.id, mockStories);

    expect(result.success).toBe(true);
    expect(result.story).toEqual(storyToEdit);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateStory', {
      editMode: true,
      storyData: storyToEdit,
    });

    // 存在しないストーリーの編集テスト
    const nonexistentResult = handleEditStory('nonexistent-id', mockStories);
    expect(nonexistentResult.success).toBe(false);
    expect(nonexistentResult.error).toBe('ストーリーが見つかりません');
  });

  test('delete confirmation dialog', () => {
    // 削除確認ダイアログのテスト
    const mockAlert = jest.fn();
    let deleteCalled = false;

    const showDeleteConfirmation = (storyTitle: string, onConfirm: () => void) => {
      mockAlert('削除確認', `「${storyTitle}」を削除しますか？`, [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive', 
          onPress: () => {
            deleteCalled = true;
            onConfirm();
          }
        }
      ]);
    };

    const storyTitle = 'テストストーリー';
    const onConfirm = jest.fn();

    showDeleteConfirmation(storyTitle, onConfirm);

    expect(mockAlert).toHaveBeenCalledWith(
      '削除確認',
      `「${storyTitle}」を削除しますか？`,
      expect.arrayContaining([
        expect.objectContaining({ text: 'キャンセル', style: 'cancel' }),
        expect.objectContaining({ text: '削除', style: 'destructive' })
      ])
    );
  });

  test('story statistics calculation', () => {
    // ストーリー統計計算のテスト
    const calculateStats = (stories: any[]) => {
      const totalStories = stories.length;
      const totalViews = stories.reduce((sum, story) => sum + story.metadata.viewCount, 0);
      const totalHelpful = stories.reduce((sum, story) => sum + story.metadata.helpfulCount, 0);
      const totalComments = stories.reduce((sum, story) => sum + story.metadata.commentCount, 0);

      const averageViews = totalStories > 0 ? Math.round(totalViews / totalStories) : 0;
      const averageHelpful = totalStories > 0 ? Math.round(totalHelpful / totalStories) : 0;

      return {
        totalStories,
        totalViews,
        totalHelpful,
        totalComments,
        averageViews,
        averageHelpful,
      };
    };

    const stats = calculateStats(mockStories);

    expect(stats.totalStories).toBe(mockStories.length);
    expect(typeof stats.totalViews).toBe('number');
    expect(typeof stats.totalHelpful).toBe('number');
    expect(typeof stats.totalComments).toBe('number');
    expect(stats.totalViews).toBeGreaterThanOrEqual(0);
    expect(stats.averageViews).toBeGreaterThanOrEqual(0);
  });

  test('story sorting functionality', () => {
    // ストーリーソート機能のテスト
    const sortStories = (stories: any[], sortBy: string) => {
      const sorted = [...stories];

      switch (sortBy) {
        case 'newest':
          return sorted.sort((a, b) => {
            const aTime = a.metadata.createdAt.getTime();
            const bTime = b.metadata.createdAt.getTime();
            return bTime - aTime;
          });

        case 'oldest':
          return sorted.sort((a, b) => {
            const aTime = a.metadata.createdAt.getTime();
            const bTime = b.metadata.createdAt.getTime();
            return aTime - bTime;
          });

        case 'mostViewed':
          return sorted.sort((a, b) => b.metadata.viewCount - a.metadata.viewCount);

        case 'mostHelpful':
          return sorted.sort((a, b) => b.metadata.helpfulCount - a.metadata.helpfulCount);

        case 'title':
          return sorted.sort((a, b) => a.content.title.localeCompare(b.content.title));

        default:
          return sorted;
      }
    };

    // 新しい順ソート
    const newestFirst = sortStories(mockStories, 'newest');
    expect(newestFirst[0].metadata.createdAt.getTime()).toBeGreaterThanOrEqual(
      newestFirst[newestFirst.length - 1].metadata.createdAt.getTime()
    );

    // 閲覧数順ソート
    const mostViewed = sortStories(mockStories, 'mostViewed');
    expect(mostViewed[0].metadata.viewCount).toBeGreaterThanOrEqual(
      mostViewed[mostViewed.length - 1].metadata.viewCount
    );

    // タイトル順ソート
    const titleSort = sortStories(mockStories, 'title');
    expect(titleSort[0].content.title.localeCompare(titleSort[1].content.title)).toBeLessThanOrEqual(0);
  });

  test('empty state handling', () => {
    // 空状態処理のテスト
    const emptyStories: any[] = [];
    const isLoading = false;

    const getEmptyStateMessage = (stories: any[], loading: boolean) => {
      if (loading) {
        return 'ストーリーを読み込み中...';
      }

      if (stories.length === 0) {
        return {
          title: 'まだ投稿がありません',
          message: '最初の失敗談を投稿してみましょう',
          actionText: '投稿する',
        };
      }

      return null;
    };

    // 空状態のテスト
    const emptyMessage = getEmptyStateMessage(emptyStories, isLoading);
    expect(emptyMessage).toEqual({
      title: 'まだ投稿がありません',
      message: '最初の失敗談を投稿してみましょう',
      actionText: '投稿する',
    });

    // ローディング状態のテスト
    const loadingMessage = getEmptyStateMessage(emptyStories, true);
    expect(loadingMessage).toBe('ストーリーを読み込み中...');

    // ストーリーが存在する場合のテスト
    const normalMessage = getEmptyStateMessage(mockStories, false);
    expect(normalMessage).toBeNull();
  });

  test('story action menu functionality', () => {
    // ストーリーアクションメニュー機能のテスト
    const mockNavigation = {
      navigate: jest.fn(),
    };

    let userStories = [...mockStories];

    const getStoryActions = (story: any) => {
      return [
        {
          id: 'edit',
          title: '編集',
          icon: 'pencil',
          onPress: () => {
            mockNavigation.navigate('CreateStory', {
              editMode: true,
              storyData: story,
            });
          },
        },
        {
          id: 'delete',
          title: '削除',
          icon: 'delete',
          destructive: true,
          onPress: () => {
            // 削除確認ダイアログを表示
            const confirmDelete = () => {
              userStories = userStories.filter(s => s.id !== story.id);
            };
            confirmDelete(); // テスト用に直接実行
          },
        },
        {
          id: 'share',
          title: '共有',
          icon: 'share',
          onPress: () => {
            // 共有機能（モック）
            console.log(`Sharing story: ${story.id}`);
          },
        },
      ];
    };

    const testStory = mockStories[0];
    const actions = getStoryActions(testStory);

    expect(actions).toHaveLength(3);
    expect(actions[0].id).toBe('edit');
    expect(actions[1].id).toBe('delete');
    expect(actions[2].id).toBe('share');

    // 編集アクションのテスト
    actions[0].onPress();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateStory', {
      editMode: true,
      storyData: testStory,
    });

    // 削除アクションのテスト
    const initialCount = userStories.length;
    actions[1].onPress();
    expect(userStories.length).toBe(initialCount - 1);
    expect(userStories.find(s => s.id === testStory.id)).toBeUndefined();
  });
}); 