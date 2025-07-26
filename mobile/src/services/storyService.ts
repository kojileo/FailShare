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
import { FailureStory, StoryCategory, EmotionType, CategoryHierarchy } from '../types';
import { getCategoryNames } from '../utils/categories';

export interface CreateStoryData {
  title: string;
  category: CategoryHierarchy; // 階層構造に変更
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
  private db: any;
  private COLLECTION_NAME = 'stories';

  constructor() {
    this.db = db;
  }

  /**
   * 投稿を作成
   */
  async createStory(authorId: string, storyData: CreateStoryData): Promise<string> {
    try {
      console.log('🚀 Firestore投稿処理開始:', { authorId, storyData });
      
      const docRef = await addDoc(collection(this.db, this.COLLECTION_NAME), {
        authorId,
        content: storyData,
        metadata: {
          createdAt: Timestamp.now(),
          viewCount: 0,
          helpfulCount: 0,
          commentCount: 0,
          tags: [storyData.category.main, storyData.category.sub, storyData.emotion]
        }
      });
      
      console.log('✅ Firestore投稿成功, ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Firestore投稿エラー:', error);
      throw error;
    }
  }

  /**
   * 投稿一覧を取得 (新API)
   */
  async getStories(): Promise<{ stories: FailureStory[] }>;
  async getStories(limitCount: number, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ stories: FailureStory[], lastDocument?: QueryDocumentSnapshot<DocumentData> }>;
  async getStories(filters: StoryFilters): Promise<{ stories: FailureStory[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }>;
  async getStories(
    arg1?: number | StoryFilters, 
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ stories: FailureStory[], lastDocument?: QueryDocumentSnapshot<DocumentData>, lastVisible?: QueryDocumentSnapshot<DocumentData> | null }> {
    try {
      // 引数の型判定
      let limitCount = 20;
      let filters: StoryFilters = {};
      
      if (typeof arg1 === 'number') {
        // 新API: getStories(limitCount, lastDoc)
        limitCount = arg1;
        console.log('📖 ストーリー取得開始 (新API):', { limitCount, hasLastDoc: !!lastDoc });
      } else if (arg1) {
        // 旧API: getStories(filters)
        filters = arg1;
        limitCount = filters.limit || 20;
        lastDoc = filters.lastVisible;
        console.log('📖 ストーリー取得開始 (旧API):', filters);
      } else {
        // 引数なし: getStories()
        console.log('📖 ストーリー取得開始 (デフォルト)');
      }
      
      // インデックスエラーを回避するため、orderByを削除してクライアントサイドでソート
      let q = query(collection(this.db, this.COLLECTION_NAME));

      // フィルタリング
      if (filters.category) {
        q = query(q, where('content.category', '==', filters.category));
      }
      if (filters.emotion) {
        q = query(q, where('content.emotion', '==', filters.emotion));
      }

      // テキスト検索がある場合は、より多くのデータを取得してクライアントサイドでフィルタリング
      const pageLimit = filters.searchText ? limitCount * 3 : limitCount;
      q = query(q, limit(pageLimit));

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      const querySnapshot = await getDocs(q);
      console.log('📊 取得件数:', querySnapshot.size);
      
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
          }
        });
      });

      // クライアントサイドで作成日時順にソート
      stories.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());

      // テキスト検索フィルタリング
      if (filters.searchText) {
        stories = this.filterStoriesByText(stories, filters.searchText);
        // テキスト検索後は元のlimit数に調整
        stories = stories.slice(0, limitCount);
      }

      const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      console.log('✅ ストーリー取得完了');
      
      return {
        stories,
        lastDocument,
        lastVisible: lastDocument || null
      };
    } catch (error) {
      console.error('❌ ストーリー取得エラー:', error);
      throw error;
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
    tags.push(data.category.main, data.category.sub, data.emotion);
    
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
        content.category.main,
        content.category.sub,
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

      console.log('投稿削除成功:', storyId);
    } catch (error) {
      console.error('投稿削除エラー:', error);
      throw error;
    }
  }
}

export const storyService = new StoryService(); 