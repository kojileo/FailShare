# FailShare モバイルアプリ

失敗を成長の糧に変える、匿名で安全な学び合いコミュニティアプリです。

## 技術スタック

- **フロントエンド**: React Native + Expo
- **言語**: TypeScript
- **状態管理**: Zustand
- **データフェッチング**: SWR
- **UIライブラリ**: React Native Paper
- **ナビゲーション**: React Navigation
- **バックエンド**: Firebase (Auth, Firestore)

## 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Expo CLI
- Expo Go アプリ (iOS/Android)

### セットアップ手順

1. **依存関係のインストール**
   ```bash
   npm install
   ```

2. **開発サーバーの起動**
   ```bash
   npm start
   ```

3. **環境変数の設定**
   ```bash
   # Development環境用
   cp .env.example .env.development
   # Staging環境用  
   cp .env.example .env.staging
   # Production環境用
   cp .env.example .env.production
   ```
   
   各ファイルにFirebaseプロジェクトの認証情報を設定してください：
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Expo Goでの動作確認**
   - スマートフォンにExpo Goアプリをインストール
   - QRコードをスキャンしてアプリを起動

## プロジェクト構造

```
src/
├── components/     # 共通コンポーネント
├── screens/        # 画面コンポーネント
├── navigation/     # ナビゲーション設定
├── stores/         # Zustand状態管理
├── services/       # Firebase等のサービス
├── types/          # TypeScript型定義
└── utils/          # ユーティリティ関数
```

## 利用可能なスクリプト

### 開発用
- `npm start`: 開発サーバーの起動
- `npm run android`: Android エミュレータで起動
- `npm run ios`: iOS シミュレータで起動 (macOS のみ)
- `npm run web`: ブラウザで起動
- `npm run start:dev`: 開発環境で起動
- `npm run start:staging`: ステージング環境で起動
- `npm run start:prod`: 本番環境で起動

### ビルド・デプロイ用
- `npm run build:dev`: 開発版ビルド
- `npm run build:staging`: ステージング版ビルド
- `npm run build:prod`: 本番版ビルド
- `npm run submit:prod`: App Store/Play Store への提出
- `npm run preview:dev`: 開発版プレビュー

### テスト・品質管理
- `npm run test`: テスト実行
- `npm run lint`: コードリンティング
- `npm run type-check`: TypeScript型チェック

## 機能概要

### 実装済み機能

- ✅ 基本的なナビゲーション
- ✅ 失敗談一覧表示
- ✅ サンプルデータ表示
- ✅ 検索バー (UI のみ)
- ✅ Material Design UI

### 実装予定機能

- 🔄 Firebase 認証
- 🔄 失敗談投稿機能
- 🔄 コメント機能
- 🔄 検索機能
- 🔄 プロフィール機能

## 開発ガイド

### 新しいスクリーンの追加

1. `src/screens/` に新しいコンポーネントを作成
2. `src/navigation/AppNavigator.tsx` に画面を追加
3. 必要に応じて型定義を `src/types/` に追加

### 状態管理

Zustandを使用して状態を管理します。新しいストアは `src/stores/` に作成してください。

### スタイリング

React Native Paper を使用して一貫したデザインを実現します。

## トラブルシューティング

### よくある問題

1. **アプリが起動しない**
   - `npm install` を実行してください
   - `npx expo start --clear` でキャッシュをクリアしてください

2. **Expo Go で接続できない**
   - デバイスが同じネットワークに接続されているか確認してください
   - ファイアウォールの設定を確認してください

3. **アイコンが表示されない**
   - `@expo/vector-icons` がインストールされているか確認してください

## デプロイメント

### 環境構成

このプロジェクトは3つの環境をサポートしています：

- **Development**: 開発・テスト用
- **Staging**: 統合テスト・UAT用
- **Production**: 本番運用用

### EAS Buildの準備

1. **EAS CLIのインストール**
   ```bash
   npm install -g @expo/cli eas-cli
   ```

2. **Expo アカウントでのログイン**
   ```bash
   eas login
   ```

3. **プロジェクトの設定**
   ```bash
   eas build:configure
   ```

### Firebase環境の設定

各環境用のFirebaseプロジェクトを作成してください：

- `failshare-dev` (開発環境)
- `failshare-staging` (ステージング環境)  
- `failshare-prod` (本番環境)

各プロジェクトの認証情報を対応する環境変数ファイルに設定してください。

### デプロイ手順

#### Development環境
```bash
# 開発版ビルド
npm run build:dev

# または開発版で起動
npm run start:dev
```

#### Staging環境
```bash
# ステージング版ビルド
npm run build:staging

# ステージング環境で起動
npm run start:staging
```

#### Production環境
```bash
# 本番版ビルド
npm run build:prod

# App Store/Play Storeへの提出
npm run submit:prod
```

### 自動デプロイ (CI/CD)

GitHub Actionsを使用した自動デプロイを設定済みです：

- `develop` ブランチ → Development環境に自動デプロイ
- `main` ブランチ → Staging環境に自動デプロイ
- タグ作成 (`v1.0.0`) → Production環境に自動デプロイ

### 環境変数ファイルの作成

以下のファイルを手動で作成してください：

**`.env.development`**
```env
EXPO_PUBLIC_APP_NAME=FailShare (Dev)
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_FIREBASE_PROJECT_ID=failshare-dev
# その他のFirebase設定...
```

**`.env.staging`**
```env
EXPO_PUBLIC_APP_NAME=FailShare (Staging)
EXPO_PUBLIC_ENVIRONMENT=staging
EXPO_PUBLIC_FIREBASE_PROJECT_ID=failshare-staging
# その他のFirebase設定...
```

**`.env.production`**
```env
EXPO_PUBLIC_APP_NAME=FailShare
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_FIREBASE_PROJECT_ID=failshare-prod
# その他のFirebase設定...
``` 