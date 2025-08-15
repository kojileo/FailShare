// 基本的な型定義
export interface User {
  id: string;
  displayName: string;
  avatar: string;
  joinedAt: Date;
  lastActive: Date;
  stats: {
    totalPosts: number;
    totalComments: number;
    helpfulVotes: number;
    learningPoints: number;
    totalLikes: number; // いいね数を追加
    receivedLikes: number; // 受けたいいね数を追加
    friendsCount: number; // フレンド数を追加
    communitiesCount: number; // 参加コミュニティ数を追加
  };
}

export interface FailureStory {
  id: string;
  authorId: string;
  content: {
    title: string;
    category: CategoryHierarchy; // 階層構造に変更
    situation: string;
    action: string;
    result: string;
    learning: string;
    emotion: EmotionType;
  };
  metadata: {
    createdAt: Date;
    viewCount: number;
    helpfulCount: number; // いいね数（seed-data.jsと統一）
    commentCount: number;
    tags: string[];
  };
}

export interface Comment {
  id: string;
  storyId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  isHelpful: boolean;
}

export interface SupportAction {
  id: string;
  storyId: string;
  fromUser: string;
  type: 'helpful' | 'empathy' | 'encouragement';
  comment?: string;
  timestamp: Date;
}

// いいね機能の型定義（helpfulCountに統一）
export interface Like {
  id: string;
  storyId: string;
  userId: string;
  createdAt: Date;
}

export interface LikeStats {
  storyId: string;
  helpfulCount: number; // likeCountからhelpfulCountに変更
  isLikedByCurrentUser: boolean;
}

export interface LikeService {
  addLike(storyId: string, userId: string): Promise<void>;
  removeLike(storyId: string, userId: string): Promise<void>;
  getHelpfulCount(storyId: string): Promise<number>; // getLikeCountからgetHelpfulCountに変更
  isLikedByUser(storyId: string, userId: string): Promise<boolean>;
  getLikesByUser(userId: string): Promise<Like[]>;
  getLikesForStory(storyId: string): Promise<Like[]>;
  subscribeToLikes(storyId: string, callback: (likes: Like[]) => void): () => void;
}

export interface LikeStore {
  likes: { [storyId: string]: Like[] };
  userLikes: { [storyId: string]: boolean };
  helpfulCounts: { [storyId: string]: number }; // likeCountsからhelpfulCountsに変更
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addLike(storyId: string, userId: string): Promise<void>;
  removeLike(storyId: string, userId: string): Promise<void>;
  setLikes(storyId: string, likes: Like[]): void;
  setUserLike(storyId: string, isLiked: boolean): void;
  setHelpfulCount(storyId: string, count: number): void; // setLikeCountからsetHelpfulCountに変更
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  reset(): void;
  
  // 追加の便利メソッド
  loadLikeStats(storyIds: string[], userId: string): Promise<void>;
  toggleLike(storyId: string, userId: string): Promise<void>;
  getHelpfulCount(storyId: string): number;
  isLikedByUser(storyId: string): boolean;
  initializeStoryLike(storyId: string, initialHelpfulCount: number, initialIsLiked?: boolean): void;
}

export type MainCategory = '恋愛' | '仕事' | 'その他';

export type LoveSubCategory = 
  | 'デート'
  | '告白'
  | 'カップル'
  | '片想い'
  | '別れ';

export type WorkSubCategory = 
  | '職場人間関係'
  | '転職・キャリア'
  | 'プレゼン・会議'
  | 'プロジェクト管理'
  | 'スキル習得';

export type OtherSubCategory = 'その他';

export type SubCategory = LoveSubCategory | WorkSubCategory | OtherSubCategory;

export interface CategoryHierarchy {
  main: MainCategory;
  sub: SubCategory;
}

// 後方互換性のため、従来のStoryCategory型も残す
export type StoryCategory = 
  | 'デート'
  | '告白'
  | 'カップル'
  | '片想い'
  | '別れ'
  | '仕事'
  | 'その他';

