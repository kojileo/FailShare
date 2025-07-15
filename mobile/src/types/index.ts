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
    category: StoryCategory;
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

export type StoryCategory = 
  | 'エンジニア'
  | '恋愛';

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
  Search: undefined;
  Profile: undefined;
}; 