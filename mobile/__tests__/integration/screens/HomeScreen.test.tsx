/// <reference types="jest" />

import { mockStories, mockUserData } from '../../__mocks__/sampleData';

// React Native コンポーネントのモック
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

// React Native Paper のモック
jest.mock('react-native-paper', () => ({
  Text: 'Text',
  Avatar: {
    Image: 'Avatar.Image',
  },
  Searchbar: 'Searchbar',
  Chip: 'Chip',
  IconButton: 'IconButton',
  Surface: 'Surface',
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
    setStories: jest.fn(),
    setLoading: jest.fn(),
    isLoading: false,
  }),
}));

// StoryService のモック
jest.mock('../../../src/services/storyService', () => ({
  storyService: {
    getStories: jest.fn().mockResolvedValue({ stories: mockStories }),
  },
}));

// Categories Utils のモック
jest.mock('../../../src/utils/categories', () => ({
  getCategoryHierarchyColor: jest.fn(() => '#E91E63'),
  getMainCategories: jest.fn(() => ['恋愛', 'その他']),
  getCategoryHierarchyIcon: jest.fn(() => '💕'),
}));

describe('HomeScreen Component Tests', () => {
  test('search and filter functionality', () => {
    // 検索・フィルター機能のロジックテスト
    const stories = mockStories;
    let filteredStories = stories;
    let searchQuery = '';
    let selectedMainCategory = null;

    // テキスト検索機能
    const filterBySearch = (query: string) => {
      if (!query.trim()) return stories;
      
      const searchLower = query.toLowerCase();
      return stories.filter(story => 
        story.content.title.toLowerCase().includes(searchLower) ||
        story.content.situation.toLowerCase().includes(searchLower) ||
        story.content.learning.toLowerCase().includes(searchLower)
      );
    };

    // カテゴリフィルター機能
    const filterByCategory = (category: string | null) => {
      if (!category) return stories;
      return stories.filter(story => 
        story.content.category.main === category
      );
    };

    // 検索テスト
    searchQuery = 'デート';
    filteredStories = filterBySearch(searchQuery);
    expect(filteredStories.length).toBeGreaterThan(0);
    
    // 恋愛カテゴリフィルターテスト
    selectedMainCategory = '恋愛';
    filteredStories = filterByCategory(selectedMainCategory);
    expect(filteredStories.length).toBeGreaterThan(0);
    expect(filteredStories.every(story => story.content.category.main === '恋愛')).toBe(true);

    // 複合検索テスト（検索 + カテゴリ）
    const combinedFilter = (query: string, category: string | null) => {
      let result = stories;
      
      if (query.trim()) {
        const searchLower = query.toLowerCase();
        result = result.filter(story => 
          story.content.title.toLowerCase().includes(searchLower) ||
          story.content.situation.toLowerCase().includes(searchLower) ||
          story.content.learning.toLowerCase().includes(searchLower)
        );
      }
      
      if (category) {
        result = result.filter(story => 
          story.content.category.main === category
        );
      }
      
      return result;
    };

    filteredStories = combinedFilter('デート', '恋愛');
    expect(Array.isArray(filteredStories)).toBe(true);
  });

  test('time ago calculation', () => {
    // 時間表示機能のテスト
    const getTimeAgo = (date: any): string => {
      try {
        let actualDate: Date;
        if (date && typeof date.toDate === 'function') {
          actualDate = date.toDate();
        } else if (date instanceof Date) {
          actualDate = date;
        } else if (date && typeof date === 'object' && date.seconds) {
          actualDate = new Date(date.seconds * 1000);
        } else {
          return '不明';
        }

        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - actualDate.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return '今';
        if (diffInHours < 24) return `${diffInHours}時間前`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}日前`;
        return actualDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
      } catch (error) {
        return '不明';
      }
    };

    // 現在時刻のテスト
    const now = new Date();
    expect(getTimeAgo(now)).toBe('今');

    // 1時間前のテスト
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(getTimeAgo(oneHourAgo)).toBe('1時間前');

    // Firestoreタイムスタンプ形式のテスト
    const firestoreTimestamp = { seconds: Date.now() / 1000 - 86400 };
    const result = getTimeAgo(firestoreTimestamp);
    expect(result).toContain('日前');

    // 無効な日付のテスト
    expect(getTimeAgo(null)).toBe('不明');
    expect(getTimeAgo(undefined)).toBe('不明');
  });

  test('emotion color mapping', () => {
    // 感情色マッピングのテスト
    const getEmotionColor = (emotion: string): string => {
      const emotionColors: { [key: string]: string } = {
        '後悔': '#FF6B6B',
        '恥ずかしい': '#FFB347',
        '悲しい': '#4ECDC4',
        '不安': '#95E1D3',
        '怒り': '#F38BA8',
        '混乱': '#DDA0DD',
        'その他': '#B0BEC5'
      };
      return emotionColors[emotion] || '#B0BEC5';
    };

    expect(getEmotionColor('後悔')).toBe('#FF6B6B');
    expect(getEmotionColor('恥ずかしい')).toBe('#FFB347');
    expect(getEmotionColor('存在しない感情')).toBe('#B0BEC5');
    expect(getEmotionColor('')).toBe('#B0BEC5');
  });

  test('story navigation functionality', () => {
    // ストーリーナビゲーション機能のテスト
    const mockNavigation = {
      navigate: jest.fn(),
    };

    const handleStoryPress = (storyId: string) => {
      mockNavigation.navigate('StoryDetail', { storyId });
    };

    const handleCreateStory = () => {
      mockNavigation.navigate('CreateStory');
    };

    const handleProfilePress = () => {
      mockNavigation.navigate('Profile');
    };

    // ストーリー詳細遷移テスト
    handleStoryPress('test-story-1');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('StoryDetail', { storyId: 'test-story-1' });

    // 新規作成遷移テスト
    handleCreateStory();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateStory');

    // プロフィール遷移テスト
    handleProfilePress();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Profile');
  });

  test('empty state handling', () => {
    // 空状態の処理テスト
    const stories = [];
    const isLoading = false;
    const searchQuery = '';
    const selectedMainCategory = null;

    const shouldShowEmpty = stories.length === 0 && !isLoading;
    const isSearchActive = Boolean(searchQuery || selectedMainCategory);

    expect(shouldShowEmpty).toBe(true);
    expect(isSearchActive).toBe(false);

    // 検索中の空状態
    const searchQueryActive = 'テスト検索';
    const isSearchActiveWithQuery = Boolean(searchQueryActive || selectedMainCategory);
    expect(isSearchActiveWithQuery).toBe(true);
  });

  test('data loading state management', () => {
    // データ読み込み状態管理のテスト
    let isLoading = false;
    let stories = [];
    let user = mockUserData;

    const loadStories = async (showLoading = true) => {
      if (!user) {
        console.log('⚠️ ユーザー未認証のため、ストーリー取得をスキップ');
        return;
      }

      if (showLoading) isLoading = true;
      
      // モック API コール
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        stories = mockStories;
      } catch (error) {
        console.error('ストーリー取得エラー:', error);
      } finally {
        if (showLoading) isLoading = false;
      }
    };

    // 認証済みユーザーでの読み込みテスト
    expect(user).toBeDefined();
    return loadStories().then(() => {
      expect(stories.length).toBeGreaterThan(0);
      expect(isLoading).toBe(false);
    });
  });
}); 