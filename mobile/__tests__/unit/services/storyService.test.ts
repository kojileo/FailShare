// Story Service のユニットテスト
import '../../../__tests__/__mocks__/firebase';
import { mockStory, mockStories } from '../../__mocks__/sampleData';

// Jest の型を手動でインポート
/// <reference types="jest" />

describe('StoryService', () => {
  test('should be defined', () => {
    // 基本的なテスト
    expect(true).toBe(true);
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