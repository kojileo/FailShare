import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { ChatMessage } from '../types';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, isOwnMessage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { editMessage, deleteMessage } = useChatStore();
  const { user } = useAuthStore();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    if (!user) return;
    
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!user) return;
    
    try {
      await editMessage(message.id, editContent);
      setIsEditing(false);
    } catch {
      Alert.alert('エラー', 'メッセージの編集に失敗しました');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleDelete = () => {
    Alert.alert(
      'メッセージを削除',
      'このメッセージを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(message.id);
            } catch {
              Alert.alert('エラー', 'メッセージの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const showMessageOptions = () => {
    if (!isOwnMessage) return;
    
    Alert.alert(
      'メッセージオプション',
      '操作を選択してください',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '編集', onPress: handleEdit },
        { text: '削除', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  return (
    <View style={[styles.container, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
      <TouchableOpacity
        style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}
        onLongPress={showMessageOptions}
        activeOpacity={0.8}
      >
        <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>
          {message.content}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={[styles.timeText, isOwnMessage ? styles.ownTimeText : styles.otherTimeText]}>
            {formatTime(message.createdAt)}
          </Text>
          {message.isEdited && (
            <Text style={[styles.editedText, isOwnMessage ? styles.ownTimeText : styles.otherTimeText]}>
              編集済み
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* 編集モーダル */}
      <Modal
        visible={isEditing}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>メッセージを編集</Text>
            <TextInput
              style={styles.editInput}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              placeholder="メッセージを入力..."
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ownBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#1E293B',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  timeText: {
    fontSize: 12,
  },
  ownTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: '#64748B',
  },
  editedText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChatMessageItem;
