import { FailureStory } from '../types';

export const sampleStories: FailureStory[] = [
  {
    id: '1',
    authorId: 'user1',
    content: {
      title: 'プレゼンテーションで大失敗',
      category: '仕事',
      situation: '大事な会議でプレゼンテーションを行うことになりました。準備は完璧だと思っていました。',
      action: '練習を怠り、ぶっつけ本番で発表に挑みました。',
      result: '途中で言葉に詰まり、資料の順番も間違えてしまいました。',
      learning: '十分な練習と準備の大切さを痛感しました。次回は必ず事前練習をします。',
      emotion: '恥ずかしい'
    },
    metadata: {
      createdAt: new Date(2024, 0, 1),
      viewCount: 156,
      helpfulCount: 23,
      commentCount: 8,
      tags: ['プレゼン', '準備不足', '会議']
    }
  },
  {
    id: '2',
    authorId: 'user2',
    content: {
      title: 'デートで道を間違えた',
      category: '恋愛',
      situation: '初デートで素敵なレストランに予約を取りました。',
      action: 'スマホの充電が切れたのに地図を確認せずに向かいました。',
      result: '道に迷って1時間も遅刻してしまいました。',
      learning: '事前準備と余裕を持ったスケジュールの重要性を学びました。',
      emotion: '後悔'
    },
    metadata: {
      createdAt: new Date(2024, 0, 2),
      viewCount: 89,
      helpfulCount: 15,
      commentCount: 5,
      tags: ['デート', '遅刻', '準備不足']
    }
  },
  {
    id: '3',
    authorId: 'user3',
    content: {
      title: '投資で大損失',
      category: 'お金',
      situation: '株式投資を始めて調子に乗っていました。',
      action: '知識不足のまま大きな金額を投資しました。',
      result: '市場の急落で大きな損失を出してしまいました。',
      learning: '投資には十分な知識と冷静な判断が必要だと学びました。',
      emotion: '不安'
    },
    metadata: {
      createdAt: new Date(2024, 0, 3),
      viewCount: 201,
      helpfulCount: 35,
      commentCount: 12,
      tags: ['投資', '株式', '損失']
    }
  }
]; 