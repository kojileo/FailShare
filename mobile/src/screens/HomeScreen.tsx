import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  FAB, 
  Searchbar,
  Chip
} from 'react-native-paper';
import { FailureStory, MainCategory, SubCategory } from '../types';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';
import { 
  getCategoryDisplayString, 
  getCategoryHierarchyColor,
  getMainCategories,
  getSubCategories
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
    setSelectedSubCategory(null); // サブカテゴリをリセット
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
    <Card style={styles.storyCard} onPress={() => navigation?.navigate('StoryDetail', { storyId: item.id })}>
      <Card.Title 
        title={item.content.title} 
        subtitle={getCategoryDisplayString(item.content.category)} 
      />
      <Card.Content>
        <Text variant="bodyMedium" numberOfLines={3}>
          {item.content.situation}
        </Text>
        <View style={styles.chipContainer}>
          <Chip 
            icon="tag" 
            style={[styles.chip, { backgroundColor: getCategoryHierarchyColor(item.content.category) }]}
            textStyle={styles.chipText}
          >
            {item.content.category.sub}
          </Chip>
          <Chip 
            icon="emoticon" 
            style={[styles.chip, { backgroundColor: getEmotionColor(item.content.emotion) }]}
            textStyle={styles.chipText}
          >
            {item.content.emotion}
          </Chip>
        </View>
        <View style={styles.metadata}>
          <Text variant="bodySmall">
            👀 {item.metadata.viewCount} • 
            👍 {item.metadata.helpfulCount} • 
            💬 {item.metadata.commentCount}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  // 表示するデータを決定
  const displayStories = searchQuery || selectedMainCategory || selectedSubCategory ? filteredStories : allStories;

  return (
    <View style={styles.container}>
      {/* ユーザー情報ヘッダー */}
      {user && (
        <View style={styles.userHeader}>
          <Avatar.Image 
            size={40} 
            source={{ uri: `https://robohash.org/${user.displayName}?set=set4` }}
          />
          <View style={styles.userInfo}>
            <Text variant="titleMedium">{user.displayName}</Text>
            <Text variant="bodySmall" style={styles.userStats}>
              投稿: {user.stats.totalPosts} • コメント: {user.stats.totalComments}
            </Text>
          </View>
        </View>
      )}

      {/* 検索バー */}
      <Searchbar
        placeholder="失敗談を検索..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />

      {/* メインカテゴリフィルター */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterSection}>
        <View style={styles.filterRow}>
          <Text variant="bodyMedium" style={styles.filterLabel}>カテゴリ:</Text>
          <Chip
            selected={selectedMainCategory === null}
            onPress={() => handleMainCategorySelect(null)}
            style={[styles.filterChip, selectedMainCategory === null && styles.selectedChip]}
          >
            すべて
          </Chip>
          {mainCategories.map((category) => (
            <Chip
              key={category}
              selected={selectedMainCategory === category}
              onPress={() => handleMainCategorySelect(category)}
              style={[
                styles.filterChip,
                selectedMainCategory === category && styles.selectedChip
              ]}
            >
              {category}
            </Chip>
          ))}
        </View>
      </ScrollView>

      {/* サブカテゴリフィルター */}
      {selectedMainCategory && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterSection}>
          <View style={styles.filterRow}>
            <Text variant="bodyMedium" style={styles.filterLabel}>詳細:</Text>
            <Chip
              selected={selectedSubCategory === null}
              onPress={() => setSelectedSubCategory(null)}
              style={[styles.filterChip, selectedSubCategory === null && styles.selectedChip]}
            >
              すべて
            </Chip>
            {getSubCategories(selectedMainCategory).map((category) => (
              <Chip
                key={category}
                selected={selectedSubCategory === category}
                onPress={() => setSelectedSubCategory(category)}
                style={[
                  styles.filterChip,
                  selectedSubCategory === category && styles.selectedChip
                ]}
              >
                {category}
              </Chip>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ストーリー一覧 */}
      <FlatList
        data={displayStories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>
                {searchQuery || selectedMainCategory || selectedSubCategory ? '🔍' : '📖'}
              </Text>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                {searchQuery || selectedMainCategory || selectedSubCategory 
                  ? '該当する失敗談が見つかりませんでした' 
                  : '失敗談を探索してみましょう'
                }
              </Text>
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchQuery || selectedMainCategory || selectedSubCategory
                  ? '検索条件を変更して再度お試しください'
                  : 'まだ投稿がないようですが、'
                }
              </Text>
              {!(searchQuery || selectedMainCategory || selectedSubCategory) && (
                <>
                  <Text variant="bodyMedium" style={styles.emptySubtext}>
                    あなたの最初の失敗談を投稿して、{'\n'}
                    他の人の学びに貢献してみませんか？
                  </Text>
                  <View style={styles.emptyHints}>
                    <Text variant="bodyMedium" style={styles.hintTitle}>
                      💡 ヒント
                    </Text>
                    <Text variant="bodySmall" style={styles.hintText}>
                      • 小さな失敗でも大丈夫です{'\n'}
                      • 構造化されたテンプレートで簡単投稿{'\n'}
                      • 完全匿名なので安心して共有できます
                    </Text>
                  </View>
                </>
              )}
            </View>
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          navigation?.navigate('CreateStory');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userStats: {
    color: '#666',
    marginTop: 2,
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  filterLabel: {
    marginRight: 8,
    color: '#666',
    minWidth: 60,
  },
  filterChip: {
    marginRight: 8,
    height: 32,
  },
  selectedChip: {
    backgroundColor: '#e3f2fd',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  storyCard: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    height: 28,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  metadata: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    lineHeight: 20,
  },
  emptyHints: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  hintTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  hintText: {
    color: '#666',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 