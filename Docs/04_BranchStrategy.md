# FailShare ブランチ戦略

## 概要

FailShareプロジェクトの継続的な開発とデプロイを支援するためのブランチ戦略について検討し、推奨アプローチを提案します。

## 現在の状況

### プロジェクト状況
- **Phase 1**: 完了 (MVP完成)
- **開発形態**: 個人開発（将来的にチーム開発予定）
- **技術スタック**: React Native + Expo, TypeScript, Firebase
- **デプロイ環境**: 開発環境のみ（本番環境準備中）

### 開発フロー要件
- **機能開発**: 新機能の安全な開発・統合
- **バグ修正**: 迅速な修正とデプロイ
- **実験的機能**: 影響範囲を限定した試験的開発
- **リリース管理**: 安定したリリースサイクル

## ブランチ戦略の選択肢

### 1. Git Flow

#### 概要
- 5つのブランチタイプ: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`
- 長期間のブランチ保持
- 明確な役割分担

#### メリット
- **明確な役割分担**: 各ブランチの目的が明確
- **安定性**: 本番環境の安定性を保証
- **リリース管理**: 計画的なリリース管理が可能
- **チーム開発**: 大規模チームでの並行開発に適している

#### デメリット
- **複雑性**: ブランチ操作が複雑
- **個人開発**: 小規模プロジェクトでは過剰
- **CI/CD**: 継続的デプロイには向かない

#### 適用シナリオ
- 大規模チーム開発
- 計画的なリリーススケジュール
- 高い安定性要求

### 2. GitHub Flow

#### 概要
- 2つのブランチタイプ: `main`, `feature/*`
- 短期間のブランチ保持
- 継続的デプロイ指向

#### メリット
- **シンプル**: 理解しやすい構造
- **継続的デプロイ**: CI/CDに最適
- **迅速な開発**: 素早い機能リリース
- **個人開発**: 小規模プロジェクトに適している

#### デメリット
- **リリース管理**: 計画的リリースが困難
- **安定性**: 本番環境の安定性リスク
- **機能統合**: 複数機能の統合が複雑

#### 適用シナリオ
- 小規模チーム・個人開発
- 継続的デプロイ環境
- 迅速な開発サイクル

### 3. GitLab Flow

#### 概要
- 環境別ブランチ: `main`, `pre-production`, `production`
- 機能ブランチ: `feature/*`
- 環境指向のワークフロー

#### メリット
- **環境管理**: 環境ごとの明確な管理
- **柔軟性**: 様々な開発スタイルに対応
- **安定性**: 段階的なデプロイで安定性確保
- **CI/CD**: 継続的デプロイにも対応

#### デメリット
- **複雑性**: 環境管理の複雑さ
- **学習コスト**: 理解に時間が必要
- **ツール依存**: GitLab固有の機能に依存

#### 適用シナリオ
- 複数環境での運用
- 段階的デプロイ要求
- 中規模チーム開発

## FailShare推奨戦略

### Phase 1-2 (現在～Phase 2): Modified GitHub Flow

#### 戦略概要
GitHub Flowをベースに、FailShareの要件に合わせてカスタマイズ

#### ブランチ構成
```
main (本番環境)
├── develop (開発環境) - 新規追加
├── feature/phase-2-comments (機能開発)
├── feature/search-enhancement (機能開発)
├── hotfix/login-bug (緊急修正)
└── experiment/new-ui (実験的機能)
```

#### ブランチ詳細

**1. main ブランチ**
- **目的**: 本番環境デプロイ用
- **保護**: 直接プッシュ禁止
- **マージ**: Pull Request経由のみ
- **品質**: 自動テスト + コードレビュー必須

**2. develop ブランチ**
- **目的**: 開発環境・統合テスト用
- **更新**: 定期的に feature ブランチをマージ
- **テスト**: 統合テストの実行環境
- **安定性**: main より緩い品質基準

**3. feature/* ブランチ**
- **命名**: `feature/phase-2-comments`, `feature/search-enhancement`
- **期間**: 短期間（1-2週間）
- **基準**: develop ブランチから分岐
- **マージ**: develop → main の順序

**4. hotfix/* ブランチ**
- **命名**: `hotfix/critical-bug-fix`
- **期間**: 緊急（数時間～1日）
- **基準**: main ブランチから分岐
- **マージ**: main と develop の両方

**5. experiment/* ブランチ**
- **命名**: `experiment/new-ui-design`
- **期間**: 可変（実験期間による）
- **基準**: develop ブランチから分岐
- **マージ**: 実験成功時のみ

### ワークフロー

#### 1. 機能開発フロー
```bash
# 1. 開発開始
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. 開発・コミット
git add .
git commit -m "feat: implement new feature"
git push origin feature/new-feature

# 3. Pull Request作成
# GitHub: feature/new-feature → develop

# 4. レビュー・マージ後
git checkout develop
git pull origin develop
git branch -d feature/new-feature

# 5. 本番デプロイ準備
# GitHub: develop → main (定期的)
```

#### 2. 緊急修正フロー
```bash
# 1. 緊急修正開始
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. 修正・テスト
git add .
git commit -m "fix: resolve critical issue"
git push origin hotfix/critical-fix

# 3. 即座にマージ
# GitHub: hotfix/critical-fix → main
# GitHub: hotfix/critical-fix → develop

# 4. 緊急デプロイ
# main ブランチから本番環境へデプロイ
```

### ブランチ保護ルール

#### main ブランチ
- **直接プッシュ**: 禁止
- **Pull Request**: 必須
- **レビュー**: 必須（将来的に）
- **ステータスチェック**: 必須
  - 自動テスト合格
  - ビルド成功
  - 型チェック合格

#### develop ブランチ
- **直接プッシュ**: 禁止
- **Pull Request**: 必須
- **レビュー**: 推奨
- **ステータスチェック**: 必須
  - 自動テスト合格
  - ビルド成功

### コミットメッセージ規約

#### Conventional Commits採用
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### タイプ一覧
- **feat**: 新機能追加
- **fix**: バグ修正
- **docs**: ドキュメント更新
- **style**: コードフォーマット
- **refactor**: リファクタリング
- **test**: テスト追加・修正
- **chore**: その他の変更

#### 例
```
feat(auth): add password reset functionality

Implement password reset feature with email verification.
User can request password reset from login screen.

Closes #123
```

### Phase 3以降: チーム開発への移行

#### 移行計画
1. **Phase 2完了時**: チームメンバー参加開始
2. **レビュー体制**: コードレビュー必須化
3. **ブランチ権限**: 管理者権限の設定
4. **自動化**: CI/CDパイプライン完全自動化

#### 移行時の調整事項
- **Git Flow導入**: より厳密なリリース管理
- **リリースブランチ**: 計画的リリース対応
- **権限管理**: ブランチ保護の強化
- **自動テスト**: カバレッジ向上

## 実装手順

### Phase 1: 基本ブランチ構成

#### 1. develop ブランチ作成
```bash
# 現在のmainから develop作成
git checkout main
git checkout -b develop
git push origin develop
```

#### 2. GitHub設定
- **ブランチ保護**: main, develop ブランチ
- **デフォルトブランチ**: develop に変更
- **Pull Request**: テンプレート作成

#### 3. 既存作業の移行
```bash
# 現在の作業を develop に移行
git checkout develop
git merge main
git push origin develop
```

### Phase 2: ワークフロー定着

#### 1. 機能開発での実践
- 次の機能開発で新ワークフローを実践
- Pull Request作成・マージの経験
- コミットメッセージ規約の習慣化

#### 2. 自動化の段階的導入
- GitHub Actions設定
- 自動テスト実行
- 自動デプロイ準備

### Phase 3: 本格運用

#### 1. チーム開発準備
- コードレビュー体制
- ブランチ権限管理
- 開発ガイドライン整備

#### 2. 継続的改善
- ワークフロー効率化
- ツール最適化
- プロセス改善

## ツール・統合

### GitHub設定

#### 1. Branch Protection Rules
```yaml
# main ブランチ
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict pushes that create files larger than 100MB

# develop ブランチ
- Require pull request reviews before merging (optional)
- Require status checks to pass before merging
- Restrict pushes that create files larger than 100MB
```

#### 2. Pull Request Template
```markdown
## 概要
<!-- 変更の概要を記載 -->

## 変更内容
- [ ] 新機能追加
- [ ] バグ修正
- [ ] リファクタリング
- [ ] ドキュメント更新

## テスト
- [ ] ユニットテスト追加
- [ ] 手動テスト実施
- [ ] 既存テストの確認

## スクリーンショット
<!-- UIに関する変更の場合、スクリーンショットを添付 -->

## 関連Issue
<!-- 関連するIssueがある場合、番号を記載 -->
Closes #

## チェックリスト
- [ ] コードレビュー準備完了
- [ ] テスト実行済み
- [ ] ドキュメント更新済み
```

### VS Code設定

#### 1. Git拡張
- **GitLens**: コミット履歴の可視化
- **Git Graph**: ブランチの可視化
- **GitHub Pull Requests**: PR管理

#### 2. コミットメッセージ支援
```json
{
  "git.inputValidation": "always",
  "git.inputValidationLength": 50,
  "gitlens.advanced.messages": {
    "suppressCommitHasNoPreviousCommitWarning": false
  }
}
```

## 成功指標

### Phase 1 (1ヶ月)
- **ブランチ構成**: main, develop ブランチ運用開始
- **Pull Request**: 100%の変更でPR経由
- **コミット規約**: Conventional Commits 80%準拠

### Phase 2 (2ヶ月)
- **自動テスト**: PR作成時の自動実行
- **デプロイ**: develop → main の自動デプロイ
- **コードレビュー**: 重要な変更でレビュー実施

### Phase 3 (3ヶ月)
- **チーム開発**: 複数人でのブランチ運用
- **リリース管理**: 計画的なリリースサイクル
- **継続的改善**: 月次でプロセス改善

## 注意事項・リスク

### 注意事項
1. **学習コスト**: 新しいワークフローの習得時間
2. **ツール設定**: GitHub設定の適切な構成
3. **習慣化**: コミットメッセージ規約の定着
4. **バックアップ**: 重要なブランチの保護

### リスク管理
1. **ブランチ削除**: 誤った削除の防止策
2. **コンフリクト**: マージコンフリクトの解決手順
3. **データ損失**: 定期的なバックアップ
4. **権限管理**: 適切なアクセス制御

## 参考資料

### 公式ドキュメント
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [GitLab Flow](https://docs.gitlab.com/ee/topics/gitlab_flow.html)

### ベストプラクティス
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)

---

**このブランチ戦略は、FailShareの成長に合わせて段階的に進化させる設計になっています。Phase 1では基本的な構成から始めて、チーム開発への移行時により厳密な管理に発展させる計画です。** 