# FailShare - React Native + Expo アプリケーション

失敗を成長の糧に変える、匿名で安全な学び合いコミュニティアプリです。

> **📚 詳細なドキュメント**: [/Docs](../Docs/) フォルダを参照してください
> - **プロジェクト概要**: [01_AppConcept.md](../Docs/01_AppConcept.md)
> - **技術選択詳細**: [02_TechChoice.md](../Docs/02_TechChoice.md)
> - **開発進捗**: [03_DevelopmentProgress.md](../Docs/03_DevelopmentProgress.md)
> - **テスト戦略**: [04_TestingStrategy.md](../Docs/04_TestingStrategy.md)

## クイックスタート

### 技術スタック
- React Native Web + Expo, TypeScript, Firebase
- Web-First アプローチによるブラウザ完全対応

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

4. **Webブラウザでの動作確認**
   - ローカル開発サーバーが `http://localhost:8081` で起動
   - ブラウザで直接アクセスして動作確認
   - レスポンシブデザインをデバイスモードで確認

## 利用可能なスクリプト

### 開発用
- `npm start`: 開発サーバーの起動 (Web優先)
- `npm run web`: ブラウザで起動
- `npm run start:dev`: 開発環境で起動
- `npm run start:staging`: ステージング環境で起動
- `npm run start:prod`: 本番環境で起動

### Web ビルド・デプロイ用
- `npm run build:web:dev`: 開発版Webビルド
- `npm run build:web:staging`: ステージング版Webビルド
- `npm run build:web:prod`: 本番版Webビルド
- `npm run server:start`: Express サーバー起動
- `npm run server:prod`: 本番用サーバー起動

### テスト・品質管理
- `npm run test`: テスト実行
- `npm run lint`: コードリンティング
- `npm run type-check`: TypeScript型チェック

### 管理者機能
- `npm run seed-data:dev -- --confirm`: 開発環境サンプルデータ投入
- `npm run seed-data:staging -- --confirm`: ステージング環境サンプルデータ投入
- `npm run seed-data:prod -- --confirm`: 本番環境サンプルデータ投入

## 開発ガイド

### 新しいスクリーンの追加

1. `src/screens/` に新しいコンポーネントを作成
2. `src/navigation/AppNavigator.tsx` に画面を追加
3. 必要に応じて型定義を `src/types/` に追加

### 状態管理

Zustandを使用して状態を管理します。新しいストアは `src/stores/` に作成してください。