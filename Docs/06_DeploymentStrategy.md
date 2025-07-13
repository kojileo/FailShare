# FailShare デプロイ戦略

## 概要

FailShareプロジェクトの安全で効率的なデプロイメントを実現するための包括的なデプロイ戦略を定義します。

## 現在の状況

### プロジェクト状況
- **Phase 1**: 完了 (MVP完成)
- **技術スタック**: React Native + Expo, TypeScript, Firebase
- **デプロイ現状**: 開発環境のみ
- **デプロイ課題**: 手動デプロイ、環境分離なし

### デプロイ要件
- **安全性**: 本番環境の安定性確保
- **効率性**: 迅速なデプロイサイクル
- **品質保証**: 自動化されたテスト実行
- **モニタリング**: デプロイ後の監視体制

## デプロイ環境構成

### 環境戦略

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │    Staging      │    │   Production    │
│                 │    │                 │    │                 │
│ • 開発・テスト  │───▶│ • 統合テスト    │───▶│ • 本番運用      │
│ • 機能実装      │    │ • UAT           │    │ • エンドユーザー│
│ • バグ修正      │    │ • パフォーマンス│    │ • 高可用性      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 1. Development Environment
- **目的**: 開発・機能テスト・バグ修正
- **更新頻度**: 毎回のコミット・プッシュ
- **品質基準**: 基本的な動作確認
- **アクセス**: 開発者のみ

#### 2. Staging Environment
- **目的**: 統合テスト・UAT・パフォーマンステスト
- **更新頻度**: 機能完成・PR マージ時
- **品質基準**: 本番環境と同等
- **アクセス**: 開発者・テスター・ステークホルダー

#### 3. Production Environment
- **目的**: 本番運用・エンドユーザー向け
- **更新頻度**: 計画的なリリース
- **品質基準**: 最高品質・高可用性
- **アクセス**: エンドユーザー

## Firebase環境構成

### Firebase Projects Structure

```
failshare-dev (開発環境)
├── Authentication
├── Firestore Database
├── Storage
└── Functions

failshare-staging (ステージング環境)
├── Authentication
├── Firestore Database
├── Storage
└── Functions

failshare-prod (本番環境)
├── Authentication
├── Firestore Database
├── Storage
└── Functions
```

### 環境変数管理

#### 1. Development (.env.development)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=dev-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=failshare-dev.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=failshare-dev
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=failshare-dev.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=dev-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=dev-app-id
EXPO_PUBLIC_ENVIRONMENT=development
```

#### 2. Staging (.env.staging)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=staging-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=failshare-staging.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=failshare-staging
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=failshare-staging.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=staging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=staging-app-id
EXPO_PUBLIC_ENVIRONMENT=staging
```

#### 3. Production (.env.production)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=prod-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=failshare-prod.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=failshare-prod
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=failshare-prod.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=prod-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=prod-app-id
EXPO_PUBLIC_ENVIRONMENT=production
```

## EAS (Expo Application Services) 構成

### EAS Build Configuration

#### eas.json
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "ENVIRONMENT": "development"
      }
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "ENVIRONMENT": "staging"
      }
    },
    "production": {
      "distribution": "store",
      "env": {
        "ENVIRONMENT": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "developer@failshare.app",
        "ascAppId": "app-store-connect-id",
        "appleTeamId": "team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "production"
      }
    }
  }
}
```

### App Configuration

#### app.config.js
```javascript
const getConfig = () => {
  const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
  
  const baseConfig = {
    expo: {
      name: 'FailShare',
      slug: 'failshare',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'light',
      splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
      },
      platforms: ['ios', 'android'],
      assetBundlePatterns: ['**/*'],
      ios: {
        supportsTablet: true,
        bundleIdentifier: getBundleIdentifier(environment)
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#FFFFFF'
        },
        package: getPackageName(environment)
      },
      web: {
        favicon: './assets/favicon.png'
      }
    }
  };

  // Environment-specific configurations
  if (environment === 'development') {
    baseConfig.expo.name = 'FailShare (Dev)';
    baseConfig.expo.icon = './assets/icon-dev.png';
  } else if (environment === 'staging') {
    baseConfig.expo.name = 'FailShare (Staging)';
    baseConfig.expo.icon = './assets/icon-staging.png';
  }

  return baseConfig;
};

const getBundleIdentifier = (environment) => {
  const base = 'com.failshare';
  if (environment === 'development') return `${base}.dev`;
  if (environment === 'staging') return `${base}.staging`;
  return base;
};

const getPackageName = (environment) => {
  const base = 'com.failshare';
  if (environment === 'development') return `${base}.dev`;
  if (environment === 'staging') return `${base}.staging`;
  return base;
};

export default getConfig();
```

## CI/CD パイプライン

### GitHub Actions Workflow

