import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { 
  Text, 
  Searchbar, 
  Card, 
  Chip, 
  Button, 
  ActivityIndicator, 
  Divider 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, FailureStory, StoryCategory, EmotionType } from '../types';
import { storyService } from '../services/storyService';
import { getCategoryNames, getCategoryColor } from '../utils/categories';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [stories, setStories] = useState<FailureStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = getCategoryNames();
  const emotions: EmotionType[] = ['後悔', '恥ずかしい', '悲しい', '不安', '怒り', '混乱', 'その他'];

  const performSearch = async () => {
    if (!searchText.trim() && !selectedCategory && !selectedEmotion) {
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const { stories: searchResults } = await storyService.getStories({
        searchText: searchText.trim() || undefined,
        category: selectedCategory || undefined,
        emotion: selectedEmotion || undefined,
        limit: 20,
      });
      setStories(searchResults);
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedCategory(null);
    setSelectedEmotion(null);
    setStories([]);
    setHasSearched(false);
  };

  // getCategoryColorはutilsから使用

  const getEmotionColor = (emotion: EmotionType) => {
    const colors: { [key in EmotionType]: string } = {
      '後悔': '#FF5722',
      '恥ずかしい': '#E91E63',
      '悲しい': '#3F51B5',
      '不安': '#FF9800',
      '怒り': '#F44336',
      '混乱': '#9C27B0',
      'その他': '#757575'
    };
    return colors[emotion];
  };

  const renderStoryItem = ({ item }: { item: FailureStory }) => (
    <Card 
      style={styles.storyCard} 
      onPress={() => navigation.navigate('StoryDetail', { storyId: item.id })}
    >
      <Card.Title title={item.content.title} subtitle={item.content.category} />
      <Card.Content>
        <Text variant="bodyMedium" numberOfLines={3}>
          {item.content.situation}
        </Text>
        <View style={styles.chipContainer}>
          <Chip 
            icon="tag" 
            style={[styles.chip, { backgroundColor: getCategoryColor(item.content.category) }]}
            textStyle={styles.chipText}
          >
            {item.content.category}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <Searchbar
          placeholder="失敗談を検索..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={performSearch}
          style={styles.searchbar}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterSection}>
          <View style={styles.filterRow}>
            <Text variant="bodyMedium" style={styles.filterLabel}>カテゴリー:</Text>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(
                  selectedCategory === category ? null : category
                )}
                style={[
                  styles.filterChip,
                  selectedCategory === category && { backgroundColor: getCategoryColor(category) }
                ]}
                textStyle={selectedCategory === category ? styles.chipText : {}}
              >
                {category}
              </Chip>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterSection}>
          <View style={styles.filterRow}>
            <Text variant="bodyMedium" style={styles.filterLabel}>感情:</Text>
            {emotions.map((emotion) => (
              <Chip
                key={emotion}
                selected={selectedEmotion === emotion}
                onPress={() => setSelectedEmotion(
                  selectedEmotion === emotion ? null : emotion
                )}
                style={[
                  styles.filterChip,
                  selectedEmotion === emotion && { backgroundColor: getEmotionColor(emotion) }
                ]}
                textStyle={selectedEmotion === emotion ? styles.chipText : {}}
              >
                {emotion}
              </Chip>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={performSearch}
            disabled={loading}
            style={styles.searchButton}
          >
            検索
          </Button>
          <Button
            mode="outlined"
            onPress={resetFilters}
            style={styles.resetButton}
          >
            リセット
          </Button>
        </View>
      </View>

      <Divider />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>検索中...</Text>
        </View>
      )}

      {!loading && hasSearched && (
        <View style={styles.resultsHeader}>
          <Text variant="titleMedium">
            検索結果: {stories.length}件
          </Text>
          {searchText && (
            <Text variant="bodyMedium" style={styles.searchQuery}>
              「{searchText}」で検索
            </Text>
          )}
        </View>
      )}

      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && hasSearched ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                検索結果が見つかりませんでした
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                別のキーワードで検索してみてください
              </Text>
            </View>
          ) : !hasSearched ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                検索条件を入力してください
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                テキスト検索やカテゴリー・感情フィルターを使って失敗談を探してみましょう
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchbar: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  filterLabel: {
    marginRight: 8,
    minWidth: 60,
  },
  filterChip: {
    marginRight: 8,
  },
  chip: {
    marginRight: 4,
  },
  chipText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  searchButton: {
    flex: 1,
    marginRight: 8,
  },
  resetButton: {
    flex: 1,
    marginLeft: 8,
  },
  resultsHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchQuery: {
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  storyCard: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
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
});

export default SearchScreen; 