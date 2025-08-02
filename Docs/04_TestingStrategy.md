# FailShare テスト戦略

## 🎯 テスト戦略の目的

### 品質保証目標
- **機能の正確性**: すべての機能が仕様通りに動作することを保証
- **リグレッション防止**: 新機能追加時に既存機能が破損しないことを確認
- **パフォーマンス保証**: アプリの応答性とパフォーマンスを維持
- **ユーザーエクスペリエンス**: エンドユーザーの視点でアプリ全体をテスト
- **エンゲージメント品質**: いいね・コメント・シェア機能の安定性確保
- **コミュニティ安全性**: フレンド・コミュニティ機能のプライバシー保護

### 対象範囲
- **ユニットテスト**: 個別関数・コンポーネントの動作
- **インテグレーションテスト**: コンポーネント間の連携
- **E2Eテスト**: エンドユーザーシナリオの完全テスト
- **エンゲージメントテスト**: いいね・コメント・シェア機能の統合テスト
- **コミュニティテスト**: フレンド・コミュニティ機能の統合テスト

---

## 📊 テストピラミッド

```
    🔺 E2E テスト (10%)
       ユーザーフロー・ブラウザテスト・エンゲージメント統合
    
  🔺🔺 インテグレーションテスト (20%)
     コンポーネント間連携・API統合・コミュニティ機能
     
🔺🔺🔺 ユニットテスト (70%)
   関数・コンポーネント・状態管理・エンゲージメントロジック
```

### テスト分散比率
- **ユニットテスト**: 70% - 高速・詳細・開発者フィードバック
- **インテグレーションテスト**: 20% - 中速・統合確認
- **E2Eテスト**: 10% - 低速・全体シナリオ確認

---

## 🛠️ 技術スタック

### ユニットテスト
- **Jest**: テストランナー・アサーション
- **React Native Testing Library**: コンポーネントテスト
- **Jest Native**: React Native専用マッチャー

### インテグレーションテスト
- **Jest + React Native Testing Library**: 画面レベルテスト
- **Firebase Emulator**: Firestore・Auth のモックテスト
- **MSW (Mock Service Worker)**: API モック

### E2Eテスト
- **Detox**: React Native アプリケーション E2E テスト
- **iOS Simulator / Android Emulator**: 実機環境シミュレーション

### エンゲージメントテスト
- **Firebase Emulator**: リアルタイム機能のテスト
- **Mock Service Worker**: Twitter API モック
- **React Native Animated**: アニメーション機能テスト

---

## 📁 テストファイル構成

```
mobile/
├── __tests__/
│   ├── unit/                    # ユニットテスト
│   │   ├── utils/              # ユーティリティ関数
│   │   ├── services/           # Firebase・API サービス
│   │   ├── stores/             # Zustand 状態管理
│   │   ├── components/         # 個別コンポーネント
│   │   └── engagement/         # エンゲージメント機能
│   │
│   ├── integration/            # インテグレーションテスト
│   │   ├── screens/           # 画面統合テスト
│   │   ├── navigation/        # ナビゲーションテスト
│   │   ├── workflows/         # ビジネスロジック統合
│   │   ├── engagement/        # エンゲージメント統合
│   │   └── community/         # コミュニティ機能統合
│   │
│   └── __mocks__/             # モックデータ・関数
│       ├── firebase.ts        # Firebase モック
│       ├── @react-navigation/ # ナビゲーションモック
│       ├── sampleData.ts      # テストデータ
│       └── twitter-api.ts     # Twitter API モック
│
├── e2e/                       # E2E テスト
│   ├── tests/                 # テストシナリオ
│   ├── helpers/               # テストヘルパー
│   └── jest.config.js         # E2E Jest 設定
│
└── src/
    └── **/*.test.{ts,tsx}     # コロケーションテスト
```

---

## 🧪 ユニットテスト戦略

### テスト対象と優先度

