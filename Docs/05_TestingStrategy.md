# FailShare 自動テスト戦略

## 概要

FailShareプロジェクトの品質保証と継続的デリバリーを支援するための包括的な自動テスト戦略を定義します。

## 現在の状況

### プロジェクト状況
- **Phase 1**: 完了 (MVP完成)
- **技術スタック**: React Native + Expo, TypeScript, Firebase
- **テスト現状**: 手動テストのみ
- **品質課題**: リグレッションバグのリスク

### テスト要件
- **機能品質**: 新機能の動作保証
- **リグレッション防止**: 既存機能の品質維持
- **パフォーマンス**: アプリケーションの性能保証
- **セキュリティ**: 認証・認可の動作確認

## テスト戦略全体像

### テストピラミッド

```
        🔺 E2E Tests (10%)
       ────────────────────
      🔺 Integration Tests (20%)
     ────────────────────────────
    🔺 Unit Tests (70%)
   ────────────────────────────────
```

### テストレベル別概要

#### 1. Unit Tests (70%)
- **対象**: 個別関数・コンポーネント
- **目的**: ロジックの正確性確認
- **実行頻度**: 毎回のコミット
- **実行速度**: 高速（秒単位）

#### 2. Integration Tests (20%)
- **対象**: サービス間連携・API統合
- **目的**: システム連携の動作確認
- **実行頻度**: Pull Request
- **実行速度**: 中速（分単位）

#### 3. E2E Tests (10%)
- **対象**: ユーザーシナリオ全体
- **目的**: 実際の使用体験確認
- **実行頻度**: リリース前
- **実行速度**: 低速（時間単位）

## テストツール選定

### 1. Unit Testing

#### Jest
- **採用理由**: React Native標準、TypeScript対応
- **対象**: ユーティリティ関数、ビジネスロジック
- **設定**: `jest.config.js`

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo))',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/navigation/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### React Native Testing Library
- **採用理由**: コンポーネントテストに特化
- **対象**: React Nativeコンポーネント
- **アプローチ**: ユーザー中心のテスト

```javascript
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../screens/HomeScreen';

describe('HomeScreen', () => {
  it('should display search bar', () => {
    const { getByPlaceholderText } = render(<HomeScreen />);
    expect(getByPlaceholderText('失敗談を検索...')).toBeTruthy();
  });
});
```

### 2. Integration Testing

#### Firebase Emulator Suite
- **採用理由**: 実際のFirebase環境の再現
- **対象**: Firebase連携機能
- **設定**: `firebase.json`

```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

#### MSW (Mock Service Worker)
- **採用理由**: API呼び出しのモック
- **対象**: 外部API連携
- **使用場面**: サービス統合テスト

### 3. E2E Testing

#### Detox
- **採用理由**: React Native専用E2Eフレームワーク
- **対象**: アプリケーション全体
- **設定**: `.detoxrc.js`

```javascript
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

#### Maestro (代替案)
- **採用理由**: 設定の簡易さ
- **対象**: クロスプラットフォームE2E
- **特徴**: YAML設定、直感的な記述

## テスト実装計画

### Phase 1: Foundation (1ヶ月)

#### 1. 基本環境構築
```bash
# テストライブラリのインストール
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# 型定義の追加
npm install --save-dev @types/jest

# カバレッジツール
npm install --save-dev babel-plugin-istanbul
```

#### 2. 基本設定ファイル

**jest.setup.js**
```javascript
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Firebase Mock
jest.mock('@react-native-firebase/app', () => ({
  utils: () => ({
    FilePath: {
      MAIN_BUNDLE: 'MAIN_BUNDLE',
    },
  }),
}));

// AsyncStorage Mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

#### 3. 優先テスト対象
- **authService**: 認証ロジック
- **storyService**: 失敗談CRUD操作
- **Utility Functions**: 共通ロジック

### Phase 2: Component Testing (2ヶ月)

#### 1. コンポーネントテスト

**HomeScreen.test.tsx**
```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { storyService } from '../services/storyService';

