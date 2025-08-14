import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, StyleSheet, Alert, TouchableOpacity, StatusBar, Modal, TextInput } from 'react-native';
import { 
  Text, 
  Avatar, 
  IconButton, 
  Chip,
  Surface
} from 'react-native-paper';

import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { FailureStory } from '../types';
import { storyService } from '../services/storyService';
import { friendService } from '../services/friendService';
import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';
import { useFriendStore } from '../stores/friendStore';
import { 
  getCategoryHierarchyColor,
  getCategoryHierarchyIcon
} from '../utils/categories';
import { LikeButton } from '../components/LikeButton';
import { CommentList } from '../components/CommentList';
import { CommentInput } from '../components/CommentInput';
import Header from '../components/Header';

interface StoryDetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StoryDetail'>;
  route: RouteProp<RootStackParamList, 'StoryDetail'>;
}

const StoryDetailScreen: React.FC<StoryDetailScreenProps> = ({ route, navigation }) => {
  const { storyId } = route.params;
  const { user: currentUser } = useAuthStore();
  const { stories, setStories } = useStoryStore();
  const { 
    sendFriendRequest
  } = useFriendStore();
  
  const [story, setStory] = useState<FailureStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  
  // フレンドリクエスト関連の状態
  const [friendRequestModalVisible, setFriendRequestModalVisible] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'pending' | 'sent'>('none');

  const loadStory = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // まずグローバルストアから最新のストーリー情報を取得
      const globalStory = stories.find(s => s.id === storyId);
      
      if (globalStory) {
        // グローバルストアに存在する場合はそれを使用
        setStory(globalStory);
        setIsLoading(false);
        return;
      }
      
      // グローバルストアにない場合はAPIから取得
      const foundStory = await storyService.getStoryById(storyId);
      if (foundStory) {
        setStory(foundStory);
      } else {
        Alert.alert('エラー', 'ストーリーが見つかりません');
        navigation.goBack();
      }
    } catch (error) {
      console.error('ストーリー取得エラー:', error);
      Alert.alert('エラー', 'ストーリーの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [storyId, navigation, stories]);

  // フレンド関係の状態を確認
  const checkFriendStatus = useCallback(async () => {
    if (!currentUser || !story) return;
    
    try {
      // 自分自身の投稿の場合はフレンドリクエストボタンを表示しない
      if (currentUser.id === story.authorId) {
        setFriendStatus('none');
        return;
      }

      // フレンド関係を確認
      const areFriendsResult = await friendService.areFriends(currentUser.id, story.authorId);
      if (areFriendsResult) {
        setFriendStatus('friends');
        return;
      }

      // 送信済みリクエストを確認
      const hasPendingResult = await friendService.hasPendingRequest(currentUser.id, story.authorId);
      if (hasPendingResult) {
        setFriendStatus('sent');
        return;
      }

      // 受信済みリクエストを確認
      const hasReceivedResult = await friendService.hasPendingRequest(story.authorId, currentUser.id);
      if (hasReceivedResult) {
        setFriendStatus('pending');
        return;
      }

      setFriendStatus('none');
    } catch (error) {
      console.error('フレンド状態確認エラー:', error);
      setFriendStatus('none');
    }
  }, [currentUser, story]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  useEffect(() => {
    if (story && currentUser) {
      checkFriendStatus();
    }
  }, [story, currentUser, checkFriendStatus]);

  const getTimeAgo = (date: unknown): string => {
    try {
      // Firestore Timestampの場合の処理
      let actualDate: Date;
      if (date && typeof date === 'object' && 'toDate' in date && typeof (date as { toDate: () => Date }).toDate === 'function') {
        actualDate = (date as { toDate: () => Date }).toDate();
      } else if (date instanceof Date) {
        actualDate = date;
      } else if (date && typeof date === 'object' && 'seconds' in date && typeof (date as { seconds: number }).seconds === 'number') {
        // Firestore Timestamp形式 {seconds: number, nanoseconds: number}
        actualDate = new Date((date as { seconds: number }).seconds * 1000);
      } else {
        return '不明';
      }

      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - actualDate.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return '今';
      if (diffInHours < 24) return `${diffInHours}時間前`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}日前`;
      return actualDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('時間計算エラー:', error);
      return '不明';
    }
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

  const handleComment = () => {
    setShowComments(!showComments);
  };

  // フレンドリクエスト送信処理
  const handleSendFriendRequest = () => {
    if (!currentUser || !story) return;
    
    setRequestMessage('');
    setFriendRequestModalVisible(true);
  };

  const handleConfirmSendRequest = async () => {
    if (!currentUser || !story) return;

    try {
      setIsSendingRequest(true);
      await sendFriendRequest(currentUser.id, story.authorId, requestMessage);
      
      Alert.alert('送信完了', 'フレンドリクエストを送信しました');
      setFriendRequestModalVisible(false);
      setRequestMessage('');
      
      // フレンド状態を更新
      setFriendStatus('sent');
    } catch (error) {
      console.error('フレンドリクエスト送信エラー:', error);
      Alert.alert('エラー', 'フレンドリクエストの送信に失敗しました');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleCancelSendRequest = () => {
    setFriendRequestModalVisible(false);
    setRequestMessage('');
  };

  // フレンドリクエストボタンの表示
  const renderFriendRequestButton = () => {
    if (!currentUser || !story || currentUser.id === story.authorId) {
      return null;
    }

    switch (friendStatus) {
      case 'friends':
        return (
          <View style={styles.friendStatusContainer}>
            <IconButton icon="account-check" size={20} iconColor="#4CAF50" />
            <Text style={styles.friendStatusText}>フレンド</Text>
          </View>
        );
      case 'sent':
        return (
          <View style={styles.friendStatusContainer}>
            <IconButton icon="clock-outline" size={20} iconColor="#FF9800" />
            <Text style={styles.friendStatusText}>リクエスト送信済み</Text>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.friendStatusContainer}>
            <IconButton icon="account-plus" size={20} iconColor="#2196F3" />
            <Text style={styles.friendStatusText}>リクエスト受信済み</Text>
          </View>
        );
      case 'none':
      default:
        return (
          <TouchableOpacity
            style={styles.friendRequestButton}
            onPress={handleSendFriendRequest}
          >
            <IconButton icon="account-plus" size={20} iconColor="#007AFF" />
            <Text style={styles.friendRequestText}>フレンド追加</Text>
          </TouchableOpacity>
        );
    }
  };

  if (isLoading || !story) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
        <Header navigation={navigation} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      <Header navigation={navigation} />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showComments}
      >
        {/* ユーザー情報ヘッダー */}
        <Surface style={styles.userSection} elevation={2}>
          <View style={styles.userHeader}>
            <Avatar.Image 
              size={56} 
              source={{ uri: `https://robohash.org/user${story.authorId}?set=set4` }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>匿名ユーザー</Text>
              <Text style={styles.postTime}>{getTimeAgo(story.metadata.createdAt)}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <IconButton icon="eye-outline" size={16} iconColor="#8E9AAF" style={styles.metaIcon} />
                  <Text style={styles.metaText}>{story.metadata.viewCount}</Text>
                </View>
                <View style={styles.metaItem}>
                  <IconButton icon="message-outline" size={16} iconColor="#8E9AAF" style={styles.metaIcon} />
                  <Text style={styles.metaText}>{story.metadata.commentCount}</Text>
                </View>
              </View>
            </View>
            {renderFriendRequestButton()}
          </View>
          
          <View style={styles.tagsRow}>
            <Chip 
              style={[styles.categoryChip, { backgroundColor: getCategoryHierarchyColor(story.content.category) + '15' }]}
              textStyle={[styles.categoryText, { color: getCategoryHierarchyColor(story.content.category) }]}
              compact
            >
              {`${getCategoryHierarchyIcon(story.content.category)} ${story.content.category.sub}`}
            </Chip>
            <Chip 
              style={[styles.emotionChip, { backgroundColor: getEmotionColor(story.content.emotion) + '15' }]}
              textStyle={[styles.emotionText, { color: getEmotionColor(story.content.emotion) }]}
              compact
            >
              {story.content.emotion}
            </Chip>
          </View>
        </Surface>

        {/* タイトル */}
        <Surface style={styles.titleSection} elevation={1}>
          <Text style={styles.storyTitle}>{story.content.title}</Text>
        </Surface>

        {/* ストーリー内容 */}
        <View style={styles.storyContent}>
          {/* 状況 */}
          <Surface style={styles.contentSection} elevation={1}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.emoji}>📍</Text>
              </View>
              <Text style={styles.sectionTitle}>状況</Text>
            </View>
            <Text style={styles.sectionText}>{story.content.situation}</Text>
          </Surface>

          {/* 行動 */}
          <Surface style={styles.contentSection} elevation={1}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.emoji}>⚡</Text>
              </View>
              <Text style={styles.sectionTitle}>行動</Text>
            </View>
            <Text style={styles.sectionText}>{story.content.action}</Text>
          </Surface>

          {/* 結果 */}
          <Surface style={styles.contentSection} elevation={1}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.emoji}>💥</Text>
              </View>
              <Text style={styles.sectionTitle}>結果</Text>
            </View>
            <Text style={styles.sectionText}>{story.content.result}</Text>
          </Surface>

          {/* 学び */}
          <Surface style={styles.learningSection} elevation={1}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, styles.learningIcon]}>
                <Text style={styles.emoji}>💡</Text>
              </View>
              <Text style={[styles.sectionTitle, styles.learningTitle]}>学び・気づき</Text>
            </View>
            <Text style={[styles.sectionText, styles.learningText]}>{story.content.learning}</Text>
          </Surface>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* コメントセクション */}
      {showComments && (
        <View style={styles.commentSection}>
          <View style={styles.commentListContainer}>
            <CommentList 
              storyId={storyId} 
              onCommentCountChange={setCommentCount}
            />
          </View>
          <CommentInput 
            storyId={storyId}
            onCommentAdded={() => {
              // コメント投稿後にコメント数を更新
              setCommentCount(prev => prev + 1);
            }}
          />
        </View>
      )}

      {/* アクションバー */}
      <Surface style={styles.actionBar} elevation={5}>
        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <IconButton 
            icon={showComments ? "message" : "message-outline"} 
            size={24} 
            iconColor={showComments ? "#007AFF" : "#8E9AAF"} 
          />
          <Text style={[styles.actionText, showComments && styles.activeActionText]}>
            {commentCount > 0 ? commentCount : story.metadata.commentCount}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionSpacer} />

        <View style={styles.supportButton}>
          <LikeButton
            storyId={story.id}
            initialHelpfulCount={story.metadata.helpfulCount || 0}
            size="large"
            showCount={true}
            onLikeChange={(isLiked, newCount) => {
              console.log(`📱 StoryDetailScreen: 参考になったボタン [${story.id}]:`, { isLiked, newCount });
              
              // ローカルストーリー状態を更新
              setStory(prev => prev ? {
                ...prev,
                metadata: { ...prev.metadata, helpfulCount: newCount }
              } : null);
              
              // グローバルストアも更新（HomeScreenとの同期のため）
              const updatedStories = stories.map(s => 
                s.id === story.id 
                  ? { ...s, metadata: { ...s.metadata, helpfulCount: newCount } }
                  : s
              );
              setStories(updatedStories);
            }}
          />
        </View>
      </Surface>

      {/* フレンドリクエスト送信モーダル */}
      <Modal
        visible={friendRequestModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelSendRequest}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              匿名ユーザーにフレンドリクエストを送信
            </Text>
            <Text style={styles.modalSubtitle}>
              この失敗談の投稿者にフレンドリクエストを送信します。
              メッセージを入力してください（任意）
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="メッセージを入力..."
              value={requestMessage}
              onChangeText={setRequestMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelSendRequest}
                disabled={isSendingRequest}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton, isSendingRequest && styles.disabledButton]}
                onPress={handleConfirmSendRequest}
                disabled={isSendingRequest}
              >
                <Text style={styles.sendButtonText}>
                  {isSendingRequest ? '送信中...' : '送信'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E9AAF',
  },
  userSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  postTime: {
    fontSize: 14,
    color: '#8E9AAF',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaIcon: {
    margin: 0,
  },
  metaText: {
    fontSize: 13,
    color: '#8E9AAF',
    marginLeft: -6,
  },
  // フレンドリクエスト関連のスタイル
  friendRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  friendRequestText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: -6,
  },
  friendStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  friendStatusText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
    marginLeft: -6,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
    height: 28,
    borderRadius: 14,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emotionChip: {
    height: 28,
    borderRadius: 14,
  },
  emotionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  titleSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    lineHeight: 32,
    textAlign: 'center',
  },
  storyContent: {
    paddingHorizontal: 16,
  },
  contentSection: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  learningSection: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)',
    borderWidth: 1,
    borderColor: '#F59E0B20',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  learningIcon: {
    backgroundColor: '#FEF3C7',
  },
  emoji: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  learningTitle: {
    color: '#D97706',
  },
  sectionText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  learningText: {
    color: '#92400E',
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    color: '#8E9AAF',
    fontWeight: '500',
    marginLeft: -6,
  },
  actionSpacer: {
    flex: 1,
  },
  supportButton: {
    borderRadius: 20,
    shadowColor: '#1DA1F2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomSpace: {
    height: 40,
  },
  commentSection: {
    height: 500,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    position: 'relative',
  },
  commentListContainer: {
    flex: 1,
    position: 'relative',
  },
  activeActionText: {
    color: '#007AFF',
  },
  // モーダル関連のスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    marginBottom: 20,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  sendButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StoryDetailScreen; 