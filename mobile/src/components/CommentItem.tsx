import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useCommentStore } from '../stores/commentStore';

interface CommentItemProps {
  comment: Comment;
  storyId: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, storyId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const { user } = useAuthStore();
  const { deleteComment, updateComment } = useCommentStore();

  const isAuthor = user?.id === comment.authorId;
  const isAnonymous = comment.authorId.startsWith('anonymous');
  
  // デバッグ用ログ
  console.log('🔍 CommentItem デバッグ:', {
    commentId: comment.id,
    commentAuthorId: comment.authorId,
    userId: user?.id,
    isAuthor,
    isAnonymous
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}時間前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = () => {
    console.log('🗑️ 削除ボタンがタップされました:', { commentId: comment.id, authorId: comment.authorId, userId: user?.id });
    
    // ユーザーが認証されているかチェック
    if (!user?.id) {
      console.log('❌ ユーザーが認証されていません');
      alert('エラー: ユーザーが認証されていません');
      return;
    }
    
    // 権限チェック
    if (!isAuthor) {
      console.log('❌ 削除権限がありません');
      alert('エラー: このコメントを削除する権限がありません');
      return;
    }
    
    // React Native Web環境ではconfirmを使用
    const confirmed = window.confirm('このコメントを削除しますか？');
    if (confirmed) {
      console.log('🗑️ 削除処理を開始:', { commentId: comment.id, userId: user.id, storyId });
      deleteComment(comment.id, user.id, storyId)
        .then(() => {
          console.log('✅ コメント削除成功');
        })
        .catch((error) => {
          console.error('❌ コメント削除エラー:', error);
          alert('エラー: コメントの削除に失敗しました');
        });
    } else {
      console.log('🗑️ 削除がキャンセルされました');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleSave = async () => {
    if (!editContent.trim()) {
      alert('エラー: コメント内容を入力してください');
      return;
    }
    
    if (editContent.length > 500) {
      alert('エラー: コメントは500文字以内で入力してください');
      return;
    }

    try {
      await updateComment(comment.id, user!.id, editContent, storyId);
      setIsEditing(false);
    } catch (error) {
      alert('エラー: コメントの更新に失敗しました');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.authorName}>
            {isAnonymous ? '匿名ユーザー' : 'あなた'}
          </Text>
          <Text style={styles.timestamp}>{formatDate(comment.createdAt)}</Text>
        </View>
        
        <TextInput
          style={styles.editInput}
          value={editContent}
          onChangeText={setEditContent}
          multiline
          maxLength={500}
          placeholder="コメントを入力..."
        />
        
        <View style={styles.editActions}>
          <TouchableOpacity style={styles.editButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={16} color="#4CAF50" />
            <Text style={[styles.editButtonText, { color: '#4CAF50' }]}>保存</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.editButton} onPress={handleCancel}>
            <Ionicons name="close" size={16} color="#666" />
            <Text style={[styles.editButtonText, { color: '#666' }]}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.authorSection}>
          <View style={[styles.avatar, isAuthor && styles.ownAvatar]}>
            <Text style={styles.avatarText}>
              {isAuthor ? 'あなた' : '匿名'}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, isAuthor && styles.ownAuthorName]}>
              {isAnonymous ? '匿名ユーザー' : 'あなた'}
            </Text>
            <Text style={styles.timestamp}>{formatDate(comment.createdAt)}</Text>
          </View>
        </View>
        
        {isAuthor && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleEdit}
              activeOpacity={0.6}
            >
              <Ionicons name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleDelete}
              activeOpacity={0.6}
            >
              <Ionicons name="trash" size={16} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{comment.content}</Text>
      </View>
      
      {comment.isHelpful && (
        <View style={styles.helpfulBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
          <Text style={styles.helpfulText}>役に立った</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ownAvatar: {
    backgroundColor: '#007AFF',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  ownAuthorName: {
    color: '#007AFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledActionButton: {
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  editInput: {
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  helpfulBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f8f0',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  helpfulText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
}); 