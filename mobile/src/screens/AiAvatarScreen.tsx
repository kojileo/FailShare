import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar
} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  Avatar,
  Surface,
  ActivityIndicator,
  Chip,
  Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAIAvatarStore } from '../stores/aiAvatarStore';
import { useAuthStore } from '../stores/authStore';
import Header from '../components/Header';

interface AiAvatarScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'AiAvatar'>;
}

const AiAvatarScreen: React.FC<AiAvatarScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const {
    currentConversation,
    conversationMessages,
    userProfile,
    isLoading,
    isTyping,
    error,
    startConversation,
    sendMessage,
    endConversation,
    loadConversationHistory,
    setError
  } = useAIAvatarStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 初期化
  useEffect(() => {
    if (user && !isInitialized) {
      initializeConversation();
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  // メッセージが追加されたらスクロール
  useEffect(() => {
    if (conversationMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversationMessages]);

  // エラー表示
  useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [
        { text: 'OK', onPress: () => setError(null) }
      ]);
    }
  }, [error, setError]);

  const initializeConversation = async () => {
    if (!user) return;

    try {
      await startConversation(user.id);
    } catch (error) {
      console.error('対話初期化エラー:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation || !user) return;

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      await sendMessage(currentConversation.id, user.id, message);
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    }
  };

  const handleEndConversation = () => {
    Alert.alert(
      '対話を終了しますか？',
      '現在の対話を終了して、新しい対話を開始できます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '終了',
          style: 'destructive',
          onPress: async () => {
            try {
              await endConversation();
              await initializeConversation();
            } catch (error) {
              console.error('対話終了エラー:', error);
            }
          }
        }
      ]
    );
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const getEmotionColor = (emotion: string): string => {
    const emotionColors: { [key: string]: string } = {
      '後悔': '#FF6B6B',
      '恥ずかしい': '#FFB347',
      '悲しい': '#4ECDC4',
      '不安': '#95E1D3',
      '怒り': '#F38BA8',
      '混乱': '#DDA0DD',
      'その他': '#B0BEC5'
    };
    return emotionColors[emotion] || '#B0BEC5';
  };

  const renderWelcomeMessage = () => (
    <View style={styles.welcomeContainer}>
      <LinearGradient
        colors={['#1A0A2E', '#16213E', '#0F3460']}
        style={styles.welcomeCard}
      >
        <View style={styles.welcomeHeader}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={80}
              source={{ uri: 'https://robohash.org/jill-cyberpunk-bartender?set=set4&bgset=bg1' }}
              style={styles.avatar}
            />
            <View style={styles.avatarGlow} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>こんにちは！ジルです</Text>
            <Text style={styles.welcomeSubtitle}>バーテンダー</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>ONLINE</Text>
            </View>
          </View>
        </View>
        <Text style={styles.welcomeMessage}>
          失敗談や愚痴を聞かせてください。あなたの気持ちに寄り添い、適切なアドバイスを提供します。
          匿名で安心して話すことができます。
        </Text>
        <View style={styles.welcomeFeatures}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>感情に寄り添う対話</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🍸</Text>
            <Text style={styles.featureText}>状況に応じたアドバイス</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>完全匿名・プライベート</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderMessage = (message: any, index: number) => {
    const isUser = message.senderType === 'user';
    const isAI = message.senderType === 'ai';

    return (
      <View key={message.id || index} style={styles.messageContainer}>
        <LinearGradient
          colors={isUser ? ['#00FF88', '#00CC6A'] : ['#1A0A2E', '#16213E']}
          style={[
            styles.messageBubble,
            isUser ? styles.userMessage : styles.aiMessage
          ]}
        >
          {isAI && (
            <View style={styles.aiMessageHeader}>
              <View style={styles.avatarContainer}>
                <Avatar.Image
                  size={32}
                  source={{ uri: 'https://robohash.org/jill-cyberpunk-bartender?set=set4&bgset=bg1' }}
                  style={styles.messageAvatar}
                />
                <View style={styles.avatarGlow} />
              </View>
              <Text style={styles.aiName}>ジル</Text>
              {message.emotion && (
                <View style={[styles.emotionChip, { backgroundColor: getEmotionColor(message.emotion) + '20' }]}>
                  <Text style={[styles.emotionText, { color: getEmotionColor(message.emotion) }]}>
                    {message.emotion}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {message.content}
          </Text>
          
          {message.metadata?.advice && (
            <LinearGradient
              colors={['#0F3460', '#16213E']}
              style={styles.adviceContainer}
            >
              <Text style={styles.adviceLabel}>💡 アドバイス</Text>
              <Text style={styles.adviceText}>{message.metadata.advice}</Text>
            </LinearGradient>
          )}
          
          <Text style={[
            styles.messageTime,
            isUser ? styles.userMessageTime : styles.aiMessageTime
          ]}>
            {getTimeAgo(message.timestamp)}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={styles.messageContainer}>
      <LinearGradient
        colors={['#1A0A2E', '#16213E']}
        style={[styles.messageBubble, styles.aiMessage]}
      >
        <View style={styles.aiMessageHeader}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={32}
              source={{ uri: 'https://robohash.org/jill-cyberpunk-bartender?set=set4&bgset=bg1' }}
              style={styles.messageAvatar}
            />
            <View style={styles.avatarGlow} />
          </View>
          <Text style={styles.aiName}>ジル</Text>
        </View>
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color="#00FF88" />
          <Text style={styles.typingText}>入力中...</Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* ヴァルハラ風ヘッダー */}
      <LinearGradient
        colors={['#1A0A2E', '#16213E', '#0F3460']}
        style={styles.valhallaHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <IconButton icon="arrow-left" size={24} iconColor="#00FF88" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>CYBERPUNK BARTENDER ACTION</Text>
            <Text style={styles.headerTitle}>AI Avatar</Text>
          </View>
          
          <TouchableOpacity onPress={handleEndConversation} style={styles.refreshButton}>
            <IconButton icon="refresh" size={20} iconColor="#00FF88" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* サイバーパンク背景 */}
        <View style={styles.cyberpunkBackground}>
          <View style={styles.gridOverlay} />
          <View style={styles.neonGlow} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {conversationMessages.length === 0 && !isLoading && renderWelcomeMessage()}
          
          {conversationMessages.map((message, index) => renderMessage(message, index))}
          
          {isTyping && renderTypingIndicator()}
        </ScrollView>

        {/* ヴァルハラ風入力エリア */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={['#1A0A2E', '#16213E']}
            style={styles.inputGradient}
          >
            <View style={styles.inputSurface}>
              <TextInput
                style={styles.textInput}
                placeholder="失敗談や愚痴を聞かせてください..."
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                maxLength={500}
                disabled={isLoading || isTyping}
                placeholderTextColor="#00FF88"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputMessage.trim() || isLoading || isTyping) && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isTyping}
              >
                <IconButton
                  icon="send"
                  size={20}
                  iconColor={inputMessage.trim() ? "#000000" : "#666666"}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
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

  // ヴァルハラ風ヘッダー
  valhallaHeader: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#00FF88',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00FF88',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  refreshButton: {
    width: 40,
  },

  // サイバーパンク背景
  cyberpunkBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0A0A',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00FF88',
    borderStyle: 'dashed',
  },
  neonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  
  // ウェルカムメッセージ
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#00FF88',
  },
  avatarGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 50,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00FF88',
    marginBottom: 4,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
    marginRight: 6,
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#00FF88',
    fontWeight: '600',
    letterSpacing: 1,
  },
  welcomeMessage: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 16,
  },
  welcomeFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },

  // メッセージ
  messageContainer: {
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    borderColor: '#00FF88',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderColor: '#00FF88',
  },
  aiMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageAvatar: {
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  aiName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF88',
    marginRight: 8,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  emotionChip: {
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  emotionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#000000',
    fontWeight: '600',
  },
  aiMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
  },
  userMessageTime: {
    color: '#000000',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: '#00FF88',
  },

  // アドバイス
  adviceContainer: {
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00FF88',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  adviceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF88',
    marginBottom: 4,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  adviceText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },

  // タイピングインジケーター
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 13,
    color: '#00FF88',
    marginLeft: 8,
  },

  // 入力エリア
  inputContainer: {
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#00FF88',
  },
  inputGradient: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  inputSurface: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#00FF88',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#333333',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default AiAvatarScreen;
