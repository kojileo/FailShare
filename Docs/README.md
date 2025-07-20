# FailShare ドキュメント

失敗を成長の糧に変える、匿名で安全な学び合いコミュニティのWebアプリケーション プロジェクトドキュメント集です。

## 📋 ドキュメント構成

### 🎯 プロジェクト基本情報
- **[01_AppConcept.md](./01_AppConcept.md)** - アプリのコンセプト・目的・機能概要
- **[02_TechChoice.md](./02_TechChoice.md)** - 技術スタック選択の背景・理由
- **[03_DevelopmentProgress.md](./03_DevelopmentProgress.md)** - 開発進捗・実装詳細・成果

### 🔧 開発・運用プロセス
- **[04_BranchStrategy.md](./04_BranchStrategy.md)** - Git ブランチ戦略・ワークフロー
- **[05_TestingStrategy.md](./05_TestingStrategy.md)** - テスト戦略・品質保証
- **[06_DeploymentStrategy.md](./06_DeploymentStrategy.md)** - マルチプラットフォーム デプロイ戦略

### 🚀 デプロイメント・運用
- **[08_WebDeploymentGuide.md](./08_WebDeploymentGuide.md)** - Web/Cloud Run デプロイ完全ガイド
- **[09_FirebaseEnvironmentSetup.md](./09_FirebaseEnvironmentSetup.md)** - Firebase環境分離設定手順
- **[10_GitHubActionsDeployment.md](./10_GitHubActionsDeployment.md)** - **NEW** GitHub Actions CI/CD設定

### 🛡️ セキュリティ・プライバシー
- **[07_AnonymousUserDataManagement.md](./07_AnonymousUserDataManagement.md)** - 匿名ユーザーデータ管理・プライバシー保護

## 🎉 最新の重要更新（2025年1月）

### ✅ 完了済み
- **Web-Firstアプローチ**: React Native Web による完全なWeb配信
- **Cloud Run デプロイ**: Docker + 自動CI/CD
- **Firebase統合**: 認証・データベース動作確認
- **本番環境運用**: スケーラブル・高可用性なWeb配信
- **全デバイス対応**: PC・タブレット・スマートフォン完全レスポンシブ

### 📈 プロジェクト状況
```
Phase 0: 開発環境構築  ✅ 完了
Phase 1: MVP開発      ✅ 完了  
Phase 2: Web対応      ✅ 完了 (NEW!)
```

## 🔗 関連リンク

### 📂 プロジェクト構成
```
FailShare/
├── Docs/                    # 📚 プロジェクトドキュメント
├── mobile/                  # 🌐 React Native Web アプリケーション
│   ├── src/                 # ソースコード
│   ├── Dockerfile           # コンテナ設定
│   ├── server.js            # Web サーバー
│   └── README.md            # 開発者向けクイックスタート
└── README.md                # プロジェクトトップ
```

### 🌐 本番環境
- **Web アプリ**: Cloud Run (`https://failshare-web-xxx.a.run.app`)
- **Firebase**: `failshare-app` プロジェクト
- **監視**: Cloud Run メトリクス + ログ

### 📱 開発環境
- **ローカル Web**: `http://localhost:19006`
- **ローカル開発**: Metro bundler + HMR
- **Firebase**: development profile

## 📖 読み進め方

### 🚀 新規参加者向け
1. [01_AppConcept.md](./01_AppConcept.md) - プロジェクト理解
2. [02_TechChoice.md](./02_TechChoice.md) - 技術背景
3. [mobile/README.md](../mobile/README.md) - 開発環境構築

### 🔧 デプロイ・運用担当者向け
1. [06_DeploymentStrategy.md](./06_DeploymentStrategy.md) - 全体戦略
2. [09_FirebaseEnvironmentSetup.md](./09_FirebaseEnvironmentSetup.md) - Firebase環境分離
3. [10_GitHubActionsDeployment.md](./10_GitHubActionsDeployment.md) - GitHub Actions CI/CD
4. [08_WebDeploymentGuide.md](./08_WebDeploymentGuide.md) - Cloud Run実践手順
5. [03_DevelopmentProgress.md](./03_DevelopmentProgress.md) - 技術実装詳細

### 📋 プロジェクト管理者向け
1. [03_DevelopmentProgress.md](./03_DevelopmentProgress.md) - 進捗状況
2. [04_BranchStrategy.md](./04_BranchStrategy.md) - 開発フロー
3. [05_TestingStrategy.md](./05_TestingStrategy.md) - 品質管理

---

**🌟 FailShare プロジェクト**: 失敗を学びに変え、みんなで成長していくコミュニティを目指しています。 