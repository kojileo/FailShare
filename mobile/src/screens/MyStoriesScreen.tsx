import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, FAB, IconButton, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, FailureStory } from '../types';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../stores/authStore';

type MyStoriesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MyStories'
>;

type MyStoriesScreenRouteProp = RouteProp<
  RootStackParamList,
  'MyStories'
>;

interface MyStoriesScreenProps {
  navigation: MyStoriesScreenNavigationProp;
  route?: MyStoriesScreenRouteProp;
}

const MyStoriesScreen: React.FC<MyStoriesScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<FailureStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadMyStories();
  }, []);

  const loadMyStories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { stories: fetchedStories } = await storyService.getUserStories(user.id);
      setStories(fetchedStories);
    } catch (error) {
      console.error('投稿一覧の読み込みエラー:', error);
      Alert.alert('エラー', 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!user) return;

    Alert.alert(
      '投稿削除',
      'この投稿を削除してもよろしいですか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            setDeleting(storyId);
            try {
              await storyService.deleteStory(storyId, user.id);
              setStories(prev => prev.filter(story => story.id !== storyId));
              Alert.alert('完了', '投稿を削除しました');
            } catch (error) {
              console.error('投稿削除エラー:', error);
              Alert.alert('エラー', error instanceof Error ? error.message : '削除に失敗しました');
            } finally {
              setDeleting(null);
            }
          }
        }
      ]
    );
  };

  const renderStoryItem = ({ item }: { item: FailureStory }) => (
    <Card style={styles.storyCard}>
      <Card.Title 
        title={item.content.title} 
        subtitle={item.content.category}
        right={(props) => (
          <View style={styles.cardActions}>
            <IconButton
              icon="eye"
              size={20}
              onPress={() => navigation.navigate('StoryDetail', { storyId: item.id })}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor="#e53e3e"
              disabled={deleting === item.id}
              onPress={() => handleDeleteStory(item.id)}
            />
          </View>
        )}
      />
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
          <Text variant="bodySmall" style={styles.dateText}>
            {item.metadata.createdAt.toLocaleDateString('ja-JP')}
          </Text>
        </View>
      </Card.Content>
      {deleting === item.id && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator size="small" />
          <Text variant="bodySmall" style={styles.deletingText}>
            削除中...
          </Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          マイ投稿
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {stories.length}件の投稿
        </Text>
      </View>

      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              まだ投稿がありません
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              最初の失敗談を投稿してみましょう
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CreateStory')}
              style={styles.createButton}
            >
              投稿する
            </Button>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateStory')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  storyCard: {
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadata: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    color: '#999',
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  deletingText: {
    marginLeft: 8,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
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
    marginBottom: 24,
  },
  createButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default MyStoriesScreen; 