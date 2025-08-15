import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  onSnapshot, 
  Timestamp, 
  updateDoc, 
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  increment,
  Firestore
} from 'firebase/firestore';
import { Comment } from '../types';

export interface CommentService {
  addComment(storyId: string, authorId: string, content: string): Promise<string>;
  getComments(storyId: string, pageSize?: number): Promise<Comment[]>;
  getCommentsWithPagination(storyId: string, lastComment?: Comment, pageSize?: number): Promise<Comment[]>;
  deleteComment(commentId: string, authorId: string): Promise<void>;
  updateComment(commentId: string, authorId: string, content: string): Promise<void>;
  subscribeToComments(storyId: string, callback: (comments: Comment[]) => void): () => void;
  getCommentCount(storyId: string): Promise<number>;
}

class CommentServiceImpl implements CommentService {
  private readonly COLLECTION_NAME = 'comments';

  constructor(private db: Firestore) {}

  async addComment(storyId: string, authorId: string, content: string): Promise<string> {
    try {
      // パラメータの検証
      if (!storyId || storyId.trim() === '') {
        throw new Error('ストーリーIDが必要です');
      }
      if (!authorId || authorId.trim() === '') {
        throw new Error('ユーザーIDが必要です');
      }
      if (!content || content.trim() === '') {
        throw new Error('コメント内容を入力してください');
      }
      
      console.log('💬 コメント投稿処理開始:', { storyId, authorId, contentLength: content.length });
      
      // コメント内容の検証
      if (content.length > 500) {
        throw new Error('コメントは500文字以内で入力してください');
      }
      
      // commentsコレクションにコメントを追加
      const docRef = await addDoc(collection(this.db, this.COLLECTION_NAME), {
        storyId,
        authorId,
        content: content.trim(),
        createdAt: Timestamp.now(),
        isHelpful: false
      });
      
      // storiesコレクションのcommentCountを+1
      const storyRef = doc(this.db, 'stories', storyId);
      await updateDoc(storyRef, {
        'metadata.commentCount': increment(1)
      });
      
      console.log('✅ コメント投稿成功, ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ コメント投稿エラー:', error);
      throw error;
    }
  }

