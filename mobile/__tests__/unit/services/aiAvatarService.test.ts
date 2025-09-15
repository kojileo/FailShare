import { aiAvatarService } from '../../../src/services/aiAvatarService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../src/services/firebase';

// Google Generative AI モック
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn()
    })
  }))
}));

// Firebase モック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

jest.mock('../../../src/services/firebase', () => ({
  db: {}
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;

describe('AIAvatarService', () => {
  let mockModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockModel = {
      generateContent: jest.fn()
    };
    
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => mockModel
    }));
  });

  describe('startConversation', () => {
    it('対話を開始する', async () => {
      const userId = 'user-123';
      const mockDocRef = { id: 'conversation-123' };
      const mockCollectionRef = {};

      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const result = await aiAvatarService.startConversation(userId);

      expect(mockCollection).toHaveBeenCalledWith(db, 'aiConversations');
      expect(mockAddDoc).toHaveBeenCalledWith(mockCollectionRef, {
        userId,
        status: 'active',
        lastActivity: 'mock-timestamp',
        messageCount: 0,
        averageEmotion: 'その他',
        topics: [],
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
      expect(result).toBe('conversation-123');
    });
  });

  describe('sendMessage', () => {
    it('メッセージを送信してAI応答を取得する', async () => {
      const conversationId = 'conversation-123';
      const userId = 'user-123';
      const message = 'こんにちは';

      const mockUserMessageRef = { id: 'user-message-123' };
      const mockAIMessageRef = { id: 'ai-message-123' };
      const mockCollectionRef = {};

      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockAddDoc
        .mockResolvedValueOnce(mockUserMessageRef as any)
        .mockResolvedValueOnce(mockAIMessageRef as any);

      // 感情分析のモック
      jest.spyOn(aiAvatarService, 'analyzeEmotion').mockResolvedValue({
        primary: 'その他',
        confidence: 0.8,
        intensity: 0.5,
        keywords: []
      });

      // 対話履歴のモック
      jest.spyOn(aiAvatarService, 'getConversationHistory').mockResolvedValue([]);

      // ユーザープロファイルのモック
      jest.spyOn(aiAvatarService, 'getUserProfile').mockResolvedValue(null);

      // AI応答生成のモック
      const mockAIResponse = {
        message: 'こんにちは！お疲れ様です。',
        emotion: 'その他',
        advice: '気分転換をしてみてください。'
      };

      // プライベートメソッドのモック
      const generateAIResponseSpy = jest.spyOn(aiAvatarService as any, 'generateAIResponse')
        .mockResolvedValue(mockAIResponse);

      // 対話状態更新のモック
      const updateConversationStateSpy = jest.spyOn(aiAvatarService as any, 'updateConversationState')
        .mockResolvedValue(undefined);

      const result = await aiAvatarService.sendMessage(conversationId, userId, message);

      expect(result).toEqual({
        id: 'ai-message-123',
        conversationId,
        message: 'こんにちは！お疲れ様です。',
        emotion: 'その他',
        advice: '気分転換をしてみてください。',
        timestamp: expect.any(Date),
        isTyping: false
      });

      expect(generateAIResponseSpy).toHaveBeenCalled();
      expect(updateConversationStateSpy).toHaveBeenCalled();
    });
  });

  describe('getConversationHistory', () => {
    it('対話履歴を取得する', async () => {
      const conversationId = 'conversation-123';
      const mockMessageData = {
        conversationId: 'conversation-123',
        senderId: 'user-123',
        senderType: 'user',
        content: 'こんにちは',
        emotion: 'その他',
        timestamp: { toDate: () => new Date('2024-01-01') },
        metadata: {}
      };

      const mockQueryRef = {};
      const mockDocSnapshot = {
        forEach: (callback: (doc: any) => void) => {
          callback({
            id: 'message-123',
            data: () => mockMessageData
          });
        }
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue(mockQueryRef as any);
      mockWhere.mockReturnValue({} as any);
      mockOrderBy.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockDocSnapshot as any);

      const result = await aiAvatarService.getConversationHistory(conversationId);

      expect(result).toEqual([{
        id: 'message-123',
        conversationId: 'conversation-123',
        senderId: 'user-123',
        senderType: 'user',
        content: 'こんにちは',
        emotion: 'その他',
        timestamp: new Date('2024-01-01'),
        metadata: {}
      }]);
    });
  });

  describe('endConversation', () => {
    it('対話を終了する', async () => {
      const conversationId = 'conversation-123';
      const mockDocRef = {};

      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await aiAvatarService.endConversation(conversationId);

      expect(mockDoc).toHaveBeenCalledWith(db, 'aiConversations', conversationId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        status: 'ended',
        updatedAt: 'mock-timestamp'
      });
    });
  });

  describe('analyzeEmotion', () => {
    it('感情分析を実行する', async () => {
      const text = 'とても悲しいです';
      const mockResponse = {
        text: () => JSON.stringify({
          primary: '悲しい',
          confidence: 0.9,
          intensity: 0.8,
          keywords: ['悲しい', 'つらい']
        })
      };

      mockModel.generateContent.mockResolvedValue({
        response: mockResponse
      });

      const result = await aiAvatarService.analyzeEmotion(text);

      expect(result).toEqual({
        primary: '悲しい',
        confidence: 0.9,
        intensity: 0.8,
        keywords: ['悲しい', 'つらい']
      });
    });

    it('JSON解析に失敗した場合にフォールバック処理を実行する', async () => {
      const text = '後悔しています';
      const mockResponse = {
        text: () => '無効なJSON'
      };

      mockModel.generateContent.mockResolvedValue({
        response: mockResponse
      });

      const result = await aiAvatarService.analyzeEmotion(text);

      expect(result).toEqual({
        primary: '後悔',
        confidence: 0.7,
        intensity: 0.6,
        keywords: []
      });
    });
  });

  describe('getUserProfile', () => {
    it('ユーザープロファイルを取得する', async () => {
      const userId = 'user-123';
      const mockProfileData = {
        userId: 'user-123',
        preferredTopics: ['技術', '仕事'],
        communicationStyle: 'friendly',
        emotionalTendencies: ['不安', '後悔'],
        conversationHistory: ['メッセージ1', 'メッセージ2'],
        lastUpdated: { toDate: () => new Date('2024-01-01') }
      };

      const mockQueryRef = {};
      const mockDocSnapshot = {
        empty: false,
        docs: [{
          data: () => mockProfileData
        }]
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue(mockQueryRef as any);
      mockWhere.mockReturnValue({} as any);
      mockLimit.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockDocSnapshot as any);

      const result = await aiAvatarService.getUserProfile(userId);

      expect(result).toEqual({
        userId: 'user-123',
        preferredTopics: ['技術', '仕事'],
        communicationStyle: 'friendly',
        emotionalTendencies: ['不安', '後悔'],
        conversationHistory: ['メッセージ1', 'メッセージ2'],
        lastUpdated: new Date('2024-01-01')
      });
    });

    it('ユーザープロファイルが見つからない場合にnullを返す', async () => {
      const userId = 'user-123';
      const mockDocSnapshot = {
        empty: true,
        docs: []
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockWhere.mockReturnValue({} as any);
      mockLimit.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockDocSnapshot as any);

      const result = await aiAvatarService.getUserProfile(userId);

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('ユーザープロファイルを更新する', async () => {
      const userId = 'user-123';
      const profile = {
        userId: 'user-123',
        preferredTopics: ['技術'],
        communicationStyle: 'friendly' as const,
        emotionalTendencies: ['不安' as const],
        conversationHistory: ['メッセージ1'],
        lastUpdated: new Date('2024-01-01')
      };

      const mockQueryRef = {};
      const mockDocSnapshot = {
        empty: false,
        docs: [{
          ref: { id: 'profile-123' }
        }]
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue(mockQueryRef as any);
      mockWhere.mockReturnValue({} as any);
      mockLimit.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockDocSnapshot as any);
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await aiAvatarService.updateUserProfile(userId, profile);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        { id: 'profile-123' },
        {
          ...profile,
          updatedAt: 'mock-timestamp'
        }
      );
    });

    it('プロファイルが存在しない場合に新規作成する', async () => {
      const userId = 'user-123';
      const profile = {
        userId: 'user-123',
        preferredTopics: ['技術'],
        communicationStyle: 'friendly' as const,
        emotionalTendencies: ['不安' as const],
        conversationHistory: ['メッセージ1'],
        lastUpdated: new Date('2024-01-01')
      };

      const mockQueryRef = {};
      const mockDocSnapshot = {
        empty: true,
        docs: []
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue(mockQueryRef as any);
      mockWhere.mockReturnValue({} as any);
      mockLimit.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockDocSnapshot as any);
      mockAddDoc.mockResolvedValue({ id: 'new-profile-123' } as any);

      await aiAvatarService.updateUserProfile(userId, profile);

      expect(mockAddDoc).toHaveBeenCalledWith({}, {
        ...profile,
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
    });
  });

  describe('subscribeToConversation', () => {
    it('対話のリアルタイム監視を開始する', () => {
      const conversationId = 'conversation-123';
      const callback = jest.fn();

      const mockUnsubscribe = jest.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const result = aiAvatarService.subscribeToConversation(conversationId, callback);

      expect(mockCollection).toHaveBeenCalledWith(db, 'aiMessages');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('conversationId', '==', conversationId);
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(result).toBe(mockUnsubscribe);
    });
  });

  describe('subscribeToConversationState', () => {
    it('対話状態のリアルタイム監視を開始する', () => {
      const conversationId = 'conversation-123';
      const callback = jest.fn();

      const mockUnsubscribe = jest.fn();
      const mockDocSnapshot = {
        exists: () => true,
        data: () => ({
          userId: 'user-123',
          status: 'active',
          lastActivity: { toDate: () => new Date('2024-01-01') },
          messageCount: 5,
          averageEmotion: 'その他',
          topics: ['技術']
        })
      };

      mockDoc.mockReturnValue({} as any);
      mockOnSnapshot.mockImplementation((ref, callback) => {
        (callback as any)(mockDocSnapshot);
        return mockUnsubscribe;
      });

      const result = aiAvatarService.subscribeToConversationState(conversationId, callback);

      expect(mockDoc).toHaveBeenCalledWith(db, 'aiConversations', conversationId);
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({
        id: conversationId,
        userId: 'user-123',
        status: 'active',
        lastActivity: new Date('2024-01-01'),
        messageCount: 5,
        averageEmotion: 'その他',
        topics: ['技術']
      });
      expect(result).toBe(mockUnsubscribe);
    });
  });
});
