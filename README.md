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