import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { 
  Text, 
  Avatar, 
  IconButton, 
  Chip,
  Surface
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { FailureStory } from '../types';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../stores/authStore';
import { 
  getCategoryHierarchyColor,
  getCategoryHierarchyIcon
} from '../utils/categories';
import { LikeButton } from '../components/LikeButton';
import { CommentList } from '../components/CommentList';
import { CommentInput } from '../components/CommentInput';

interface StoryDetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StoryDetail'>;
  route: RouteProp<RootStackParamList, 'StoryDetail'>;
}

const StoryDetailScreen: React.FC<StoryDetailScreenProps> = ({ route, navigation }) => {
  const { storyId } = route.params;
  const { user: _user } = useAuthStore();
  const [story, setStory] = useState<FailureStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const loadStory = async () => {
    try {
      setIsLoading(true);
      const { stories } = await storyService.getStories();
      const foundStory = stories.find(s => s.id === storyId);
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
  };

  useEffect(() => {
    loadStory();
  }, [storyId, loadStory]);

  const getTimeAgo = (date: Date | any): string => {
    try {
      // Firestore Timestampの場合の処理
      let actualDate: Date;
      if (date && typeof date.toDate === 'function') {
        actualDate = date.toDate();
      } else if (date instanceof Date) {
        actualDate = date;
      } else if (date && typeof date === 'object' && date.seconds) {
        // Firestore Timestamp形式 {seconds: number, nanoseconds: number}
        actualDate = new Date(date.seconds * 1000);
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



  const handleShare = () => {
    Alert.alert('シェア', 'この機能は開発中です');
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  if (isLoading || !story) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
        <LinearGradient
          colors={['#1DA1F2', '#1991DB']}
          style={styles.modernHeader}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>失敗談</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      
      {/* モダンヘッダー */}
      <LinearGradient
        colors={['#1DA1F2', '#1991DB']}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>失敗談</Text>
          <TouchableOpacity style={styles.headerRight}>
            <IconButton icon="dots-horizontal" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

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

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <IconButton icon="share-outline" size={24} iconColor="#8E9AAF" />
          <Text style={styles.actionText}>シェア</Text>
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
              // ストーリーのいいね数を更新
              setStory(prev => prev ? {
                ...prev,
                metadata: { ...prev.metadata, helpfulCount: newCount }
              } : null);
            }}
          />
        </View>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modernHeader: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
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
});

export default StoryDetailScreen; 