# FailShare - 失敗を成長の糧に変える学び合いコミュニティ

失敗を恥ずかしい秘密ではなく、価値ある学習リソースとして捉え直し、みんなで共有し支え合うことで成長を促進するWebアプリケーションです。

## 🌐 **Web版運用中！**

**🚀 [https://failshare-web-xxx.a.run.app](https://failshare-web-xxx.a.run.app)**

- **即座にアクセス**: ブラウザからすぐに利用可能
- **全デバイス対応**: PC・タブレット・スマートフォン完全対応
- **インストール不要**: PWA対応でアプリライクな体験

## プロジェクト概要

### 核となる価値提案
**「失敗を成長の糧に変える、匿名で安全な学び合いコミュニティ」**

React Native + Expo で開発され、Web配信に最適化されたアプリケーションです。あらゆるデバイスのブラウザからアクセス可能で、アプリのような滑らかな操作感を提供します。

### 主要機能
- **匿名認証**: ワンクリックで安全にサインイン
- **失敗談投稿**: 構造化された振り返りテンプレート
- **共感・支援**: 建設的なコメント・アドバイス機能
- **検索・発見**: カテゴリ・感情別の失敗事例検索
- **レスポンシブ対応**: PC・タブレット・スマートフォン対応

## プロジェクト構造

```
FailShare/
├── Docs/                         # 📚 包括的プロジェクトドキュメント
│   ├── 01_AppConcept.md          # アプリコンセプト・機能詳細
│   ├── 02_TechChoice.md          # 技術選定の背景・理由
│   ├── 03_DevelopmentProgress.md # 開発進捗・実装詳細
│   ├── 06_DeploymentStrategy.md  # マルチプラットフォーム戦略
│   ├── 08_WebDeploymentGuide.md  # Web/Cloud Run デプロイガイド
│   └── README.md                 # ドキュメントインデックス
├── mobile/                       # 🌐 React Native Web アプリケーション
│   ├── src/                      # ソースコード
│   │   ├── components/           # 共通コンポーネント
│   │   ├── screens/              # 画面コンポーネント
│   │   ├── navigation/           # ナビゲーション設定
│   │   ├── stores/               # Zustand状態管理
│   │   ├── services/             # Firebase等のサービス
│   │   ├── types/                # TypeScript型定義
│   │   └── utils/                # ユーティリティ関数
│   ├── assets/                   # 画像・アイコン等
│   ├── Dockerfile                # 🐳 Webデプロイ用コンテナ設定
│   ├── server.js                 # 🌐 Express Webサーバー
│   ├── cloudbuild.yaml           # ☁️ Cloud Build CI/CD設定
│   └── README.md                 # 開発者向けクイックスタート
└── README.md                     # このファイル
```

## 技術スタック

### Webアプリケーション
- **フロントエンド**: React Native Web + Expo + TypeScript
- **Web配信**: Docker + Express + Cloud Run
- **状態管理**: Zustand + SWR
- **UI**: React Native Paper (Material Design)
- **PWA機能**: レスポンシブ・オフライン対応

### バックエンド・インフラ
- **BaaS**: Firebase (Auth, Firestore)
- **ホスティング**: Google Cloud Run
- **CI/CD**: Cloud Build + GitHub
- **監視**: Cloud Run Metrics + Logs

## 🚀 開発・デプロイ状況

### ✅ 本番運用中 (Phase 2 完了)
- **Web アプリケーション**: Cloud Run本番運用中
- **Docker化**: コンテナベースデプロイ
- **CI/CD**: 自動ビルド・デプロイパイプライン
- **Firebase統合**: 認証・データベース動作確認
- **レスポンシブ対応**: PC・タブレット・スマートフォン完全対応

### 🔄 継続改善中
- **PWA機能**: オフライン対応・インストール機能
- **パフォーマンス最適化**: 読み込み速度向上
- **UI/UX改善**: ユーザビリティ向上

### 📱 将来の展開
- **ネイティブモバイルアプリ**: 将来のロードマップで検討中

## 📚 ドキュメント

詳細な技術情報・開発プロセスは [/Docs](./Docs/) フォルダを参照してください：

- **🎯 [プロジェクト概要](./Docs/01_AppConcept.md)** - アプリのコンセプト・機能詳細
- **🔧 [技術選択](./Docs/02_TechChoice.md)** - 技術スタック選定理由
- **📈 [開発進捗](./Docs/03_DevelopmentProgress.md)** - 実装詳細・成果
- **🚀 [Webデプロイ](./Docs/08_WebDeploymentGuide.md)** - Cloud Run デプロイガイド

## 🛠️ クイックスタート

### Web版を試す
1. [https://failshare-web-xxx.a.run.app](https://failshare-web-xxx.a.run.app) にアクセス
2. 「匿名で始める」をクリック
3. 失敗談を投稿・閲覧して体験

### ローカル開発
```bash
cd mobile
npm install
npm start
# Web: http://localhost:19006
# Mobile: Expo Go アプリでQRコード読み取り
```

---

**🌟 FailShare**: 失敗を学びに変え、みんなで成長していくコミュニティを目指しています。
- **ストレージ**: Cloud Storage (将来的に)

## 開発環境セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn
- Git
- Expo CLI
- Expo Go アプリ（iOS/Android）

### 初期セットアップ

1. **リポジトリのクローン**
   ```bash
   git clone [リポジトリURL]
   cd FailShare
   ```

2. **モバイルアプリのセットアップ**
   ```bash
   cd mobile
   npm install
   npm start
   ```

3. **動作確認**
   - スマートフォンにExpo Goアプリをインストール
   - QRコードをスキャンしてアプリを起動

## 現在の実装状況

### ✅ 完了
- 基本的なプロジェクト構造
- React Native + Expo セットアップ
- 基本的なナビゲーション
- サンプルデータでの失敗談一覧表示
- Material Design UI コンポーネント
- TypeScript型定義
- Zustand状態管理基盤

### 🔄 開発中
- Firebase設定（認証・データベース）
- 失敗談投稿機能
- コメント機能
- 検索機能
- プロフィール機能

### 📋 今後の予定
- 匿名化システムの実装
- 高度な検索・フィルター機能
- 学習記録機能
- 通知システム
- プレミアム機能

## 貢献ガイド

### 開発ワークフロー
1. 新しいブランチを作成
2. 機能開発・バグ修正
3. テスト実行
4. プルリクエスト作成

### コードスタイル
- TypeScript strict mode
- ESLint + Prettier
- React/React Native best practices
- コンポーネント単位での開発

## ライセンス

[ライセンス情報を記載]

## 連絡先

[連絡先情報を記載] 