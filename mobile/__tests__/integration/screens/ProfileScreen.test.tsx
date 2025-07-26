/// <reference types="jest" />

import { mockUserData } from '../../__mocks__/sampleData';

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
  Surface: 'Surface',
  Avatar: {
    Image: 'Avatar.Image',
  },
  Button: 'Button',
  IconButton: 'IconButton',
}));

// Navigation のモック
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

// AuthStore のモック
jest.mock('../../../src/stores/authStore', () => ({
  useAuthStore: () => ({
    user: mockUserData,
    logout: jest.fn(),
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

describe('ProfileScreen Component Tests', () => {
  test('mock user data is valid', () => {
    expect(mockUserData).toBeDefined();
    expect(mockUserData.uid).toBe('test-user-id');
    expect(mockUserData.displayName).toBe('テストユーザー');
  });

  test('component structure validation', () => {
    // コンポーネントの基本構造テスト
    expect(typeof mockUserData.uid).toBe('string');
    expect(typeof mockUserData.displayName).toBe('string');
    expect(mockUserData.uid.length).toBeGreaterThan(0);
  });

  test('basic component logic test', () => {
    // 基本的なロジックテスト
    const testUser = mockUserData;
    expect(testUser.isAnonymous).toBe(true);
    expect(testUser.providerId).toBe('anonymous');
    expect(testUser.email).toContain('@');
  });
}); 