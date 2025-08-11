const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const env = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'dev';

console.log(`🚀 サンプルデータ投入スクリプト開始 (環境: ${env})`);

// Firebase Admin SDK の初期化
let serviceAccount;
try {
  // サービスアカウントキーのパス
  const serviceAccountPath = path.join(__dirname, `../config/firebase-admin-${env}.json`);
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ サービスアカウントキーが見つかりません: ${serviceAccountPath}`);
    console.error(`
📋 セットアップ手順:
1. Firebase Console > プロジェクト設定 > サービスアカウント
2. 新しい秘密鍵を生成 > JSONファイルをダウンロード
3. ファイル名を firebase-admin-${env}.json に変更
4. mobile/config/ フォルダに配置
    `);
    process.exit(1);
  }
  
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('❌ サービスアカウントキーの読み込みエラー:', error.message);
  process.exit(1);
}

// Firebase Admin の初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // プロジェクトIDは自動的に設定される
});

const db = admin.firestore();

// サンプルユーザーデータ定義
const getSampleUsers = () => {
  return [
    {
      id: 'sample_user_1',
      displayName: '田中太郎',
      email: 'tanaka@example.com',
      avatarUrl: 'https://robohash.org/tanaka?set=set4',
      bio: '失敗から学ぶことが大好きなエンジニアです。',
      interests: ['プログラミング', '読書', '旅行'],
      stats: {
        totalPosts: 3,
        totalLikes: 45,
        totalComments: 12,
        friendsCount: 2,
        communitiesCount: 1
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 1)),
      lastActiveAt: admin.firestore.Timestamp.fromDate(new Date())
    },
    {
      id: 'sample_user_2',
      displayName: '佐藤花子',
      email: 'sato@example.com',
      avatarUrl: 'https://robohash.org/sato?set=set4',
      bio: '恋愛の失敗談を共有して、みんなで成長しましょう！',
      interests: ['恋愛', 'カフェ巡り', '映画鑑賞'],
      stats: {
        totalPosts: 2,
        totalLikes: 38,
        totalComments: 8,
        friendsCount: 3,
        communitiesCount: 2
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 2)),
      lastActiveAt: admin.firestore.Timestamp.fromDate(new Date())
    },
    {
      id: 'sample_user_3',
      displayName: '山田次郎',
      email: 'yamada@example.com',
      avatarUrl: 'https://robohash.org/yamada?set=set4',
      bio: '仕事での失敗を糧に、より良いエンジニアを目指しています。',
      interests: ['プログラミング', 'ゲーム', '音楽'],
      stats: {
        totalPosts: 1,
        totalLikes: 22,
        totalComments: 5,
        friendsCount: 1,
        communitiesCount: 1
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 3)),
      lastActiveAt: admin.firestore.Timestamp.fromDate(new Date())
    },
    {
      id: 'sample_user_4',
      displayName: '鈴木美咲',
      email: 'suzuki@example.com',
      avatarUrl: 'https://robohash.org/suzuki?set=set4',
      bio: 'デザイナーとして、失敗から学ぶことの大切さを実感しています。',
      interests: ['デザイン', 'アート', '写真'],
      stats: {
        totalPosts: 2,
        totalLikes: 31,
        totalComments: 9,
        friendsCount: 2,
        communitiesCount: 1
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 4)),
      lastActiveAt: admin.firestore.Timestamp.fromDate(new Date())
    },
    {
      id: 'sample_user_5',
      displayName: '高橋健太',
      email: 'takahashi@example.com',
      avatarUrl: 'https://robohash.org/takahashi?set=set4',
      bio: 'マネージャーとして、チーム運営の失敗談を共有します。',
      interests: ['マネジメント', 'リーダーシップ', '読書'],
      stats: {
        totalPosts: 1,
        totalLikes: 18,
        totalComments: 4,
        friendsCount: 1,
        communitiesCount: 1
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 5)),
      lastActiveAt: admin.firestore.Timestamp.fromDate(new Date())
    },
    {
      id: 'sample_user_6',
      displayName: '伊藤愛',
      email: 'ito@example.com',
      avatarUrl: 'https://robohash.org/ito?set=set4',
      bio: '転職活動の失敗談を共有して、みんなの参考になればと思います。',
      interests: ['キャリア', '転職', '自己啓発'],
      stats: {
        totalPosts: 1,
        totalLikes: 25,
        totalComments: 6,
        friendsCount: 0,
        communitiesCount: 0
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 6)),
      lastActiveAt: admin.firestore.Timestamp.fromDate(new Date())
    }
  ];
};

// フレンドシップデータ定義
const getSampleFriendships = () => {
  return [
    {
      id: 'friendship_1_2',
      userId: 'sample_user_1',
      friendId: 'sample_user_2',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 10))
    },
    {
      id: 'friendship_2_1',
      userId: 'sample_user_2',
      friendId: 'sample_user_1',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 10))
    },
    {
      id: 'friendship_1_3',
      userId: 'sample_user_1',
      friendId: 'sample_user_3',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 12))
    },
    {
      id: 'friendship_3_1',
      userId: 'sample_user_3',
      friendId: 'sample_user_1',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 12))
    },
    {
      id: 'friendship_2_4',
      userId: 'sample_user_2',
      friendId: 'sample_user_4',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 15))
    },
    {
      id: 'friendship_4_2',
      userId: 'sample_user_4',
      friendId: 'sample_user_2',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 15))
    },
    {
      id: 'friendship_2_5',
      userId: 'sample_user_2',
      friendId: 'sample_user_5',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 18))
    },
    {
      id: 'friendship_5_2',
      userId: 'sample_user_5',
      friendId: 'sample_user_2',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 18))
    },
    {
      id: 'friendship_4_5',
      userId: 'sample_user_4',
      friendId: 'sample_user_5',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 20))
    },
    {
      id: 'friendship_5_4',
      userId: 'sample_user_5',
      friendId: 'sample_user_4',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 20))
    }
  ];
};

// フレンドリクエストデータ定義
const getSampleFriendRequests = () => {
  return [
    {
      id: 'request_6_1',
      fromUserId: 'sample_user_6',
      toUserId: 'sample_user_1',
      message: '失敗談を共有して、お互いに学び合いましょう！',
      status: 'pending',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 22))
    },
    {
      id: 'request_6_3',
      fromUserId: 'sample_user_6',
      toUserId: 'sample_user_3',
      message: 'エンジニアとして、技術的な失敗談を聞かせてください。',
      status: 'pending',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 23))
    },
    {
      id: 'request_3_4',
      fromUserId: 'sample_user_3',
      toUserId: 'sample_user_4',
      message: 'デザインの失敗談、興味があります！',
      status: 'pending',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 24))
    }
  ];
};

// フレンド推薦データ定義
const getSampleFriendRecommendations = () => {
  return [
    {
      userId: 'sample_user_6',
      recommendations: [
        {
          userId: 'sample_user_1',
          displayName: '田中太郎',
          avatarUrl: 'https://robohash.org/tanaka?set=set4',
          commonInterests: ['プログラミング'],
          mutualFriends: 0,
          score: 0.8
        },
        {
          userId: 'sample_user_3',
          displayName: '山田次郎',
          avatarUrl: 'https://robohash.org/yamada?set=set4',
          commonInterests: ['プログラミング'],
          mutualFriends: 0,
          score: 0.7
        },
        {
          userId: 'sample_user_4',
          displayName: '鈴木美咲',
          avatarUrl: 'https://robohash.org/suzuki?set=set4',
          commonInterests: [],
          mutualFriends: 0,
          score: 0.5
        }
      ]
    },
    {
      userId: 'sample_user_3',
      recommendations: [
        {
          userId: 'sample_user_4',
          displayName: '鈴木美咲',
          avatarUrl: 'https://robohash.org/suzuki?set=set4',
          commonInterests: [],
          mutualFriends: 0,
          score: 0.6
        },
        {
          userId: 'sample_user_5',
          displayName: '高橋健太',
          avatarUrl: 'https://robohash.org/takahashi?set=set4',
          commonInterests: [],
          mutualFriends: 0,
          score: 0.5
        }
      ]
    }
  ];
};

// サンプルデータ定義（環境別）
const getSampleStories = (env) => {
  const baseStories = [
    {
      authorId: 'sample_user_1',
      content: {
        title: '初デートで高級レストランを選んで失敗',
        category: { main: '恋愛', sub: 'デート' },
        situation: 'マッチングアプリで知り合った人と初デートの約束をしました。相手に良い印象を与えたくて、特別な場所を選ぼうと考えました。',
        action: '相手の好みや予算を確認せず、一人で高級フレンチレストランを予約してしまいました。サプライズのつもりでした。',
        result: '相手はカジュアルな服装で来たため、場の雰囲気に困惑していました。緊張して会話も弾まず、気まずい時間を過ごしました。',
        learning: '初デートは相手が気軽に過ごせる場所を選ぶべきでした。相手のことを考えず、自分の印象だけを気にしていたと反省しています。',
        emotion: '後悔'
      },
      metadata: {
        createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 1)),
        viewCount: 178,
        helpfulCount: 28,
        commentCount: 6,
        tags: ['初デート', 'レストラン', 'マッチングアプリ', '気遣い']
      }
    },
    {
      authorId: 'sample_user_2',
      content: {
        title: '友人の恋人に告白してしまった',
        category: { main: '恋愛', sub: '告白' },
        situation: '大学時代の友人グループで遊んでいたとき、友人の恋人に好意を抱いてしまいました。相手も私に優しく接してくれるので、勘違いしていました。',
        action: '友人関係を壊すかもしれないと思いつつも、気持ちを抑えきれずに告白してしまいました。',
        result: '当然断られ、友人にもバレて大きく関係が悪化しました。グループからも距離を置かれ、大切な友人たちを失いました。',
        learning: '人として最低な行為だったと深く反省しています。友情と恋愛の境界を守ることの大切さと、衝動的な行動の危険性を学びました。',
        emotion: '後悔'
      },
      metadata: {
        createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 2)),
        viewCount: 243,
        helpfulCount: 19,
        commentCount: 11,
        tags: ['友人関係', '三角関係', '友情', '裏切り']
      }
    },
    {
      authorId: 'sample_user_3',
      content: {
        title: 'LINEの既読スルーに過剰反応した',
        category: { main: '恋愛', sub: 'カップル' },
        situation: '付き合って2ヶ月の恋人とLINEでやりとりしていました。いつも即レスしてくれるのに、その日は8時間既読スルーされました。',
        action: '不安になって「何かあった？」「怒ってる？」「返事して」と立て続けにメッセージを送ってしまいました。',
        result: '恋人は仕事で忙しかっただけでしたが、私の過剰な反応に疲れてしまい、「重い」と言われて距離を置かれました。',
        learning: '相手にも都合があることを理解し、適度な距離感を保つことが大切だと学びました。不安でも冷静に対処する必要があります。',
        emotion: '恥ずかしい'
      },
      metadata: {
        createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 3)),
        viewCount: 156,
        helpfulCount: 34,
        commentCount: 8,
        tags: ['LINE', '既読スルー', '束縛', '依存']
      }
    }
  ];

  if (env === 'staging') {
    // ステージング環境用：より多くのテストデータ
    return [
      ...baseStories,
      {
        authorId: 'sample_user_4',
        content: {
          title: '会議で準備不足を露呈（ステージング）',
          category: { main: '仕事', sub: 'プレゼン・会議' },
          situation: 'ステージング環境でのテスト用データです。重要なクライアントとの会議で、新サービスの提案を任されました。',
          action: '「なんとかなるだろう」と楽観視し、前日の夜に資料をざっと見ただけで臨みました。',
          result: 'クライアントからの質問に答えられず、データも曖昧で、信頼を大きく失いました。商談は破談になりました。',
          learning: '準備こそが最重要だと痛感しました。忙しくても、優先順位をつけて時間を確保すべきでした。',
          emotion: '後悔'
        },
        metadata: {
          createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 4)),
          viewCount: 89,
          helpfulCount: 15,
          commentCount: 4,
          tags: ['準備不足', 'クライアント', '商談', 'staging']
        }
      },
      {
        authorId: 'sample_user_5',
        content: {
          title: 'プロジェクト管理での失敗（ステージング）',
          category: { main: '仕事', sub: 'プロジェクト管理' },
          situation: 'ステージング環境用テストデータ。プロジェクトで予期しない技術的問題が発生しました。',
          action: '上司に相談せず、一人で問題解決に取り組み続けました。「解決してから報告しよう」と考えていました。',
          result: '問題はさらに複雑化し、納期に大幅な遅れが生じました。上司からは「なぜ早く相談しなかったのか」と厳しく叱責されました。',
          learning: '問題が起きたら即座に報告・相談することの重要性を学びました。一人で抱え込むのは危険です。',
          emotion: '後悔'
        },
        metadata: {
          createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 5)),
          viewCount: 134,
          helpfulCount: 22,
          commentCount: 7,
          tags: ['報告', '相談', 'プロジェクト', 'staging']
        }
      },
      {
        authorId: 'sample_user_6',
        content: {
          title: '転職活動での誤算（ステージング）',
          category: { main: '仕事', sub: '転職・キャリア' },
          situation: 'ステージング用データ。転職活動で理想と現実のギャップに直面しました。',
          action: '現職の不満ばかりを面接で話してしまいました。前向きな転職理由を準備していませんでした。',
          result: '複数の企業で「ネガティブな印象」を与えてしまい、なかなか内定が取れませんでした。',
          learning: '転職では前向きな理由とビジョンを語ることが重要だと学びました。不満だけでは説得力がありません。',
          emotion: '恥ずかしい'
        },
        metadata: {
          createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 6)),
          viewCount: 167,
          helpfulCount: 25,
          commentCount: 9,
          tags: ['転職', '面接', 'ネガティブ', 'staging']
        }
      }
    ];
  } else if (env === 'prod') {
    // 本番環境用：品質の高い少数精鋭データ
    return baseStories;
  } else {
    // 開発環境用：基本データ + 追加テストデータ
    return [
      ...baseStories,
      {
        authorId: 'sample_user_4',
        content: {
          title: '会議で準備不足を露呈',
          category: { main: '仕事', sub: 'プレゼン・会議' },
          situation: '重要なクライアントとの会議で、新サービスの提案を任されました。他の業務が忙しく、準備時間が取れませんでした。',
          action: '「なんとかなるだろう」と楽観視し、前日の夜に資料をざっと見ただけで臨みました。',
          result: 'クライアントからの質問に答えられず、データも曖昧で、信頼を大きく失いました。商談は破談になりました。',
          learning: '準備こそが最重要だと痛感しました。忙しくても、優先順位をつけて時間を確保すべきでした。',
          emotion: '後悔'
        },
        metadata: {
          createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 4)),
          viewCount: 89,
          helpfulCount: 15,
          commentCount: 4,
          tags: ['準備不足', 'クライアント', '商談', '時間管理']
        }
      },
      {
        authorId: 'sample_user_5',
        content: {
          title: '上司への報告を怠って問題が拡大',
          category: { main: '仕事', sub: 'プロジェクト管理' },
          situation: 'プロジェクトで予期しない技術的問題が発生しました。解決に時間がかかりそうでしたが、自分で何とかしたいと思いました。',
          action: '上司に相談せず、一人で問題解決に取り組み続けました。「解決してから報告しよう」と考えていました。',
          result: '問題はさらに複雑化し、納期に大幅な遅れが生じました。上司からは「なぜ早く相談しなかったのか」と厳しく叱責されました。',
          learning: '問題が起きたら即座に報告・相談することの重要性を学びました。一人で抱え込むのは危険です。',
          emotion: '後悔'
        },
        metadata: {
          createdAt: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 5)),
          viewCount: 134,
          helpfulCount: 22,
          commentCount: 7,
          tags: ['報告', '相談', 'プロジェクト', '納期遅れ']
        }
      }
    ];
  }
};

// データ投入関数
async function seedData() {
  try {
    console.log('📊 Firestoreへのサンプルデータ投入を開始...');
    
    const batch = db.batch();
    
    // 1. サンプルユーザーデータの投入
    console.log('👥 サンプルユーザーデータを投入中...');
    const usersRef = db.collection('users');
    const sampleUsers = getSampleUsers();
    
    // 既存のサンプルユーザーを削除
    const existingUsersQuery = await usersRef.where('id', '>=', 'sample_user_').where('id', '<', 'sample_user_z').get();
    if (!existingUsersQuery.empty) {
      existingUsersQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      console.log(`🗑️ ${existingUsersQuery.size}件の既存サンプルユーザーを削除対象に追加`);
    }
    
    // 新しいサンプルユーザーを追加
    sampleUsers.forEach((userData) => {
      const docRef = usersRef.doc(userData.id);
      batch.set(docRef, userData);
      console.log(`👤 ユーザー: ${userData.displayName} (${userData.id})`);
    });
    
    // 2. フレンドシップデータの投入
    console.log('🤝 フレンドシップデータを投入中...');
    const friendshipsRef = db.collection('friendships');
    const sampleFriendships = getSampleFriendships();
    
    // 既存のサンプルフレンドシップを削除
    const existingFriendshipsQuery = await friendshipsRef.where('userId', '>=', 'sample_user_').where('userId', '<', 'sample_user_z').get();
    if (!existingFriendshipsQuery.empty) {
      existingFriendshipsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      console.log(`🗑️ ${existingFriendshipsQuery.size}件の既存サンプルフレンドシップを削除対象に追加`);
    }
    
    // 新しいフレンドシップを追加
    sampleFriendships.forEach((friendshipData) => {
      const docRef = friendshipsRef.doc(friendshipData.id);
      batch.set(docRef, friendshipData);
      console.log(`🤝 フレンドシップ: ${friendshipData.userId} ↔ ${friendshipData.friendId}`);
    });
    
    // 3. フレンドリクエストデータの投入
    console.log('📨 フレンドリクエストデータを投入中...');
    const friendRequestsRef = db.collection('friendRequests');
    const sampleFriendRequests = getSampleFriendRequests();
    
    // 既存のサンプルフレンドリクエストを削除
    const existingRequestsQuery = await friendRequestsRef.where('fromUserId', '>=', 'sample_user_').where('fromUserId', '<', 'sample_user_z').get();
    if (!existingRequestsQuery.empty) {
      existingRequestsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      console.log(`🗑️ ${existingRequestsQuery.size}件の既存サンプルフレンドリクエストを削除対象に追加`);
    }
    
    // 新しいフレンドリクエストを追加
    sampleFriendRequests.forEach((requestData) => {
      const docRef = friendRequestsRef.doc(requestData.id);
      batch.set(docRef, requestData);
      console.log(`📨 フレンドリクエスト: ${requestData.fromUserId} → ${requestData.toUserId}`);
    });
    
    // 4. フレンド推薦データの投入
    console.log('💡 フレンド推薦データを投入中...');
    const recommendationsRef = db.collection('friendRecommendations');
    const sampleRecommendations = getSampleFriendRecommendations();
    
    // 既存のサンプル推薦データを削除
    const existingRecommendationsQuery = await recommendationsRef.where('userId', '>=', 'sample_user_').where('userId', '<', 'sample_user_z').get();
    if (!existingRecommendationsQuery.empty) {
      existingRecommendationsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      console.log(`🗑️ ${existingRecommendationsQuery.size}件の既存サンプル推薦データを削除対象に追加`);
    }
    
    // 新しい推薦データを追加
    sampleRecommendations.forEach((recommendationData) => {
      const docRef = recommendationsRef.doc(recommendationData.userId);
      batch.set(docRef, recommendationData);
      console.log(`💡 推薦データ: ${recommendationData.userId} (${recommendationData.recommendations.length}件の推薦)`);
    });
    
    // 5. ストーリーデータの投入（既存の処理）
    console.log('📝 ストーリーデータを投入中...');
    const storiesRef = db.collection('stories');
    
    // 既存のサンプルストーリーを削除
    const existingStoriesQuery = await storiesRef.where('authorId', '>=', 'sample_user_').where('authorId', '<', 'sample_user_z').get();
    if (!existingStoriesQuery.empty) {
      existingStoriesQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      console.log(`🗑️ ${existingStoriesQuery.size}件の既存サンプルストーリーを削除対象に追加`);
    }
    
    // 環境に応じたサンプルストーリーを取得
    const sampleStories = getSampleStories(env);
    
    // 新しいサンプルストーリーを追加
    sampleStories.forEach((storyData, index) => {
      const docRef = storiesRef.doc(); // 自動生成ID
      batch.set(docRef, storyData);
      console.log(`📝 ストーリー${index + 1}: ${storyData.content.title}`);
    });
    
    // バッチ実行
    await batch.commit();
    
    console.log('✅ サンプルデータの投入が完了しました！');
    console.log(`📊 投入データ数:`);
    console.log(`  👥 ユーザー: ${sampleUsers.length}件`);
    console.log(`  🤝 フレンドシップ: ${sampleFriendships.length}件`);
    console.log(`  📨 フレンドリクエスト: ${sampleFriendRequests.length}件`);
    console.log(`  💡 フレンド推薦: ${sampleRecommendations.length}件`);
    console.log(`  📝 ストーリー: ${sampleStories.length}件`);
    console.log(`🌍 環境: ${env}`);
    
    // 環境別の特徴を表示
    if (env === 'staging') {
      console.log('🔧 ステージング環境：本番に近い状態でのテスト用データセット');
    } else if (env === 'prod') {
      console.log('🚀 本番環境：品質重視の厳選されたサンプルデータ');
    } else {
      console.log('⚡ 開発環境：開発・デバッグ用の豊富なテストデータ');
    }
    
    console.log('\n🎯 フレンド機能テスト用データ:');
    console.log('  • sample_user_1 と sample_user_2 はフレンド関係');
    console.log('  • sample_user_6 から sample_user_1,3 にフレンドリクエスト送信中');
    console.log('  • sample_user_3 から sample_user_4 にフレンドリクエスト送信中');
    console.log('  • sample_user_6 には3件のフレンド推薦が表示される');
    
  } catch (error) {
    console.error('❌ サンプルデータ投入エラー:', error);
    throw error;
  }
}

// データ確認関数
async function verifyData() {
  try {
    console.log('🔍 投入されたデータを確認中...');
    
    // ユーザーデータの確認
    const usersSnapshot = await db.collection('users')
      .where('id', '>=', 'sample_user_')
      .where('id', '<', 'sample_user_z')
      .orderBy('id')
      .get();
    
    console.log(`👥 ユーザー: ${usersSnapshot.size}件`);
    
    // フレンドシップデータの確認
    const friendshipsSnapshot = await db.collection('friendships')
      .where('userId', '>=', 'sample_user_')
      .where('userId', '<', 'sample_user_z')
      .get();
    
    console.log(`🤝 フレンドシップ: ${friendshipsSnapshot.size}件`);
    
    // フレンドリクエストデータの確認
    const requestsSnapshot = await db.collection('friendRequests')
      .where('fromUserId', '>=', 'sample_user_')
      .where('fromUserId', '<', 'sample_user_z')
      .get();
    
    console.log(`📨 フレンドリクエスト: ${requestsSnapshot.size}件`);
    
    // フレンド推薦データの確認
    const recommendationsSnapshot = await db.collection('friendRecommendations')
      .where('userId', '>=', 'sample_user_')
      .where('userId', '<', 'sample_user_z')
      .get();
    
    console.log(`💡 フレンド推薦: ${recommendationsSnapshot.size}件`);
    
    // ストーリーデータの確認
    const storiesSnapshot = await db.collection('stories')
      .where('authorId', '>=', 'sample_user_')
      .where('authorId', '<', 'sample_user_z')
      .orderBy('authorId')
      .get();
    
    console.log(`📝 ストーリー: ${storiesSnapshot.size}件`);
    
    console.log('\n📋 サンプルユーザー一覧:');
    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`  • ${data.displayName} (${data.id}) - フレンド数: ${data.stats.friendsCount}`);
    });
    
  } catch (error) {
    console.error('❌ データ確認エラー:', error);
  }
}

// メイン実行
async function main() {
  try {
    await seedData();
    await verifyData();
    
    console.log('🎉 サンプルデータ投入スクリプトが正常に完了しました！');
    console.log('\n🚀 フレンド機能のテスト方法:');
    console.log('1. アプリを起動して sample_user_1 でログイン');
    console.log('2. プロフィール画面から「フレンド」をタップ');
    console.log('3. フレンド一覧、リクエスト、検索機能をテスト');
    console.log('4. 他のユーザーでログインしてフレンド機能を確認');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ スクリプト実行エラー:', error);
    process.exit(1);
  }
}

// 実行確認
if (process.argv.includes('--confirm')) {
  main();
} else {
  console.log(`
⚠️  このスクリプトは Firestore にサンプルデータを投入します。

環境: ${env}
対象: Firebase プロジェクトの以下のコレクション
  • users (サンプルユーザー)
  • friendships (フレンド関係)
  • friendRequests (フレンドリクエスト)
  • friendRecommendations (フレンド推薦)
  • stories (失敗談)

実行するには --confirm フラグを追加してください:
  npm run seed-data -- --confirm
  npm run seed-data:dev -- --confirm
  npm run seed-data:prod -- --confirm
  `);
} 