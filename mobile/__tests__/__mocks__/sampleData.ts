import { FailureStory, CategoryHierarchy, EmotionType } from '../../src/types';

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
    emotion: '後悔' as EmotionType
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
      emotion: '後悔' as EmotionType
    },
    authorId: 'test-user-id-2',
    metadata: {
      createdAt: new Date(Date.now() - 86400000),
      viewCount: 5,
      helpfulCount: 2,
      commentCount: 1,
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