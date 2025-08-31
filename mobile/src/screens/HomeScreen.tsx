import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { 
  Text, 
  Avatar, 
  Searchbar,
  Chip,
  IconButton,
  Surface
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { FailureStory, MainCategory, SubCategory, PostType } from '../types';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';
import { 
  getCategoryHierarchyColor,
  getMainCategories,
  getCategoryHierarchyIcon
} from '../utils/categories';
import { LikeButton } from '../components/LikeButton';
import Header from '../components/Header';


interface HomeScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, signIn } = useAuthStore();
  const { stories, setStories, setLoading, isLoading } = useStoryStore();
  
  // 検索・フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [selectedPostType, setSelectedPostType] = useState<PostType | null>(null);
  const [filteredStories, setFilteredStories] = useState<FailureStory[]>([]);
  
  // ウェルカムメッセージの表示制御
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);


  const mainCategories = getMainCategories();

  const loadStories = React.useCallback(async (showLoading = true) => {
    try {
      // 認証状態をチェックし、必要に応じて匿名認証を実行
      if (!user) {
        console.log('🔐 ユーザー未認証のため、匿名認証を実行中...');
        await signIn();
        // 認証後に再度ユーザー情報を取得
        const { user: newUser } = useAuthStore.getState();
        if (!newUser) {
          console.log('⚠️ 認証に失敗したため、ストーリー取得をスキップ');
          return;
        }
      }

      if (showLoading) setLoading(true);
      const { stories: fetchedStories } = await storyService.getStories();
      setStories(fetchedStories);
      

    } catch (error) {
      console.error('ストーリー取得エラー:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user, signIn, setLoading, setStories]);

  const filterStories = React.useCallback(() => {
    let filtered = stories;

    // テキスト検索
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(story => 
        story.content.title.toLowerCase().includes(searchLower) ||
        story.content.situation.toLowerCase().includes(searchLower) ||
        story.content.action.toLowerCase().includes(searchLower) ||
        story.content.result.toLowerCase().includes(searchLower) ||
        story.content.learning.toLowerCase().includes(searchLower)
      );
    }

    // メインカテゴリフィルター
    if (selectedMainCategory) {
      filtered = filtered.filter(story => 
        story.content.category.main === selectedMainCategory
      );
    }

    // サブカテゴリフィルター
    if (selectedSubCategory) {
      filtered = filtered.filter(story => 
        story.content.category.sub === selectedSubCategory
      );
    }

    // 投稿タイプフィルター
    if (selectedPostType) {
      filtered = filtered.filter(story => 
        story.content.postType === selectedPostType
      );
    }

    setFilteredStories(filtered);
  }, [stories, searchQuery, selectedMainCategory, selectedSubCategory, selectedPostType]);

  // 画面フォーカス時に自動リフレッシュ
  useFocusEffect(
    React.useCallback(() => {
      loadStories();
    }, [loadStories])
  );

  useEffect(() => {
    filterStories();
  }, [filterStories]);

  const handleMainCategorySelect = (category: MainCategory | null) => {
    setSelectedMainCategory(category);
    setSelectedSubCategory(null);
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

  const displayStories = searchQuery || selectedMainCategory || selectedSubCategory ? filteredStories : stories;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Header
        navigation={navigation}
        showBackButton={false}
      />

      {/* ウェルカムメッセージ */}
      {showWelcomeMessage && !searchQuery && (
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeTitle}>🎉 FailShareへようこそ！</Text>
              <TouchableOpacity 
                onPress={() => setShowWelcomeMessage(false)}
                style={styles.closeButton}
              >
                <IconButton icon="close" size={20} iconColor="#8E9AAF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.welcomeDescription}>
              失敗談と愚痴を匿名で共有し、同じ経験を持つ人たちと支え合うコミュニティです。
            </Text>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={() => navigation?.navigate('CreateStory')}
            >
              <Text style={styles.getStartedText}>最初の投稿をしてみる</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 検索セクション */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="失敗談を検索..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.modernSearchbar}
            inputStyle={styles.searchInput}
            iconColor="#8E9AAF"
            placeholderTextColor="#8E9AAF"
          />
          <TouchableOpacity 
            style={styles.searchCreateButton}
            onPress={() => navigation?.navigate('CreateStory')}
          >
            <IconButton icon="plus" size={20} iconColor="#FFFFFF" style={styles.createIcon} />
          </TouchableOpacity>
        </View>

        {/* アクティブフィルター */}
        {(selectedMainCategory || selectedSubCategory || searchQuery) && (
          <View style={styles.activeFilters}>
            <View style={styles.filterRow}>
              {searchQuery && (
                <Chip
                  icon="magnify"
                  onClose={() => setSearchQuery('')}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterText}
                >
                  「{searchQuery}」
                </Chip>
              )}
              {selectedMainCategory && (
                <Chip
                  onClose={() => handleMainCategorySelect(null)}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterText}
                >
                  {selectedMainCategory}
                </Chip>
              )}
              {selectedSubCategory && (
                <Chip
                  onClose={() => setSelectedSubCategory(null)}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterText}
                >
                  {selectedSubCategory}
                </Chip>
              )}
              {selectedPostType && (
                <Chip
                  onClose={() => setSelectedPostType(null)}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterText}
                >
                  {selectedPostType === 'failure' ? '💔 失敗談' : '😤 愚痴'}
                </Chip>
              )}
            </View>
          </View>
        )}
      </View>

      {/* 投稿タイプフィルター */}
      {!searchQuery && (
        <View style={styles.categorySection}>
          <View style={styles.categoryScrollContent}>
            <TouchableOpacity
              style={[styles.categoryFilterButton, selectedPostType === null && styles.categoryFilterButtonActive]}
              onPress={() => setSelectedPostType(null)}
            >
              <Text style={[styles.categoryFilterText, selectedPostType === null && styles.categoryFilterTextActive]}>
                すべて
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryFilterButton, selectedPostType === 'failure' && styles.categoryFilterButtonActive]}
              onPress={() => setSelectedPostType('failure')}
            >
              <Text style={[styles.categoryFilterText, selectedPostType === 'failure' && styles.categoryFilterTextActive]}>
                💔 失敗談
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryFilterButton, selectedPostType === 'complaint' && styles.categoryFilterButtonActive]}
              onPress={() => setSelectedPostType('complaint')}
            >
              <Text style={[styles.categoryFilterText, selectedPostType === 'complaint' && styles.categoryFilterTextActive]}>
                😤 愚痴
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* カテゴリフィルター */}
      {!searchQuery && (
        <View style={styles.categorySection}>
          <View style={styles.categoryScrollContent}>
            <TouchableOpacity
              style={[styles.categoryFilterButton, selectedMainCategory === null && styles.categoryFilterButtonActive]}
              onPress={() => handleMainCategorySelect(null)}
            >
              <Text style={[styles.categoryFilterText, selectedMainCategory === null && styles.categoryFilterTextActive]}>
                すべて
              </Text>
            </TouchableOpacity>
            {mainCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryFilterButton, selectedMainCategory === category && styles.categoryFilterButtonActive]}
                onPress={() => handleMainCategorySelect(category)}
              >
                <Text style={[styles.categoryFilterText, selectedMainCategory === category && styles.categoryFilterTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ストーリーリスト */}
      <ScrollView 
        style={styles.storyListContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.storyListContent}
      >
        {displayStories.length === 0 && !isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {searchQuery || selectedMainCategory || selectedSubCategory || selectedPostType ? '🔍' : '💭'}
            </Text>
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedMainCategory || selectedSubCategory || selectedPostType
                ? '該当する投稿が見つかりませんでした' 
                : '失敗談と愚痴を共有しましょう'
              }
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedMainCategory || selectedSubCategory || selectedPostType
                ? '検索条件を変更してお試しください'
                : 'あなたの経験や感情を匿名で共有し、同じような経験を持つ人たちと支え合いましょう。失敗から学び、愚痴を吐き出して心を軽くすることができます。'
              }
            </Text>
            {!searchQuery && !selectedMainCategory && !selectedSubCategory && !selectedPostType && (
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={() => navigation?.navigate('CreateStory')}
              >
                <Text style={styles.emptyActionText}>投稿を始める</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayStories.map((story, _index) => (
            <TouchableOpacity 
              key={story.id}
              onPress={() => navigation?.navigate('StoryDetail', { storyId: story.id })}
              activeOpacity={0.7}
              style={styles.storyCardContainer}
            >
              <Surface style={styles.storyCard} elevation={1}>
                <View style={styles.cardContent}>
                  {/* ヘッダー部分 */}
                  <View style={styles.cardHeader}>
                    <Avatar.Image 
                      size={44} 
                      source={{ uri: `https://robohash.org/user${story.authorId}?set=set4` }}
                      style={styles.avatar}
                    />
                    <View style={styles.userDetails}>
                      <View style={styles.userInfoRow}>
                        <Text style={styles.userName}>匿名ユーザー</Text>
                        <Text style={styles.timeAgo}>・{getTimeAgo(story.metadata.createdAt)}</Text>
                      </View>
                      <View style={styles.categoryContainer}>
                        <Chip 
                          compact
                          style={[styles.categoryChip, { backgroundColor: getCategoryHierarchyColor(story.content.category) + '15' }]}
                          textStyle={[styles.categoryText, { color: getCategoryHierarchyColor(story.content.category) }]}
                        >
                          {`${getCategoryHierarchyIcon(story.content.category)} ${story.content.category.sub}`}
                        </Chip>
                        <Chip 
                          compact
                          style={[styles.emotionChip, { backgroundColor: getEmotionColor(story.content.emotion) + '15' }]}
                          textStyle={[styles.emotionText, { color: getEmotionColor(story.content.emotion) }]}
                        >
                          {story.content.emotion}
                        </Chip>
                      </View>
                    </View>
                  </View>

                  {/* メインコンテンツ */}
                  <View style={styles.mainContent}>
                    <Text style={styles.storyTitle} numberOfLines={2}>
                      {story.content.title}
                    </Text>
                    <Text style={styles.storyPreview} numberOfLines={3}>
                      {story.content.situation}
                    </Text>
                  </View>

                  {/* アクション */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionItem}>
                      <IconButton icon="eye-outline" size={18} iconColor="#8E9AAF" style={styles.actionIcon} />
                      <Text style={styles.actionText}>{story.metadata.viewCount}</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.actionItem}>
                      <LikeButton
                        storyId={story.id}
                        initialHelpfulCount={story.metadata.helpfulCount || 0}
                        size="small"
                        showCount={true}
                        onLikeChange={(isLiked, newCount) => {
                          console.log(`🏠 HomeScreen: いいね更新 [${story.id}]:`, { isLiked, newCount });
                          
                          // ストーリーのいいね数を更新（グローバルストアも更新）
                          const updatedStories = stories.map(s => 
                            s.id === story.id 
                              ? { ...s, metadata: { ...s.metadata, helpfulCount: newCount } }
                              : s
                          );
                          setStories(updatedStories);
                          
                          // フィルター済みストーリーも更新
                          if (searchQuery || selectedMainCategory || selectedSubCategory) {
                            const updatedFilteredStories = filteredStories.map(s => 
                              s.id === story.id 
                                ? { ...s, metadata: { ...s.metadata, helpfulCount: newCount } }
                                : s
                            );
                            setFilteredStories(updatedFilteredStories);
                          }
                        }}
                      />
                    </View>
                    
                    <TouchableOpacity style={styles.actionItem}>
                      <IconButton icon="message-outline" size={18} iconColor="#8E9AAF" style={styles.actionIcon} />
                      <Text style={styles.actionText}>{story.metadata.commentCount}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Surface>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomSpace} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#1DA1F2',
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  profileButton: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileIcon: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#1DA1F2',
    borderRadius: 10,
    margin: 0,
    width: 20,
    height: 20,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modernSearchbar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchCreateButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  createIcon: {
    margin: 0,
  },
  searchInput: {
    fontSize: 14,
    color: '#334155',
  },
  activeFilters: {
    marginTop: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  activeFilterChip: {
    marginRight: 8,
    backgroundColor: '#1DA1F2',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  categoryScrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  categoryFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  categoryFilterButtonActive: {
    backgroundColor: '#1DA1F2',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 32,
    minHeight: 300,
    marginHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1E293B',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 24,
  },
  storyCardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
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
    height: 26,
    borderRadius: 13,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emotionChip: {
    marginRight: 6,
    marginBottom: 2,
    height: 26,
    borderRadius: 13,
  },
  emotionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  mainContent: {
    marginBottom: 16,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 8,
  },
  storyPreview: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionIcon: {
    margin: 0,
  },
  actionText: {
    fontSize: 13,
    color: '#8E9AAF',
    fontWeight: '500',
    marginLeft: -6,
  },
  storyListContainer: {
    flex: 1,
  },
  storyListContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  bottomSpace: {
    height: 40,
  },
  // ウェルカムメッセージのスタイル
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1DA1F2',
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    margin: 0,
    padding: 0,
  },
  welcomeDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  welcomeFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  getStartedButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // 空の状態のアクションボタン
  emptyActionButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen; 