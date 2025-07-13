# FailShare - 失敗を成長の糧に変える学び合いコミュニティ

失敗を恥ずかしい秘密ではなく、価値ある学習リソースとして捉え直し、みんなで共有し支え合うことで成長を促進するプラットフォームです。

## プロジェクト概要

### 核となる価値提案
**「失敗を成長の糧に変える、匿名で安全な学び合いコミュニティ」**

失敗の痛みを乗り越えて、次のステップへ進む勇気を与えるアプリケーションです。

### 主要機能
- **匿名投稿**: 完全匿名で身バレしない安全な失敗談共有
- **構造化テンプレート**: 状況・行動・結果・学びの4段階での振り返り
- **共感・支援機能**: 建設的なアドバイスと励ましのコミュニティ
- **検索・発見機能**: 関連する失敗事例の検索と学習

## プロジェクト構造

```
FailShare/
├── Docs/                 # プロジェクトドキュメント
│   ├── 01_AppConcept.md  # アプリコンセプト詳細
│   └── 02_TechChoice.md  # 技術選定
├── mobile/               # React Native + Expo モバイルアプリ
│   ├── src/
│   │   ├── components/   # 共通コンポーネント
│   │   ├── screens/      # 画面コンポーネント
│   │   ├── navigation/   # ナビゲーション設定
│   │   ├── stores/       # Zustand状態管理
│   │   ├── services/     # Firebase等のサービス
│   │   ├── types/        # TypeScript型定義
│   │   └── utils/        # ユーティリティ関数
│   ├── assets/          # 画像・アイコン等
│   └── README.md        # モバイルアプリ開発ガイド
└── README.md            # このファイル
```

## 技術スタック

### モバイルアプリ
- **フロントエンド**: React Native + Expo
- **言語**: TypeScript
- **状態管理**: Zustand
- **データフェッチング**: SWR
- **UIライブラリ**: React Native Paper
- **ナビゲーション**: React Navigation

### バックエンド
- **BaaS**: Firebase
- **認証**: Firebase Authentication
- **データベース**: Cloud Firestore
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