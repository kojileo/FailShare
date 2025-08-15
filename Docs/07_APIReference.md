# FailShare API仕様・サービス一覧

## 📋 概要

このドキュメントでは、FailShareアプリケーションのAPI仕様とサービス一覧を説明します。

### 🎯 対象読者
- フロントエンド開発者
- バックエンド開発者
- API利用者

---

## 🔧 サービス層アーキテクチャ

### サービス構成
```
src/services/
├── authService.ts      # 認証サービス
├── storyService.ts     # ストーリー管理サービス
├── commentService.ts   # コメント管理サービス
├── likeService.ts      # いいね管理サービス
├── friendService.ts    # フレンド管理サービス
├── chatService.ts      # チャット管理サービス
└── firebase.ts         # Firebase設定
```

---

## 🔐 認証サービス (authService)

### 概要
Firebase Anonymous Authenticationを使用した匿名認証システム

### 主要メソッド

#### 匿名認証
```typescript
// 匿名ユーザーの作成・認証
export const signInAnonymous = async (): Promise<User | null>

// サインアウト
export const signOutUser = async (): Promise<void>

// 現在のユーザー取得
export const getCurrentUser = (): User | null

// 認証状態の監視
export const onAuthStateChanged = (callback: (user: User | null) => void): () => void
```

#### ユーザー管理
```typescript
// ユーザープロフィール作成
export const createUserProfile = async (userData: Partial<UserProfile>): Promise<void>

// ユーザープロフィール更新
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void>

// ユーザープロフィール取得
export const getUserProfile = async (userId: string): Promise<UserProfile | null>

// ユーザーデータ削除
export const deleteUserData = async (userId: string): Promise<{ success: boolean; error?: string }>
```

### データ型
```typescript
interface User {
  uid: string;
  isAnonymous: boolean;
  createdAt: Date;
}

interface UserProfile {
  id: string;
  displayName?: string;
  avatar?: string;
  joinedAt: Date;
  lastActive: Date;
  stats: UserStats;
}

interface UserStats {
  totalPosts: number;
  totalComments: number;
  helpfulVotes: number;
  learningPoints: number;
  totalLikes: number;
  receivedLikes: number;
  friendsCount: number;
}
```

---

## 📝 ストーリーサービス (storyService)

### 概要
失敗談の投稿・編集・削除・検索を管理するサービス

### 主要メソッド

#### ストーリー管理
```typescript
// ストーリー投稿
export const createStory = async (storyData: CreateStoryData): Promise<string>

// ストーリー取得（ページネーション対応）
export const getStories = async (
  arg1?: number | StoryFilters, 
  lastDoc?: QueryDocumentSnapshot
): Promise<{ stories: FailureStory[], lastDocument?: QueryDocumentSnapshot }>

// ストーリー詳細取得
export const getStoryById = async (storyId: string): Promise<FailureStory | null>

// ストーリー更新
export const updateStory = async (storyId: string, updates: Partial<FailureStory>): Promise<void>

// ストーリー削除
export const deleteStory = async (storyId: string): Promise<void>
```

#### 検索・フィルタ
```typescript
// カテゴリ別検索
export const getStoriesByCategory = async (category: string): Promise<FailureStory[]>

// キーワード検索
export const searchStories = async (keyword: string): Promise<FailureStory[]>

// 感情別フィルタ
export const getStoriesByEmotion = async (emotion: EmotionType): Promise<FailureStory[]>
```

### データ型
```typescript
interface FailureStory {
  id: string;
  authorId: string;
  content: StoryContent;
  metadata: StoryMetadata;
}

interface StoryContent {
  title: string;
  category: CategoryHierarchy;
  situation: string;
  action: string;
  result: string;
  learning: string;
  emotion: EmotionType;
}

interface StoryMetadata {
  createdAt: Date;
  viewCount: number;
  helpfulCount: number;
  commentCount: number;
  tags: string[];
}

interface StoryFilters {
  category?: string;
  emotion?: EmotionType;
  searchText?: string;
  limit?: number;
  lastVisible?: QueryDocumentSnapshot;
}
```

---

## 💬 コメントサービス (commentService)

### 概要
コメントの投稿・編集・削除・リアルタイム更新を管理するサービス

