// Jest セットアップファイル（最小限版）

// React Native のモック
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

// React Native Paper のモック
jest.mock('react-native-paper', () => ({
  Text: 'Text',
  Avatar: 'Avatar',
  Searchbar: 'Searchbar',
  Card: 'Card',
  Button: 'Button',
  Chip: 'Chip',
  IconButton: 'IconButton',
  FAB: 'FAB',
  Divider: 'Divider',
  List: {
    Item: 'ListItem',
  },
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      text: '#000000',
    },
  }),
}));

// React Native Safe Area Context のモック
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

// React Navigation のモック
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }: any) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

// Firebase のモック
jest.mock('../src/services/firebase', () => ({
  auth: {
    currentUser: null,
    signInAnonymously: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  },
  db: {},
}));

// Expo Vector Icons のモック
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Expo Linear Gradient のモック
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// グローバルなモック設定
(globalThis as any).console = {
  ...console,
  // テスト中のログを抑制
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 