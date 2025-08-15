# FailShare デプロイ・運用ガイド

## 📋 概要

このドキュメントでは、FailShareアプリケーションのデプロイと運用に関する詳細な手順を説明します。

### 🎯 対象読者
- 開発者
- 運用担当者
- デプロイ担当者

---

## 🏗️ 環境構成

### 3段階環境構成
```
開発環境 (dev)
├── Firebase Project: failshare-dev
├── データベース: 開発用データ
├── 認証: 開発用設定
└── ホスティング: 開発用URL

ステージング環境 (staging)
├── Firebase Project: failshare-staging
├── データベース: テスト用データ
├── 認証: 本番同等設定
└── ホスティング: ステージング用URL

本番環境 (production)
├── Firebase Project: failshare-prod
├── データベース: 本番データ
├── 認証: 本番設定
└── ホスティング: 本番URL
```

---

## 🔧 開発環境セットアップ

### 前提条件
- Node.js 18+
- npm または yarn
- Expo CLI
- Firebase CLI
- Git

### セットアップ手順

#### 1. リポジトリのクローン
```bash
git clone https://github.com/your-username/FailShare.git
cd FailShare/mobile
```

#### 2. 依存関係のインストール
```bash
npm install
```

#### 3. 環境変数の設定
```bash
# 環境変数テンプレートをコピー
cp .env.example .env

# .envファイルを編集
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_ENVIRONMENT=development
```

#### 4. Firebase CLIのセットアップ
```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトの初期化
firebase init
```

#### 5. 開発サーバーの起動
```bash
# 開発サーバー起動
npm start

# または環境別起動
npm run start:dev
```

---

## 🚀 デプロイ手順

### Firebase Hosting デプロイ

#### 1. Web版ビルド
```bash
# 開発環境
npm run build:web:dev

# ステージング環境
npm run build:web:staging

# 本番環境
npm run build:web:prod
```

#### 2. Firebase Hosting デプロイ
```bash
# 開発環境
firebase use failshare-dev
firebase deploy --only hosting

# ステージング環境
firebase use failshare-staging
firebase deploy --only hosting

# 本番環境
firebase use failshare-prod
firebase deploy --only hosting
```

### Google Cloud Run デプロイ

#### 1. Dockerイメージのビルド
```bash
# 開発環境
docker build -t failshare-dev .

# ステージング環境
docker build -t failshare-staging .

# 本番環境
docker build -t failshare-prod .
```

#### 2. Cloud Run デプロイ
```bash
# 開発環境
gcloud run deploy failshare-dev \
  --image gcr.io/your-project/failshare-dev \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated

# ステージング環境
gcloud run deploy failshare-staging \
  --image gcr.io/your-project/failshare-staging \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated

# 本番環境
gcloud run deploy failshare-prod \
  --image gcr.io/your-project/failshare-prod \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated
```

---

## 📊 監視・運用

### Firebase Console 監視

#### 1. Firestore使用量監視
```
Firebase Console → プロジェクト → Firestore Database → 使用状況
```
- 日次・月次の読み取り・書き込み・削除回数
- リアルタイム接続数
- エラー率とレイテンシー

#### 2. Authentication監視
```
Firebase Console → プロジェクト → Authentication → ユーザー
```
- アクティブユーザー数
- 認証方法別統計
- セキュリティイベント

#### 3. Hosting監視
```
Firebase Console → プロジェクト → Hosting → 使用状況
```
- ページビュー数
- 帯域幅使用量
- エラー率

### Google Cloud Console 監視

#### 1. Cloud Monitoring
```
Google Cloud Console → Monitoring → ダッシュボード
```
- アプリケーションパフォーマンス
- エラー率とレイテンシー
- リソース使用量

#### 2. Cloud Logging
```
Google Cloud Console → Logging → ログビューア
```
- アプリケーションログ
- エラーログ
- セキュリティログ

#### 3. Billing監視
```
Google Cloud Console → Billing → 予算とアラート
```
- 月次使用量
- コスト予測
- 予算アラート