export type EmotionType = 
  | '後悔' 
  | '恥ずかしい' 
  | '悲しい' 
  | '不安' 
  | '怒り' 
  | '混乱' 
  | 'その他';

// フレンド機能の型定義
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  acceptedAt?: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface FriendRecommendation {
  userId: string;
  displayName: string;
  avatar: string;
  commonInterests: string[];
  mutualFriends: number;
  score: number;
}

// コミュニティ機能の型定義
export interface Community {
  id: string;
  name: string;
  description: string;
  category: CategoryHierarchy;
  creatorId: string;
  createdAt: Date;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  rules: string[];
  tags: string[];
}

export interface CommunityMembership {
  id: string;
  communityId: string;
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
  lastActive: Date;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
}

// フレンドサービスインターフェース
export interface FriendService {
  // フレンド関係管理
  sendFriendRequest(fromUserId: string, toUserId: string, message?: string): Promise<void>;
  acceptFriendRequest(requestId: string): Promise<void>;
  rejectFriendRequest(requestId: string): Promise<void>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  blockUser(userId: string, blockedUserId: string): Promise<void>;
  unblockUser(userId: string, blockedUserId: string): Promise<void>;
  
  // フレンド情報取得
  getFriends(userId: string): Promise<User[]>;
  getFriendRequests(userId: string): Promise<FriendRequest[]>;
  getSentFriendRequests(userId: string): Promise<FriendRequest[]>;
  getBlockedUsers(userId: string): Promise<User[]>;
  getFriendRecommendations(userId: string, limit?: number): Promise<FriendRecommendation[]>;
  
  // フレンド関係確認
  areFriends(userId: string, friendId: string): Promise<boolean>;
  hasPendingRequest(fromUserId: string, toUserId: string): Promise<boolean>;
  isBlocked(userId: string, blockedUserId: string): Promise<boolean>;
  
  // リアルタイム更新
  subscribeToFriends(userId: string, callback: (friends: User[]) => void): () => void;
  subscribeToFriendRequests(userId: string, callback: (requests: FriendRequest[]) => void): () => void;
}

// コミュニティサービスインターフェース
export interface CommunityService {
  // コミュニティ管理
  createCommunity(community: Omit<Community, 'id' | 'createdAt' | 'memberCount' | 'postCount'>): Promise<string>;
  updateCommunity(communityId: string, updates: Partial<Community>): Promise<void>;
  deleteCommunity(communityId: string): Promise<void>;
  
  // メンバーシップ管理
  joinCommunity(communityId: string, userId: string): Promise<void>;
  leaveCommunity(communityId: string, userId: string): Promise<void>;
  inviteToCommunity(communityId: string, userId: string, invitedUserId: string): Promise<void>;
  removeMember(communityId: string, userId: string, removedUserId: string): Promise<void>;
  
  // コミュニティ情報取得
  getCommunities(userId?: string): Promise<Community[]>;
  getCommunity(communityId: string): Promise<Community | null>;
  getCommunityMembers(communityId: string): Promise<User[]>;
  getUserCommunities(userId: string): Promise<Community[]>;
  
  // コミュニティ投稿
  addCommunityPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'likeCount' | 'commentCount'>): Promise<string>;
  updateCommunityPost(postId: string, content: string): Promise<void>;
  deleteCommunityPost(postId: string): Promise<void>;
  getCommunityPosts(communityId: string, limit?: number): Promise<CommunityPost[]>;
  
  // リアルタイム更新
  subscribeToCommunity(communityId: string, callback: (community: Community) => void): () => void;
  subscribeToCommunityPosts(communityId: string, callback: (posts: CommunityPost[]) => void): () => void;
}

