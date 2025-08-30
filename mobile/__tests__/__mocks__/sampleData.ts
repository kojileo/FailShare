import { FailureStory, CategoryHierarchy, EmotionType, PostType, Like, LikeStats, User, FriendRequest, FriendRecommendation, Friendship } from '../../src/types';

export const mockCategory: CategoryHierarchy = {
  main: '恋愛',
  sub: 'デート'
};



export const mockStory: FailureStory = {
  id: 'test-story-1',
  content: {
    title: 'テストデートの失敗談',
    category: mockCategory,
    situation: '初デートで緊張してしまい、会話が続かなかった。',
    action: '無理に話題を振ろうとして、相手の趣味について知ったかぶりをした。',
    result: '相手に見抜かれて気まずい雰囲気になり、デートが早めに終わってしまった。',
    learning: '素直に自分らしくいることの大切さを学んだ。背伸びをせず、正直に接することが信頼関係の基盤。',
    emotion: '後悔' as EmotionType,
    postType: 'failure' as PostType
  },
  authorId: 'test-user-id',
  metadata: {
    createdAt: new Date(),
    viewCount: 0,
    helpfulCount: 0,
    commentCount: 0,
    tags: []
  }
};

export const mockStories: FailureStory[] = [
  mockStory,
  {
    id: 'test-story-2',
    content: {
      title: '告白のタイミングを逃した話',
      category: { main: '恋愛', sub: '告白' },
      situation: '好きな人と良い雰囲気になったが、告白のタイミングを逃した。',
      action: '次の機会を待とうと思い、何もアクションを起こさなかった。',
      result: '相手が他の人と付き合ってしまった。',
      learning: 'チャンスは待っていても来ない。勇気を出して行動することの重要性。',
      emotion: '後悔' as EmotionType,
      postType: 'failure' as PostType
    },
    authorId: 'test-user-id-2',
    metadata: {
      createdAt: new Date(Date.now() - 86400000),
      viewCount: 5,
      helpfulCount: 2,
      commentCount: 1,
      tags: []
    }
  },
  {
    id: 'test-story-3',
    content: {
      title: '上司の愚痴',
      category: { main: '仕事', sub: '職場人間関係' },
      situation: '上司がいつも理不尽な要求をしてくる。',
      action: '我慢して従っているが、ストレスが溜まっている。',
      result: '仕事へのモチベーションが下がってしまった。',
      learning: '', // 愚痴投稿では学びは任意
      emotion: '怒り' as EmotionType,
      postType: 'complaint' as PostType
    },
    authorId: 'test-user-id-3',
    metadata: {
      createdAt: new Date(Date.now() - 172800000),
      viewCount: 3,
      helpfulCount: 1,
      commentCount: 0,
      tags: []
    }
  }
];

// Mock user without jest functions (we'll use this in test setup)
export const mockUserData = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'テストユーザー',
  photoURL: null,
  emailVerified: false,
  isAnonymous: true,
  providerId: 'anonymous',
  refreshToken: 'mock-refresh-token',
  tenantId: null,
};

// いいね機能のモックデータ
export const mockLike: Like = {
  id: 'like-1',
  storyId: 'test-story-1',
  userId: 'test-user-id',
  createdAt: new Date()
};

export const mockLikes: Like[] = [
  mockLike,
  {
    id: 'like-2',
    storyId: 'test-story-1',
    userId: 'test-user-id-2',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'like-3',
    storyId: 'test-story-2',
    userId: 'test-user-id',
    createdAt: new Date(Date.now() - 7200000)
  }
];

export const mockLikeStats: LikeStats = {
  storyId: 'test-story-1',
  helpfulCount: 2,
  isLikedByCurrentUser: true
};

export const mockLikeStatsArray: LikeStats[] = [
  mockLikeStats,
  {
    storyId: 'test-story-2',
    helpfulCount: 1,
    isLikedByCurrentUser: false
  }
]; 

