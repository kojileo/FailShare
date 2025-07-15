import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  increment, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  where,
  getDoc,
  deleteDoc,
  writeBatch,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { FailureStory, StoryCategory, EmotionType } from '../types';
import { getCategoryNames } from '../utils/categories';

export interface CreateStoryData {
  title: string;
  category: StoryCategory;
  situation: string;
  action: string;
  result: string;
  learning: string;
  emotion: EmotionType;
}

export interface StoryFilters {
  category?: StoryCategory;
  emotion?: EmotionType;
  searchText?: string;
  limit?: number;
  lastVisible?: QueryDocumentSnapshot<DocumentData>;
}

class StoryService {
  private readonly COLLECTION_NAME = 'stories';
  private readonly USERS_COLLECTION = 'anonymousUsers';

  /**
   * 初期サンプルデータを投稿する（開発・デモ用）
   */
  async seedSampleData(): Promise<void> {
    try {
      console.log('サンプルデータの投稿を開始...');

      // サンプルユーザーを作成
      const sampleUsers = [
        {
          id: 'sample_user_1',
          displayName: 'さくらさん',
          joinedAt: new Date(2024, 0, 1),
          stats: { totalPosts: 1, totalComments: 0, helpfulVotes: 0, learningPoints: 0 }
        },
        {
          id: 'sample_user_2', 
          displayName: 'たろうさん',
          joinedAt: new Date(2024, 0, 2),
          stats: { totalPosts: 1, totalComments: 0, helpfulVotes: 0, learningPoints: 0 }
        },
        {
          id: 'sample_user_3',
          displayName: 'みどりさん',
          joinedAt: new Date(2024, 0, 3),
          stats: { totalPosts: 1, totalComments: 0, helpfulVotes: 0, learningPoints: 0 }
        },
        {
          id: 'sample_user_4',
          displayName: 'かずきさん',
          joinedAt: new Date(2024, 0, 4),
          stats: { totalPosts: 1, totalComments: 0, helpfulVotes: 0, learningPoints: 0 }
        },
        {
          id: 'sample_user_5',
          displayName: 'ゆみさん',
          joinedAt: new Date(2024, 0, 5),
          stats: { totalPosts: 1, totalComments: 0, helpfulVotes: 0, learningPoints: 0 }
        },
        {
          id: 'sample_user_6',
          displayName: 'ひろきさん',
          joinedAt: new Date(2024, 0, 6),
          stats: { totalPosts: 1, totalComments: 0, helpfulVotes: 0, learningPoints: 0 }
        }
      ];

      // サンプルユーザーをFirestoreに追加
      for (const user of sampleUsers) {
        const userRef = doc(db, this.USERS_COLLECTION, user.id);
        await updateDoc(userRef, user).catch(async () => {
          // ユーザーが存在しない場合は作成
          await addDoc(collection(db, this.USERS_COLLECTION), user);
        });
      }

      // 二大コンテンツのサンプル失敗談データ（エンジニア関連・恋愛関連）
      const sampleStories = [
        // エンジニア関連の失敗談
        {
          authorId: 'sample_user_1',
          content: {
            title: 'コードレビューで痛烈な指摘を受けた',
            category: 'エンジニア' as StoryCategory,
            situation: '入社して3ヶ月目、初めて大きな機能開発を任されました。先輩エンジニアにコードレビューを依頼する時が来ました。自分では良いコードが書けたと思っていました。',
            action: 'セキュリティやパフォーマンスを深く考えずに、とりあえず動くコードを書いてレビュー依頼しました。コメントも少なく、変数名も適当でした。',
            result: 'レビューで20箇所以上の修正指摘を受けました。「このコードは本番に出せない」と言われ、ほぼ全面的な書き直しになりました。',
            learning: 'コードは書いて終わりではなく、可読性・保守性・セキュリティが重要だと学びました。レビュー前の自己確認の大切さも実感しています。',
            emotion: '恥ずかしい' as EmotionType
          },
          metadata: {
            createdAt: Timestamp.fromDate(new Date(2024, 0, 1)),
            viewCount: 156,
            helpfulCount: 23,
            commentCount: 8,
            tags: ['コードレビュー', '可読性', '保守性', 'セキュリティ']
          }
        },
        {
          authorId: 'sample_user_2',
          content: {
            title: '本番環境で大規模障害を起こした',
            category: 'エンジニア' as StoryCategory,
            situation: 'ECサイトの決済システム改修で、金曜日の夕方にデプロイ作業を行いました。テスト環境では正常に動作していたので安心していました。',
            action: '本番環境とテスト環境の設定差異を十分に確認せず、そのままデプロイしました。また、デプロイ後の動作確認も最小限でした。',
            result: '決済処理が全て失敗するようになり、1時間で数百万円の機会損失が発生しました。週末に緊急対応でロールバック作業を行いました。',
            learning: '本番デプロイは慎重に行うべきで、特に金曜日の夜は避けるべきだと学びました。環境差異の確認とモニタリングの重要性を痛感しています。',
            emotion: '不安' as EmotionType
          },
          metadata: {
            createdAt: Timestamp.fromDate(new Date(2024, 0, 2)),
            viewCount: 289,
            helpfulCount: 45,
            commentCount: 15,
            tags: ['デプロイ', '本番障害', 'ロールバック', 'モニタリング']
          }
        },
        {
          authorId: 'sample_user_3',
          content: {
            title: '転職面接で技術力不足を露呈した',
            category: 'エンジニア' as StoryCategory,
            situation: '憧れの大手IT企業の中途採用面接を受けることになりました。履歴書の経験をアピールして書類選考は通過していました。',
            action: '面接で聞かれそうな技術について表面的な勉強しかせず、実際に手を動かした経験が少ないまま面接に臨みました。',
            result: 'ライブコーディングで基本的なアルゴリズムが書けず、使用技術の深い質問に答えられませんでした。面接官に呆れられました。',
            learning: '技術は知識だけでなく実践経験が重要だと痛感しました。今後は必ず手を動かして学習し、ポートフォリオも充実させます。',
            emotion: '恥ずかしい' as EmotionType
          },
          metadata: {
            createdAt: Timestamp.fromDate(new Date(2024, 0, 3)),
            viewCount: 201,
            helpfulCount: 35,
            commentCount: 12,
            tags: ['転職', '面接', 'ライブコーディング', '技術力']
          }
        },
        // 恋愛関連の失敗談
        {
          authorId: 'sample_user_4',
          content: {
            title: '初デートで高級レストランを選んで失敗',
            category: '恋愛' as StoryCategory,
            situation: 'マッチングアプリで知り合った人と初デートの約束をしました。相手に良い印象を与えたくて、特別な場所を選ぼうと考えました。',
            action: '相手の好みや予算を確認せず、一人で高級フレンチレストランを予約してしまいました。サプライズのつもりでした。',
            result: '相手はカジュアルな服装で来たため、場の雰囲気に困惑していました。緊張して会話も弾まず、気まずい時間を過ごしました。',
            learning: '初デートは相手が気軽に過ごせる場所を選ぶべきでした。相手のことを考えず、自分の印象だけを気にしていたと反省しています。',
            emotion: '後悔' as EmotionType
          },
          metadata: {
            createdAt: Timestamp.fromDate(new Date(2024, 0, 4)),
            viewCount: 178,
            helpfulCount: 28,
            commentCount: 6,
            tags: ['初デート', 'レストラン', 'マッチングアプリ', '気遣い']
          }
        },
        {
          authorId: 'sample_user_5',
          content: {
            title: '友人の恋人に告白してしまった',
            category: '恋愛' as StoryCategory,
            situation: '大学時代の友人グループで遊んでいたとき、友人の恋人に好意を抱いてしまいました。相手も私に優しく接してくれるので、勘違いしていました。',
            action: '友人関係を壊すかもしれないと思いつつも、気持ちを抑えきれずに告白してしまいました。',
            result: '当然断られ、友人にもバレて大きく関係が悪化しました。グループからも距離を置かれ、大切な友人たちを失いました。',
            learning: '人として最低な行為だったと深く反省しています。友情と恋愛の境界を守ることの大切さと、衝動的な行動の危険性を学びました。',
            emotion: '後悔' as EmotionType
          },
          metadata: {
            createdAt: Timestamp.fromDate(new Date(2024, 0, 5)),
            viewCount: 243,
            helpfulCount: 19,
            commentCount: 11,
            tags: ['友人関係', '三角関係', '友情', '裏切り']
          }
        },
        {
          authorId: 'sample_user_6',
          content: {
            title: 'LINEの既読スルーに過剰反応した',
            category: '恋愛' as StoryCategory,
            situation: '付き合って2ヶ月の恋人とLINEでやりとりしていました。いつも即レスしてくれるのに、その日は8時間既読スルーされました。',
            action: '不安になって「何かあった？」「怒ってる？」「返事して」と立て続けにメッセージを送ってしまいました。',
            result: '恋人は仕事で忙しかっただけでしたが、私の過剰な反応に疲れてしまい、「重い」と言われて距離を置かれました。',
            learning: '相手にも都合があることを理解し、適度な距離感を保つことが大切だと学びました。不安でも冷静に対処する必要があります。',
            emotion: '不安' as EmotionType
          },
          metadata: {
            createdAt: Timestamp.fromDate(new Date(2024, 0, 6)),
            viewCount: 167,
            helpfulCount: 31,
            commentCount: 9,
            tags: ['LINE', '既読スルー', '束縛', '距離感']
          }
        }
      ];

      // 既存のサンプルデータを削除してから新しいデータを投稿
      await this.updateSampleData(sampleStories);
    } catch (error) {
      console.error('サンプルデータ投稿エラー:', error);
      throw error;
    }
  }

