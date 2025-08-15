import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ChatMessage } from '../types';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { useFriendStore } from '../stores/friendStore';
import { chatService } from '../services/chatService';
import ChatMessageItem from '../components/ChatMessageItem';
import ChatInput from '../components/ChatInput';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const { friendId, friendName } = route.params;
  
  const { user } = useAuthStore();
  const { friends } = useFriendStore();
  const {
    currentChat: _currentChat,
    currentChatMessages,
    isLoading,
    error,
    loadChat,
    loadChatMessages,
    markChatAsRead,
    sendMessage: _sendMessage,
    subscribeToChat,
    subscribeToUserChats,
  } = useChatStore();

  const [chatId, setChatId] = useState<string | null>(null);
  const [friend, setFriend] = useState<{ id: string; displayName: string; isOnline?: boolean } | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // フレンド情報を取得
  useEffect(() => {
    const foundFriend = friends.find(f => f.id === friendId);
    setFriend(foundFriend);
  }, [friends, friendId]);

    // チャットIDを取得または作成
  useEffect(() => {
    const findOrCreateChat = async () => {
      if (!user) return;

      try {
        // 既存のチャットを検索
        const userChats = await chatService.getUserChats(user.id);

        const existingChat = userChats.find(chat =>
          chat.participants.includes(friendId) && chat.participants.includes(user.id)
        );

        if (existingChat) {
          setChatId(existingChat.id);
        } else {
          // 新しいチャットを作成
          const newChatId = await chatService.createChat([user.id, friendId]);
          setChatId(newChatId);
        }
      } catch (error) {
        console.error('チャット取得/作成エラー:', error);
        Alert.alert('エラー', 'チャットの初期化に失敗しました');
      }
    };

    findOrCreateChat();
  }, [user, friendId]);

    // チャットとメッセージを読み込み
  useEffect(() => {
    if (!chatId || !user) return;

    loadChat(chatId);
    loadChatMessages(chatId);
    markChatAsRead(chatId, user.id);

    // リアルタイム更新を開始
    const unsubscribeChat = subscribeToChat(chatId);
    const unsubscribeUserChats = subscribeToUserChats(user.id);

    return () => {
      unsubscribeChat();
      unsubscribeUserChats();
    };
  }, [chatId, user, loadChat, loadChatMessages, markChatAsRead, subscribeToChat, subscribeToUserChats]);

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    if (currentChatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentChatMessages]);

  const handleSendMessage = () => {
    // メッセージ送信後に既読処理
    if (chatId && user) {
      markChatAsRead(chatId, user.id);
    }
  };



  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === user?.id;

    return (
      <ChatMessageItem
        message={item}
        isOwnMessage={isOwnMessage}
      />
    );
  };

  const renderEmptyState = () => (
            <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>メッセージがありません</Text>
          <Text style={styles.emptyStateSubtitle}>
            {friend?.displayName || friendName}さんとメッセージを送り合いましょう
          </Text>
        </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1E293B" />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>
          {friend?.displayName || friendName}
        </Text>
        <Text style={styles.headerSubtitle}>
          {friend?.isOnline ? 'オンライン' : 'オフライン'}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => {
          Alert.alert(
            'チャットオプション',
                        '操作を選択してください',
            [
              { text: 'キャンセル', style: 'cancel' },
              {
                text: 'チャットを削除',
                style: 'destructive',
                onPress: () => {
                  Alert.alert(
                    'チャットを削除',
                    'このチャットを削除しますか？\nメッセージは完全に削除されます。',
                    [
                      { text: 'キャンセル', style: 'cancel' },
                      { 
                        text: '削除', 
                        style: 'destructive',
                        onPress: () => {
                          // TODO: チャット削除機能の実装
                          navigation.goBack();
                        }
                      }
                    ]
                  );
                }
              }
            ]
          );
        }}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#1E293B" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !chatId) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>チャットを読み込み中...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>エラーが発生しました</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            if (chatId) {
              loadChat(chatId);
              loadChatMessages(chatId);
            }
          }}
        >
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={currentChatMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() => {
            if (currentChatMessages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
                      ListHeaderComponent={null}
        />
        
        {chatId && (
          <ChatInput
            chatId={chatId}
            onSend={handleSendMessage}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  debugContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  debugText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'monospace',
    lineHeight: 16,
  },

});

export default ChatScreen;
