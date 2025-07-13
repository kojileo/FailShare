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
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { FailureStory, StoryCategory, EmotionType } from '../types';

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
      const categories: StoryCategory[] = ['仕事', '恋愛', 'お金', '健康', '人間関係', '学習', 'その他'];
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
}

export const storyService = new StoryService(); 