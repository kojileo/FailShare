import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { useCommentStore } from '../stores/commentStore';

interface CommentInputProps {
  storyId: string;
  onCommentAdded?: () => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({ storyId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn } = useAuthStore();
  const { addComment } = useCommentStore();

  const maxLength = 500;
  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;
  const isEmpty = !content.trim();

  const handleSubmit = async () => {
    if (isEmpty) {
      Alert.alert('エラー', 'コメント内容を入力してください');
      return;
    }

    if (isOverLimit) {
      Alert.alert('エラー', 'コメントは500文字以内で入力してください');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      let currentUser = user;
      
      // ユーザーが認証されていない場合は匿名認証を実行
      if (!currentUser?.id) {
        console.log('🔐 匿名認証を実行中...');
        await signIn();
        const authState = useAuthStore.getState();
        currentUser = authState.user;
        
        if (!currentUser?.id) {
          throw new Error('認証に失敗しました');
        }
      }

      await addComment(storyId, currentUser.id, content.trim());
      
      // 入力フィールドをクリア
      setContent('');
      
      // コールバックを実行
      onCommentAdded?.();
      
      console.log('✅ コメント投稿完了');
    } catch (error) {
      console.error('❌ コメント投稿エラー:', error);
      Alert.alert('エラー', 'コメントの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    // Enterキーで投稿（React NativeのTextInputではShift+Enterの判定が困難なため、単純にEnterキーで投稿）
    if (e.nativeEvent?.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputHeader}>
          <IconButton icon="chat-outline" size={16} iconColor="#666" style={styles.inputIcon} />
          <Text style={styles.inputLabel}>コメントを投稿</Text>
        </View>
        
        <TextInput
          style={[
            styles.input,
            isOverLimit && styles.inputError
          ]}
          value={content}
          onChangeText={setContent}
          placeholder="失敗談についての感想やアドバイスを共有してください..."
          multiline
          maxLength={maxLength}
          textAlignVertical="top"
          onKeyPress={handleKeyPress}
          editable={!isSubmitting}
        />
        
        <View style={styles.inputFooter}>
          <View style={styles.charCountContainer}>
            <Text style={[
              styles.charCount,
              isOverLimit && styles.charCountError
            ]}>
              {remainingChars}
            </Text>
            <Text style={styles.charCountLabel}>文字</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isEmpty || isOverLimit || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isEmpty || isOverLimit || isSubmitting}
          >
            {isSubmitting ? (
              <IconButton icon="clock" size={16} iconColor="#999" style={styles.submitIcon} />
            ) : (
              <IconButton icon="send" size={16} iconColor="#fff" style={styles.submitIcon} />
            )}
            <Text style={[
              styles.submitButtonText,
              (isEmpty || isOverLimit || isSubmitting) && styles.submitButtonTextDisabled
            ]}>
              投稿
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {isOverLimit && (
        <Text style={styles.errorText}>
          文字数制限を超えています
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    padding: 16,
  },
  inputContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 12,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  input: {
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    maxHeight: 120,
    lineHeight: 20,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  charCountLabel: {
    fontSize: 11,
    color: '#999',
    marginLeft: 2,
  },
  charCountError: {
    color: '#e74c3c',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
    textAlign: 'center',
  },
  inputIcon: {
    margin: 0,
  },
  submitIcon: {
    margin: 0,
  },
}); 