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
    const storiesRef = db.collection('stories');
    
    // 既存のサンプルデータを削除（sample_user_で始まるauthorId）
    console.log('🗑️ 既存のサンプルデータを削除中...');
    const existingSampleQuery = await storiesRef.where('authorId', '>=', 'sample_user_').where('authorId', '<', 'sample_user_z').get();
    
    if (!existingSampleQuery.empty) {
      existingSampleQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      console.log(`📝 ${existingSampleQuery.size}件の既存サンプルデータを削除対象に追加`);
    }
    
    // 環境に応じたサンプルデータを取得
    const sampleStories = getSampleStories(env);
    
    // 新しいサンプルデータを追加
    console.log(`➕ ${env}環境用サンプルデータを追加中...`);
    sampleStories.forEach((storyData, index) => {
      const docRef = storiesRef.doc(); // 自動生成ID
      batch.set(docRef, storyData);
      console.log(`📝 サンプル${index + 1}: ${storyData.content.title}`);
    });
    
    // バッチ実行
    await batch.commit();
    
    console.log('✅ サンプルデータの投入が完了しました！');
    console.log(`📊 投入データ数: ${sampleStories.length}件`);
    console.log(`🌍 環境: ${env}`);
    
    // 環境別の特徴を表示
    if (env === 'staging') {
      console.log('🔧 ステージング環境：本番に近い状態でのテスト用データセット');
    } else if (env === 'prod') {
      console.log('🚀 本番環境：品質重視の厳選されたサンプルデータ');
    } else {
      console.log('⚡ 開発環境：開発・デバッグ用の豊富なテストデータ');
    }
    
  } catch (error) {
    console.error('❌ サンプルデータ投入エラー:', error);
    throw error;
  }
}

// データ確認関数
async function verifyData() {
  try {
    console.log('🔍 投入されたデータを確認中...');
    
    const storiesSnapshot = await db.collection('stories')
      .where('authorId', '>=', 'sample_user_')
      .where('authorId', '<', 'sample_user_z')
      .orderBy('authorId')
      .get();
    
    console.log(`📊 確認結果: ${storiesSnapshot.size}件のサンプルデータが存在`);
    
    storiesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.content.title} (${data.authorId})`);
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
対象: Firebase プロジェクトの stories コレクション

実行するには --confirm フラグを追加してください:
  npm run seed-data -- --confirm
  npm run seed-data:dev -- --confirm
  npm run seed-data:prod -- --confirm
  `);
} 