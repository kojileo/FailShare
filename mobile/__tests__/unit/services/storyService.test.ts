// Story Service のユニットテスト
import '../../../__tests__/__mocks__/firebase';
import { mockStory, mockStories } from '../../__mocks__/sampleData';
import { storyService } from '../../../src/services/storyService';
import { likeService } from '../../../src/services/likeService';
import { MainCategory, SubCategory, EmotionType } from '../../../src/types';

// Jest の型を手動でインポート
/// <reference types="jest" />

// モック設定
jest.mock('../../../src/services/likeService');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  where: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  increment: jest.fn(),
  deleteDoc: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() }))
  }
}));

const mockLikeService = likeService as jest.Mocked<typeof likeService>;

describe('StoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本的な機能', () => {
    test('should be defined', () => {
      expect(storyService).toBeDefined();
    });

    test('mock story data is valid', () => {
      expect(mockStory).toBeDefined();
      expect(mockStory.id).toBe('test-story-1');
      expect(mockStory.content.title).toBeTruthy();
      expect(mockStory.content.category).toBeDefined();
    });

    test('mock stories array is valid', () => {
      expect(mockStories).toBeDefined();
      expect(Array.isArray(mockStories)).toBe(true);
      expect(mockStories.length).toBeGreaterThan(0);
    });
  });

  describe('getStories - いいね機能の統合', () => {
    it('FirestoreのhelpfulCountが正しく取得される', async () => {
      const { getDocs, query, collection } = require('firebase/firestore');
      
      // Firestoreのモックデータ
      const mockQuerySnapshot = {
        size: 2,
        docs: [
          {
            id: 'story1',
            data: () => ({
              authorId: 'user1',
              content: {
                title: 'テストストーリー1',
                category: { main: '仕事', sub: '転職' },
                situation: 'テスト状況1',
                action: 'テスト行動1',
                result: 'テスト結果1',
                learning: 'テスト学び1',
                emotion: '後悔'
              },
              metadata: {
                createdAt: { toDate: () => new Date() },
                viewCount: 10,
                helpfulCount: 22, // seed-data.jsの値
                commentCount: 5,
                tags: ['仕事', '転職', '後悔']
              }
            })
          },
          {
            id: 'story2',
            data: () => ({
              authorId: 'user2',
              content: {
                title: 'テストストーリー2',
                category: { main: '人間関係', sub: '上司' },
                situation: 'テスト状況2',
                action: 'テスト行動2',
                result: 'テスト結果2',
                learning: 'テスト学び2',
                emotion: '恥ずかしい'
              },
              metadata: {
                createdAt: { toDate: () => new Date() },
                viewCount: 15,
                helpfulCount: 28, // seed-data.jsの値
                commentCount: 8,
                tags: ['人間関係', '上司', '恥ずかしい']
              }
            })
          }
        ],
        forEach: function(callback: any) {
          this.docs.forEach(callback);
        }
      };

      getDocs.mockResolvedValue(mockQuerySnapshot);
      query.mockReturnValue({});
      collection.mockReturnValue({});

      const result = await storyService.getStories();

      expect(result.stories).toHaveLength(2);
      // 配列の順序に依存しないテスト
      const helpfulCounts = result.stories.map(story => story.metadata.helpfulCount).sort();
      expect(helpfulCounts).toEqual([22, 28]);
    });

    it('helpfulCountが0の場合も正しく処理される', async () => {
      const { getDocs, query, collection } = require('firebase/firestore');
      
      const mockQuerySnapshot = {
        size: 1,
        docs: [
          {
            id: 'story1',
            data: () => ({
              authorId: 'user1',
              content: {
                title: 'テストストーリー',
                category: { main: '仕事', sub: '転職' },
                situation: 'テスト状況',
                action: 'テスト行動',
                result: 'テスト結果',
                learning: 'テスト学び',
                emotion: '後悔'
              },
              metadata: {
                createdAt: { toDate: () => new Date() },
                viewCount: 10,
                helpfulCount: 0, // 0の場合
                commentCount: 5,
                tags: ['仕事', '転職', '後悔']
              }
            })
          }
        ],
        forEach: function(callback: any) {
          this.docs.forEach(callback);
        }
      };

      getDocs.mockResolvedValue(mockQuerySnapshot);
      query.mockReturnValue({});
      collection.mockReturnValue({});

      const result = await storyService.getStories();

      expect(result.stories).toHaveLength(1);
      expect(result.stories[0].metadata.helpfulCount).toBe(0);
    });

    it('metadata.helpfulCountが存在しない場合も正しく処理される', async () => {
      const { getDocs, query, collection } = require('firebase/firestore');
      
      const mockQuerySnapshot = {
        size: 1,
        docs: [
          {
            id: 'story1',
            data: () => ({
              authorId: 'user1',
              content: {
                title: 'テストストーリー',
                category: { main: '仕事', sub: '転職' },
                situation: 'テスト状況',
                action: 'テスト行動',
                result: 'テスト結果',
                learning: 'テスト学び',
                emotion: '後悔'
              },
              metadata: {
                createdAt: { toDate: () => new Date() },
                viewCount: 10,
                // helpfulCountが存在しない
                commentCount: 5,
                tags: ['仕事', '転職', '後悔']
              }
            })
          }
        ],
        forEach: function(callback: any) {
          this.docs.forEach(callback);
        }
      };

      getDocs.mockResolvedValue(mockQuerySnapshot);
      query.mockReturnValue({});
      collection.mockReturnValue({});

      const result = await storyService.getStories();

      expect(result.stories).toHaveLength(1);
      expect(result.stories[0].metadata.helpfulCount).toBe(0);
    });
  });

  describe('createStory - いいね初期化', () => {
    it('新しいストーリー作成時にhelpfulCountが0で初期化される', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      
      addDoc.mockResolvedValue({ id: 'new-story-id' });
      collection.mockReturnValue({});

      const storyData = {
        title: '新しいストーリー',
        category: { main: '仕事' as MainCategory, sub: '転職' as SubCategory },
        situation: '新しい状況',
        action: '新しい行動',
        result: '新しい結果',
        learning: '新しい学び',
        emotion: '後悔' as EmotionType
      };

      const result = await storyService.createStory('user1', storyData);

      expect(result).toBe('new-story-id');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          authorId: 'user1',
          content: storyData,
          metadata: expect.objectContaining({
            helpfulCount: 0 // 初期値は0
          })
        })
      );
    });
  });

  describe('getStoryById - いいね機能の統合', () => {
    it('個別ストーリー取得時にhelpfulCountが正しく取得される', async () => {
      const { getDoc, doc, updateDoc, increment } = require('firebase/firestore');
      
      const mockDocSnapshot = {
        exists: () => true,
        id: 'story1',
        data: () => ({
          authorId: 'user1',
          content: {
            title: 'テストストーリー',
            category: { main: '仕事', sub: '転職' },
            situation: 'テスト状況',
            action: 'テスト行動',
            result: 'テスト結果',
            learning: 'テスト学び',
            emotion: '後悔'
          },
          metadata: {
            createdAt: { toDate: () => new Date() },
            viewCount: 10,
            helpfulCount: 22,
            commentCount: 5,
            tags: ['仕事', '転職', '後悔']
          }
        })
      };

      getDoc.mockResolvedValue(mockDocSnapshot);
      doc.mockReturnValue({});
      updateDoc.mockResolvedValue(undefined);
      increment.mockReturnValue(1);
      mockLikeService.getHelpfulCount.mockResolvedValue(22);

      const result = await storyService.getStoryById('story1');

      expect(result).toBeDefined();
      expect(result?.metadata.helpfulCount).toBe(22);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { 'metadata.viewCount': 1 }
      );
    });

    it('存在しないストーリーの場合はnullを返す', async () => {
      const { getDoc, doc } = require('firebase/firestore');
      
      const mockDocSnapshot = {
        exists: () => false
      };

      getDoc.mockResolvedValue(mockDocSnapshot);
      doc.mockReturnValue({});

      const result = await storyService.getStoryById('non-existent-story');

      expect(result).toBeNull();
    });
  });

  describe('markStoryAsHelpful - いいね機能', () => {
    it('markStoryAsHelpfulが正しく動作する', async () => {
      const { doc, updateDoc, increment } = require('firebase/firestore');
      
      doc.mockReturnValue({});
      updateDoc.mockResolvedValue(undefined);
      increment.mockReturnValue(1);

      await storyService.markStoryAsHelpful('story1');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { 'metadata.helpfulCount': 1 }
      );
    });
  });

  describe('エラーハンドリング', () => {
    it('getStoriesでエラーが発生した場合、適切に処理される', async () => {
      const { getDocs, query, collection } = require('firebase/firestore');
      
      getDocs.mockRejectedValue(new Error('Firestore error'));
      query.mockReturnValue({});
      collection.mockReturnValue({});

      await expect(storyService.getStories()).rejects.toThrow('Firestore error');
    });

    it('createStoryでエラーが発生した場合、適切に処理される', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      
      addDoc.mockRejectedValue(new Error('Create story error'));
      collection.mockReturnValue({});

      const storyData = {
        title: 'テストストーリー',
        category: { main: '仕事' as MainCategory, sub: '転職' as SubCategory },
        situation: 'テスト状況',
        action: 'テスト行動',
        result: 'テスト結果',
        learning: 'テスト学び',
        emotion: '後悔' as EmotionType
      };

      await expect(storyService.createStory('user1', storyData)).rejects.toThrow('Create story error');
    });
  });

  describe('データ検証', () => {
    it('無効なストーリーデータでエラーが発生する', async () => {
      const invalidStoryData = {
        title: '', // 空のタイトル
        category: { main: '仕事' as MainCategory, sub: '転職' as SubCategory },
        situation: 'テスト状況',
        action: 'テスト行動',
        result: 'テスト結果',
        learning: 'テスト学び',
        emotion: '後悔' as EmotionType
      };

      await expect(storyService.createStory('user1', invalidStoryData)).rejects.toThrow('タイトルは必須です');
    });

    it('文字数制限を超えたデータでエラーが発生する', async () => {
      const longTitle = 'a'.repeat(101); // 100文字を超える
      const invalidStoryData = {
        title: longTitle,
        category: { main: '仕事' as MainCategory, sub: '転職' as SubCategory },
        situation: 'テスト状況',
        action: 'テスト行動',
        result: 'テスト結果',
        learning: 'テスト学び',
        emotion: '後悔' as EmotionType
      };

      await expect(storyService.createStory('user1', invalidStoryData)).rejects.toThrow('タイトルは100文字以内で入力してください');
    });
  });
}); 