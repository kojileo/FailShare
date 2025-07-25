import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { 
  Text, 
  Avatar, 
  FAB, 
  Searchbar,
  Chip,
  IconButton,
  Surface
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { FailureStory, MainCategory, SubCategory } from '../types';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';
import { 
  getCategoryDisplayString, 
  getCategoryHierarchyColor,
  getMainCategories,
  getSubCategories,
  getCategoryHierarchyIcon
} from '../utils/categories';

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { stories, setStories, setLoading, isLoading } = useStoryStore();
  
  // 検索・フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [filteredStories, setFilteredStories] = useState<FailureStory[]>([]);
  const [allStories, setAllStories] = useState<FailureStory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const mainCategories = getMainCategories();

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    filterStories();
  }, [searchQuery, selectedMainCategory, selectedSubCategory, allStories]);

  const loadStories = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { stories: fetchedStories } = await storyService.getStories();
      setAllStories(fetchedStories);
      setStories(fetchedStories);
    } catch (error) {
      console.error('ストーリー取得エラー:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = allStories;

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

    setFilteredStories(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadStories(false);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMainCategorySelect = (category: MainCategory | null) => {
    setSelectedMainCategory(category);
    setSelectedSubCategory(null);
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '今';
    if (diffInHours < 24) return `${diffInHours}時間`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}日`;
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

  const renderStoryItem = ({ item }: { item: FailureStory }) => (
    <TouchableOpacity 
      onPress={() => navigation?.navigate('StoryDetail', { storyId: item.id })}
      activeOpacity={0.7}
    >
      <Surface style={styles.storyCard} elevation={1}>
        <View style={styles.cardContent}>
          {/* ヘッダー部分 */}
          <View style={styles.cardHeader}>
            <Avatar.Image 
              size={44} 
              source={{ uri: `https://robohash.org/user${item.authorId}?set=set4` }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <View style={styles.userInfoRow}>
                <Text style={styles.userName}>匿名ユーザー</Text>
                <Text style={styles.timeAgo}>・{getTimeAgo(item.metadata.createdAt)}</Text>
              </View>
              <View style={styles.categoryContainer}>
                <Chip 
                  compact
                  style={[styles.categoryChip, { backgroundColor: getCategoryHierarchyColor(item.content.category) + '15' }]}
                  textStyle={[styles.categoryText, { color: getCategoryHierarchyColor(item.content.category) }]}
                >
                  {getCategoryHierarchyIcon(item.content.category)} {item.content.category.sub}
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

          {/* メインコンテンツ */}
          <View style={styles.mainContent}>
            <Text style={styles.storyTitle} numberOfLines={2}>
              {item.content.title}
            </Text>
            <Text style={styles.storyPreview} numberOfLines={3}>
              {item.content.situation}
            </Text>
          </View>

          {/* アクション部分 */}
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionItem}>
              <IconButton icon="eye-outline" size={18} iconColor="#8E9AAF" style={styles.actionIcon} />
              <Text style={styles.actionText}>{item.metadata.viewCount}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <IconButton icon="heart-outline" size={18} iconColor="#8E9AAF" style={styles.actionIcon} />
              <Text style={styles.actionText}>{item.metadata.helpfulCount}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <IconButton icon="message-outline" size={18} iconColor="#8E9AAF" style={styles.actionIcon} />
              <Text style={styles.actionText}>{item.metadata.commentCount}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <IconButton icon="share-outline" size={18} iconColor="#8E9AAF" style={styles.actionIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const displayStories = searchQuery || selectedMainCategory || selectedSubCategory ? filteredStories : allStories;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      
      {/* モダンヘッダー */}
      <LinearGradient
        colors={['#1DA1F2', '#1991DB']}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.modernHeaderTitle}>FailShare</Text>
            <Text style={styles.headerSubtitle}>失敗から学ぶコミュニティ</Text>
          </View>
          {user && (
            <Avatar.Image 
              size={36} 
              source={{ uri: `https://robohash.org/${user.displayName}?set=set4` }}
              style={styles.headerAvatar}
            />
          )}
        </View>
      </LinearGradient>

      {/* 検索セクション */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="失敗談を検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.modernSearchbar}
          inputStyle={styles.searchInput}
          iconColor="#8E9AAF"
          placeholderTextColor="#8E9AAF"
        />
        
        {/* アクティブフィルター */}
        {(selectedMainCategory || selectedSubCategory || searchQuery) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilters}>
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
            </View>
          </ScrollView>
        )}
      </View>

      {/* カテゴリフィルター */}
      {!searchQuery && (
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
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
          </ScrollView>
        </View>
      )}

      {/* ストーリータイムライン */}
      <FlatList
        data={displayStories}
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
              <Text style={styles.emptyIcon}>
                {searchQuery || selectedMainCategory || selectedSubCategory ? '🔍' : '📱'}
              </Text>
              <Text style={styles.emptyTitle}>
                {searchQuery || selectedMainCategory || selectedSubCategory 
                  ? '該当する失敗談が見つかりませんでした' 
                  : '最初の失敗談を投稿してみましょう'
                }
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedMainCategory || selectedSubCategory
                  ? '検索条件を変更してお試しください'
                  : 'あなたの経験が誰かの学びになります'
                }
              </Text>
            </View>
          ) : null
        }
      />

      {/* モダンFAB */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modernHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  modernHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modernSearchbar: {
    elevation: 0,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryScrollContent: {
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

export default HomeScreen; 