// フレンド機能のモックデータ
export const mockUsers: User[] = [
  {
    id: 'user-1',
    displayName: '田中太郎',
    avatar: 'https://robohash.org/user-1?set=set4',
    joinedAt: new Date('2024-01-01'),
    lastActive: new Date(),
    stats: {
      totalPosts: 5,
      totalComments: 10,
      helpfulVotes: 20,
      learningPoints: 15,
      totalLikes: 30,
      receivedLikes: 25,
      friendsCount: 3,
      communitiesCount: 1,
    },
  },
  {
    id: 'user-2',
    displayName: '佐藤花子',
    avatar: 'https://robohash.org/user-2?set=set4',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(),
    stats: {
      totalPosts: 3,
      totalComments: 8,
      helpfulVotes: 15,
      learningPoints: 12,
      totalLikes: 25,
      receivedLikes: 20,
      friendsCount: 2,
      communitiesCount: 0,
    },
  },
  {
    id: 'user-3',
    displayName: '山田次郎',
    avatar: 'https://robohash.org/user-3?set=set4',
    joinedAt: new Date('2024-02-01'),
    lastActive: new Date(),
    stats: {
      totalPosts: 7,
      totalComments: 15,
      helpfulVotes: 30,
      learningPoints: 25,
      totalLikes: 40,
      receivedLikes: 35,
      friendsCount: 4,
      communitiesCount: 2,
    },
  },
  {
    id: 'user-4',
    displayName: '鈴木美咲',
    avatar: 'https://robohash.org/user-4?set=set4',
    joinedAt: new Date('2024-02-15'),
    lastActive: new Date(),
    stats: {
      totalPosts: 2,
      totalComments: 5,
      helpfulVotes: 10,
      learningPoints: 8,
      totalLikes: 15,
      receivedLikes: 12,
      friendsCount: 1,
      communitiesCount: 0,
    },
  },
];

export const mockFriendships: Friendship[] = [
  {
    id: 'friendship-1',
    userId: 'user-1',
    friendId: 'user-2',
    status: 'accepted',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'friendship-2',
    userId: 'user-2',
    friendId: 'user-1',
    status: 'accepted',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'friendship-3',
    userId: 'user-3',
    friendId: 'user-4',
    status: 'accepted',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'friendship-4',
    userId: 'user-4',
    friendId: 'user-3',
    status: 'accepted',
    createdAt: new Date('2024-02-20'),
  },
];

export const mockFriendRequests: FriendRequest[] = [
  {
    id: 'request-1',
    fromUserId: 'user-1',
    toUserId: 'user-3',
    message: 'よろしくお願いします！',
    status: 'pending',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'request-2',
    fromUserId: 'user-4',
    toUserId: 'user-1',
    message: '同じカテゴリの投稿が面白いです',
    status: 'pending',
    createdAt: new Date('2024-03-02'),
  },
  {
    id: 'request-3',
    fromUserId: 'user-1',
    toUserId: 'user-5',
    message: 'フレンドリクエストを送信しました',
    status: 'pending',
    createdAt: new Date('2024-03-03'),
  },
];

export const mockFriendRecommendations: FriendRecommendation[] = [
  {
    userId: 'user-5',
    displayName: '高橋健一',
    avatar: 'https://robohash.org/user-5?set=set4',
    commonInterests: ['恋愛', 'デート'],
    mutualFriends: 2,
    score: 85,
  },
  {
    userId: 'user-6',
    displayName: '渡辺愛',
    avatar: 'https://robohash.org/user-6?set=set4',
    commonInterests: ['恋愛', '告白'],
    mutualFriends: 1,
    score: 72,
  },
  {
    userId: 'user-7',
    displayName: '伊藤誠',
    avatar: 'https://robohash.org/user-7?set=set4',
    commonInterests: ['恋愛'],
    mutualFriends: 0,
    score: 65,
  },
];

// ブロックユーザーのモックデータ
export const mockBlockedUsers: User[] = [
  {
    id: 'blocked-user-1',
    displayName: 'ブロックユーザー1',
    avatar: 'https://robohash.org/blocked-1?set=set4',
    joinedAt: new Date('2024-01-01'),
    lastActive: new Date(),
    stats: {
      totalPosts: 1,
      totalComments: 2,
      helpfulVotes: 3,
      learningPoints: 2,
      totalLikes: 5,
      receivedLikes: 3,
      friendsCount: 0,
      communitiesCount: 0,
    },
  },
];

// フレンド機能のテスト用ヘルパー関数
export const createMockFriendRequest = (overrides: Partial<FriendRequest> = {}): FriendRequest => ({
  id: `request-${Date.now()}`,
  fromUserId: 'user-1',
  toUserId: 'user-2',
  message: 'テストメッセージ',
  status: 'pending',
  createdAt: new Date(),
  ...overrides,
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: `user-${Date.now()}`,
  displayName: 'テストユーザー',
  avatar: 'https://robohash.org/test?set=set4',
  joinedAt: new Date(),
  lastActive: new Date(),
  stats: {
    totalPosts: 0,
    totalComments: 0,
    helpfulVotes: 0,
    learningPoints: 0,
    totalLikes: 0,
    receivedLikes: 0,
    friendsCount: 0,
    communitiesCount: 0,
  },
  ...overrides,
});

export const createMockFriendRecommendation = (overrides: Partial<FriendRecommendation> = {}): FriendRecommendation => ({
  userId: `user-${Date.now()}`,
  displayName: '推薦ユーザー',
  avatar: 'https://robohash.org/recommend?set=set4',
  commonInterests: [],
  mutualFriends: 0,
  score: 50,
  ...overrides,
}); 