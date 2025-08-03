import { create } from 'zustand';
import { Comment } from '../types';
import { commentService } from '../services/commentService';

interface CommentState {
  comments: { [storyId: string]: Comment[] };
  isLoading: { [storyId: string]: boolean };
  error: { [storyId: string]: string | null };
  hasMore: { [storyId: string]: boolean };
  
  // Actions
  loadComments(storyId: string, pageSize?: number): Promise<void>;
  loadMoreComments(storyId: string, pageSize?: number): Promise<void>;
  addComment(storyId: string, authorId: string, content: string): Promise<void>;
  deleteComment(commentId: string, authorId: string, storyId: string): Promise<void>;
  updateComment(commentId: string, authorId: string, content: string, storyId: string): Promise<void>;
  subscribeToComments(storyId: string): () => void;
  setComments(storyId: string, comments: Comment[]): void;
  setLoading(storyId: string, loading: boolean): void;
  setError(storyId: string, error: string | null): void;
  setHasMore(storyId: string, hasMore: boolean): void;
  resetStory(storyId: string): void;
  reset(): void;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: {},
  isLoading: {},
  error: {},
  hasMore: {},

  async loadComments(storyId: string, pageSize: number = 20) {
    const { setLoading, setError, setComments, setHasMore } = get();
    
    try {
      setLoading(storyId, true);
      setError(storyId, null);
      
      console.log(`📖 コメント読み込み開始 [${storyId}]:`, { pageSize });
      const comments = await commentService.getComments(storyId, pageSize);
      
      setComments(storyId, comments);
      setHasMore(storyId, comments.length === pageSize);
      
      console.log(`✅ コメント読み込み完了 [${storyId}]:`, { count: comments.length });
    } catch (error) {
      console.error(`❌ コメント読み込みエラー [${storyId}]:`, error);
      
      // インデックスエラーの場合は特別なメッセージを表示
      let errorMessage = 'コメントの読み込みに失敗しました';
      if (error instanceof Error) {
        if (error.message.includes('index')) {
          errorMessage = 'コメントの読み込みに時間がかかっています。しばらくお待ちください。';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(storyId, errorMessage);
    } finally {
      setLoading(storyId, false);
    }
  },

  async loadMoreComments(storyId: string, pageSize: number = 20) {
    const { comments, setLoading, setError, setHasMore } = get();
    const currentComments = comments[storyId] || [];
    
    if (currentComments.length === 0) {
      await get().loadComments(storyId, pageSize);
      return;
    }
    
    try {
      setLoading(storyId, true);
      setError(storyId, null);
      
      const lastComment = currentComments[currentComments.length - 1];
      console.log(`📖 追加コメント読み込み開始 [${storyId}]:`, { pageSize, lastCommentId: lastComment.id });
      
      const moreComments = await commentService.getCommentsWithPagination(storyId, lastComment, pageSize);
      
      if (moreComments.length > 0) {
        const updatedComments = [...currentComments, ...moreComments];
        set({ comments: { ...comments, [storyId]: updatedComments } });
        setHasMore(storyId, moreComments.length === pageSize);
      } else {
        setHasMore(storyId, false);
      }
      
      console.log(`✅ 追加コメント読み込み完了 [${storyId}]:`, { count: moreComments.length });
    } catch (error) {
      console.error(`❌ 追加コメント読み込みエラー [${storyId}]:`, error);
      setError(storyId, error instanceof Error ? error.message : '追加コメントの読み込みに失敗しました');
    } finally {
      setLoading(storyId, false);
    }
  },

  async addComment(storyId: string, authorId: string, content: string) {
    const { comments, setLoading, setError } = get();
    const currentComments = comments[storyId] || [];
    
    try {
      setLoading(storyId, true);
      setError(storyId, null);
      
      console.log(`💬 コメント投稿開始 [${storyId}]:`, { authorId, contentLength: content.length });
      
      // 楽観的更新：即座にUIにコメントを追加
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        storyId,
        authorId,
        content,
        createdAt: new Date(),
        isHelpful: false
      };
      
      const updatedComments = [optimisticComment, ...currentComments];
      set({ comments: { ...comments, [storyId]: updatedComments } });
      
      // 実際の投稿処理
      const commentId = await commentService.addComment(storyId, authorId, content);
      
      // 楽観的更新を実際のデータで置き換え
      const actualComment: Comment = {
        ...optimisticComment,
        id: commentId
      };
      
      const finalComments = updatedComments.map(comment => 
        comment.id === optimisticComment.id ? actualComment : comment
      );
      
      set({ comments: { ...comments, [storyId]: finalComments } });
      
      console.log(`✅ コメント投稿完了 [${storyId}]:`, { commentId });
    } catch (error) {
      console.error(`❌ コメント投稿エラー [${storyId}]:`, error);
      setError(storyId, error instanceof Error ? error.message : 'コメントの投稿に失敗しました');
      
      // エラー時は楽観的更新を元に戻す
      set({ comments: { ...comments, [storyId]: currentComments } });
    } finally {
      setLoading(storyId, false);
    }
  },

  async deleteComment(commentId: string, authorId: string, storyId: string) {
    const { comments, setLoading, setError } = get();
    const currentComments = comments[storyId] || [];
    
    try {
      setLoading(storyId, true);
      setError(storyId, null);
      
      console.log(`🗑️ コメント削除開始 [${storyId}]:`, { commentId, authorId });
      
      // 楽観的更新：即座にUIからコメントを削除
      const updatedComments = currentComments.filter(comment => comment.id !== commentId);
      set({ comments: { ...comments, [storyId]: updatedComments } });
      
      // 実際の削除処理
      await commentService.deleteComment(commentId, authorId);
      
      console.log(`✅ コメント削除完了 [${storyId}]:`, { commentId });
    } catch (error) {
      console.error(`❌ コメント削除エラー [${storyId}]:`, error);
      setError(storyId, error instanceof Error ? error.message : 'コメントの削除に失敗しました');
      
      // エラー時は楽観的更新を元に戻す
      set({ comments: { ...comments, [storyId]: currentComments } });
    } finally {
      setLoading(storyId, false);
    }
  },

  async updateComment(commentId: string, authorId: string, content: string, storyId: string) {
    const { comments, setLoading, setError } = get();
    const currentComments = comments[storyId] || [];
    
    try {
      setLoading(storyId, true);
      setError(storyId, null);
      
      console.log(`✏️ コメント更新開始 [${storyId}]:`, { commentId, authorId, contentLength: content.length });
      
      // 楽観的更新：即座にUIのコメントを更新
      const updatedComments = currentComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content, updatedAt: new Date() }
          : comment
      );
      set({ comments: { ...comments, [storyId]: updatedComments } });
      
      // 実際の更新処理
      await commentService.updateComment(commentId, authorId, content);
      
      console.log(`✅ コメント更新完了 [${storyId}]:`, { commentId });
    } catch (error) {
      console.error(`❌ コメント更新エラー [${storyId}]:`, error);
      setError(storyId, error instanceof Error ? error.message : 'コメントの更新に失敗しました');
      
      // エラー時は楽観的更新を元に戻す
      set({ comments: { ...comments, [storyId]: currentComments } });
    } finally {
      setLoading(storyId, false);
    }
  },

  subscribeToComments(storyId: string) {
    console.log(`👂 コメントリアルタイム監視開始 [${storyId}]`);
    
    return commentService.subscribeToComments(storyId, (comments) => {
      console.log(`📡 コメントリアルタイム更新 [${storyId}]:`, { count: comments.length });
      set(state => ({
        comments: { ...state.comments, [storyId]: comments }
      }));
    });
  },

  setComments(storyId: string, comments: Comment[]) {
    set(state => ({
      comments: { ...state.comments, [storyId]: comments }
    }));
  },

  setLoading(storyId: string, loading: boolean) {
    set(state => ({
      isLoading: { ...state.isLoading, [storyId]: loading }
    }));
  },

  setError(storyId: string, error: string | null) {
    set(state => ({
      error: { ...state.error, [storyId]: error }
    }));
  },

  setHasMore(storyId: string, hasMore: boolean) {
    set(state => ({
      hasMore: { ...state.hasMore, [storyId]: hasMore }
    }));
  },

  resetStory(storyId: string) {
    set(state => {
      const newState = { ...state };
      delete newState.comments[storyId];
      delete newState.isLoading[storyId];
      delete newState.error[storyId];
      delete newState.hasMore[storyId];
      return newState;
    });
  },

  reset() {
    set({
      comments: {},
      isLoading: {},
      error: {},
      hasMore: {}
    });
  }
})); 