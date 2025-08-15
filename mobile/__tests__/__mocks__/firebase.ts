// Firebase モックファイル
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

export const mockAuth = {
  currentUser: mockUser,
  signInAnonymously: jest.fn().mockResolvedValue({ user: mockUser }),
  signOut: jest.fn().mockResolvedValue(undefined),
  onAuthStateChanged: jest.fn(),
};

export const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ title: 'Test Story' }),
        id: 'test-doc-id',
      }),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    })),
    add: jest.fn().mockResolvedValue({ id: 'test-doc-id' }),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: 'test-story-1',
          data: () => ({
            content: {
              title: 'テストストーリー1',
              category: { main: '恋愛', sub: 'デート' },
              situation: 'テスト状況',
              action: 'テスト行動',
              result: 'テスト結果',
              learning: 'テスト学び',
              emotion: '後悔',
            },
            authorId: 'test-user-id',
            metadata: {
              createdAt: { seconds: Date.now() / 1000 },
              updatedAt: { seconds: Date.now() / 1000 },
              viewCount: 0,
              helpfulCount: 0,
              commentCount: 0,
            }
          })
        }
      ]
    }),
  })),
  doc: jest.fn(() => ({
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ title: 'Test Document' }),
      id: 'test-doc-id',
    }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  })),
};

// バッチ処理のモック
export const mockBatch = {
  set: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  commit: jest.fn().mockResolvedValue(undefined),
};

// Firebase SDK モック
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  signInAnonymously: jest.fn(() => Promise.resolve({ user: mockUser })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn(),
  connectAuthEmulator: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  connectFirestoreEmulator: jest.fn(),
  collection: jest.fn(() => mockFirestore.collection()),
  doc: jest.fn(() => mockFirestore.doc()),
  addDoc: jest.fn().mockResolvedValue({ id: 'test-doc-id' }),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({ title: 'Test Document' }),
    id: 'test-doc-id',
  }),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      {
        id: 'test-story-1',
        data: () => ({
          title: 'Test Story',
          category: { main: '恋愛', sub: 'デート' },
        })
      }
    ]
  }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
  query: jest.fn().mockReturnValue({}),
  where: jest.fn().mockReturnValue({}),
  orderBy: jest.fn().mockReturnValue({}),
  limit: jest.fn().mockReturnValue({}),
  writeBatch: jest.fn(() => mockBatch),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, toDate: () => new Date() })),
    fromDate: jest.fn((date: Date) => ({ seconds: date.getTime() / 1000 })),
  },
  increment: jest.fn((value: number) => value),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
  startAfter: jest.fn().mockReturnValue({}),
  QueryDocumentSnapshot: jest.fn(),
})); 