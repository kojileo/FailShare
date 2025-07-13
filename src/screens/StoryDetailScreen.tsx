import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Avatar, 
  ActivityIndicator,
  IconButton,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, FailureStory } from '../types';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../stores/authStore';

type StoryDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'StoryDetail'
>;

type StoryDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'StoryDetail'
>;

interface StoryDetailScreenProps {
  navigation: StoryDetailScreenNavigationProp;
  route: StoryDetailScreenRouteProp;
}

const StoryDetailScreen: React.FC<StoryDetailScreenProps> = ({ navigation, route }) => {
  const { storyId } = route.params;
  const { user } = useAuthStore();
  const [story, setStory] = useState<FailureStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  const loadStory = async () => {
    try {
      setLoading(true);
      const fetchedStory = await storyService.getStoryById(storyId);
      setStory(fetchedStory);
    } catch (error) {
      console.error('失敗談詳細取得エラー:', error);
      Alert.alert('エラー', 'データの取得に失敗しました', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsHelpful = async () => {
    if (!story) return;

    setActionLoading(true);
    try {
      await storyService.markStoryAsHelpful(story.id);
      // 統計を更新
      setStory(prev => prev ? {
        ...prev,
        metadata: {
          ...prev.metadata,
          helpfulCount: prev.metadata.helpfulCount + 1
        }
      } : null);
      Alert.alert('完了', 'この失敗談を「役に立った」にマークしました');
    } catch (error) {
      console.error('役に立ったマークエラー:', error);
      Alert.alert('エラー', '操作に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '仕事': '#1976D2',
      '恋愛': '#E91E63',
      'お金': '#4CAF50',
      '健康': '#FF9800',
      '人間関係': '#9C27B0',
      '学習': '#00BCD4',
      'その他': '#757575'
    };
    return colors[category] || '#757575';
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: { [key: string]: string } = {
      '後悔': '😔',
      '恥ずかしい': '😳',
      '悲しい': '😢',
      '不安': '😰',
      '怒り': '😠',
      '混乱': '😵',
      'その他': '🤔'
    };
    return emojis[emotion] || '🤔';
  };

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

  if (!story) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>
            失敗談が見つかりません
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            戻る
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* ヘッダー情報 */}
          <Card style={styles.headerCard}>
            <Card.Content>
              <View style={styles.headerRow}>
                <Avatar.Image 
                  size={50} 
                  source={{ uri: `https://robohash.org/anonymous_${story.authorId}?set=set4` }}
                />
                <View style={styles.headerInfo}>
                  <Text variant="bodyLarge" style={styles.authorName}>
                    匿名ユーザー
                  </Text>
                  <Text variant="bodySmall" style={styles.postDate}>
                    {story.metadata.createdAt.toLocaleDateString('ja-JP')}
                  </Text>
                </View>
              </View>
              
              <Text variant="headlineSmall" style={styles.title}>
                {story.content.title}
              </Text>
              
              <View style={styles.tagsRow}>
                <Chip 
                  style={[styles.categoryChip, { backgroundColor: getCategoryColor(story.content.category) }]}
                  textStyle={styles.chipText}
                >
                  {story.content.category}
                </Chip>
                <Chip 
                  style={styles.emotionChip}
                  textStyle={styles.chipText}
                >
                  {getEmotionEmoji(story.content.emotion)} {story.content.emotion}
                </Chip>
              </View>
            </Card.Content>
          </Card>

          {/* 統計情報 */}
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={styles.statNumber}>
                    {story.metadata.viewCount}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    閲覧数
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={styles.statNumber}>
                    {story.metadata.helpfulCount}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    役に立った
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={styles.statNumber}>
                    {story.metadata.commentCount}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    コメント
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* 失敗談の詳細 */}
          <Card style={styles.contentCard}>
            <Card.Content>
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  🎯 状況
                </Text>
                <Text variant="bodyLarge" style={styles.sectionContent}>
                  {story.content.situation}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  🚀 行動
                </Text>
                <Text variant="bodyLarge" style={styles.sectionContent}>
                  {story.content.action}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  💥 結果
                </Text>
                <Text variant="bodyLarge" style={styles.sectionContent}>
                  {story.content.result}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  💡 学び
                </Text>
                <Text variant="bodyLarge" style={styles.sectionContent}>
                  {story.content.learning}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* アクションボタン */}
          <Card style={styles.actionCard}>
            <Card.Content>
              <Button
                mode="contained"
                onPress={handleMarkAsHelpful}
                loading={actionLoading}
                disabled={actionLoading}
                style={styles.helpfulButton}
                icon="thumb-up"
              >
                役に立った
              </Button>
              <Text variant="bodySmall" style={styles.actionDescription}>
                この失敗談があなたの学びになった場合、「役に立った」をタップしてください
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  headerCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontWeight: 'bold',
  },
  postDate: {
    color: '#666',
    marginTop: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  emotionChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#E8F5E8',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#6200EE',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  contentCard: {
    marginBottom: 16,
  },
  sectionContainer: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#333',
  },
  sectionContent: {
    lineHeight: 24,
    color: '#555',
  },
  divider: {
    marginVertical: 16,
  },
  actionCard: {
    marginBottom: 32,
  },
  helpfulButton: {
    marginBottom: 12,
  },
  actionDescription: {
    textAlign: 'center',
    color: '#666',
  },
});

export default StoryDetailScreen; 