### 主要メソッド

#### コメント管理
```typescript
// コメント投稿
export const addComment = async (storyId: string, authorId: string, content: string): Promise<string>

// コメント取得
export const getComments = async (storyId: string, pageSize?: number): Promise<Comment[]>

// ページネーション対応コメント取得
export const getCommentsWithPagination = async (
  storyId: string, 
  lastComment?: Comment, 
  pageSize?: number
): Promise<Comment[]>

// コメント更新
export const updateComment = async (commentId: string, authorId: string, content: string): Promise<void>

// コメント削除
export const deleteComment = async (commentId: string, authorId: string): Promise<void>

// コメント数取得
export const getCommentCount = async (storyId: string): Promise<number>
```

#### リアルタイム更新
```typescript
// コメントのリアルタイム監視
export const subscribeToComments = async (
  storyId: string, 
  callback: (comments: Comment[]) => void
): Promise<() => void>
```

### データ型
```typescript
interface Comment {
  id: string;
  storyId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  isHelpful: boolean;
}
```

---

## ❤️ いいねサービス (likeService)

### 概要
いいねの追加・削除・統計管理を処理するサービス

### 主要メソッド

#### いいね管理
```typescript
// いいね追加
export const addLike = async (storyId: string, userId: string): Promise<string>

// いいね削除
export const removeLike = async (storyId: string, userId: string): Promise<void>

// ストーリーのいいね取得
export const getLikesForStory = async (storyId: string): Promise<Like[]>

// ユーザーのいいね取得
export const getUserLikes = async (userId: string): Promise<Like[]>

// いいね数取得
export const getLikeCount = async (storyId: string): Promise<number>

// いいね状態確認
export const isLikedByUser = async (storyId: string, userId: string): Promise<boolean>
```

#### バッチ処理
```typescript
// 複数いいねの一括処理
export const batchToggleLikes = async (
  operations: Array<{ storyId: string; userId: string; action: 'add' | 'remove' }>
): Promise<void>
```

#### リアルタイム更新
```typescript
// いいねのリアルタイム監視
export const subscribeToLikes = async (
  storyId: string, 
  callback: (likes: Like[]) => void
): Promise<() => void>
```

### データ型
```typescript
interface Like {
  id: string;
  storyId: string;
  userId: string;
  createdAt: Date;
}

interface LikeStats {
  totalLikes: number;
  isLikedByCurrentUser: boolean;
}
```

---

## 👥 フレンドサービス (friendService)

### 概要
フレンド関係・リクエスト・ブロック機能を管理するサービス

### 主要メソッド

#### フレンドリクエスト
```typescript
// フレンドリクエスト送信
export const sendFriendRequest = async (
  fromUserId: string, 
  toUserId: string, 
  message?: string
): Promise<void>

// フレンドリクエスト承認
export const acceptFriendRequest = async (requestId: string): Promise<void>

// フレンドリクエスト拒否
export const rejectFriendRequest = async (requestId: string): Promise<void>

// 受信リクエスト取得
export const getReceivedRequests = async (userId: string): Promise<FriendRequest[]>

// 送信リクエスト取得
export const getSentRequests = async (userId: string): Promise<FriendRequest[]>
```

#### フレンド管理
```typescript
// フレンド一覧取得
export const getFriends = async (userId: string): Promise<Friend[]>

// フレンド削除
export const removeFriend = async (userId: string, friendId: string): Promise<void>

// フレンド検索
export const searchFriends = async (userId: string, query: string): Promise<Friend[]>

// フレンド推薦
export const getFriendRecommendations = async (userId: string): Promise<FriendRecommendation[]>
```

#### ブロック機能
```typescript
// ユーザーブロック
export const blockUser = async (userId: string, blockedUserId: string): Promise<void>

// ブロック解除
export const unblockUser = async (userId: string, blockedUserId: string): Promise<void>

// ブロックユーザー一覧取得
export const getBlockedUsers = async (userId: string): Promise<BlockedUser[]>
```