  /**
   * サンプルデータを強制更新する
   */
  private async updateSampleData(sampleStories: any[]): Promise<void> {
    try {
      // 1. 既存のサンプルデータを削除
      const existingQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('authorId', 'in', ['sample_user_1', 'sample_user_2', 'sample_user_3'])
      );
      const existingDocs = await getDocs(existingQuery);
      
      if (!existingDocs.empty) {
        console.log(`既存のサンプルデータ ${existingDocs.size} 件を削除中...`);
        const batch = writeBatch(db);
        existingDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('既存のサンプルデータを削除しました');
      }

      // 2. 新しいサンプル失敗談を投稿
      for (const story of sampleStories) {
        await addDoc(collection(db, this.COLLECTION_NAME), story);
        console.log(`エンジニア向けサンプル失敗談「${story.content.title}」を投稿しました`);
      }
      console.log('エンジニア向けサンプルデータの投稿完了！');
    } catch (error) {
      console.error('サンプルデータ更新エラー:', error);
      throw error;
    }
  }

  /**
   * 失敗談を投稿する
   */
  async createStory(authorId: string, storyData: CreateStoryData): Promise<string> {
    try {
      // 入力データの検証
      this.validateStoryData(storyData);

      // 投稿データの準備
      const storyDoc = {
        authorId,
        content: {
          title: storyData.title.trim(),
          category: storyData.category,
          situation: storyData.situation.trim(),
          action: storyData.action.trim(),
          result: storyData.result.trim(),
          learning: storyData.learning.trim(),
          emotion: storyData.emotion,
        },
        metadata: {
          createdAt: Timestamp.now(),
          viewCount: 0,
          helpfulCount: 0,
          commentCount: 0,
          tags: this.generateTags(storyData),
        },
      };

      // Firestoreに投稿を保存
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), storyDoc);
      
      // ユーザーの投稿数を更新
      await this.updateUserStats(authorId, 'totalPosts', 1);

      console.log('失敗談投稿成功:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('失敗談投稿エラー:', error);
      throw new Error('投稿に失敗しました');
    }
  }

  /**
   * 失敗談一覧を取得する
   */
  async getStories(filters: StoryFilters = {}): Promise<{
    stories: FailureStory[];
    lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    try {
      // インデックスエラーを回避するため、orderByを削除してクライアントサイドでソート
      let q = query(collection(db, this.COLLECTION_NAME));

      // フィルタリング
      if (filters.category) {
        q = query(q, where('content.category', '==', filters.category));
      }
      if (filters.emotion) {
        q = query(q, where('content.emotion', '==', filters.emotion));
      }

      // テキスト検索がある場合は、より多くのデータを取得してクライアントサイドでフィルタリング
      const pageLimit = filters.searchText ? (filters.limit || 10) * 3 : (filters.limit || 10);
      q = query(q, limit(pageLimit));

      if (filters.lastVisible) {
        q = query(q, startAfter(filters.lastVisible));
      }

      const querySnapshot = await getDocs(q);
      let stories: FailureStory[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stories.push({
          id: doc.id,
          authorId: data.authorId,
          content: data.content,
          metadata: {
            ...data.metadata,
            createdAt: data.metadata.createdAt?.toDate() || new Date(),
          },
        });
      });

      // クライアントサイドで作成日時順にソート
      stories.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());

      // テキスト検索フィルタリング
      if (filters.searchText) {
        stories = this.filterStoriesByText(stories, filters.searchText);
        // テキスト検索後は元のlimit数に調整
        const originalLimit = filters.limit || 10;
        stories = stories.slice(0, originalLimit);
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { stories, lastVisible };
    } catch (error) {
      console.error('失敗談取得エラー:', error);
      throw new Error('データの取得に失敗しました');
    }
  }

  /**
   * 特定の失敗談を取得し、閲覧数を増加させる
   */
  async getStoryById(storyId: string): Promise<FailureStory | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, storyId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      // 閲覧数を増加
      await updateDoc(docRef, {
        'metadata.viewCount': increment(1)
      });

      return {
        id: docSnap.id,
        authorId: data.authorId,
        content: data.content,
        metadata: {
          ...data.metadata,
          createdAt: data.metadata.createdAt?.toDate() || new Date(),
          viewCount: data.metadata.viewCount + 1, // 増加後の値を反映
        },
      };
    } catch (error) {
      console.error('失敗談詳細取得エラー:', error);
      throw new Error('データの取得に失敗しました');
    }
  }

  /**
   * 失敗談に「役に立った」を追加
   */
  async markStoryAsHelpful(storyId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, storyId);
      await updateDoc(docRef, {
        'metadata.helpfulCount': increment(1)
      });
    } catch (error) {
      console.error('役に立ったマークエラー:', error);
      throw new Error('操作に失敗しました');
    }
  }

  /**
   * カテゴリー別の投稿数を取得
   */
  async getCategoryStats(): Promise<{ [key in StoryCategory]: number }> {
    try {
      const categories = getCategoryNames();
      const stats: { [key in StoryCategory]: number } = {} as any;

      for (const category of categories) {
        const q = query(
          collection(db, this.COLLECTION_NAME),
          where('content.category', '==', category)
        );
        const querySnapshot = await getDocs(q);
        stats[category] = querySnapshot.size;
      }

      return stats;
    } catch (error) {
      console.error('カテゴリー統計取得エラー:', error);
      throw new Error('統計データの取得に失敗しました');
    }
  }

  /**
   * 投稿データの検証
   */
  private validateStoryData(data: CreateStoryData): void {
    if (!data.title?.trim()) {
      throw new Error('タイトルは必須です');
    }
    if (!data.category) {
      throw new Error('カテゴリーは必須です');
    }
    if (!data.situation?.trim()) {
      throw new Error('状況の説明は必須です');
    }
    if (!data.action?.trim()) {
      throw new Error('行動の説明は必須です');
    }
    if (!data.result?.trim()) {
      throw new Error('結果の説明は必須です');
    }
    if (!data.learning?.trim()) {
      throw new Error('学びの内容は必須です');
    }
    if (!data.emotion) {
      throw new Error('感情は必須です');
    }

    // 文字数制限
    if (data.title.length > 50) {
      throw new Error('タイトルは50文字以内で入力してください');
    }
    if (data.situation.length > 500) {
      throw new Error('状況は500文字以内で入力してください');
    }
    if (data.action.length > 500) {
      throw new Error('行動は500文字以内で入力してください');
    }
    if (data.result.length > 500) {
      throw new Error('結果は500文字以内で入力してください');
    }
    if (data.learning.length > 500) {
      throw new Error('学びは500文字以内で入力してください');
    }
  }

  /**
   * タグの自動生成
   */
  private generateTags(data: CreateStoryData): string[] {
    const tags: string[] = [];
    
    // カテゴリーとEmotionは必ずタグに含める
    tags.push(data.category, data.emotion);
    
    // タイトルから追加のタグを生成（シンプルなキーワード抽出）
    const keywords = ['転職', '面接', '失恋', '投資', '貯金', '人間関係', '上司', '部下', '仕事'];
    keywords.forEach(keyword => {
      if (data.title.includes(keyword) || data.situation.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)]; // 重複を削除
  }

  /**
   * テキストによるストーリーのフィルタリング
   */
  private filterStoriesByText(stories: FailureStory[], searchText: string): FailureStory[] {
    if (!searchText.trim()) {
      return stories;
    }

    const searchLower = searchText.toLowerCase().trim();
    
    return stories.filter(story => {
      const { content, metadata } = story;
      
      // 検索対象のフィールドを配列にまとめる
      const searchFields = [
        content.title,
        content.situation,
        content.action,
        content.result,
        content.learning,
        content.category,
        content.emotion,
        ...metadata.tags
      ];
      
      // いずれかのフィールドに検索テキストが含まれているかチェック
      return searchFields.some(field => 
        field.toLowerCase().includes(searchLower)
      );
    });
  }

  /**
   * 特定ユーザーの投稿一覧を取得
   */
  async getUserStories(userId: string, filters: Omit<StoryFilters, 'authorId'> = {}): Promise<{
    stories: FailureStory[];
    lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    try {
      // インデックスエラーを回避するため、orderByを削除してクライアントサイドでソート
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('authorId', '==', userId)
      );

      // フィルタリング
      if (filters.category) {
        q = query(q, where('content.category', '==', filters.category));
      }
      if (filters.emotion) {
        q = query(q, where('content.emotion', '==', filters.emotion));
      }

      // テキスト検索がある場合は、より多くのデータを取得してクライアントサイドでフィルタリング
      const pageLimit = filters.searchText ? (filters.limit || 10) * 3 : (filters.limit || 10);
      q = query(q, limit(pageLimit));

      if (filters.lastVisible) {
        q = query(q, startAfter(filters.lastVisible));
      }

      const querySnapshot = await getDocs(q);
      let stories: FailureStory[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stories.push({
          id: doc.id,
          authorId: data.authorId,
          content: data.content,
          metadata: {
            ...data.metadata,
            createdAt: data.metadata.createdAt?.toDate() || new Date(),
          },
        });
      });

      // クライアントサイドで作成日時順にソート
      stories.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());

      // テキスト検索フィルタリング
      if (filters.searchText) {
        stories = this.filterStoriesByText(stories, filters.searchText);
        // テキスト検索後は元のlimit数に調整
        const originalLimit = filters.limit || 10;
        stories = stories.slice(0, originalLimit);
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { stories, lastVisible };
    } catch (error) {
      console.error('ユーザー投稿取得エラー:', error);
      throw new Error('投稿データの取得に失敗しました');
    }
  }

  /**
   * 投稿を削除
   */
  async deleteStory(storyId: string, userId: string): Promise<void> {
    try {
      // 投稿の存在確認と所有者確認
      const docRef = doc(db, this.COLLECTION_NAME, storyId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('投稿が見つかりません');
      }

      const data = docSnap.data();
      if (data.authorId !== userId) {
        throw new Error('この投稿を削除する権限がありません');
      }

      // 投稿を削除
      await deleteDoc(docRef);

      // ユーザー統計を更新（投稿数を減らす）
      await this.updateUserStats(userId, 'totalPosts', -1);

      console.log('投稿削除成功:', storyId);
    } catch (error) {
      console.error('投稿削除エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザー統計の更新
   */
  private async updateUserStats(userId: string, field: string, increment_value: number): Promise<void> {
    try {
      const userDocRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userDocRef, {
        [`stats.${field}`]: increment(increment_value),
        lastActive: Timestamp.now(),
      });
    } catch (error) {
      console.error('ユーザー統計更新エラー:', error);
      // 統計更新の失敗は投稿成功を阻害しないよう、エラーを投げない
    }
  }

  /**
   * 手動でサンプルデータをリセットする（開発用）
   */
  async resetSampleData(): Promise<void> {
    try {
      console.log('サンプルデータをリセット中...');
      
      // 1. 全ての失敗談を削除
      const allStoriesQuery = query(collection(db, this.COLLECTION_NAME));
      const allDocs = await getDocs(allStoriesQuery);
      
      if (!allDocs.empty) {
        const batch = writeBatch(db);
        allDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`${allDocs.size} 件の既存データを削除しました`);
      }

      // 2. seedSampleData()を実行して新しいエンジニア向けデータを投稿
      await this.seedSampleData();
      
      console.log('サンプルデータのリセット完了！');
    } catch (error) {
      console.error('サンプルデータリセットエラー:', error);
      throw error;
    }
  }
}

export const storyService = new StoryService(); 