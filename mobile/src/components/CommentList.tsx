import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../types';
import { useCommentStore } from '../stores/commentStore';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  storyId: string;
  onCommentCountChange?: (count: number) => void;
}

export const CommentList: React.FC<CommentListProps> = ({ storyId, onCommentCountChange }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { 
    comments, 
    isLoading, 
    error, 
    hasMore,
    loadComments, 
    loadMoreComments, 
    subscribeToComments 
  } = useCommentStore();

  const storyComments = comments[storyId] || [];
  const storyLoading = isLoading[storyId] || false;
  const storyError = error[storyId];
  const storyHasMore = hasMore[storyId] || false;

  useEffect(() => {
    if (!isInitialized) {
      console.log(`📖 コメント初期化開始 [${storyId}]`);
      loadComments(storyId);
      setIsInitialized(true);
      
      // リアルタイム監視を開始
      const unsubscribe = subscribeToComments(storyId);
      
      return () => {
        console.log(`👋 コメント監視終了 [${storyId}]`);
        unsubscribe();
      };
    }
  }, [storyId, isInitialized, loadComments, subscribeToComments]);

  useEffect(() => {
    // コメント数の変更を親コンポーネントに通知
    onCommentCountChange?.(storyComments.length);
  }, [storyComments.length, onCommentCountChange]);

  const handleLoadMore = () => {
    if (storyHasMore && !storyLoading) {
      console.log(`📖 追加コメント読み込み [${storyId}]`);
      loadMoreComments(storyId);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem comment={item} storyId={storyId} />
  );

  const renderFooter = () => {
    if (!storyHasMore) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {storyComments.length === 0 ? 'まだコメントがありません' : 'すべてのコメントを表示しました'}
          </Text>
        </View>
      );
    }

    if (storyLoading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.footerText}>読み込み中...</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
        <Ionicons name="chevron-down" size={16} color="#007AFF" />
        <Text style={styles.loadMoreText}>さらに読み込む</Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (storyLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#666" />
          <Text style={styles.emptyText}>コメントを読み込み中...</Text>
        </View>
      );
    }

         if (storyError) {
       return (
         <View style={styles.emptyContainer}>
           <Ionicons name="alert-circle" size={48} color="#e74c3c" />
           <Text style={styles.errorText}>
             {storyError.includes('index') 
               ? 'コメントの読み込みに時間がかかっています。しばらくお待ちください。'
               : storyError
             }
           </Text>
           <TouchableOpacity 
             style={styles.retryButton} 
             onPress={() => loadComments(storyId)}
           >
             <Ionicons name="refresh" size={16} color="#007AFF" />
             <Text style={styles.retryText}>再試行</Text>
           </TouchableOpacity>
         </View>
       );
     }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>まだコメントがありません</Text>
        <Text style={styles.emptySubText}>最初のコメントを投稿してみましょう！</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={20} color="#333" />
        <Text style={styles.title}>コメント</Text>
        <Text style={styles.count}>({storyComments.length})</Text>
      </View>
      
      <FlatList
        data={storyComments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  count: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20, // 適切な余白
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 4,
  },
  retryText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignSelf: 'center',
    gap: 4,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
}); 