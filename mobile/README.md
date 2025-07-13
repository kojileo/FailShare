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

3. **Expo Goでの動作確認**
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

- `npm start`: 開発サーバーの起動
- `npm run android`: Android エミュレータで起動
- `npm run ios`: iOS シミュレータで起動 (macOS のみ)
- `npm run web`: ブラウザで起動

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