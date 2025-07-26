/// <reference types="jest" />

import { mockStory, mockStories } from '../../__mocks__/sampleData';

describe('StoryStore', () => {
  test('mock story has correct structure', () => {
    expect(mockStory).toHaveProperty('id');
    expect(mockStory).toHaveProperty('authorId');
    expect(mockStory).toHaveProperty('content');
    expect(mockStory).toHaveProperty('metadata');
  });

  test('story content has required fields', () => {
    const { content } = mockStory;
    expect(content).toHaveProperty('title');
    expect(content).toHaveProperty('category');
    expect(content).toHaveProperty('situation');
    expect(content).toHaveProperty('action');
    expect(content).toHaveProperty('result');
    expect(content).toHaveProperty('learning');
    expect(content).toHaveProperty('emotion');
  });

  test('story metadata has required fields', () => {
    const { metadata } = mockStory;
    expect(metadata).toHaveProperty('createdAt');
    expect(metadata).toHaveProperty('viewCount');
    expect(metadata).toHaveProperty('helpfulCount');
    expect(metadata).toHaveProperty('commentCount');
  });

  test('story category has hierarchical structure', () => {
    const { category } = mockStory.content;
    expect(category).toHaveProperty('main');
    expect(category).toHaveProperty('sub');
    expect(category.main).toBe('恋愛');
    expect(category.sub).toBe('デート');
  });

  test('mock stories array contains valid stories', () => {
    expect(Array.isArray(mockStories)).toBe(true);
    expect(mockStories.length).toBeGreaterThan(0);
    
    mockStories.forEach(story => {
      expect(story).toHaveProperty('id');
      expect(story).toHaveProperty('content');
      expect(story).toHaveProperty('metadata');
      expect(story.content).toHaveProperty('category');
    });
  });

  test('story validation - title length', () => {
    expect(mockStory.content.title.length).toBeGreaterThan(0);
    expect(mockStory.content.title.length).toBeLessThanOrEqual(100);
  });

  test('story validation - emotion is valid', () => {
    const validEmotions = ['後悔', '恥ずかしい', '悲しい', '不安', '怒り', '混乱', 'その他'];
    expect(validEmotions).toContain(mockStory.content.emotion);
  });
}); 