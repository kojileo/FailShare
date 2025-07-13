import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB, Searchbar, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useStoryStore } from '../stores/storyStore';
import { useAuthStore } from '../stores/authStore';
import { FailureStory } from '../types';
import { storyService } from '../services/storyService';

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { stories, setStories } = useStoryStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // 実際のデータをロード
  const loadStories = React.useCallback(async () => {
    try {
      setLoading(true);
      const { stories: fetchedStories } = await storyService.getStories();
      setStories(fetchedStories);
    } catch (error) {
      console.error('失敗談の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  }, [setStories]);

  useFocusEffect(
    React.useCallback(() => {
      loadStories();
    }, [loadStories])
  );

  const renderStoryItem = ({ item }: { item: FailureStory }) => (
    <Card style={styles.storyCard}>
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
        style={styles.searchbar}
      />
      
      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              まだ失敗談がありません
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              最初の失敗談を投稿してみましょう
            </Text>
          </View>
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
    paddingTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 