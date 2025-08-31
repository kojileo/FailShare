// Keyword Filter Service のユニットテスト
import { keywordFilterService } from '../../../src/services/keywordFilterService';

describe('KeywordFilterService', () => {
  beforeEach(() => {
    // テスト前にフィルタをリセット
    keywordFilterService.updateFilter({
      bannedWords: [
        '死ね', '殺す', '消えろ', 'うざい', 'きもい', 'むかつく',
        'ばか', 'あほ', 'クソ', 'ゴミ', 'カス', 'ブス', 'デブ'
      ],
      warningWords: [
        '最悪', '最下位', 'ダメ', '無理', 'できない', '嫌い'
      ],
      isEnabled: true
    });
  });

  describe('基本的な機能', () => {
    test('should be defined', () => {
      expect(keywordFilterService).toBeDefined();
    });

    test('should have default filter settings', () => {
      const filter = keywordFilterService.getFilter();
      expect(filter.isEnabled).toBe(true);
      expect(filter.bannedWords).toContain('死ね');
      expect(filter.warningWords).toContain('最悪');
    });
  });

  describe('コメントフィルタリング', () => {
    test('should allow normal comments', () => {
      const result = keywordFilterService.filterComment('とても良い投稿ですね！');
      expect(result.isBlocked).toBe(false);
      expect(result.warningMessage).toBeUndefined();
    });

    test('should block comments with banned words', () => {
      const result = keywordFilterService.filterComment('死ね！');
      expect(result.isBlocked).toBe(true);
      expect(result.warningMessage).toBe('不適切な表現が含まれています。');
      expect(result.suggestions).toContain('頑張って');
    });

    test('should warn about warning words', () => {
      const result = keywordFilterService.filterComment('最悪な状況です');
      expect(result.isBlocked).toBe(false);
      expect(result.warningMessage).toBe('より建設的な表現に変更することをお勧めします。');
      expect(result.suggestions).toContain('良くない');
    });

    test('should be case insensitive', () => {
      const result = keywordFilterService.filterComment('クソみたいな');
      expect(result.isBlocked).toBe(true);
    });

    test('should handle mixed case', () => {
      const result = keywordFilterService.filterComment('クソみたいな');
      expect(result.isBlocked).toBe(true);
    });
  });

  describe('投稿フィルタリング', () => {
    test('should filter story content', () => {
      const result = keywordFilterService.filterStory('死ね！');
      expect(result.isBlocked).toBe(true);
    });

    test('should allow normal story content', () => {
      const result = keywordFilterService.filterStory('とても良い経験でした');
      expect(result.isBlocked).toBe(false);
    });
  });

  describe('フィルタ設定の更新', () => {
    test('should update filter settings', () => {
      keywordFilterService.updateFilter({
        isEnabled: false
      });
      
      const filter = keywordFilterService.getFilter();
      expect(filter.isEnabled).toBe(false);
    });

    test('should add banned word', () => {
      keywordFilterService.addBannedWord('テスト禁止ワード');
      
      const filter = keywordFilterService.getFilter();
      expect(filter.bannedWords).toContain('テスト禁止ワード');
    });

    test('should remove banned word', () => {
      keywordFilterService.removeBannedWord('死ね');
      
      const filter = keywordFilterService.getFilter();
      expect(filter.bannedWords).not.toContain('死ね');
    });

    test('should add warning word', () => {
      keywordFilterService.addWarningWord('テスト警告ワード');
      
      const filter = keywordFilterService.getFilter();
      expect(filter.warningWords).toContain('テスト警告ワード');
    });

    test('should remove warning word', () => {
      keywordFilterService.removeWarningWord('最悪');
      
      const filter = keywordFilterService.getFilter();
      expect(filter.warningWords).not.toContain('最悪');
    });
  });

  describe('改善提案', () => {
    test('should provide suggestions for banned words', () => {
      const result = keywordFilterService.filterComment('死ね！');
      expect(result.suggestions).toContain('頑張って');
      expect(result.suggestions).toContain('応援してる');
    });

    test('should provide suggestions for warning words', () => {
      const result = keywordFilterService.filterComment('最悪');
      expect(result.suggestions).toContain('良くない');
      expect(result.suggestions).toContain('ひどい');
    });

    test('should provide default suggestions for unknown words', () => {
      keywordFilterService.addBannedWord('未知の禁止ワード');
      const result = keywordFilterService.filterComment('未知の禁止ワード');
      expect(result.suggestions).toContain('より良い表現に変更してみましょう');
    });
  });

  describe('フィルタ無効化', () => {
    test('should not filter when disabled', () => {
      keywordFilterService.updateFilter({ isEnabled: false });
      
      const result = keywordFilterService.filterComment('死ね！');
      expect(result.isBlocked).toBe(false);
    });
  });

  describe('エッジケース', () => {
    test('should handle empty string', () => {
      const result = keywordFilterService.filterComment('');
      expect(result.isBlocked).toBe(false);
    });

    test('should handle very long text', () => {
      const longText = 'a'.repeat(1000) + '死ね' + 'b'.repeat(1000);
      const result = keywordFilterService.filterComment(longText);
      expect(result.isBlocked).toBe(true);
    });

    test('should handle text with special characters', () => {
      const result = keywordFilterService.filterComment('死ね！！！');
      expect(result.isBlocked).toBe(true);
    });
  });
});
