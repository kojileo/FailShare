# FailShare

失敗から学ぶコミュニティアプリ - 恋愛・人間関係の失敗談共有プラットフォーム

## 🎯 プロジェクト状況（2025年1月最新）

### ✅ **Phase 2完了: Production Ready**
- 🔥 **スクロール問題完全解決**: React Native Web制約を突破
- 🛡️ **管理者システム構築**: Firebase Admin SDK による安全なデータ管理
- 🏗️ **3段階環境構成**: Development → Staging → Production 
- 📦 **Docker安定化**: 依存関係競合問題の解決
- ✏️ **編集・削除機能**: ユーザーによる投稿管理
- 🎨 **Twitter風UI**: モダンで直感的なインターフェース

### 🚀 **運用可能状態**
```bash
# 本番環境データ投入
npm run seed-data:prod -- --confirm

# アプリ起動
npm start
```

## 📱 アプリ概要

### コア機能
- **失敗談投稿**: 恋愛・人間関係での失敗体験の共有
- **検索・フィルター**: カテゴリ・感情・テキストでの絞り込み
- **学びの共有**: 失敗から得た教訓の記録
- **匿名性**: プライバシーを保護した安全な共有
- **投稿管理**: 編集・削除機能による自分の投稿管理
- **共感表現**: いいね機能による感情的なサポート

### 対象ユーザー
- 恋愛で失敗した経験を持つ人
- 他人の失敗から学びたい人  
- 失敗を前向きに捉えたい人

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

### 1. 基本セットアップ
```bash
cd mobile
npm install
cp .env.example .env
# .envファイルにFirebase設定を追加
```

### 2. アプリ起動
```bash
npm start          # 開発サーバー起動
npm run web        # Webブラウザで表示
```

### 3. 管理者セットアップ（オプション）
```bash
# Firebase Admin キーを取得・配置
# mobile/config/firebase-admin-dev.json

# サンプルデータ投入
npm run seed-data:dev -- --confirm
```

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

詳細は `mobile/scripts/README.md` を参照

## 🔧 開発ガイド

### 主要ディレクトリ
```
mobile/
├── src/
│   ├── screens/     # 画面コンポーネント
│   ├── services/    # Firebase等のサービス
│   ├── stores/      # 状態管理（Zustand）
│   ├── types/       # TypeScript型定義
│   └── utils/       # ユーティリティ
├── scripts/         # 管理者スクリプト
├── config/          # 環境別設定ファイル
└── Docs/            # プロジェクトドキュメント
```

### 重要な解決済み問題
1. **スクロール問題**: React Native Web制約を HTML/CSS で解決
2. **認証エラー**: Firestore権限エラーの修正  
3. **Docker依存関係**: @types/react競合問題の解決
4. **管理体制**: サンプルデータの安全な投入システム
5. **UI/UX改善**: Twitter風インターフェースの実装

## 📋 ドキュメント

- [開発進捗記録](03_DevelopmentProgress.md)
- [技術選定](02_TechChoice.md)  
- [アプリコンセプト](01_AppConcept.md)
- [テスト戦略](05_TestingStrategy.md)

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
- 匿名認証システム
- 失敗談投稿機能（構造化テンプレート）
- 失敗談詳細表示・閲覧機能
- 検索・フィルタリング機能
- プロフィール機能（編集・削除）
- マイ投稿管理機能
- いいね機能

### 🔄 次期予定
- ユーザーテスト実施
- パフォーマンス最適化
- 本番環境デプロイ
- モニタリング体制構築
- コメント機能実装
- 高度な検索・分析機能
- メンタリング機能

## 🚀 技術的成果

### 開発効率
- **予定期間**: 3-4ヶ月
- **実際期間**: 1ヶ月
- **効率性**: 予定の3-4倍の速度で完了

### 機能カバレッジ
- **MVP必須機能**: 100% 完了
- **ユーザー体験**: 包括的なジャーニー実装
- **技術的品質**: 型安全性、エラーハンドリング完備

### コスト実績
- **開発時間**: 約20時間（5フェーズ合計）
- **金銭コスト**: 0円（Firebase無料枠内）
- **学習コスト**: 合理的（既存技術の効率的活用） 