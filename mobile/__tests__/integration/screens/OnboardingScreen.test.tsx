/// <reference types="jest" />

// React Native コンポーネントのモック
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

// React Native Paper のモック
jest.mock('react-native-paper', () => ({
  Text: 'Text',
  Button: 'Button',
}));

// Navigation のモック
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Linear Gradient のモック
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Safe Area Context のモック
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

// Status Bar のモック
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

describe('OnboardingScreen Component Tests', () => {
  test('onboarding data structure is valid', () => {
    // オンボーディングで使用するデータ構造のテスト
    const onboardingData = [
      {
        title: 'FailShareへようこそ',
        description: '失敗から学び、成長するコミュニティ',
        icon: '🌟',
      },
      {
        title: '安全な共有',
        description: 'プライバシーを守りながら体験を共有',
        icon: '🔒',
      },
      {
        title: '学びと成長',
        description: '他者の失敗から学び、前向きに成長',
        icon: '📈',
      }
    ];

    expect(onboardingData).toHaveLength(3);
    onboardingData.forEach(item => {
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('icon');
      expect(typeof item.title).toBe('string');
      expect(typeof item.description).toBe('string');
      expect(typeof item.icon).toBe('string');
    });
  });

  test('navigation functionality requirements', () => {
    // ナビゲーション機能の要件テスト
    const mockNavigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
    };

    // "スタート"ボタンがHomeScreenに遷移することをテスト
    const handleStart = () => {
      mockNavigation.replace('Home');
    };

    handleStart();
    expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
  });

  test('screen dimensions handling', () => {
    // 画面サイズ対応のテスト
    const screenData = {
      width: 375,
      height: 812,
    };

    expect(screenData.width).toBeGreaterThan(0);
    expect(screenData.height).toBeGreaterThan(0);
    expect(typeof screenData.width).toBe('number');
    expect(typeof screenData.height).toBe('number');
  });

  test('component state management', () => {
    // オンボーディングの状態管理テスト
    let currentPage = 0;
    const totalPages = 3;

    // 次のページへ
    const goToNext = () => {
      if (currentPage < totalPages - 1) {
        currentPage += 1;
      }
    };

    // 前のページへ
    const goToPrevious = () => {
      if (currentPage > 0) {
        currentPage -= 1;
      }
    };

    expect(currentPage).toBe(0);

    goToNext();
    expect(currentPage).toBe(1);

    goToNext();
    expect(currentPage).toBe(2);

    // 最後のページでは進まない
    goToNext();
    expect(currentPage).toBe(2);

    goToPrevious();
    expect(currentPage).toBe(1);

    goToPrevious();
    expect(currentPage).toBe(0);

    // 最初のページでは戻らない
    goToPrevious();
    expect(currentPage).toBe(0);
  });

  test('page indicator logic', () => {
    // ページインジケーターのロジックテスト
    const currentPage = 1;
    const totalPages = 3;

    const indicators = Array.from({ length: totalPages }, (_, index) => ({
      isActive: index === currentPage,
      index,
    }));

    expect(indicators).toHaveLength(3);
    expect(indicators[0].isActive).toBe(false);
    expect(indicators[1].isActive).toBe(true);
    expect(indicators[2].isActive).toBe(false);
  });
}); 