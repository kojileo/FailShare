# FailShare プロジェクトドキュメント

## 📋 プロジェクト概要

**FailShare（フェイルシェア）**は、失敗談と愚痴を匿名で共有し、同じような経験を持つ人たちが支え合うコミュニティプラットフォームです。

### 🎯 基本コンセプト
**「失敗談と愚痴を共有して、みんなで支え合う」**

失敗談と愚痴を共有することで心の整理を図り、同じような経験を持つ人たちが支え合い、共感し合える安全な環境を提供するプラットフォーム。シンプルで使いやすい投稿フォーマットと、基本的なコミュニティガイドラインにより、安心して感情を吐き出せる場所を作ります。

---

## 📚 ドキュメント構成

### 🎯 **概要・戦略ドキュメント**
- **[01_AppConcept.md](./01_AppConcept.md)** - アプリコンセプト・機能仕様
- **[02_TechChoice.md](./02_TechChoice.md)** - 技術選定・アーキテクチャ
- **[03_DevelopmentProgress.md](./03_DevelopmentProgress.md)** - 開発進捗・実装状況

### 🧪 **品質・運用ドキュメント**
- **[04_TestingStrategy.md](./04_TestingStrategy.md)** - テスト戦略・品質保証
- **[05_DeploymentGuide.md](./05_DeploymentGuide.md)** - デプロイ・運用ガイド
- **[06_SecurityPolicy.md](./06_SecurityPolicy.md)** - セキュリティ・プライバシー

### 📖 **開発者向けドキュメント**
- **[07_APIReference.md](./07_APIReference.md)** - API仕様・サービス一覧
- **[08_ComponentGuide.md](./08_ComponentGuide.md)** - コンポーネント・画面仕様
- **[09_DatabaseSchema.md](./09_DatabaseSchema.md)** - データベース設計

---

## 🚀 現在の開発状況

### ✅ **実装済み機能**
1. **認証システム**: 匿名認証・ユーザー管理
2. **投稿機能**: 失敗談の投稿・編集・削除
3. **検索機能**: カテゴリ別・キーワード検索
4. **エンゲージメント**: いいね・コメント機能
5. **フレンド機能**: リクエスト・承認・管理・検索・ブロック
6. **チャット機能**: リアルタイム1対1チャット

### 🔄 **現在開発中**
- **愚痴共有機能**: 統一フォーマットでの愚痴投稿
- **簡易ネガティブ防止**: キーワードフィルタ・コミュニティガイドライン
- **テスト実装**: ユニット・インテグレーション・E2Eテスト
- **品質保証**: パフォーマンス・セキュリティテスト

### 📅 **開発フェーズ**
- **Phase 1-3**: ✅ 完了（MVP開発・Web対応・リアルタイム最適化）
- **Phase 4**: ⏳ 予定（愚痴共有・簡易ネガティブ防止機能）
- **Phase 5**: 🔄 進行中（テスト・品質保証）
- **Phase 6**: ⏳ 予定（本番準備・運用開始）

---

## 🛠️ 技術スタック

### **フロントエンド**
- **React Native**: モバイルアプリ開発
- **React Native Web**: Web版対応
- **TypeScript**: 型安全性
- **Zustand**: 状態管理
- **React Navigation**: 画面遷移

### **バックエンド**
- **Firebase**: 完全サーバーレス
- **Firestore**: データベース
- **Firebase Auth**: 匿名認証
- **Firebase Hosting**: Web配信


### **開発・テスト**
- **Jest**: テストフレームワーク
- **React Native Testing Library**: テストライブラリ
- **ESLint**: コード品質管理
- **TypeScript**: 型チェック

### **デプロイ・運用**
- **Google Cloud Run**: Web版デプロイ
- **Docker**: コンテナ化
- **GitHub Actions**: CI/CD
- **Firebase Console**: 運用管理

---

## 📁 プロジェクト構造

```
FailShare/
├── Docs/                    # プロジェクトドキュメント
│   ├── README.md            # このファイル（概要・ナビゲーション）
│   ├── 01_AppConcept.md     # アプリコンセプト・機能仕様
│   ├── 02_TechChoice.md     # 技術選定・アーキテクチャ
│   ├── 03_DevelopmentProgress.md # 開発進捗・実装状況
│   ├── 04_TestingStrategy.md # テスト戦略・品質保証
│   ├── 05_DeploymentGuide.md # デプロイ・運用ガイド
│   ├── 06_SecurityPolicy.md # セキュリティ・プライバシー
│   ├── 07_APIReference.md   # API仕様・サービス一覧
│   ├── 08_ComponentGuide.md # コンポーネント・画面仕様
│   └── 09_DatabaseSchema.md # データベース設計
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
cp .env.example .env
# .envファイルにFirebase設定を追加
```

4. **開発サーバーの起動**
```bash
npm start
```

詳細なセットアップ手順は **[05_DeploymentGuide.md](./05_DeploymentGuide.md)** を参照してください。

---

## 📞 サポート・連絡先

### 開発者向け
- **技術的な質問**: GitHub Issues
- **バグ報告**: GitHub Issues
- **機能要望**: GitHub Discussions

### ドキュメント関連
- **ドキュメント改善**: GitHub Pull Requests
- **情報の追加・修正**: GitHub Issues

---

## 📝 ドキュメント更新履歴

| 日付 | 更新内容 | 更新者 |
|------|----------|--------|
| 2025-01-XX | ドキュメント構造の整備 | 開発チーム |
| 2025-01-XX | リアルタイム機能最適化の追加 | 開発チーム |
| 2025-01-XX | フレンド・チャット機能の追加 | 開発チーム |
| 2025-01-XX | 愚痴共有・ネガティブ防止システムの追加 | 開発チーム |

---

## 🔗 関連リンク

- **[プロジェクト概要](../README.md)**
- **[モバイルアプリ](../mobile/README.md)**
- **[Firebase Console](https://console.firebase.google.com/)**
- **[Google Cloud Console](https://console.cloud.google.com/)** 