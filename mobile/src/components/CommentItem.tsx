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
    Alert.alert(
      'コメントを削除',
      'このコメントを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(comment.id, user!.id, storyId);
            } catch (error) {
              Alert.alert('エラー', 'コメントの削除に失敗しました');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleSave = async () => {
    if (!editContent.trim()) {
      Alert.alert('エラー', 'コメント内容を入力してください');
      return;
    }
    
    if (editContent.length > 500) {
      Alert.alert('エラー', 'コメントは500文字以内で入力してください');
      return;
    }

    try {
      await updateComment(comment.id, user!.id, editContent, storyId);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('エラー', 'コメントの更新に失敗しました');
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
        <Text style={styles.authorName}>
          {isAnonymous ? '匿名ユーザー' : 'あなた'}
        </Text>
        <Text style={styles.timestamp}>{formatDate(comment.createdAt)}</Text>
        
        {isAuthor && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Ionicons name="pencil" size={14} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Ionicons name="trash" size={14} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <Text style={styles.content}>{comment.content}</Text>
      
      {comment.isHelpful && (
        <View style={styles.helpfulBadge}>
          <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
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