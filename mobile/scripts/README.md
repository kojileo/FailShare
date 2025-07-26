# 管理者スクリプト

このフォルダには、FailShareアプリの管理者用スクリプトが含まれています。

## セットアップ

### 1. Firebase Admin SDK の設定

Firebase Console から サービスアカウントキーを取得します：

1. [Firebase Console](https://console.firebase.google.com) にアクセス
2. プロジェクトを選択
3. ⚙️ **プロジェクト設定** > **サービス アカウント**
4. **新しい秘密鍵の生成** をクリック
5. JSONファイルをダウンロード

### 2. 設定ファイルの配置

ダウンロードしたJSONファイルを以下の場所に配置：

```
mobile/
├── config/
│   ├── firebase-admin-dev.json      # 開発環境用
│   ├── firebase-admin-staging.json  # ステージング環境用
│   └── firebase-admin-prod.json     # 本番環境用
└── scripts/
    └── seed-data.js
```

### 3. 依存関係のインストール

```bash
cd mobile
npm install firebase-admin
```

## 3段階デプロイフロー

### 🔧 開発環境 (Development)
- **用途**: 機能開発・デバッグ
- **データ**: 豊富なテストデータ（5件）
- **特徴**: 開発者がローカルで自由にテスト

### 🏗️ ステージング環境 (Staging)  
- **用途**: 本番前の最終テスト・QA
- **データ**: 本番に近い状態のテストデータ（6件）
- **特徴**: 本番環境と同じ構成での動作確認

### 🚀 本番環境 (Production)
- **用途**: エンドユーザー向けサービス
- **データ**: 品質重視の厳選データ（3件）  
- **特徴**: 最小限の高品質サンプルデータ

## スクリプト一覧

### サンプルデータ投入 (`seed-data.js`)

Firestoreにサンプルの失敗談データを投入します。

#### 基本使用方法

```bash
# 開発環境（デフォルト）
npm run seed-data -- --confirm

# 開発環境（明示的）
npm run seed-data:dev -- --confirm

# ステージング環境  
npm run seed-data:staging -- --confirm

# 本番環境
npm run seed-data:prod -- --confirm
```

#### 環境別データセット

| 環境 | データ数 | 特徴 | 用途 |
|------|----------|------|------|
| dev | 5件 | 開発・デバッグ用 | ローカル開発 |
| staging | 6件 | 本番に近いテスト用 | QA・最終確認 |
| prod | 3件 | 厳選された高品質データ | エンドユーザー向け |

#### 機能

- ✅ **既存データのクリーンアップ**: `sample_user_*` のデータを自動削除
- ✅ **バッチ処理**: 効率的なFirestore操作
- ✅ **データ検証**: 投入後の自動確認
- ✅ **環境分離**: dev/staging/prod環境の切り替え
- ✅ **安全な実行**: `--confirm` フラグによる確認

#### サンプルデータ内容

**共通データ（全環境）:**
- **恋愛カテゴリ**: デート、告白、カップル失敗談
- **基本統計**: 閲覧数、いいね数、コメント数

**環境別追加データ:**
- **開発環境**: 仕事カテゴリ（会議・プロジェクト管理）
- **ステージング環境**: より多様なテストケース + staging タグ
- **本番環境**: 厳選された高品質データのみ

## デプロイフロー推奨手順

### 1. 開発フェーズ
```bash
# ローカル開発用データ投入
npm run seed-data:dev -- --confirm
```

### 2. ステージングフェーズ  
```bash
# 本番に近い環境でのテスト
npm run seed-data:staging -- --confirm
```

### 3. 本番デプロイフェーズ
```bash
# 本番環境への最小限データ投入
npm run seed-data:prod -- --confirm
```

## セキュリティ注意事項

### ⚠️ サービスアカウントキーの管理

- **Gitにコミットしない**: `.gitignore` に必ず追加
- **環境別管理**: dev/staging/prod で異なるキーを使用
- **本番キーの管理**: 厳重に管理し、定期的に更新
- **権限の最小化**: 必要最小限の権限のみ付与

### 🔒 本番環境での実行

```bash
# 本番実行前に必ず確認
npm run seed-data:prod

# 確認後に実行
npm run seed-data:prod -- --confirm
```

### 📋 `.gitignore` 設定例

```gitignore
# Firebase Admin Keys
mobile/config/firebase-admin-*.json

# Node modules
node_modules/
```

## トラブルシューティング

### エラー: サービスアカウントキーが見つからない

```
❌ サービスアカウントキーが見つかりません: mobile/config/firebase-admin-staging.json
```

**解決方法**:
1. Firebase Consoleからサービスアカウントキーをダウンロード
2. ファイル名を `firebase-admin-staging.json` に変更
3. `mobile/config/` フォルダに配置

### エラー: 権限不足

```
❌ Error: Missing or insufficient permissions
```

**解決方法**:
1. サービスアカウントに適切な権限が付与されているか確認
2. `Cloud Firestore` の読み書き権限が必要
3. 環境ごとに正しいプロジェクトを選択しているか確認

### エラー: プロジェクトIDが間違っている

**解決方法**:
1. サービスアカウントキーの `project_id` を確認
2. 正しいFirebaseプロジェクト（dev/staging/prod）のキーか確認

## 拡張可能性

新しい管理スクリプトを追加する場合：

1. `scripts/` フォルダに新しいJSファイルを作成
2. `package.json` の `scripts` セクションにコマンドを追加
3. このREADMEにドキュメントを追加

例：
```javascript
// scripts/export-data.js
// scripts/cleanup-old-data.js  
// scripts/generate-analytics.js
// scripts/backup-data.js
```

## 環境管理のベストプラクティス

### 🔧 開発環境
- 頻繁なデータリセット OK
- 実験的なデータ投入 OK
- 破壊的変更のテスト OK

### 🏗️ ステージング環境  
- 本番データの模擬テスト
- パフォーマンステスト
- 最終的な動作確認

### 🚀 本番環境
- 慎重なデータ操作
- 最小限の変更のみ
- 事前承認必須 