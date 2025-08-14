import { db } from './firebase';
import { collection, addDoc, deleteDoc, getDocs, query, where, doc, onSnapshot, Timestamp, updateDoc, increment, Firestore } from 'firebase/firestore';
import { Like, LikeStats, LikeService as ILikeService } from '../types';

class LikeService implements ILikeService {
  private readonly COLLECTION_NAME = 'likes';

  constructor(private db: Firestore) {}

  async addLike(storyId: string, userId: string): Promise<void> {
    try {
      console.log('❤️ いいね追加処理開始:', { storyId, userId });
      const existingLike = await this.isLikedByUser(storyId, userId);
      if (existingLike) {
        throw new Error('既にいいね済みです');
      }
      
      // likesコレクションにいいねを追加
      const docRef = await addDoc(collection(this.db, this.COLLECTION_NAME), {
        storyId,
        userId,
        createdAt: Timestamp.now()
      });
      
      // storiesコレクションのhelpfulCountを+1
      const storyRef = doc(this.db, 'stories', storyId);
      await updateDoc(storyRef, {
        'metadata.helpfulCount': increment(1)
      });
      
      console.log('✅ いいね追加成功, ID:', docRef.id);
    } catch (error) {
      console.error('❌ いいね追加エラー:', error);
      throw error;
    }
  }

  async removeLike(storyId: string, userId: string): Promise<void> {
    try {
      console.log('💔 いいね削除処理開始:', { storyId, userId });
      const likesQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('storyId', '==', storyId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(likesQuery);
      
      if (querySnapshot.empty) {
        throw new Error('いいねが見つかりません');
      }
      
      // likesコレクションからいいねを削除
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // storiesコレクションのhelpfulCountを-1
      const storyRef = doc(this.db, 'stories', storyId);
      await updateDoc(storyRef, {
        'metadata.helpfulCount': increment(-1)
      });
      
      console.log('✅ いいね削除成功');
    } catch (error) {
      console.error('❌ いいね削除エラー:', error);
      throw error;
    }
  }

  async getHelpfulCount(storyId: string): Promise<number> {
    try {
      console.log('📊 いいね数取得開始:', storyId);
      const likesQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('storyId', '==', storyId)
      );
      const querySnapshot = await getDocs(likesQuery);
      const count = querySnapshot.size;
      console.log('✅ いいね数取得成功:', count);
      return count;
    } catch (error) {
      console.error('❌ いいね数取得エラー:', error);
      throw error;
    }
  }

  async isLikedByUser(storyId: string, userId: string): Promise<boolean> {
    try {
      console.log('🔍 いいね状態確認開始:', { storyId, userId });
      const likesQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('storyId', '==', storyId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(likesQuery);
      const isLiked = !querySnapshot.empty;
      console.log('✅ いいね状態確認成功:', isLiked);
      return isLiked;
    } catch (error) {
      console.error('❌ いいね状態確認エラー:', error);
      throw error;
    }
  }

  async getLikesByUser(userId: string): Promise<Like[]> {
    try {
      console.log('👤 ユーザーのいいね取得開始:', userId);
      const likesQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(likesQuery);
      const likes: Like[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        storyId: doc.data().storyId,
        userId: doc.data().userId,
        createdAt: doc.data().createdAt.toDate()
      }));
      console.log('✅ ユーザーのいいね取得成功:', likes.length);
      return likes;
    } catch (error) {
      console.error('❌ ユーザーのいいね取得エラー:', error);
      throw error;
    }
  }

  async getLikesForStory(storyId: string): Promise<Like[]> {
    try {
      console.log('📖 ストーリーのいいね取得開始:', storyId);
      const likesQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('storyId', '==', storyId)
      );
      const querySnapshot = await getDocs(likesQuery);
      const likes: Like[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        storyId: doc.data().storyId,
        userId: doc.data().userId,
        createdAt: doc.data().createdAt.toDate()
      }));
      console.log('✅ ストーリーのいいね取得成功:', likes.length);
      return likes;
    } catch (error) {
      console.error('❌ ストーリーのいいね取得エラー:', error);
      throw error;
    }
  }

  subscribeToLikes(storyId: string, callback: (likes: Like[]) => void): () => void {
    console.log('👂 いいねリアルタイム監視開始:', storyId);
    const likesQuery = query(
      collection(this.db, this.COLLECTION_NAME),
      where('storyId', '==', storyId)
    );
    
    const unsubscribe = onSnapshot(likesQuery, (querySnapshot) => {
      const likes: Like[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        storyId: doc.data().storyId,
        userId: doc.data().userId,
        createdAt: doc.data().createdAt.toDate()
      }));
      callback(likes);
    }, (error) => {
      console.error('❌ いいねリアルタイム監視エラー:', error);
    });
    
    return unsubscribe;
  }

  async getLikeStatsForStories(storyIds: string[], userId: string): Promise<{ [storyId: string]: LikeStats }> {
    try {
      console.log('📊 複数ストーリーのいいね統計取得開始:', { storyIds, userId });
      const stats: { [storyId: string]: LikeStats } = {};
      
      // 各ストーリーのいいね数を並行取得
      const helpfulCountPromises = storyIds.map(async (storyId) => {
        const count = await this.getHelpfulCount(storyId);
        return { storyId, count };
      });
      
      // 各ストーリーのいいね状態を並行取得
      const likeStatusPromises = storyIds.map(async (storyId) => {
        const isLiked = await this.isLikedByUser(storyId, userId);
        return { storyId, isLiked };
      });
      
      const [helpfulCounts, likeStatuses] = await Promise.all([
        Promise.all(helpfulCountPromises),
        Promise.all(likeStatusPromises)
      ]);
      
      // 結果を統合
      storyIds.forEach(storyId => {
        const countData = helpfulCounts.find(item => item.storyId === storyId);
        const statusData = likeStatuses.find(item => item.storyId === storyId);
        
        stats[storyId] = {
          storyId,
          helpfulCount: countData?.count || 0,
          isLikedByCurrentUser: statusData?.isLiked || false
        };
      });
      
      console.log('✅ 複数ストーリーのいいね統計取得成功:', Object.keys(stats).length);
      return stats;
    } catch (error) {
      console.error('❌ 複数ストーリーのいいね統計取得エラー:', error);
      throw error;
    }
  }
}

export const likeService = new LikeService(db); 