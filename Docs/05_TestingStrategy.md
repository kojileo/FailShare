# FailShare テスト戦略

## 🎯 テスト戦略の目的

### 品質保証目標
- **機能の正確性**: すべての機能が仕様通りに動作することを保証
- **リグレッション防止**: 新機能追加時に既存機能が破損しないことを確認
- **パフォーマンス保証**: アプリの応答性とパフォーマンスを維持
- **ユーザーエクスペリエンス**: エンドユーザーの視点でアプリ全体をテスト

### 対象範囲
- **ユニットテスト**: 個別関数・コンポーネントの動作
- **インテグレーションテスト**: コンポーネント間の連携
- **E2Eテスト**: エンドユーザーシナリオの完全テスト

---

## 📊 テストピラミッド

```
    🔺 E2E テスト (10%)
       ユーザーフロー・ブラウザテスト
    
  🔺🔺 インテグレーションテスト (20%)
     コンポーネント間連携・API統合
     
🔺🔺🔺 ユニットテスト (70%)
   関数・コンポーネント・状態管理
```

### テスト分散比率
- **ユニットテスト**: 70% - 高速・詳細・開発者フィードバック
- **インテグレーションテスト**: 20% - 中速・統合確認
- **E2Eテスト**: 10% - 低速・全体シナリオ確認

---

## 🛠️ 技術スタック

### ユニットテスト
- **Jest**: テストランナー・アサーション
- **React Native Testing Library**: コンポーネントテスト
- **Jest Native**: React Native専用マッチャー

### インテグレーションテスト
- **Jest + React Native Testing Library**: 画面レベルテスト
- **Firebase Emulator**: Firestore・Auth のモックテスト
- **MSW (Mock Service Worker)**: API モック

### E2Eテスト
- **Detox**: React Native アプリケーション E2E テスト
- **iOS Simulator / Android Emulator**: 実機環境シミュレーション

---

## 📁 テストファイル構成

```
mobile/
├── __tests__/
│   ├── unit/                    # ユニットテスト
│   │   ├── utils/              # ユーティリティ関数
│   │   ├── services/           # Firebase・API サービス
│   │   ├── stores/             # Zustand 状態管理
│   │   └── components/         # 個別コンポーネント
│   │
│   ├── integration/            # インテグレーションテスト
│   │   ├── screens/           # 画面統合テスト
│   │   ├── navigation/        # ナビゲーションテスト
│   │   └── workflows/         # ビジネスロジック統合
│   │
│   └── __mocks__/             # モックデータ・関数
│       ├── firebase.ts        # Firebase モック
│       ├── @react-navigation/ # ナビゲーションモック
│       └── sampleData.ts      # テストデータ
│
├── e2e/                       # E2E テスト
│   ├── tests/                 # テストシナリオ
│   ├── helpers/               # テストヘルパー
│   └── jest.config.js         # E2E Jest 設定
│
└── src/
    └── **/*.test.{ts,tsx}     # コロケーションテスト
```

---

## 🧪 ユニットテスト戦略

### テスト対象と優先度