---

## 🔒 セキュリティ設定

### Firestoreセキュリティルール

#### 1. ルールのデプロイ
```bash
# セキュリティルールのデプロイ
firebase deploy --only firestore:rules

# インデックスのデプロイ
firebase deploy --only firestore:indexes
```

#### 2. ルールの確認
```bash
# ルールのテスト
firebase emulators:start --only firestore
```

### 環境変数の管理

#### 1. 機密情報の管理
```bash
# 環境変数の暗号化
gcloud kms encrypt \
  --key your-key \
  --keyring your-keyring \
  --location asia-northeast1 \
  --plaintext-file .env \
  --ciphertext-file .env.encrypted
```

#### 2. シークレット管理
```bash
# Google Secret Managerの使用
gcloud secrets create firebase-config \
  --data-file .env \
  --replication-policy automatic
```

---

## 📈 パフォーマンス最適化

### リアルタイムリスナー管理

#### 1. リスナー数の監視
```typescript
// 開発環境での統計表示
setInterval(() => {
  const stats = realtimeManager.getListenerStats();
  console.log('📊 リアルタイムリスナー統計:', stats);
}, 30000);
```

#### 2. 自動停止機能
```typescript
// 機能別の自動停止設定
features: {
  comments: { autoStopTimeout: 3 * 60 * 1000 }, // 3分
  likes: { autoStopTimeout: 2 * 60 * 1000 },    // 2分
  friends: { autoStopTimeout: 10 * 60 * 1000 }, // 10分
}
```

### キャッシュ戦略

#### 1. 機能別キャッシュ設定
```typescript
export const cacheConfigs = {
  stories: { defaultTTL: 5 * 60 * 1000, maxSize: 200 },    // 5分
  comments: { defaultTTL: 3 * 60 * 1000, maxSize: 500 },   // 3分
  likes: { defaultTTL: 2 * 60 * 1000, maxSize: 300 },      // 2分
  users: { defaultTTL: 10 * 60 * 1000, maxSize: 100 }      // 10分
};
```

---

## 🚨 トラブルシューティング

### よくある問題と解決策

#### 1. Firebase接続エラー
```bash
# Firebase CLIの再認証
firebase logout
firebase login

# プロジェクトの再設定
firebase use --add
```

#### 2. ビルドエラー
```bash
# 依存関係のクリーンアップ
rm -rf node_modules
npm install

# キャッシュのクリア
npm start -- --clear
```

#### 3. デプロイエラー
```bash
# デプロイ前の確認
firebase deploy --dry-run

# 特定のサービスのみデプロイ
firebase deploy --only hosting,firestore:rules
```

### ログの確認方法

#### 1. アプリケーションログ
```bash
# Cloud Run ログの確認
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 50 \
  --format "table(timestamp,severity,textPayload)"
```

#### 2. Firebaseログ
```
Firebase Console → プロジェクト → Functions → ログ
```

---

## 📝 運用チェックリスト

### 日次チェック
- [ ] Firebase使用量の確認
- [ ] エラーログの確認
- [ ] パフォーマンス指標の確認
- [ ] セキュリティイベントの確認

### 週次チェック
- [ ] バックアップの確認
- [ ] セキュリティアップデートの確認
- [ ] コスト分析の確認
- [ ] ユーザー統計の確認

### 月次チェック
- [ ] インフラストラクチャの見直し
- [ ] セキュリティ監査
- [ ] パフォーマンス最適化
- [ ] ドキュメントの更新

---

## 🔗 関連ドキュメント

- **[セキュリティポリシー](./06_SecurityPolicy.md)**
- **[API仕様](./07_APIReference.md)**
- **[データベース設計](./09_DatabaseSchema.md)**

---

## 📞 サポート

### 緊急時連絡先
- **技術的な問題**: GitHub Issues
- **セキュリティ問題**: セキュリティチーム
- **運用問題**: 運用チーム

### ドキュメント更新
- **手順の追加・修正**: GitHub Pull Requests
- **情報の改善**: GitHub Issues
