import { KeywordFilter, CommentFilterResult } from '../types';

class KeywordFilterService {
  private filter: KeywordFilter;

  constructor() {
    // 基本的な禁止ワードリスト
    this.filter = {
      bannedWords: [
        '死ね', '殺す', '消えろ', 'うざい', 'きもい', 'むかつく',
        'ばか', 'あほ', 'クソ', 'ゴミ', 'カス', 'ブス', 'デブ',
        'チビ', 'ハゲ', 'キモい', 'うざい', 'むかつく', 'きもい'
      ],
      warningWords: [
        '最悪', '最下位', 'ダメ', '無理', 'できない', '嫌い',
        '苦手', 'つらい', 'しんどい', '疲れた', 'やめたい'
      ],
      isEnabled: true
    };
  }

  /**
   * コメントをフィルタリング
   */
  filterComment(content: string): CommentFilterResult {
    if (!this.filter.isEnabled) {
      return { isBlocked: false };
    }

    const contentLower = content.toLowerCase();

    // 禁止ワードチェック
    for (const word of this.filter.bannedWords) {
      if (contentLower.includes(word.toLowerCase())) {
        return {
          isBlocked: true,
          warningMessage: '不適切な表現が含まれています。',
          suggestions: this.getSuggestions(word)
        };
      }
    }

    // 警告ワードチェック
    for (const word of this.filter.warningWords) {
      if (contentLower.includes(word.toLowerCase())) {
        return {
          isBlocked: false,
          warningMessage: 'より建設的な表現に変更することをお勧めします。',
          suggestions: this.getSuggestions(word)
        };
      }
    }

    return { isBlocked: false };
  }

  /**
   * 投稿内容をフィルタリング
   */
  filterStory(content: string): CommentFilterResult {
    return this.filterComment(content);
  }

  /**
   * 改善提案を取得
   */
  private getSuggestions(bannedWord: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      '死ね': ['頑張って', '応援してる', '一緒に乗り越えよう'],
      '殺す': ['改善したい', '変えたい', '良くしたい'],
      '消えろ': ['距離を置こう', '避けよう', '関わらないようにしよう'],
      'うざい': ['困る', '大変', '難しい'],
      'きもい': ['苦手', '嫌い', '好きじゃない'],
      'むかつく': ['イライラする', '腹が立つ', '困る'],
      'ばか': ['間違ってる', '違う', '正しくない'],
      'あほ': ['間違ってる', '違う', '正しくない'],
      'クソ': ['最悪', 'ひどい', '良くない'],
      'ゴミ': ['価値がない', '意味がない', '役に立たない'],
      'カス': ['価値がない', '意味がない', '役に立たない'],
      'ブス': ['美しくない', '好みじゃない', 'タイプじゃない'],
      'デブ': ['太ってる', '体重が多い', '体型が気になる'],
      'チビ': ['背が低い', '小さい', '身長が低い'],
      'ハゲ': ['髪が薄い', '禿げてる', '髪が少ない'],
      'キモい': ['気持ち悪い', '嫌い', '苦手'],
      '最悪': ['良くない', 'ひどい', '困る'],
      'ダメ': ['できない', '無理', '難しい'],
      '無理': ['難しい', 'できない', '困難'],
      'できない': ['困難', '難しい', '大変'],
      '嫌い': ['苦手', '好きじゃない', '好みじゃない'],
      '苦手': ['得意じゃない', '難しい', '困る'],
      'つらい': ['大変', '困難', 'しんどい'],
      'しんどい': ['大変', '困難', 'つらい'],
      '疲れた': ['大変だった', '困難だった', 'しんどかった'],
      'やめたい': ['辞めたい', '止めたい', '終わりにしたい']
    };

    return suggestions[bannedWord] || ['より良い表現に変更してみましょう'];
  }

  /**
   * フィルタ設定を更新
   */
  updateFilter(newFilter: Partial<KeywordFilter>): void {
    this.filter = { ...this.filter, ...newFilter };
  }

  /**
   * 現在のフィルタ設定を取得
   */
  getFilter(): KeywordFilter {
    return { ...this.filter };
  }

  /**
   * 禁止ワードを追加
   */
  addBannedWord(word: string): void {
    if (!this.filter.bannedWords.includes(word)) {
      this.filter.bannedWords.push(word);
    }
  }

  /**
   * 禁止ワードを削除
   */
  removeBannedWord(word: string): void {
    this.filter.bannedWords = this.filter.bannedWords.filter(w => w !== word);
  }

  /**
   * 警告ワードを追加
   */
  addWarningWord(word: string): void {
    if (!this.filter.warningWords.includes(word)) {
      this.filter.warningWords.push(word);
    }
  }

  /**
   * 警告ワードを削除
   */
  removeWarningWord(word: string): void {
    this.filter.warningWords = this.filter.warningWords.filter(w => w !== word);
  }
}

export const keywordFilterService = new KeywordFilterService();
