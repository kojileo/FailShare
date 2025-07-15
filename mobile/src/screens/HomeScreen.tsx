import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB, Searchbar, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStoryStore } from '../stores/storyStore';
import { useAuthStore } from '../stores/authStore';
import { FailureStory, RootStackParamList } from '../types';
import { storyService } from '../services/storyService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  navigation?: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { stories, setStories } = useStoryStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // 実際のデータをロード
  const loadStories = React.useCallback(async (filters?: { searchText?: string }) => {
    try {
      setLoading(true);
      const { stories: fetchedStories } = await storyService.getStories(filters);
      setStories(fetchedStories);
    } catch (error) {
      console.error('失敗談の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  }, [setStories]);

  // 検索実行
  const performSearch = React.useCallback(() => {
    if (searchQuery.trim()) {
      loadStories({ searchText: searchQuery.trim() });
    } else {
      loadStories();
    }
  }, [searchQuery, loadStories]);

  useFocusEffect(
    React.useCallback(() => {
      loadStories();
    }, [loadStories])
  );

  const renderStoryItem = ({ item }: { item: FailureStory }) => (
    <Card style={styles.storyCard} onPress={() => navigation?.navigate('StoryDetail', { storyId: item.id })}>
      <Card.Title title={item.content.title} subtitle={item.content.category} />
      <Card.Content>
        <Text variant="bodyMedium" numberOfLines={3}>
          {item.content.situation}
        </Text>
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

      <Searchbar
        placeholder="失敗談を検索..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={performSearch}
        style={styles.searchbar}
      />
      
      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                失敗談を探索してみましょう
              </Text>
              <Text variant="bodyLarge" style={styles.emptyText}>
                まだ投稿がないようですが、
              </Text>
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
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  storyCard: {
    marginBottom: 16,
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