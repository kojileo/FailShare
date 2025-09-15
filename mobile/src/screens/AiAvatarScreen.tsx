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
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, EmotionType } from '../types';
import { useAdminSupportStore } from '../stores/adminSupportStore';
import { useAuthStore } from '../stores/authStore';
// import Header from '../components/Header';
import PixelAvatar, { EmotionType as AvatarEmotionType, AvatarColorType } from '../components/PixelAvatar';

interface AdminSupportScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'AiAvatar'>;
}

const AdminSupportScreen: React.FC<AdminSupportScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const {
    currentSession,
    supportMessages,
    availableAdmins,
    userRequests,
    isLoading,
    isWaitingForAdmin,
    error,
    getActiveSession,
    requestSupport,
    sendMessage,
    endSession,
    loadSession,
    subscribeToSession,
    subscribeToRequests,
    setError
  } = useAdminSupportStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentAvatarEmotion, setCurrentAvatarEmotion] = useState<AvatarEmotionType>('neutral');
  const [currentAvatarColor, setCurrentAvatarColor] = useState<AvatarColorType>('green');
  const [selectedEmotion, _setSelectedEmotion] = useState<EmotionType>('その他');
  const scrollViewRef = useRef<ScrollView>(null);

  // 初期化
  useEffect(() => {
    if (user && !isInitialized) {
      // 管理者サポートの初期化は必要に応じて実行
      setIsInitialized(true);
      
      // 既存のアクティブセッションを確認
      getActiveSession(user.id);
      
      // ユーザーのリクエストを監視
      const unsubscribe = subscribeToRequests(user.id);
      return unsubscribe;
    }
  }, [user, isInitialized, getActiveSession, subscribeToRequests]);

  // メッセージが追加されたらスクロール
  useEffect(() => {
    if (supportMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [supportMessages]);

  // 最新の管理者メッセージの感情に基づいてアバターの表情を更新
  useEffect(() => {
    const latestAdminMessage = supportMessages
      .filter(msg => msg.senderType === 'admin')
      .slice(-1)[0];
    
    if (latestAdminMessage?.metadata && 'avatarExpression' in latestAdminMessage.metadata) {
      setCurrentAvatarEmotion((latestAdminMessage.metadata as any).avatarExpression as AvatarEmotionType);
    }
  }, [supportMessages]);

  // ユーザーのリクエスト状態を監視
  useEffect(() => {
    if (userRequests.length > 0) {
      const latestRequest = userRequests[0]; // 最新のリクエスト
      
      if (latestRequest.status === 'in_progress' && latestRequest.sessionId && !currentSession) {
        // 管理者が対応開始した場合、セッションを開始
        console.log('🔄 管理者が対応開始、セッションを開始:', latestRequest.sessionId);
        loadSession(latestRequest.sessionId);
      }
    }
  }, [userRequests, currentSession, loadSession]);

  // セッションが開始されたらメッセージの監視を開始
  useEffect(() => {
    if (currentSession) {
      console.log('💬 セッション開始、メッセージ監視を開始:', currentSession.id);
      
      // セッション開始の通知
      Alert.alert(
        '管理者が対応開始',
        '管理者があなたのサポートリクエストに対応を開始しました。\nお気軽にメッセージをお送りください。',
        [{ text: 'OK' }]
      );
      
      const unsubscribe = subscribeToSession(currentSession.id);
      return unsubscribe;
    }
  }, [currentSession, subscribeToSession]);

  // エラー表示
  useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [
        { text: 'OK', onPress: () => setError(null) }
      ]);
    }
  }, [error, setError]);

  const handleRequestSupport = async () => {
    if (!inputMessage.trim() || !user) return;

    const message = inputMessage.trim();
    
    // 既存のセッションがある場合は、新しいリクエストを作成せずにメッセージを送信
    if (currentSession) {
      console.log('💬 既存セッションにメッセージ送信:', {
        sessionId: currentSession.id,
        message: message.substring(0, 50) + '...'
      });
      
      setInputMessage('');
      
      try {
        await sendMessage(currentSession.id, user.id, message);
        console.log('✅ メッセージ送信完了');
      } catch (error) {
        console.error('❌ メッセージ送信エラー:', error);
        Alert.alert('エラー', 'メッセージの送信に失敗しました。');
      }
      return;
    }

    // 既存のセッションがない場合は、新しいサポートリクエストを作成
    console.log('🆘 サポートリクエスト送信開始:', {
      userId: user.id,
      message: message.substring(0, 50) + '...',
      emotion: selectedEmotion
    });
    
    setInputMessage('');

    try {
      await requestSupport(user.id, message, selectedEmotion);
      console.log('✅ サポートリクエスト送信完了');
      Alert.alert(
        'サポートリクエスト送信完了',
        '管理者があなたのリクエストを確認し、できるだけ早く対応いたします。',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ サポートリクエストエラー:', error);
      Alert.alert('エラー', 'サポートリクエストの送信に失敗しました。');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || !user) {
      console.log('❌ メッセージ送信条件不足:', {
        hasMessage: !!inputMessage.trim(),
        hasSession: !!currentSession,
        hasUser: !!user,
        sessionId: currentSession?.id
      });
      return;
    }

    const message = inputMessage.trim();
    console.log('💬 ユーザーメッセージ送信開始:', {
      sessionId: currentSession.id,
      userId: user.id,
      message: message.substring(0, 50) + '...'
    });
    
    setInputMessage('');

    try {
      await sendMessage(currentSession.id, user.id, message);
      console.log('✅ ユーザーメッセージ送信完了');
    } catch (error) {
      console.error('❌ ユーザーメッセージ送信エラー:', error);
    }
  };

  const handleEndSession = () => {
    if (!currentSession) return;

    Alert.alert(
      'サポートセッションを終了しますか？',
      '現在のサポートセッションを終了します。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '終了',
          style: 'destructive',
          onPress: async () => {
            try {
              await endSession(currentSession.id);
            } catch (error) {
              console.error('セッション終了エラー:', error);
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
            <PixelAvatar
              size={120}
              emotion={currentAvatarEmotion}
              color={currentAvatarColor}
              isTyping={isWaitingForAdmin}
              style={styles.avatar}
            />
            <View style={styles.avatarGlow} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>こんにちは！カノンです</Text>
            <Text style={styles.welcomeSubtitle}>サポート管理者</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {availableAdmins.length > 0 ? 'ONLINE' : 'BUSY'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.welcomeMessage}>
          失敗談や愚痴を聞かせてください。私たち管理者があなたの気持ちに寄り添い、
          人間ならではの温かいサポートを提供します。匿名で安心して話すことができます。
        </Text>
        <View style={styles.welcomeFeatures}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureText}>人間による直接サポート</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💝</Text>
            <Text style={styles.featureText}>真の共感と理解</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>完全匿名・プライベート</Text>
          </View>
        </View>
        
        {/* 表情テスト用ボタン */}
        <View style={styles.emotionTestContainer}>
          <Text style={styles.emotionTestTitle}>表情テスト</Text>
          <View style={styles.emotionButtons}>
            {(['neutral', 'happy', 'sad', 'angry', 'surprised', 'thinking', 'confused'] as AvatarEmotionType[]).map((emotion) => (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.emotionButton,
                  currentAvatarEmotion === emotion && styles.emotionButtonActive
                ]}
                onPress={() => setCurrentAvatarEmotion(emotion)}
              >
                <Text style={styles.emotionButtonText}>
                  {emotion === 'neutral' ? '😐' : 
                   emotion === 'happy' ? '😊' :
                   emotion === 'sad' ? '😢' :
                   emotion === 'angry' ? '😠' :
                   emotion === 'surprised' ? '😲' :
                   emotion === 'thinking' ? '🤔' :
                   emotion === 'confused' ? '😉' : '😐'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderMessage = (message: any, index: number) => {
    const isUser = message.senderType === 'user';
    const isAdmin = message.senderType === 'admin';

    return (
      <View key={message.id || index} style={styles.messageContainer}>
        <LinearGradient
          colors={isUser ? ['#00FF88', '#00CC6A'] : ['#1A0A2E', '#16213E']}
          style={[
            styles.messageBubble,
            isUser ? styles.userMessage : styles.aiMessage
          ]}
        >
          {isAdmin && (
            <View style={styles.aiMessageHeader}>
              <View style={styles.avatarContainer}>
                <PixelAvatar
                  size={32}
                  emotion={(message.metadata as any)?.avatarExpression as AvatarEmotionType || 'neutral'}
                  color={currentAvatarColor}
                  isTyping={false}
                  style={styles.messageAvatar}
                />
                <View style={styles.avatarGlow} />
              </View>
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

  const renderWaitingIndicator = () => (
    <View style={styles.messageContainer}>
      <LinearGradient
        colors={['#1A0A2E', '#16213E']}
        style={[styles.messageBubble, styles.aiMessage]}
      >
        <View style={styles.aiMessageHeader}>
          <View style={styles.avatarContainer}>
            <PixelAvatar
              size={32}
              emotion="thinking"
              color={currentAvatarColor}
              isTyping={true}
              style={styles.messageAvatar}
            />
            <View style={styles.avatarGlow} />
          </View>
          <Text style={styles.aiName}>カノン</Text>
        </View>
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color="#00FF88" />
          <Text style={styles.typingText}>管理者を探しています...</Text>
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
            <Text style={styles.headerTitle}>未来人カノン</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setCurrentAvatarColor(currentAvatarColor === 'green' ? 'blue' : 'green')} 
              style={styles.colorButton}
            >
              <IconButton 
                icon="palette" 
                size={18} 
                iconColor={currentAvatarColor === 'green' ? '#00FF88' : '#00AAFF'} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEndSession} style={styles.refreshButton}>
              <IconButton icon="refresh" size={20} iconColor="#00FF88" />
            </TouchableOpacity>
          </View>
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
          {supportMessages.length === 0 && !isLoading && !currentSession && renderWelcomeMessage()}
          
          {currentSession && supportMessages.length === 0 && (
            <View style={styles.messageContainer}>
              <LinearGradient
                colors={['#1A0A2E', '#16213E']}
                style={[styles.messageBubble, styles.aiMessage]}
              >
                <Text style={styles.aiMessageText}>
                  管理者が対応を開始しました。お気軽にメッセージをお送りください。
                </Text>
              </LinearGradient>
            </View>
          )}
          
          {currentSession && supportMessages.length > 0 && (
            <View style={styles.messageContainer}>
              <LinearGradient
                colors={['#0F3460', '#16213E']}
                style={[styles.messageBubble, styles.aiMessage]}
              >
                <Text style={styles.aiMessageText}>
                  💬 チャットセッションが継続中です
                </Text>
              </LinearGradient>
            </View>
          )}
          
          {supportMessages.map((message, index) => renderMessage(message, index))}
          
          {isWaitingForAdmin && renderWaitingIndicator()}
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
                placeholder={currentSession ? "メッセージを入力..." : "サポートをリクエストしてください..."}
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                maxLength={500}
                disabled={isLoading || isWaitingForAdmin}
                placeholderTextColor="#00FF88"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputMessage.trim() || isLoading || isWaitingForAdmin) && styles.sendButtonDisabled
                ]}
                onPress={currentSession ? handleSendMessage : handleRequestSupport}
                disabled={!inputMessage.trim() || isLoading || isWaitingForAdmin}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'space-between',
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 24,
    borderWidth: 2,
    borderColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    minHeight: 300,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
    alignSelf: 'flex-start',
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
    paddingTop: 4,
    justifyContent: 'space-between',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00FF88',
    marginBottom: 20,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    lineHeight: 24,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 18,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  welcomeFeatures: {
    gap: 12,
    marginBottom: 16,
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

  // 表情テスト
  emotionTestContainer: {
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  emotionTestTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF88',
    marginBottom: 8,
    textAlign: 'center',
  },
  emotionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  emotionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  emotionButtonActive: {
    backgroundColor: '#00FF88',
  },
  emotionButtonText: {
    fontSize: 18,
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

export default AdminSupportScreen;