### データ型
```typescript
interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'accepted';
  createdAt: Date;
  acceptedAt: Date;
}

interface Friend {
  id: string;
  displayName: string;
  avatar?: string;
  joinedAt: Date;
  lastActive: Date;
  stats: UserStats;
}

interface BlockedUser {
  id: string;
  userId: string;
  blockedUserId: string;
  blockedAt: Date;
}

interface FriendRecommendation {
  userId: string;
  displayName: string;
  avatar?: string;
  commonInterests: string[];
  recommendationScore: number;
}
```

---

## 💬 チャットサービス (chatService)

### 概要
1対1チャット機能を管理するサービス

### 主要メソッド

#### チャット管理
```typescript
// チャット作成
export const createChat = async (participants: string[]): Promise<string>

// チャット一覧取得
export const getChats = async (userId: string): Promise<Chat[]>

// チャット詳細取得
export const getChatById = async (chatId: string): Promise<Chat | null>

// チャット削除
export const deleteChat = async (chatId: string): Promise<void>
```

#### メッセージ管理
```typescript
// メッセージ送信
export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  content: string, 
  messageType?: 'text' | 'image' | 'file'
): Promise<string>

// メッセージ取得
export const getMessages = async (chatId: string): Promise<Message[]>

// メッセージ編集
export const editMessage = async (messageId: string, content: string): Promise<void>

// メッセージ削除
export const deleteMessage = async (messageId: string): Promise<void>

// 既読設定
export const markAsRead = async (messageId: string, userId: string): Promise<void>
```

#### リアルタイム更新
```typescript
// メッセージのリアルタイム監視
export const subscribeToMessages = async (
  chatId: string, 
  callback: (messages: Message[]) => void
): Promise<() => void>

// チャット一覧のリアルタイム監視
export const subscribeToChats = async (
  userId: string, 
  callback: (chats: Chat[]) => void
): Promise<() => void>
```

### データ型
```typescript
interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageAt?: Date;
  updatedAt: Date;
  unreadCount: Record<string, number>;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  createdAt: Date;
  isRead: boolean;
  isEdited: boolean;
}
```

---

## 🔧 ユーティリティサービス

### リアルタイムリスナー管理
```typescript
// RealtimeManager
export class RealtimeManager {
  // リスナー登録
  public registerListener(key: string, unsubscribe: Unsubscribe, context: string): boolean
  
  // リスナー削除
  public removeListener(key: string): void
  
  // 全リスナー停止
  public removeAllListeners(): void
  
  // 統計取得
  public getListenerStats(): ListenerStats
}
```

### キャッシュ管理
```typescript
// CacheManager
export class CacheManager {
  // データ保存
  public set<T>(key: string, data: T, ttl?: number): void
  
  // データ取得
  public get<T>(key: string): T | null
  
  // データ削除
  public delete(key: string): boolean
  
  // パターン削除
  public deletePattern(pattern: string): number
}
```

---

## 📊 エラーハンドリング

### エラー型定義
```typescript
interface ServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

enum ErrorCode {
  // 認証エラー
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_USER = 'INVALID_USER',
  
  // データエラー
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // ネットワークエラー
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // リアルタイムエラー
  LISTENER_ERROR = 'LISTENER_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR'
}
```

### エラーハンドリング例
```typescript
try {
  const result = await storyService.createStory(storyData);
  return result;
} catch (error) {
  if (error.code === ErrorCode.AUTH_REQUIRED) {
    // 認証が必要な場合の処理
    await authService.signInAnonymous();
    return await storyService.createStory(storyData);
  } else if (error.code === ErrorCode.DATA_VALIDATION_ERROR) {
    // データ検証エラーの処理
    throw new Error('投稿データが正しくありません');
  } else {
    // その他のエラー
    console.error('ストーリー作成エラー:', error);
    throw new Error('投稿に失敗しました');
  }
}
```

---

## 🔗 関連ドキュメント

- **[データベース設計](./09_DatabaseSchema.md)**
- **[コンポーネントガイド](./08_ComponentGuide.md)**
- **[セキュリティポリシー](./06_SecurityPolicy.md)**

---

## 📝 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|----------|--------|
| 2025-01-XX | API仕様書作成 | 開発チーム |
| 2025-01-XX | サービス一覧追加 | 開発チーム |
| 2025-01-XX | エラーハンドリング追加 | 開発チーム |
