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

// Navigation型定義
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  CreateStory: { editMode?: boolean; storyData?: FailureStory } | undefined;
  StoryDetail: { storyId: string };
  MyStories: undefined;
}; 