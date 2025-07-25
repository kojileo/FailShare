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
    helpfulCount: number;
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
  MainTabs: undefined;
  CreateStory: undefined;
  StoryDetail: { storyId: string };
  MyStories: undefined;
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
}; 