// フレンドストアインターフェース
export interface FriendStore {
  friends: User[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  blockedUsers: User[];
  recommendations: FriendRecommendation[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadFriends(userId: string): Promise<void>;
  loadFriendRequests(userId: string): Promise<void>;
  loadSentRequests(userId: string): Promise<void>;
  loadBlockedUsers(userId: string): Promise<void>;
  loadRecommendations(userId: string): Promise<void>;
  
  sendFriendRequest(fromUserId: string, toUserId: string, message?: string): Promise<void>;
  acceptFriendRequest(requestId: string): Promise<void>;
  rejectFriendRequest(requestId: string): Promise<void>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  blockUser(userId: string, blockedUserId: string): Promise<void>;
  unblockUser(userId: string, blockedUserId: string): Promise<void>;
  
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  subscribeToFriends(userId: string): () => void;
  subscribeToFriendRequests(userId: string): () => void;
  reset(): void;
}

// コミュニティストアインターフェース
export interface CommunityStore {
  communities: Community[];
  userCommunities: Community[];
  currentCommunity: Community | null;
  communityPosts: CommunityPost[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadCommunities(userId?: string): Promise<void>;
  loadUserCommunities(userId: string): Promise<void>;
  loadCommunity(communityId: string): Promise<void>;
  loadCommunityPosts(communityId: string): Promise<void>;
  
  createCommunity(community: Omit<Community, 'id' | 'createdAt' | 'memberCount' | 'postCount'>): Promise<string>;
  joinCommunity(communityId: string, userId: string): Promise<void>;
  leaveCommunity(communityId: string, userId: string): Promise<void>;
  
  addCommunityPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'likeCount' | 'commentCount'>): Promise<string>;
  
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  reset(): void;
}

// チャット機能の型定義
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  createdAt: Date;
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
}

export interface Chat {
  id: string;
  participants: string[]; // ユーザーIDの配列
  lastMessage?: ChatMessage;
  lastMessageAt?: Date;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatPreview {
  chatId: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  isOnline: boolean;
}

// チャットサービスインターフェース
export interface ChatService {
  // チャット管理
  createChat(participants: string[]): Promise<string>;
  getChat(chatId: string): Promise<Chat | null>;
  getUserChats(userId: string): Promise<Chat[]>;
  getChatPreview(userId: string): Promise<ChatPreview[]>;
  
  // メッセージ管理
  sendMessage(chatId: string, senderId: string, content: string, messageType?: 'text' | 'image' | 'file'): Promise<string>;
  editMessage(messageId: string, content: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;
  markChatAsRead(chatId: string, userId: string): Promise<void>;
  
  // メッセージ取得
  getChatMessages(chatId: string, limit?: number): Promise<ChatMessage[]>;
  getUnreadMessages(userId: string): Promise<ChatMessage[]>;
  
  // リアルタイム更新
  subscribeToChat(chatId: string, callback: (chat: Chat) => void): () => void;
  subscribeToChatMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void;
  subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void;
}

// チャットストアインターフェース
export interface ChatStore {
  chats: Chat[];
  chatPreviews: ChatPreview[];
  currentChat: Chat | null;
  currentChatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadUserChats(userId: string): Promise<void>;
  loadChat(chatId: string): Promise<void>;
  loadChatMessages(chatId: string): Promise<void>;
  
  sendMessage(chatId: string, senderId: string, content: string): Promise<void>;
  editMessage(messageId: string, content: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  markChatAsRead(chatId: string, userId: string): Promise<void>;
  
  setCurrentChat(chat: Chat | null): void;
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  reset(): void;
  
  // リアルタイム更新
  subscribeToChat(chatId: string): () => void;
  subscribeToUserChats(userId: string): () => void;
}

// Navigation型定義を更新
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  CreateStory: { editMode?: boolean; storyData?: FailureStory } | undefined;
  StoryDetail: { storyId: string };
  MyStories: undefined;
  Friends: undefined;
  FriendRequests: undefined;
  FriendSearch: undefined;
  BlockedUsers: undefined;
  Communities: undefined;
  CommunityDetail: { communityId: string };
  CreateCommunity: undefined;
  Chat: { friendId: string; friendName: string } | undefined;
  ChatList: undefined;
}; 