  async getComments(storyId: string, pageSize: number = 20): Promise<Comment[]> {
    try {
      console.log('📖 コメント取得開始:', { storyId, pageSize });
      const commentsQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('storyId', '==', storyId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      const querySnapshot = await getDocs(commentsQuery);
      const comments: Comment[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        storyId: doc.data().storyId,
        authorId: doc.data().authorId,
        content: doc.data().content,
        createdAt: doc.data().createdAt.toDate(),
        isHelpful: doc.data().isHelpful || false
      }));
      console.log('✅ コメント取得成功:', comments.length);
      return comments;
    } catch (error) {
      console.error('❌ コメント取得エラー:', error);
      throw error;
    }
  }

  async getCommentsWithPagination(storyId: string, lastComment?: Comment, pageSize: number = 20): Promise<Comment[]> {
    try {
      console.log('📖 コメントページネーション取得開始:', { storyId, pageSize, hasLastComment: !!lastComment });
      
      let commentsQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('storyId', '==', storyId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      // 前回の最後のコメントがある場合、そこから開始
      if (lastComment) {
        const lastDoc = await this.getCommentDocument(lastComment.id);
        if (lastDoc) {
          commentsQuery = query(
            collection(this.db, this.COLLECTION_NAME),
            where('storyId', '==', storyId),
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc),
            limit(pageSize)
          );
        }
      }
      
      const querySnapshot = await getDocs(commentsQuery);
      const comments: Comment[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        storyId: doc.data().storyId,
        authorId: doc.data().authorId,
        content: doc.data().content,
        createdAt: doc.data().createdAt.toDate(),
        isHelpful: doc.data().isHelpful || false
      }));
      
      console.log('✅ コメントページネーション取得成功:', comments.length);
      return comments;
    } catch (error) {
      console.error('❌ コメントページネーション取得エラー:', error);
      throw error;
    }
  }

  private async getCommentDocument(commentId: string): Promise<QueryDocumentSnapshot | null> {
    try {
      const commentQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('__name__', '==', commentId)
      );
      const querySnapshot = await getDocs(commentQuery);
      return querySnapshot.empty ? null : querySnapshot.docs[0];
    } catch (error) {
      console.error('❌ コメントドキュメント取得エラー:', error);
      return null;
    }
  }

  async deleteComment(commentId: string, authorId: string): Promise<void> {
    try {
      console.log('🗑️ コメント削除処理開始:', { commentId, authorId });
      
      // コメントの存在確認と権限チェック
      const commentQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('__name__', '==', commentId),
        where('authorId', '==', authorId)
      );
      const querySnapshot = await getDocs(commentQuery);
      
      if (querySnapshot.empty) {
        throw new Error('コメントが見つからないか、削除権限がありません');
      }
      
      const commentDoc = querySnapshot.docs[0];
      const commentData = commentDoc.data();
      
      // コメントを削除
      await deleteDoc(commentDoc.ref);
      
      // storiesコレクションのcommentCountを-1
      const storyRef = doc(this.db, 'stories', commentData.storyId);
      await updateDoc(storyRef, {
        'metadata.commentCount': increment(-1)
      });
      
      console.log('✅ コメント削除成功');
    } catch (error) {
      console.error('❌ コメント削除エラー:', error);
      throw error;
    }
  }

  async updateComment(commentId: string, authorId: string, content: string): Promise<void> {
    try {
      // パラメータの検証
      if (!commentId || commentId.trim() === '') {
        throw new Error('コメントIDが必要です');
      }
      if (!authorId || authorId.trim() === '') {
        throw new Error('ユーザーIDが必要です');
      }
      if (!content || content.trim() === '') {
        throw new Error('コメント内容を入力してください');
      }
      
      console.log('✏️ コメント更新処理開始:', { commentId, authorId, contentLength: content.length });
      
      // コメント内容の検証
      if (content.length > 500) {
        throw new Error('コメントは500文字以内で入力してください');
      }
      
      // コメントの存在確認と権限チェック
      const commentQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('__name__', '==', commentId),
        where('authorId', '==', authorId)
      );
      const querySnapshot = await getDocs(commentQuery);
      
      if (querySnapshot.empty) {
        throw new Error('コメントが見つからないか、編集権限がありません');
      }
      
      const commentDoc = querySnapshot.docs[0];
      
      // コメントを更新
      await updateDoc(commentDoc.ref, {
        content: content.trim(),
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ コメント更新成功');
    } catch (error) {
      console.error('❌ コメント更新エラー:', error);
      throw error;
    }
  }

  subscribeToComments(storyId: string, callback: (comments: Comment[]) => void): () => void {
    console.log('👂 コメントリアルタイム監視開始:', storyId);
    
    // リスナーキーを生成
    const listenerKey = `comments:${storyId}`;
    
    const commentsQuery = query(
      collection(this.db, this.COLLECTION_NAME),
      where('storyId', '==', storyId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(commentsQuery, (querySnapshot) => {
      const comments: Comment[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        storyId: doc.data().storyId,
        authorId: doc.data().authorId,
        content: doc.data().content,
        createdAt: doc.data().createdAt.toDate(),
        isHelpful: doc.data().isHelpful || false
      }));
      callback(comments);
    }, (error) => {
      console.error('❌ コメントリアルタイム監視エラー:', error);
    });
    
    // リスナーを管理システムに登録
    const { realtimeManager } = require('../utils/realtimeManager');
    const success = realtimeManager.registerListener(listenerKey, unsubscribe, 'comments');
    
    // カスタムアンサブスクライブ関数を返す
    return () => {
      if (success) {
        realtimeManager.removeListener(listenerKey);
      }
    };
  }

  async getCommentCount(storyId: string): Promise<number> {
    try {
      console.log('📊 コメント数取得開始:', storyId);
      const commentsQuery = query(
        collection(this.db, this.COLLECTION_NAME),
        where('storyId', '==', storyId)
      );
      const querySnapshot = await getDocs(commentsQuery);
      const count = querySnapshot.size;
      console.log('✅ コメント数取得成功:', count);
      return count;
    } catch (error) {
      console.error('❌ コメント数取得エラー:', error);
      throw error;
    }
  }
}

export const commentService = new CommentServiceImpl(db); 