#### .github/workflows/deploy.yml
```yaml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
  FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Type check
        run: npm run type-check

  build-development:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build development app
        run: |
          expo build:android --profile development --non-interactive
          expo build:ios --profile development --non-interactive
      
      - name: Deploy to Firebase (Development)
        run: |
          npm install -g firebase-tools
          firebase use failshare-dev --token ${{ secrets.FIREBASE_TOKEN }}
          firebase deploy --only firestore:rules,storage:rules --token ${{ secrets.FIREBASE_TOKEN }}

  build-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build staging app
        run: |
          expo build:android --profile staging --non-interactive
          expo build:ios --profile staging --non-interactive
      
      - name: Deploy to Firebase (Staging)
        run: |
          npm install -g firebase-tools
          firebase use failshare-staging --token ${{ secrets.FIREBASE_TOKEN }}
          firebase deploy --only firestore:rules,storage:rules --token ${{ secrets.FIREBASE_TOKEN }}
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Notify staging deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  deploy-production:
    needs: build-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build production app
        run: |
          expo build:android --profile production --non-interactive
          expo build:ios --profile production --non-interactive
      
      - name: Deploy to Firebase (Production)
        run: |
          npm install -g firebase-tools
          firebase use failshare-prod --token ${{ secrets.FIREBASE_TOKEN }}
          firebase deploy --only firestore:rules,storage:rules --token ${{ secrets.FIREBASE_TOKEN }}
      
      - name: Submit to App Stores
        run: |
          expo submit:android --profile production --non-interactive
          expo submit:ios --profile production --non-interactive
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
      
      - name: Notify production deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### デプロイメント戦略

#### 1. Blue-Green Deployment

```yaml
# Blue-Green デプロイメント戦略
blue-green-deploy:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to Blue Environment
      run: |
        # Blue環境にデプロイ
        firebase use failshare-blue --token ${{ secrets.FIREBASE_TOKEN }}
        firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
    
    - name: Run Health Checks
      run: |
        # ヘルスチェック実行
        curl -f https://failshare-blue.web.app/health
    
    - name: Switch Traffic to Blue
      run: |
        # トラフィックをBlue環境に切り替え
        firebase hosting:channel:deploy production --expires 1h --token ${{ secrets.FIREBASE_TOKEN }}
    
    - name: Cleanup Green Environment
      run: |
        # 古いGreen環境のクリーンアップ
        firebase use failshare-green --token ${{ secrets.FIREBASE_TOKEN }}
        firebase hosting:channel:delete production --token ${{ secrets.FIREBASE_TOKEN }}
```

#### 2. Canary Deployment

```yaml
# Canary デプロイメント戦略
canary-deploy:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy Canary Version
      run: |
        # Canary版をデプロイ
        expo publish --release-channel canary
    
    - name: Monitor Canary Metrics
      run: |
        # Canary版のメトリクスを監視
        node scripts/monitor-canary.js
    
    - name: Promote to Production
      if: success()
      run: |
        # 成功時は本番環境にプロモート
        expo publish --release-channel production
```

## Over-the-Air (OTA) Updates

### OTA Update Strategy

#### 1. 即座のバグ修正
```bash
# 緊急バグ修正のOTA
expo publish --release-channel production --message "Critical bug fix"
```

#### 2. 段階的ロールアウト
```bash
# 段階的な機能リリース
expo publish --release-channel production-10 --message "New feature - 10% rollout"
expo publish --release-channel production-50 --message "New feature - 50% rollout"
expo publish --release-channel production --message "New feature - full rollout"
```

#### 3. A/B テスト
```javascript
// A/B テストのためのOTA設定
const getUpdateChannel = (userId) => {
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return hash % 2 === 0 ? 'production-a' : 'production-b';
};
```

## モニタリングとアラート

### 1. Application Monitoring

#### Firebase Performance Monitoring
```javascript
// Performance監視の設定
import perf from '@react-native-firebase/perf';

const trace = perf().newTrace('story_creation');
trace.start();

// 失敗談作成処理
await storyService.createStory(data);

trace.stop();
```

#### Crashlytics
```javascript
// クラッシュレポートの設定
import crashlytics from '@react-native-firebase/crashlytics';

crashlytics().recordError(new Error('Story creation failed'));
```

### 2. Infrastructure Monitoring

#### Firebase Alerts
```json
{
  "alertPolicy": {
    "displayName": "High Error Rate",
    "conditions": [
      {
        "displayName": "Error rate > 5%",
        "conditionThreshold": {
          "filter": "resource.type=\"cloud_function\"",
          "comparison": "COMPARISON_GREATER_THAN",
          "thresholdValue": 0.05
        }
      }
    ],
    "notificationChannels": ["projects/failshare-prod/notificationChannels/slack"]
  }
}
```

### 3. Custom Metrics

#### アプリケーション健全性指標
```javascript
// カスタムメトリクスの実装
const logCustomMetric = (name, value) => {
  analytics().logEvent(name, {
    value: value,
    timestamp: Date.now(),
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT
  });
};

