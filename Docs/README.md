# FailShare プロジェクトドキュメント

## 📋 プロジェクト概要

**FailShare（フェイルシェア）**は、失敗談を匿名で共有し、同じような経験を持つ人たちが支え合い、学び合えるコミュニティプラットフォームです。

### 🎯 基本コンセプト
**「失敗を共有して、みんなで成長する」**

失敗を恥ずかしい秘密ではなく、価値ある学習資源として捉え直し、同じ経験をした人同士で共有し支え合うことで成長を促進するプラットフォーム。

---

## 🚀 現在の開発状況

### ✅ 実装済み機能
1. **認証システム**: 匿名認証・ユーザー管理
2. **投稿機能**: 失敗談の投稿・編集・削除
3. **検索機能**: カテゴリ別・キーワード検索
4. **いいね機能**: ハートアニメーション付きの共感表現
5. **コメント機能**: リアルタイム更新・編集・削除
6. **フレンド機能**: リクエスト・承認・管理・検索・ブロック

### 🔄 現在開発中
- **チャット機能**: 設計・実装準備中

### 📅 開発フェーズ
- **Phase 1-3**: ✅ 完了（MVP開発・Web対応）
- **Phase 4**: ✅ 完了（エンゲージメント機能実装）
- **Phase 5**: 🔄 進行中（フレンド・チャット機能実装）

---

## 🛠️ 技術スタック

### フロントエンド
- **React Native**: モバイルアプリ開発
- **React Native Web**: Web版対応
- **TypeScript**: 型安全性
- **Zustand**: 状態管理
- **React Navigation**: 画面遷移

### バックエンド
- **Firebase**: 完全サーバーレス
- **Firestore**: データベース
- **Firebase Auth**: 匿名認証
- **Firebase Hosting**: Web配信

### 開発・テスト
- **Jest**: テストフレームワーク
- **React Native Testing Library**: テストライブラリ
- **ESLint**: コード品質管理
- **TypeScript**: 型チェック

### デプロイ・運用
- **Google Cloud Run**: Web版デプロイ
- **Docker**: コンテナ化
- **GitHub Actions**: CI/CD
- **Firebase Console**: 運用管理

---

## 📁 プロジェクト構造

```
FailShare/
├── Docs/                    # プロジェクトドキュメント
│   ├── 01_AppConcept.md     # アプリコンセプト
│   ├── 02_TechChoice.md     # 技術選定
│   ├── 03_DevelopmentProgress.md # 開発進捗
│   ├── 04_TestingStrategy.md # テスト戦略
│   └── README.md            # このファイル
├── mobile/                  # モバイルアプリ
│   ├── src/                 # ソースコード
│   │   ├── components/      # 再利用可能コンポーネント
│   │   ├── screens/         # 画面コンポーネント
│   │   ├── services/        # ビジネスロジック
│   │   ├── stores/          # 状態管理
│   │   ├── types/           # 型定義
│   │   ├── utils/           # ユーティリティ
│   │   └── navigation/      # ナビゲーション
│   ├── __tests__/           # テストコード
│   ├── scripts/             # 管理スクリプト
│   └── config/              # 設定ファイル
└── README.md                # プロジェクト概要
```

---

## 🔧 開発環境セットアップ

### 前提条件
- Node.js 18+
- npm または yarn
- Expo CLI
- Firebase CLI

### セットアップ手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/your-username/FailShare.git
cd FailShare
```

2. **依存関係のインストール**
```bash
cd mobile
npm install
```

3. **環境変数の設定**
```bash
# .envファイルを作成
cp .env.example .env
# Firebase設定を入力
```

4. **開発サーバーの起動**
```bash
# 開発環境
npm run start:dev

# ステージング環境
npm run start:staging

# 本番環境
npm run start:prod
```

---

## 🧪 テスト実行

### テストコマンド
```bash
# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# ユニットテストのみ
npm run test:unit