#### 🔥 **高優先度** (カバレッジ100%目標)
- **utils/categories.ts**: カテゴリ管理ロジック
- **services/storyService.ts**: Firestore CRUD操作
- **services/authService.ts**: 認証ロジック
- **stores/**: Zustand 状態管理
- **services/engagementService.ts**: いいね・コメント・シェア機能
- **services/communityService.ts**: フレンド・コミュニティ機能

#### 🟡 **中優先度** (カバレッジ80%目標)
- **screens/**: 画面コンポーネントの基本動作
- **navigation/**: ナビゲーション設定
- **components/**: 再利用可能コンポーネント
- **utils/**: ユーティリティ関数

#### 🟢 **低優先度** (カバレッジ60%目標)
- **assets/**: 静的リソース
- **config/**: 設定ファイル
- **types/**: 型定義

### エンゲージメント機能テスト

#### いいね機能テスト
```typescript
describe('LikeService', () => {
  test('いいねの追加・削除', async () => {
    const likeService = new LikeService();
    const storyId = 'test-story-id';
    const userId = 'test-user-id';
    
    // いいね追加
    await likeService.addLike(storyId, userId);
    expect(await likeService.getLikeCount(storyId)).toBe(1);
    
    // いいね削除
    await likeService.removeLike(storyId, userId);
    expect(await likeService.getLikeCount(storyId)).toBe(0);
  });
  
  test('いいね状態の取得', async () => {
    const likeService = new LikeService();
    const storyId = 'test-story-id';
    const userId = 'test-user-id';
    
    await likeService.addLike(storyId, userId);
    expect(await likeService.isLikedByUser(storyId, userId)).toBe(true);
  });
});
```

#### コメント機能テスト
```typescript
describe('CommentService', () => {
  test('コメントの投稿・取得', async () => {
    const commentService = new CommentService();
    const storyId = 'test-story-id';
    const comment = {
      content: 'テストコメント',
      authorId: 'test-user-id',
      timestamp: new Date()
    };
    
    const commentId = await commentService.addComment(storyId, comment);
    const comments = await commentService.getComments(storyId);
    
    expect(comments).toHaveLength(1);
    expect(comments[0].content).toBe('テストコメント');
  });
  
  test('コメント返信機能', async () => {
    const commentService = new CommentService();
    const storyId = 'test-story-id';
    const parentCommentId = 'parent-comment-id';
    const reply = {
      content: '返信コメント',
      authorId: 'test-user-id',
      parentId: parentCommentId
    };
    
    await commentService.addReply(storyId, reply);
    const replies = await commentService.getReplies(parentCommentId);
    
    expect(replies).toHaveLength(1);
    expect(replies[0].content).toBe('返信コメント');
  });
});
```

#### シェア機能テスト
```typescript
describe('ShareService', () => {
  test('Twitterシェア機能', async () => {
    const shareService = new ShareService();
    const storyId = 'test-story-id';
    const storyTitle = 'テスト投稿';
    
    const shareUrl = await shareService.generateTwitterShareUrl(storyId, storyTitle);
    expect(shareUrl).toContain('twitter.com/intent/tweet');
    expect(shareUrl).toContain(encodeURIComponent(storyTitle));
  });
  
  test('URLシェア機能', async () => {
    const shareService = new ShareService();
    const storyId = 'test-story-id';
    
    const shareUrl = await shareService.generateShareUrl(storyId);
    expect(shareUrl).toContain(storyId);
  });
});
```

### コミュニティ機能テスト

#### フレンド機能テスト
```typescript
describe('FriendService', () => {
  test('フレンド追加・削除', async () => {
    const friendService = new FriendService();
    const userId = 'test-user-id';
    const friendId = 'friend-user-id';
    
    // フレンド追加
    await friendService.addFriend(userId, friendId);
    expect(await friendService.getFriends(userId)).toContain(friendId);
    
    // フレンド削除
    await friendService.removeFriend(userId, friendId);
    expect(await friendService.getFriends(userId)).not.toContain(friendId);
  });
  
  test('フレンド推薦機能', async () => {
    const friendService = new FriendService();
    const userId = 'test-user-id';
    
    const recommendations = await friendService.getRecommendations(userId);
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
```

#### コミュニティ機能テスト
```typescript
describe('CommunityService', () => {
  test('コミュニティ作成・参加', async () => {
    const communityService = new CommunityService();
    const community = {
      name: 'テストコミュニティ',
      description: 'テスト用コミュニティ',
      creatorId: 'test-user-id'
    };
    
    const communityId = await communityService.createCommunity(community);
    await communityService.joinCommunity(communityId, 'test-user-id');
    
    const members = await communityService.getMembers(communityId);
    expect(members).toContain('test-user-id');
  });
  
  test('コミュニティ投稿機能', async () => {
    const communityService = new CommunityService();
    const communityId = 'test-community-id';
    const post = {
      content: 'コミュニティ投稿',
      authorId: 'test-user-id'
    };
    
    const postId = await communityService.addPost(communityId, post);
    const posts = await communityService.getPosts(communityId);
    
    expect(posts).toHaveLength(1);
    expect(posts[0].content).toBe('コミュニティ投稿');
  });
});
```

---

## 🔗 インテグレーションテスト戦略

### エンゲージメント統合テスト

#### いいね・コメント・シェア統合テスト
```typescript
describe('Engagement Integration', () => {
  test('投稿へのエンゲージメント一連の流れ', async () => {
    // 1. 投稿作成
    const story = await createTestStory();
    
    // 2. いいね追加
    await addLike(story.id, 'user1');
    await addLike(story.id, 'user2');
    
    // 3. コメント投稿
    await addComment(story.id, 'user1', '素晴らしい投稿です！');
    await addComment(story.id, 'user2', '参考になりました');
    
    // 4. シェア実行
    await shareStory(story.id, 'user1');
    
    // 5. 統計確認
    const stats = await getStoryStats(story.id);
    expect(stats.likeCount).toBe(2);
    expect(stats.commentCount).toBe(2);
    expect(stats.shareCount).toBe(1);
  });
});
```

#### リアルタイム更新テスト
```typescript
describe('Real-time Updates', () => {
  test('いいねのリアルタイム更新', async () => {
    const story = await createTestStory();
    const listener = subscribeToLikes(story.id);
    
    // いいね追加
    await addLike(story.id, 'user1');
    
    // リアルタイム更新確認
    await waitFor(() => {
      expect(listener.getLatestCount()).toBe(1);
    });
  });
});
```

### コミュニティ統合テスト

#### フレンド・コミュニティ統合テスト
```typescript
describe('Community Integration', () => {
  test('フレンドを通じたコミュニティ参加', async () => {
    // 1. フレンド追加
    await addFriend('user1', 'user2');
    
    // 2. コミュニティ作成
    const community = await createCommunity('user1', 'テストコミュニティ');
    
    // 3. フレンド招待
    await inviteFriendToCommunity(community.id, 'user2');
    
    // 4. フレンド参加
    await joinCommunity(community.id, 'user2');
    
    // 5. コミュニティ内投稿
    await addCommunityPost(community.id, 'user2', '参加しました！');
    
    // 6. 投稿確認
    const posts = await getCommunityPosts(community.id);
    expect(posts).toHaveLength(1);
  });
});
```

---

## 🌐 E2Eテスト戦略

### エンゲージメントE2Eテスト

#### いいね機能E2Eテスト
```typescript
describe('Like Feature E2E', () => {
  test('投稿へのいいね機能', async () => {
    await device.launchApp();
    
    // 投稿一覧画面に移動
    await element(by.id('home-screen')).tap();
    
    // 最初の投稿を選択
    await element(by.id('story-card-0')).tap();
    
    // いいねボタンをタップ
    await element(by.id('like-button')).tap();
    
    // いいね数が増加することを確認
    await expect(element(by.id('like-count'))).toHaveText('1');
    
    // いいねボタンがアクティブ状態になることを確認
    await expect(element(by.id('like-button'))).toHaveProp('isLiked', true);
  });
});
```

#### コメント機能E2Eテスト
```typescript
describe('Comment Feature E2E', () => {
  test('投稿へのコメント機能', async () => {
    await device.launchApp();
    
    // 投稿詳細画面に移動
    await element(by.id('story-detail-screen')).tap();
    
    // コメント入力
    await element(by.id('comment-input')).typeText('素晴らしい投稿です！');
    
    // コメント投稿
    await element(by.id('comment-submit')).tap();
    
    // コメントが表示されることを確認
    await expect(element(by.text('素晴らしい投稿です！'))).toBeVisible();
  });
});
```

#### シェア機能E2Eテスト
```typescript
describe('Share Feature E2E', () => {
  test('Twitterシェア機能', async () => {
    await device.launchApp();
    
    // 投稿詳細画面に移動
    await element(by.id('story-detail-screen')).tap();
    
    // シェアボタンをタップ
    await element(by.id('share-button')).tap();
    
    // Twitterシェアオプションを選択
    await element(by.text('Twitter')).tap();
    
    // シェアURLが生成されることを確認
    await expect(element(by.id('share-url'))).toBeVisible();
  });
});
```

### コミュニティE2Eテスト

#### フレンド機能E2Eテスト
```typescript
describe('Friend Feature E2E', () => {
  test('フレンド追加機能', async () => {
    await device.launchApp();
    
    // ユーザー検索画面に移動
    await element(by.id('search-screen')).tap();
    
    // ユーザー検索
    await element(by.id('search-input')).typeText('testuser');
    
    // 検索結果からユーザーを選択
    await element(by.id('user-result-0')).tap();
    
    // フレンド追加ボタンをタップ
    await element(by.id('add-friend-button')).tap();
    
    // フレンド追加成功メッセージを確認
    await expect(element(by.text('フレンドに追加しました'))).toBeVisible();
  });
});
```

#### コミュニティ機能E2Eテスト
```typescript
describe('Community Feature E2E', () => {
  test('コミュニティ作成・参加', async () => {
    await device.launchApp();
    
    // コミュニティ画面に移動
    await element(by.id('community-screen')).tap();
    
    // コミュニティ作成ボタンをタップ
    await element(by.id('create-community-button')).tap();
    
    // コミュニティ情報入力
    await element(by.id('community-name-input')).typeText('テストコミュニティ');
    await element(by.id('community-description-input')).typeText('テスト用コミュニティです');
    
    // コミュニティ作成
    await element(by.id('create-community-submit')).tap();
    
    // コミュニティ作成成功を確認
    await expect(element(by.text('コミュニティを作成しました'))).toBeVisible();
  });
});
```

---

## 🧪 テストデータ管理

### モックデータ

#### エンゲージメントモックデータ
```typescript
// __mocks__/engagementData.ts
export const mockLikes = [
  { id: 'like1', storyId: 'story1', userId: 'user1', timestamp: new Date() },
  { id: 'like2', storyId: 'story1', userId: 'user2', timestamp: new Date() }
];

export const mockComments = [
  {
    id: 'comment1',
    storyId: 'story1',
    userId: 'user1',
    content: '素晴らしい投稿です！',
    timestamp: new Date()
  }
];

export const mockShares = [
  { id: 'share1', storyId: 'story1', userId: 'user1', platform: 'twitter', timestamp: new Date() }
];
```

#### コミュニティモックデータ
```typescript
// __mocks__/communityData.ts
export const mockFriendships = [
  { id: 'friendship1', userId: 'user1', friendId: 'user2', status: 'accepted', timestamp: new Date() }
];

export const mockCommunities = [
  {
    id: 'community1',
    name: 'テストコミュニティ',
    description: 'テスト用コミュニティ',
    creatorId: 'user1',
    memberCount: 5,
    createdAt: new Date()
  }
];

export const mockMemberships = [
  { id: 'membership1', communityId: 'community1', userId: 'user1', role: 'admin', joinedAt: new Date() }
];
```

### テストヘルパー

#### エンゲージメントテストヘルパー
```typescript
// e2e/helpers/engagementHelpers.ts
export const createTestStory = async () => {
  return await storyService.createStory({
    title: 'テスト投稿',
    content: 'テスト内容',
    category: 'work',
    authorId: 'test-user'
  });
};

export const addLike = async (storyId: string, userId: string) => {
  return await likeService.addLike(storyId, userId);
};

export const addComment = async (storyId: string, userId: string, content: string) => {
  return await commentService.addComment(storyId, { content, authorId: userId });
};

export const shareStory = async (storyId: string, userId: string) => {
  return await shareService.shareStory(storyId, userId, 'twitter');
};
```

#### コミュニティテストヘルパー
```typescript
// e2e/helpers/communityHelpers.ts
export const createTestCommunity = async (creatorId: string, name: string) => {
  return await communityService.createCommunity({
    name,
    description: 'テスト用コミュニティ',
    creatorId
  });
};

export const addFriend = async (userId: string, friendId: string) => {
  return await friendService.addFriend(userId, friendId);
};

export const joinCommunity = async (communityId: string, userId: string) => {
  return await communityService.joinCommunity(communityId, userId);
};
```

---

## 📊 テストカバレッジ目標

### 全体カバレッジ目標
- **ユニットテスト**: 80%以上
- **インテグレーションテスト**: 60%以上
- **E2Eテスト**: 40%以上

### 機能別カバレッジ目標
- **エンゲージメント機能**: 90%以上
- **コミュニティ機能**: 85%以上
- **認証機能**: 95%以上
- **投稿機能**: 90%以上

### 品質指標
- **テスト実行時間**: 5分以内
- **テスト成功率**: 95%以上
- **バグ検出率**: 80%以上

---

## 🚀 継続的テスト戦略

### CI/CD統合
- **GitHub Actions**: プルリクエスト時の自動テスト実行
- **テスト結果通知**: Slack/Discordへの通知
- **カバレッジレポート**: 自動生成・共有

### テスト保守
- **定期的なテスト更新**: 機能変更時のテスト更新
- **モックデータ管理**: 最新のデータ構造に合わせた更新
- **パフォーマンス監視**: テスト実行時間の監視

### 品質向上
- **テストレビュー**: コードレビューと並行したテストレビュー
- **テスト改善**: 失敗テストの分析・改善
- **ベストプラクティス**: チーム内でのテスト手法共有 