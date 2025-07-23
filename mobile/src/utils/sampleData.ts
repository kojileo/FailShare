import { FailureStory } from '../types';

export const sampleStories: FailureStory[] = [
  {
    id: '1',
    authorId: 'user1',
    content: {
      title: 'デートの約束をすっぽかしてしまった',
      category: 'デート',
      situation: '忙しい仕事に追われていて、恋人とのデート約束をうっかり忘れてしまいました。',
      action: 'スケジュール管理を怠り、ダブルブッキングしてしまいました。',
      result: '恋人を長時間待たせてしまい、深く傷つけてしまいました。',
      learning: 'スケジュール管理と相手への配慮の大切さを痛感しました。次回は必ずリマインダーを設定します。',
      emotion: '恥ずかしい'
    },
    metadata: {
      createdAt: new Date(2024, 0, 1),
      viewCount: 156,
      helpfulCount: 23,
      commentCount: 8,
      tags: ['デート', 'スケジュール', '約束', '配慮']
    }
  },
  {
    id: '2',
    authorId: 'user2',
    content: {
      title: '告白の返事を急かしてしまった',
      category: '告白',
      situation: '好きな人に告白しましたが、すぐに返事をもらえませんでした。',
      action: '毎日のように「どうですか？」と返事を急かしてしまいました。',
      result: '相手にプレッシャーを与えてしまい、結局断られてしまいました。',
      learning: '相手のペースを尊重することの重要性を学びました。焦りは禁物です。',
      emotion: '後悔'
    },
    metadata: {
      createdAt: new Date(2024, 0, 2),
      viewCount: 89,
      helpfulCount: 15,
      commentCount: 5,
      tags: ['告白', '返事', 'プレッシャー', 'ペース']
    }
  },
  {
    id: '3',
    authorId: 'user3',
    content: {
      title: '記念日を忘れてしまった',
      category: 'カップル',
      situation: '付き合って1年の記念日でしたが、仕事が忙しくて完全に忘れていました。',
      action: '何の準備もせず、普通の日として過ごしてしまいました。',
      result: '恋人がサプライズを用意してくれていたのに、私は何もしていませんでした。',
      learning: '大切な記念日はしっかりと覚えておき、相手への愛情を表現することが大切だと学びました。',
      emotion: '不安'
    },
    metadata: {
      createdAt: new Date(2024, 0, 3),
      viewCount: 201,
      helpfulCount: 35,
      commentCount: 12,
      tags: ['記念日', '忙しさ', 'サプライズ', '愛情表現']
    }
  }
]; 