# インテグレーションテストのみ
npm run test:integration
```

### テスト環境
- **Jest**: テストフレームワーク
- **React Native Testing Library**: コンポーネントテスト
- **Firebase Emulator**: ローカルFirebase環境

---

## 📊 開発進捗

### Phase 1: MVP開発 ✅ **完了**
- 基本的な投稿・閲覧機能
- 匿名認証システム
- シンプルなUI/UX

### Phase 2: Web対応・デプロイ ✅ **完了**
- React Native Web対応
- Cloud Runデプロイ
- 3段階環境構成

### Phase 3: AdSense審査対策 ✅ **完了**
- 法的文書整備
- 審査システム構築
- 技術要件対応

### Phase 4: エンゲージメント機能実装 ✅ **完了**
- いいね機能
- コメント機能
- フレンド機能
- テスト整備

### Phase 5: フレンド・コミュニティ機能実装 🔄 **進行中**
- コミュニティ機能
- チャット機能
- マッチング機能

---

## 📈 成功指標

### 短期目標（1ヶ月）
- **ユーザー数**: 1,000人以上
- **投稿数**: 200件以上
- **エンゲージメント率**: 15%以上
- **投稿継続率**: 60%以上

### 中期目標（3ヶ月）
- **月間PV**: 20,000以上
- **アクティブユーザー**: 3,000人以上
- **エンゲージメント率**: 20%以上
- **フレンド関係数**: 平均5フレンド以上

### 長期目標（6ヶ月）
- **月間PV**: 50,000以上
- **アクティブユーザー**: 10,000人以上
- **エンゲージメント率**: 25%以上
- **月間収益**: 20万円以上

---

## 🔒 セキュリティ・プライバシー

### 匿名性の徹底
- 完全匿名での投稿・コメント
- 個人情報の最小化
- プライバシー保護の徹底

### データ保護
- Firebaseセキュリティルール
- 適切なアクセス制御
- データ暗号化

### 法的対応
- プライバシーポリシー
- 利用規約
- GDPR対応

---

## 🚀 デプロイ

### 環境別デプロイ
```bash
# 開発環境
npm run build:web:dev
npm run server:dev

# ステージング環境
npm run build:web:staging
npm run server:staging

# 本番環境
npm run build:web:prod
npm run server:prod
```

### CI/CD
- **GitHub Actions**: 自動ビルド・デプロイ
- **Docker**: コンテナ化
- **Cloud Run**: サーバーレスデプロイ

---

## 📝 ドキュメント

### 技術ドキュメント
- [アプリコンセプト](Docs/01_AppConcept.md) - アプリの目的・機能・ターゲット
- [技術選定](Docs/02_TechChoice.md) - 技術スタック・選定理由
- [開発進捗](Docs/03_DevelopmentProgress.md) - 詳細な開発進捗
- [テスト戦略](Docs/04_TestingStrategy.md) - テスト方針・実装状況

### APIドキュメント
- Firebase Firestore API
- Firebase Auth API
- React Native Web API

---

## 🤝 コントリビューション

### 開発フロー
1. イシューの作成
2. ブランチの作成
3. 機能開発・テスト
4. プルリクエストの作成
5. コードレビュー
6. マージ・デプロイ

### コーディング規約
- TypeScript使用
- ESLint準拠
- テスト必須
- ドキュメント更新

---

## 📞 サポート

### 開発者向け
- **GitHub Issues**: バグ報告・機能要望
- **GitHub Discussions**: 技術的な議論
- **ドキュメント**: 詳細な技術ドキュメント

### ユーザー向け
- **ヘルプセンター**: ユーザーガイド
- **お問い合わせ**: サポート窓口
- **FAQ**: よくある質問

---

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

## 🙏 謝辞

- **Firebase**: サーバーレスインフラの提供
- **React Native**: クロスプラットフォーム開発
- **Expo**: 開発ツールの提供
- **コミュニティ**: フィードバック・サポート

---

**最終更新**: 2025年1月
**開発状況**: Phase 4完了（エンゲージメント機能実装完了）
**次のフェーズ**: Phase 5（フレンド・コミュニティ機能実装） 