import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { 
  Text, 
  Avatar,
  Chip,
  IconButton,
  Surface,
  Button
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FailureStory } from '../types';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';
import { 
  getCategoryHierarchyColor,
  getCategoryHierarchyIcon
} from '../utils/categories';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import Header from '../components/Header';

interface MyStoriesScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyStories'>;
}

const MyStoriesScreen: React.FC<MyStoriesScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { stories, setStories, setLoading, isLoading } = useStoryStore();
  const [userStories, setUserStories] = useState<FailureStory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadUserStories = async () => {
      if (!user) {
        console.log('⚠️ ユーザー未認証のため、マイストーリー取得をスキップ');
        return;
      }
      
      try {
        setLoading(true);
        const { stories: allStories } = await storyService.getStories();
        const filtered = allStories.filter(story => story.authorId === user.id);
        setUserStories(filtered);
        setStories(allStories);
      } catch (error) {
        console.error('ユーザーストーリー取得エラー:', error);
        Alert.alert('エラー', 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadUserStories();
  }, [user, setLoading, setStories]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user) {
        const { stories: allStories } = await storyService.getStories();
        const filtered = allStories.filter(story => story.authorId === user.id);
        setUserStories(filtered);
        setStories(allStories);
      }
    } catch (error) {
      console.error('ユーザーストーリー取得エラー:', error);
      Alert.alert('エラー', 'データの取得に失敗しました');
    } finally {
      setRefreshing(false);
    }
  };

  const getTimeAgo = (date: any): string => {
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

  const handleEditStory = (storyId: string) => {
    // 編集画面への遷移（編集モードでCreateStoryScreenを開く）
    const storyToEdit = userStories.find(story => story.id === storyId);
    if (storyToEdit) {
      navigation?.navigate('CreateStory', { 
        editMode: true, 
        storyData: storyToEdit 
      });
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!user) return;
    
    Alert.alert(
      '削除確認',
      'この失敗談を削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await storyService.deleteStory(storyId, user.id);
              
              // ローカル状態を更新
              const updatedUserStories = userStories.filter(story => story.id !== storyId);
              const updatedAllStories = stories.filter(story => story.id !== storyId);
              setUserStories(updatedUserStories);
              setStories(updatedAllStories);
              
              Alert.alert('削除完了', '失敗談を削除しました。');
            } catch (error) {
              console.error('削除エラー:', error);
              Alert.alert('削除失敗', '削除に失敗しました。もう一度お試しください。');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderStoryItem = ({ item }: { item: FailureStory }) => (
    <TouchableOpacity 
      onPress={() => navigation?.navigate('StoryDetail', { storyId: item.id })}
      activeOpacity={0.7}
    >
      <Surface style={styles.storyCard} elevation={1}>
        <View style={styles.cardContent}>
          {/* ヘッダー部分 */}
          <View style={styles.cardHeader}>
            <View style={styles.userSection}>
              <Avatar.Image 
                size={40} 
                source={{ uri: `https://robohash.org/user${item.authorId}?set=set4` }}
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <View style={styles.userInfoRow}>
                  <Text style={styles.userName}>あなた</Text>
                  <Text style={styles.timeAgo}>{`・${getTimeAgo(item.metadata.createdAt)}`}</Text>
                </View>
                <View style={styles.categoryContainer}>
                  <Chip 
                    compact
                    style={[styles.categoryChip, { backgroundColor: getCategoryHierarchyColor(item.content.category) + '15' }]}
                    textStyle={[styles.categoryText, { color: getCategoryHierarchyColor(item.content.category) }]}
                  >
                    {`${getCategoryHierarchyIcon(item.content.category)} ${item.content.category.sub}`}
                  </Chip>
                  <Chip 
                    compact
                    style={[styles.emotionChip, { backgroundColor: getEmotionColor(item.content.emotion) + '15' }]}
                    textStyle={[styles.emotionText, { color: getEmotionColor(item.content.emotion) }]}
                  >
                    {item.content.emotion}
                  </Chip>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
              <IconButton icon="dots-vertical" size={20} iconColor="#8E9AAF" />
            </TouchableOpacity>
          </View>

          {/* メインコンテンツ */}
          <View style={styles.mainContent}>
            <Text style={styles.storyTitle} numberOfLines={2}>
              {item.content.title}
            </Text>
            <Text style={styles.storyPreview} numberOfLines={2}>
              {item.content.situation}
            </Text>
          </View>

          {/* 統計情報 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <IconButton icon="eye-outline" size={16} iconColor="#8E9AAF" style={styles.statIcon} />
              <Text style={styles.statText}>{item.metadata.viewCount}</Text>
            </View>
            <View style={styles.statItem}>
              <IconButton icon="heart-outline" size={16} iconColor="#8E9AAF" style={styles.statIcon} />
              <Text style={styles.statText}>{item.metadata.helpfulCount}</Text>
            </View>
            <View style={styles.statItem}>
              <IconButton icon="message-outline" size={16} iconColor="#8E9AAF" style={styles.statIcon} />
              <Text style={styles.statText}>{item.metadata.commentCount}</Text>
            </View>
            <View style={styles.spacer} />
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditStory(item.id)}
              >
                <IconButton icon="pencil-outline" size={18} iconColor="#1DA1F2" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteStory(item.id)}
              >
                <IconButton icon="delete-outline" size={18} iconColor="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      <Header navigation={navigation} />

      {/* 統計情報カード */}
      <Surface style={styles.statsCard} elevation={2}>
        <View style={styles.statsContainer}>
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>{userStories.length}</Text>
            <Text style={styles.statLabel}>投稿数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>
              {userStories.reduce((sum, story) => sum + story.metadata.viewCount, 0)}
            </Text>
            <Text style={styles.statLabel}>総閲覧数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>
              {userStories.reduce((sum, story) => sum + story.metadata.helpfulCount, 0)}
            </Text>
            <Text style={styles.statLabel}>総いいね</Text>
          </View>
        </View>
      </Surface>

      {/* ストーリーリスト */}
      <FlatList
        data={userStories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        style={styles.timeline}
        contentContainerStyle={styles.timelineContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#1DA1F2']}
            tintColor="#1DA1F2"
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>まだ投稿がありません</Text>
              <Text style={styles.emptyText}>
                最初の失敗談を投稿して、{'\n'}
                他のユーザーの学びに貢献しましょう
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation?.navigate('CreateStory')}
                style={styles.createButton}
                labelStyle={styles.createButtonText}
              >
                失敗談を投稿する
              </Button>
            </View>
          ) : null
        }
      />

      {/* 投稿FAB */}
      <LinearGradient
        colors={['#1DA1F2', '#1991DB']}
        style={styles.modernFab}
      >
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => navigation?.navigate('CreateStory')}
        >
          <IconButton icon="plus" size={24} iconColor="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  statsCard: {
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E9AAF',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  timeline: {
    flex: 1,
    paddingTop: 16,
  },
  timelineContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  storyCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  timeAgo: {
    fontSize: 14,
    color: '#8E9AAF',
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 6,
    marginBottom: 2,
    height: 24,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emotionChip: {
    marginRight: 6,
    marginBottom: 2,
    height: 24,
    borderRadius: 12,
  },
  emotionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  menuButton: {
    marginLeft: 8,
  },
  mainContent: {
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 6,
  },
  storyPreview: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    margin: 0,
  },
  statText: {
    fontSize: 12,
    color: '#8E9AAF',
    marginLeft: -6,
  },
  spacer: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 4,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1E293B',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modernFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    shadowColor: '#1DA1F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MyStoriesScreen; 