// Mock services
jest.mock('../services/storyService');
const mockStoryService = storyService as jest.Mocked<typeof storyService>;

describe('HomeScreen', () => {
  beforeEach(() => {
    mockStoryService.getStories.mockResolvedValue({
      stories: mockStories,
      lastVisible: null,
    });
  });

  it('should load stories on mount', async () => {
    const { getByText } = render(<HomeScreen />);
    
    await waitFor(() => {
      expect(getByText('プレゼンテーションで大失敗')).toBeTruthy();
    });
  });

  it('should perform search when search bar is submitted', async () => {
    const { getByPlaceholderText } = render(<HomeScreen />);
    const searchBar = getByPlaceholderText('失敗談を検索...');
    
    fireEvent.changeText(searchBar, '仕事');
    fireEvent(searchBar, 'submitEditing');
    
    await waitFor(() => {
      expect(mockStoryService.getStories).toHaveBeenCalledWith({
        searchText: '仕事',
      });
    });
  });
});
```

#### 2. Service層テスト

**storyService.test.ts**
```typescript
import { storyService } from '../services/storyService';
import { firebase } from '../services/firebase';

// Firebase Mock
jest.mock('../services/firebase');

describe('storyService', () => {
  describe('createStory', () => {
    it('should create story successfully', async () => {
      const mockStoryData = {
        title: 'テスト失敗談',
        category: '仕事' as const,
        situation: 'テスト状況',
        action: 'テスト行動',
        result: 'テスト結果',
        learning: 'テスト学び',
        emotion: '後悔' as const,
      };

      const storyId = await storyService.createStory('user123', mockStoryData);
      
      expect(storyId).toBeDefined();
      expect(typeof storyId).toBe('string');
    });

    it('should throw error for invalid data', async () => {
      const invalidData = {
        title: '', // 空のタイトル
        category: '仕事' as const,
        // 他の必須フィールドなし
      };

      await expect(
        storyService.createStory('user123', invalidData)
      ).rejects.toThrow('投稿に失敗しました');
    });
  });

  describe('getStories', () => {
    it('should filter stories by category', async () => {
      const result = await storyService.getStories({ category: '仕事' });
      
      expect(result.stories).toBeDefined();
      expect(Array.isArray(result.stories)).toBe(true);
    });

    it('should filter stories by search text', async () => {
      const result = await storyService.getStories({ searchText: 'プレゼン' });
      
      expect(result.stories).toBeDefined();
      result.stories.forEach(story => {
        expect(
          story.content.title.includes('プレゼン') ||
          story.content.situation.includes('プレゼン')
        ).toBe(true);
      });
    });
  });
});
```

### Phase 3: Integration Testing (3ヶ月)

#### 1. Firebase Integration

**firebase.integration.test.ts**
```typescript
import { authService } from '../services/authService';
import { storyService } from '../services/storyService';