#### 🔥 **高優先度** (カバレッジ100%目標)
- **utils/categories.ts**: カテゴリ管理ロジック
- **services/storyService.ts**: Firestore CRUD操作
- **services/authService.ts**: 認証ロジック
- **stores/**: Zustand 状態管理

#### 🟡 **中優先度** (カバレッジ80%目標)
- **screens/**: 画面コンポーネントの基本動作
- **navigation/**: ナビゲーション設定

#### 🟢 **低優先度** (カバレッジ50%目標)
- **types/**: TypeScript型定義
- **constants/**: 定数定義

### テスト例
```typescript
// utils/categories.test.ts
describe('getCategoryHierarchyColor', () => {
  it('恋愛カテゴリの正しい色を返す', () => {
    const category = { main: '恋愛', sub: 'デート' };
    expect(getCategoryHierarchyColor(category)).toBe('#E91E63');
  });
});

// stores/authStore.test.ts
describe('AuthStore', () => {
  it('ログイン時にユーザー状態が更新される', async () => {
    const { login } = useAuthStore.getState();
    await login('test@example.com', 'password');
    expect(useAuthStore.getState().user).toBeDefined();
  });
});
```

---

## 🔗 インテグレーションテスト戦略

### テスト対象
#### 画面レベル統合
- **HomeScreen**: 検索・フィルター・ストーリー表示の統合
- **CreateStoryScreen**: フォーム入力・バリデーション・送信の統合
- **MyStoriesScreen**: ストーリー取得・編集・削除の統合

#### データフロー統合
- **認証フロー**: Login → ユーザー状態更新 → 画面遷移
- **ストーリー投稿フロー**: 入力 → バリデーション → Firestore保存 → 状態更新
- **ストーリー編集フロー**: データ取得 → 編集 → 更新 → 再表示

### テスト例
```typescript
// screens/HomeScreen.integration.test.tsx
describe('HomeScreen Integration', () => {
  it('検索とカテゴリフィルターが連携して動作する', async () => {
    render(<HomeScreen />);
    
    // 検索実行
    fireEvent.changeText(screen.getByPlaceholderText('失敗談を検索...'), 'デート');
    
    // カテゴリフィルター選択
    fireEvent.press(screen.getByText('恋愛'));
    
    // 結果確認
    await waitFor(() => {
      expect(screen.getByText('デートでの失敗談')).toBeVisible();
    });
  });
});
```

---

## 🎬 E2Eテスト戦略

### 主要ユーザーシナリオ
#### クリティカルパス
1. **新規ユーザー登録・投稿フロー**
   ```
   アプリ起動 → 認証 → オンボーディング → ホーム → 投稿作成 → 投稿完了
   ```

2. **既存ユーザー閲覧・検索フロー**
   ```
   ログイン → ホーム → 検索実行 → ストーリー詳細 → いいね・コメント
   ```

3. **マイストーリー管理フロー**
   ```
   マイストーリー → 編集 → 更新 → 削除 → 確認
   ```

### 対象プラットフォーム
- **Web (React Native Web)**: Chrome・Safari・Firefox
- **iOS**: iPhone 15 Simulator
- **Android**: Pixel 3a Emulator

### テスト例
```typescript
// e2e/tests/story-creation.e2e.ts
describe('ストーリー投稿フロー', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('新規ストーリーを投稿できる', async () => {
    // ホーム画面から投稿画面へ
    await element(by.id('create-story-button')).tap();
    
    // フォーム入力
    await element(by.id('story-title-input')).typeText('E2Eテストストーリー');
    await element(by.id('category-picker')).tap();
    await element(by.text('恋愛')).tap();
    
    // 投稿実行
    await element(by.id('submit-button')).tap();
    
    // 投稿完了確認
    await expect(element(by.text('投稿が完了しました'))).toBeVisible();
  });
});
```

---

## 🚀 CI/CD統合

### GitHub Actions ワークフロー
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:e2e:ios
```

### テストレポート
- **カバレッジレポート**: Codecov 統合
- **テスト結果**: GitHub Actions Summary
- **パフォーマンスメトリクス**: Lighthouse CI

---

## 📊 品質ゲート

### カバレッジ目標
- **全体**: 70%以上
- **ユニットテスト**: 80%以上 
- **インテグレーションテスト**: 60%以上
- **E2Eテスト**: 主要フロー100%

### パフォーマンス目標
- **テスト実行時間**: ユニット<30s、統合<2min、E2E<10min
- **テスト安定性**: フレイク率<5%
- **CI実行時間**: 全テスト<15分

### 品質チェックポイント
- [ ] 新機能にはテストが含まれる
- [ ] 既存テストが全て通過する
- [ ] カバレッジが低下していない
- [ ] E2Eテストが主要フローをカバーしている

---

## 🔄 継続的改善

### テストメンテナンス
- **月次レビュー**: フレイクテストの特定・修正
- **四半期レビュー**: テスト戦略・カバレッジ分析
- **年次レビュー**: テストツール・アーキテクチャ見直し

### メトリクス監視
- **テスト実行時間**: 傾向分析・最適化
- **カバレッジ推移**: 品質向上進捗確認
- **デプロイ成功率**: テスト効果測定

**次のステップ**: ユニットテストから段階的に実装を開始します。 