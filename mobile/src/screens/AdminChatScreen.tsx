import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  Card,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, AdminSupportMessage } from '../types';
import { useAdminSupportStore } from '../stores/adminSupportStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import Header from '../components/Header';

interface AdminChatScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'AdminChat'>;
  route?: {
    params: {
      sessionId: string;
      userId: string;
    };
  };
}

const AdminChatScreen: React.FC<AdminChatScreenProps> = ({ navigation, route }) => {
  const { admin } = useAdminAuthStore();
  const {
    currentSession: _currentSession,
    supportMessages,
    isLoading,
    error,
    loadSession,
    sendAdminMessage,
    subscribeToSession,
    setError
  } = useAdminSupportStore();

  const [message, setMessage] = useState('');
  const [sessionId, _setSessionId] = useState(route?.params?.sessionId || '');
  const [_userId, _setUserId] = useState(route?.params?.userId || '');

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
      const unsubscribe = subscribeToSession(sessionId);
      return unsubscribe;
    }
  }, [sessionId, loadSession, subscribeToSession]);

  useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [
        { text: 'OK', onPress: () => setError(null) }
      ]);
    }
  }, [error, setError]);

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId || !admin) return;

    const messageText = message.trim();
    setMessage('');

    try {
      await sendAdminMessage(sessionId, admin.id, messageText);
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    }
  };

  const renderMessage = (msg: AdminSupportMessage, _index: number) => {
    const isAdmin = msg.senderType === 'admin';
    const _isCurrentAdmin = msg.senderId === admin?.id;

    return (
      <View
        key={msg.id}
        style={[
          styles.messageContainer,
          isAdmin ? styles.adminMessageContainer : styles.userMessageContainer
        ]}
      >
        <Card
          style={[
            styles.messageCard,
            isAdmin ? styles.adminMessageCard : styles.userMessageCard
          ]}
        >
          <Card.Content style={styles.messageContent}>
            <Text style={[
              styles.messageText,
              isAdmin ? styles.adminMessageText : styles.userMessageText
            ]}>
              {msg.content}
            </Text>
            <Text style={[
              styles.messageTime,
              isAdmin ? styles.adminMessageTime : styles.userMessageTime
            ]}>
              {msg.timestamp.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="管理者チャット"
          showBackButton
          onBackPress={() => navigation?.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF88" />
          <Text style={styles.loadingText}>チャットを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="管理者チャット"
        showBackButton
        onBackPress={() => navigation?.goBack()}
      />
      
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* メッセージ一覧 */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {supportMessages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                チャットを開始してください
              </Text>
            </View>
          ) : (
            supportMessages.map(renderMessage)
          )}
        </ScrollView>

        {/* メッセージ入力 */}
        <LinearGradient
          colors={['#1A1A1A', '#0A0A0A']}
          style={styles.inputContainer}
        >
          <View style={styles.inputSurface}>
            <TextInput
              style={styles.textInput}
              placeholder="メッセージを入力..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              disabled={isLoading}
              placeholderTextColor="#00FF88"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim() || isLoading}
            >
              <IconButton
                icon="send"
                size={20}
                iconColor={message.trim() ? "#000000" : "#666666"}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
  },
  adminMessageContainer: {
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
    borderRadius: 16,
  },
  adminMessageCard: {
    backgroundColor: '#00FF88',
  },
  userMessageCard: {
    backgroundColor: '#2A2A2A',
  },
  messageContent: {
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  adminMessageText: {
    color: '#000000',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  adminMessageTime: {
    color: '#000000',
  },
  userMessageTime: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  inputSurface: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00FF88',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#00FF88',
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
});

export default AdminChatScreen;