describe('Firebase Integration', () => {
  beforeAll(async () => {
    // Firebase Emulator起動
    await firebase.initializeTestApp({
      projectId: 'failshare-test',
    });
  });

  afterAll(async () => {
    // クリーンアップ
    await firebase.clearFirestoreData({ projectId: 'failshare-test' });
  });

  describe('Auth + Story Flow', () => {
    it('should allow authenticated user to create story', async () => {
      // 1. 匿名ログイン
      const user = await authService.signInAnonymous();
      expect(user).toBeDefined();

      // 2. 失敗談作成
      const storyData = {
        title: '統合テスト失敗談',
        category: '仕事' as const,
        situation: 'テスト状況',
        action: 'テスト行動',
        result: 'テスト結果',
        learning: 'テスト学び',
        emotion: '後悔' as const,
      };

      const storyId = await storyService.createStory(user.id, storyData);
      expect(storyId).toBeDefined();

      // 3. 作成された失敗談の取得
      const story = await storyService.getStoryById(storyId);
      expect(story).toBeDefined();
      expect(story.content.title).toBe('統合テスト失敗談');
    });
  });
});
```

#### 2. API Integration

**api.integration.test.ts**
```typescript
import { render, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../screens/HomeScreen';

describe('API Integration', () => {
  it('should display real data from Firebase', async () => {
    const { getByText } = render(<HomeScreen />);
    
    // 実際のFirebaseからデータを取得
    await waitFor(() => {
      expect(getByText(/失敗談/)).toBeTruthy();
    }, { timeout: 5000 });
  });
});
```

### Phase 4: E2E Testing (4ヶ月)

#### 1. Detox E2E Tests

**e2e/auth.e2e.js**
```javascript
describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should sign in anonymously', async () => {
    await expect(element(by.text('匿名でサインイン'))).toBeVisible();
    await element(by.text('匿名でサインイン')).tap();
    
    await waitFor(element(by.text('ホーム')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

**e2e/story.e2e.js**
```javascript
describe('Story Management', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    // 事前にログイン
    await element(by.text('匿名でサインイン')).tap();
    await waitFor(element(by.text('ホーム'))).toBeVisible();
  });

  it('should create a new story', async () => {
    // FABボタンをタップ
    await element(by.id('fab-create-story')).tap();
    
    // フォーム入力
    await element(by.id('story-title-input')).typeText('E2Eテスト失敗談');
    await element(by.id('category-仕事')).tap();
    await element(by.id('situation-input')).typeText('テスト状況');
    await element(by.id('action-input')).typeText('テスト行動');
    await element(by.id('result-input')).typeText('テスト結果');
    await element(by.id('learning-input')).typeText('テスト学び');
    await element(by.id('emotion-後悔')).tap();
    
    // 投稿ボタンをタップ
    await element(by.text('投稿する')).tap();
    
    // 成功メッセージを確認
    await waitFor(element(by.text('投稿が完了しました')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should search stories', async () => {
    await element(by.id('search-bar')).typeText('仕事');
    await element(by.id('search-bar')).tapReturnKey();
    
    await waitFor(element(by.text('検索結果')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

#### 2. Maestro E2E Tests

**e2e/flows/auth.yaml**
```yaml
appId: com.failshare.app
---
- launchApp
- tapOn: "匿名でサインイン"
- assertVisible: "ホーム"
- assertVisible: "失敗談を検索..."
```

**e2e/flows/create-story.yaml**
```yaml
appId: com.failshare.app
---
- launchApp
- tapOn: "匿名でサインイン"
- assertVisible: "ホーム"
- tapOn: 
    id: "fab-create-story"
- inputText: "E2Eテスト失敗談"
- tapOn: "仕事"
- inputText: "テスト状況"
- tapOn: "投稿する"
- assertVisible: "投稿が完了しました"
```

## テスト実行戦略

### 1. ローカル開発環境

#### 開発中のテスト実行
```bash
# ユニットテスト（Watch Mode）
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e
```

#### package.json設定
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "detox test",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### 2. CI/CD環境

#### GitHub Actions設定

**.github/workflows/test.yml**
```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start Firebase Emulator
        run: |
          npm install -g firebase-tools
          firebase emulators:start --detach
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Stop Firebase Emulator
        run: firebase emulators:stop

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build app
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
```

### 3. 品質ゲート

#### カバレッジ要件
- **ユニットテスト**: 80%以上
- **サービス層**: 90%以上
- **重要な機能**: 100%

#### テスト必須条件
- **Pull Request**: ユニットテスト必須
- **develop → main**: 統合テスト必須
- **リリース**: E2Eテスト必須

## モック戦略

### 1. Firebase Mock

**__mocks__/firebase.ts**
```typescript
export const mockFirestore = {
  collection: jest.fn(() => ({
    add: jest.fn(),
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    where: jest.fn(() => ({
      get: jest.fn(),
    })),
  })),
};

export const mockAuth = {
  signInAnonymously: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
};
```

### 2. AsyncStorage Mock

**__mocks__/asyncStorage.ts**
```typescript
export default {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
```

### 3. Navigation Mock

**__mocks__/navigation.ts**
```typescript
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

export const mockRoute = {
  params: {},
};
```

## テストデータ管理

### 1. テストデータ作成

**__tests__/fixtures/stories.ts**
```typescript
import { FailureStory } from '../../src/types';

export const mockStories: FailureStory[] = [
  {
    id: 'story1',
    authorId: 'user1',
    content: {
      title: 'プレゼンテーションで大失敗',
      category: '仕事',
      situation: 'テスト状況',
      action: 'テスト行動',
      result: 'テスト結果',
      learning: 'テスト学び',
      emotion: '後悔',
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      viewCount: 10,
      helpfulCount: 5,
      commentCount: 2,
      tags: ['プレゼン', '仕事'],
    },
  },
];
```

### 2. ファクトリー関数

**__tests__/factories/storyFactory.ts**
```typescript
import { CreateStoryData } from '../../src/services/storyService';

export const createStoryData = (
  overrides: Partial<CreateStoryData> = {}
): CreateStoryData => ({
  title: 'テスト失敗談',
  category: '仕事',
  situation: 'テスト状況',
  action: 'テスト行動',
  result: 'テスト結果',
  learning: 'テスト学び',
  emotion: '後悔',
  ...overrides,
});
```

## パフォーマンステスト

### 1. レンダリング性能

**performance.test.tsx**
```typescript
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../screens/HomeScreen';

describe('Performance Tests', () => {
  it('should render large story list within acceptable time', async () => {
    const start = Date.now();
    
    const { getByText } = render(
      <HomeScreen stories={largeMockStories} />
    );
    
    const end = Date.now();
    const renderTime = end - start;
    
    expect(renderTime).toBeLessThan(1000); // 1秒以内
  });
});
```

### 2. メモリ使用量

**memory.test.ts**
```typescript
describe('Memory Usage', () => {
  it('should not cause memory leaks', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // 大量のコンポーネントを作成・破棄
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<HomeScreen />);
      unmount();
    }
    
    global.gc(); // ガベージコレクション実行
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB以内
  });
});
```

## テストレポート

### 1. カバレッジレポート

**jest.config.js**
```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageReporters: ['html', 'text', 'lcov'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

### 2. 視覚的回帰テスト

**visual.test.tsx**
```typescript
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../screens/HomeScreen';

describe('Visual Regression Tests', () => {
  it('should match snapshot', () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
```

## 継続的改善

### 1. テストメトリクス

- **実行時間**: テストスイートの実行時間監視
- **成功率**: テストの成功率追跡
- **カバレッジ**: コードカバレッジの推移
- **フレークiness**: 不安定なテストの特定

### 2. 定期的な見直し

#### 月次レビュー
- テスト実行時間の最適化
- 不要なテストの削除
- テストデータの更新

#### 四半期レビュー
- テスト戦略の見直し
- 新しいテストツールの検討
- テスト品質の評価

## 実装スケジュール

### Phase 1 (1ヶ月)
- [ ] Jest環境構築
- [ ] 基本的なユニットテスト
- [ ] CI/CD統合

### Phase 2 (2ヶ月)
- [ ] React Native Testing Library導入
- [ ] コンポーネントテスト
- [ ] Firebase Mock設定

### Phase 3 (3ヶ月)
- [ ] Firebase Emulator統合
- [ ] 統合テスト実装
- [ ] パフォーマンステスト

### Phase 4 (4ヶ月)
- [ ] Detox E2E環境構築
- [ ] 主要フローのE2Eテスト
- [ ] 視覚的回帰テスト

## 成功指標

### 品質指標
- **バグ検出率**: 90%以上のバグをテストで検出
- **カバレッジ**: 80%以上のコードカバレッジ
- **レスポンス時間**: テストスイート実行時間 < 10分

### プロセス指標
- **テスト実行頻度**: 100%のPRでテスト実行
- **自動化率**: 90%以上のテストケース自動化
- **メンテナンス性**: 新機能開発時のテスト作成時間 < 開発時間の30%

---

**この自動テスト戦略により、FailShareの品質を継続的に保証し、安心してリリースできる開発環境を構築します。段階的な実装により、開発速度を落とすことなく品質を向上させることができます。** 