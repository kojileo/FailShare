# FailShare - 失敗を成長の糧に変える学び合いコミュニティ

失敗を恥ずかしい秘密ではなく、価値ある学習リソースとして捉え直し、みんなで共有し支え合うことで成長を促進するWebアプリケーションです

## 🌐 **Web版運用中！**

**🚀 [https://fail-share.com/](https://fail-share.com/)**

- **即座にアクセス**: ブラウザからすぐに利用可能
- **全デバイス対応**: PC・タブレット・スマートフォン完全対応
- **インストール不要**: PWA対応でアプリライクな体験

## プロジェクト概要

### 核となる価値提案
**「失敗を成長の糧に変え、支えあうコミュニティ」**

React Native + Expo で開発され、Web配信に最適化されたアプリケーションです。あらゆるデバイスのブラウザからアクセス可能で、アプリのような滑らかな操作感を提供します。

### 主要機能
- **匿名認証**: ワンクリックで安全にサインイン
- **失敗談投稿**: 構造化された振り返りテンプレート
- **共感・支援**: 建設的なコメント・アドバイス機能
- **検索・発見**: カテゴリ・感情別の失敗事例検索
- **レスポンシブ対応**: PC・タブレット・スマートフォン対応
- **投稿管理**: 編集・削除機能による自分の投稿管理
- **管理者システム**: Firebase Admin SDK による安全なデータ管理

## プロジェクト構造

```
FailShare/
├── Docs/                         # 📚 包括的プロジェクトドキュメント
│   ├── 01_AppConcept.md          # アプリコンセプト・機能詳細
│   ├── 02_TechChoice.md          # 技術選定の背景・理由
│   ├── 03_DevelopmentProgress.md # 開発進捗・実装詳細
│   ├── 04_TestingStrategy.md     # テスト戦略・品質保証
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
│   ├── scripts/                  # 管理者スクリプト
│   ├── config/                   # 環境別設定ファイル
│   ├── firestore.indexes.json    # 🔍 Firestoreインデックス設定
│   ├── firestore.rules           # 🔒 Firestoreセキュリティルール
│   ├── Dockerfile                # 🐳 Webデプロイ用コンテナ設定
│   ├── server.js                 # 🌐 Express Webサーバー
│   └── README.md                 # 開発者向けクイックスタート
└── README.md                     # このファイル
```

## 🛠️ 技術スタック

### フロントエンド
- **React Native + Expo**: モバイルアプリ開発
- **React Native Web**: Webブラウザ対応
- **HTML/CSS Pure Scroll**: Web環境スクロール問題解決
- **TypeScript**: 型安全性
- **React Native Paper**: UIライブラリ

### バックエンド
- **Firebase Authentication**: 匿名認証
- **Firestore**: NoSQLデータベース
- **Firebase Admin SDK**: 管理者スクリプト

### インフラ
- **Docker**: コンテナ化デプロイメント
- **3段階環境**: Development/Staging/Production
- **npm管理スクリプト**: 自動化されたデータ管理

## 🚀 セットアップ

### 前提条件

#### 必要なソフトウェア
```bash
# Node.js (v18以上推奨)
node --version

# npm (Node.jsに含まれています)
npm --version

# Git
git --version

# Firebase CLI (グローバルインストール)
npm install -g firebase-tools

# Expo CLI (グローバルインストール)
npm install -g @expo/cli
```

#### Firebaseプロジェクトの準備
1. **Firebase Console**でプロジェクトを作成
2. **Authentication**で匿名認証を有効化
3. **Firestore Database**を作成（本番モード）
4. **Firebase Admin SDK**の秘密鍵をダウンロード

### 1. 基本セットアップ
```bash
# リポジトリをクローン
git clone https://github.com/your-username/FailShare.git
cd FailShare/mobile

# 依存関係をインストール
npm install

# 環境変数ファイルをコピー
cp .env.example .env

# .envファイルにFirebase設定を追加
# FIREBASE_API_KEY=your_api_key
# FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# FIREBASE_PROJECT_ID=your_project_id
# FIREBASE_STORAGE_BUCKET=your_project.appspot.com
# FIREBASE_MESSAGING_SENDER_ID=your_sender_id
# FIREBASE_APP_ID=your_app_id
```

### 2. アプリ起動
```bash
npm start          # 開発サーバー起動
npm run web        # Webブラウザで表示
```

### 3. Firebase設定のデプロイ
```bash
# Firebaseプロジェクトにログイン
firebase login

# プロジェクトを初期化（初回のみ）
firebase init firestore

# セキュリティルールをデプロイ
firebase deploy --only firestore:rules

# インデックスをデプロイ
firebase deploy --only firestore:indexes
```

### 4. 管理者セットアップ（オプション）
```bash
# Firebase Admin キーを配置
# mobile/config/firebase-admin-dev.json に配置

# サンプルデータ投入
npm run seed-data:dev -- --confirm
```

## 🔍 Firestoreインデックス設定

### 概要
`firestore.indexes.json`は、Firestoreのクエリパフォーマンスを最適化するための複合インデックスを定義しています。

### 主要インデックス

#### 📝 ストーリー関連
- **ユーザー別投稿**: `authorId` + `metadata.createdAt`（降順）
- **カテゴリ別投稿**: `content.category.main` + `metadata.createdAt`（降順）
- **感情別投稿**: `content.emotion` + `metadata.createdAt`（降順）

#### 💬 コメント関連
- **ストーリー別コメント**: `storyId` + `createdAt`（降順）

#### 👥 フレンド機能
- **フレンドリクエスト**: `status` + `toUserId` + `createdAt`（降順）
- **フレンドシップ**: `userId` + `createdAt`（降順）

#### 💬 チャット機能
- **チャット一覧**: `participants`（配列） + `updatedAt`（降順）
- **メッセージ**: `chatId` + `createdAt`（昇順・降順両方）
- **未読メッセージ**: `chatId` + `senderId` + `isRead`

### デプロイ方法
```bash
# Firebase CLIでインデックスをデプロイ
firebase deploy --only firestore:indexes

# または、Firebase Consoleから手動でインデックスを作成
# Firebase Console > Firestore Database > インデックス タブ
```

## 🔒 Firestoreセキュリティルール

### 概要
`firestore.rules`は、データベースへのアクセス制御とデータ検証を定義しています。

### 主要セキュリティポリシー

#### 👤 ユーザー認証
- **匿名認証**: 認証済みユーザーのみアクセス可能
- **自己データ**: 自分のデータのみ読み書き可能

#### 📝 ストーリー投稿
```javascript
// 作成: 認証済みユーザーのみ、自分の投稿のみ
allow create: if request.auth != null 
              && request.auth.uid == request.resource.data.authorId
              && validateStoryData(request.resource.data);

// 更新: 投稿者のみ、データ検証も実行
allow update: if request.auth != null
              && request.auth.uid == resource.data.authorId
              && validateStoryUpdate(request.resource.data, resource.data);
```

#### 👍 いいね機能
```javascript
// 作成: 認証済みユーザーのみ、自分のいいねのみ
allow create: if request.auth != null 
              && request.auth.uid == request.resource.data.userId
              && validateLikeData(request.resource.data);

// 削除: 自分のいいねのみ
allow delete: if request.auth != null 
              && request.auth.uid == resource.data.userId;
```

#### 💬 コメント・チャット
- **コメント**: 認証済みユーザーのみ、自分のコメントのみ編集可能
- **チャット**: 参加者のみアクセス可能
- **メッセージ**: 送信者のみ編集・削除可能

#### 👥 フレンド機能
- **フレンドリクエスト**: 送信者・受信者のみアクセス可能
- **フレンドシップ**: 関係者のみアクセス可能

### データ検証関数
- `validateStoryData()`: 投稿データの完全性チェック
- `validateCommentData()`: コメントデータの検証
- `validateLikeData()`: いいねデータの検証
- `validateChatData()`: チャットデータの検証

### デプロイ方法
```bash
# Firebase CLIでセキュリティルールをデプロイ
firebase deploy --only firestore:rules

# または、Firebase Consoleから手動でルールを更新
# Firebase Console > Firestore Database > ルール タブ
```

### 開発時の注意点
1. **ローカルテスト**: `firebase emulators:start`でローカル環境でテスト
2. **段階的デプロイ**: 開発→ステージング→本番の順で適用
3. **ルールテスト**: Firebase Consoleのルールテスト機能を活用
4. **環境変数**: `.env`ファイルはGitにコミットしない（`.gitignore`に追加済み）
5. **Firebase Admin キー**: 秘密鍵ファイルは絶対にGitにコミットしない

## 📚 管理者システム

### サンプルデータ管理
```bash
# 開発環境（5件のテストデータ）
npm run seed-data:dev -- --confirm

# ステージング環境（6件の本番類似データ）  
npm run seed-data:staging -- --confirm

# 本番環境（3件の厳選データ）
npm run seed-data:prod -- --confirm
```

### 管理機能
- ✅ **環境分離**: dev/staging/prod の完全分離
- ✅ **安全操作**: Firebase Admin 権限による確実な処理
- ✅ **データクリーンアップ**: 既存サンプルデータの自動削除
- ✅ **誤実行防止**: --confirm フラグによる確認機能

## 🎯 現在の状況

### ✅ 完了済み
- MVP機能実装完了
- Web対応・レスポンシブデザイン
- Twitter風UI実装
- スクロール問題完全解決
- 管理者システム構築
- 編集・削除機能実装
- Docker化・依存関係安定化
- 3段階環境構成（Development/Staging/Production）
- 🔍 Firestoreインデックス最適化
- 🔒 包括的セキュリティルール実装

### 🔄 次期予定
- ユーザーテスト実施
- パフォーマンス最適化
- 本番環境デプロイ
- モニタリング体制構築

## 📋 ドキュメント

詳細なドキュメントは `/Docs/` フォルダを参照してください：
- [開発進捗記録](Docs/03_DevelopmentProgress.md)
- [技術選定](Docs/02_TechChoice.md)  
- [アプリコンセプト](Docs/01_AppConcept.md)
- [テスト戦略](Docs/05_TestingStrategy.md)