// 使用例
logCustomMetric('story_creation_success', 1);
logCustomMetric('search_response_time', responseTime);
```

## ロールバック戦略

### 1. 自動ロールバック

#### GitHub Actions自動ロールバック
```yaml
rollback:
  runs-on: ubuntu-latest
  if: failure()
  steps:
    - name: Rollback to Previous Version
      run: |
        # 前のバージョンにロールバック
        expo publish --release-channel production --message "Automatic rollback"
        
    - name: Notify Rollback
      uses: 8398a7/action-slack@v3
      with:
        status: "warning"
        text: "Automatic rollback triggered"
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. 手動ロールバック

#### 緊急時のロールバック手順
```bash
# 1. 現在のバージョンを確認
expo publish:history

# 2. 前のバージョンを特定
expo publish:rollback --release-channel production --sdk-version 49.0.0

# 3. Firebase設定のロールバック
firebase use failshare-prod
firebase deploy --only firestore:rules,storage:rules

# 4. ヘルスチェック
curl -f https://failshare-prod.web.app/health
```

## セキュリティ対策

### 1. 環境変数保護

#### GitHub Secrets管理
```yaml
# GitHub Secretsの設定
secrets:
  EXPO_TOKEN: "expo-token"
  FIREBASE_TOKEN: "firebase-token"
  SLACK_WEBHOOK: "slack-webhook-url"
  GOOGLE_SERVICES_JSON: "base64-encoded-google-services.json"
  APPLE_ID: "apple-developer-id"
  APPLE_PASSWORD: "app-specific-password"
```

### 2. Firebase Security Rules

#### Production環境のセキュリティ強化
```javascript
// Firestore Security Rules (Production)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stories/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.uid == resource.data.authorId
        && validateStoryData(request.resource.data);
    }
    
    match /anonymousUsers/{document} {
      allow read, write: if request.auth != null 
        && request.auth.uid == document;
    }
  }
}
```

### 3. アプリケーションセキュリティ

#### Code Signing
```bash
# iOS Code Signing
expo build:ios --profile production --clear-credentials

# Android App Signing
expo build:android --profile production --clear-credentials
```

## 実装スケジュール

### Phase 1: 基本デプロイ環境 (1ヶ月)
- [ ] Firebase環境分離
- [ ] EAS設定
- [ ] 基本的な手動デプロイ
- [ ] 環境変数管理

### Phase 2: CI/CD自動化 (2ヶ月)
- [ ] GitHub Actions設定
- [ ] 自動テスト統合
- [ ] 自動デプロイ
- [ ] 基本的なモニタリング

### Phase 3: 高度なデプロイ戦略 (3ヶ月)
- [ ] Blue-Green デプロイメント
- [ ] Canary リリース
- [ ] OTA Updates
- [ ] 包括的なモニタリング

### Phase 4: エンタープライズ対応 (4ヶ月)
- [ ] 高可用性設定
- [ ] 災害復旧計画
- [ ] 高度なセキュリティ
- [ ] パフォーマンス最適化

## 運用手順

### 1. 日常的なデプロイ

#### 開発環境への自動デプロイ
```bash
# developブランチへのプッシュで自動実行
git push origin develop
```

#### ステージング環境への手動デプロイ
```bash
# mainブランチへのマージで自動実行
git checkout main
git merge develop
git push origin main
```

### 2. 本番環境リリース

#### 本番リリース手順
```bash
# 1. バージョンタグの作成
git tag v1.0.0
git push origin v1.0.0

# 2. 自動デプロイが開始される
# 3. App Store/Google Play Store へのsubmit

# 4. リリース確認
curl -f https://failshare-prod.web.app/health
```

### 3. 緊急時対応

#### 緊急修正フロー
```bash
# 1. hotfixブランチ作成
git checkout -b hotfix/critical-bug main

# 2. 修正実装
# 3. 緊急デプロイ
expo publish --release-channel production --message "Hotfix: Critical bug"

# 4. 修正のマージ
git checkout main
git merge hotfix/critical-bug
git push origin main
```

## 品質保証

### 1. デプロイ前チェック

#### 必須チェック項目
- [ ] 全テストが合格
- [ ] 型チェックが合格
- [ ] リンターが合格
- [ ] ビルドが成功
- [ ] セキュリティチェックが合格

### 2. デプロイ後チェック

#### 健全性確認
- [ ] アプリケーションが正常起動
- [ ] 主要機能が動作
- [ ] パフォーマンスが基準内
- [ ] エラー率が許容範囲内

### 3. 継続的監視

#### 監視指標
- **可用性**: 99.9%以上
- **レスポンス時間**: 2秒以内
- **エラー率**: 1%未満
- **クラッシュ率**: 0.1%未満

## 成功指標

### デプロイ効率
- **デプロイ頻度**: 週2回以上
- **デプロイ時間**: 15分以内
- **成功率**: 95%以上
- **ロールバック率**: 5%未満

### 品質指標
- **本番バグ**: 月1件未満
- **ダウンタイム**: 99.9%可用性
- **セキュリティ**: 脆弱性0件
- **パフォーマンス**: 基準値内

---

**このデプロイ戦略により、FailShareの安全で効率的なリリースサイクルを実現し、継続的な価値提供を可能にします。段階的な実装により、運用負荷を最小限に抑えながら、エンタープライズレベルのデプロイメント能力を構築できます。** 