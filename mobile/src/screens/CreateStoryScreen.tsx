import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Divider, 
  SegmentedButtons,
  HelperText,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StoryCategory, EmotionType, FailureStory, MainCategory, SubCategory, CategoryHierarchy } from '../types';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';
import { getMainCategories, getSubCategories, getCategoryHierarchyInfo } from '../utils/categories';

interface CreateStoryScreenProps {
  navigation: any;
}

const CreateStoryScreen: React.FC<CreateStoryScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { addStory } = useStoryStore();
  const [formData, setFormData] = useState({
    title: '',
    category: { main: '' as MainCategory, sub: '' as SubCategory } as CategoryHierarchy,
    situation: '',
    action: '',
    result: '',
    learning: '',
    emotion: '' as EmotionType
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const mainCategories = getMainCategories();
  const subCategories = formData.category.main ? getSubCategories(formData.category.main) : [];
  const emotions: EmotionType[] = ['後悔', '恥ずかしい', '悲しい', '不安', '怒り', '混乱', 'その他'];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) newErrors.title = 'タイトルは必須です';
    if (!formData.category.main) newErrors.mainCategory = 'メインカテゴリーを選択してください';
    if (!formData.category.sub) newErrors.subCategory = 'サブカテゴリーを選択してください';
    if (!formData.situation.trim()) newErrors.situation = '状況の説明は必須です';
    if (!formData.action.trim()) newErrors.action = '行動の説明は必須です';
    if (!formData.result.trim()) newErrors.result = '結果の説明は必須です';
    if (!formData.learning.trim()) newErrors.learning = '学びの内容は必須です';
    if (!formData.emotion) newErrors.emotion = '感情を選択してください';

    // 文字数チェック
    if (formData.title.length > 50) newErrors.title = 'タイトルは50文字以内で入力してください';
    if (formData.situation.length > 500) newErrors.situation = '状況は500文字以内で入力してください';
    if (formData.action.length > 500) newErrors.action = '行動は500文字以内で入力してください';
    if (formData.result.length > 500) newErrors.result = '結果は500文字以内で入力してください';
    if (formData.learning.length > 500) newErrors.learning = '学びは500文字以内で入力してください';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      Alert.alert('エラー', 'ログインが必要です');
      return;
    }

    setLoading(true);
    try {
      const storyData = {
        title: formData.title,
        category: formData.category,
        situation: formData.situation,
        action: formData.action,
        result: formData.result,
        learning: formData.learning,
        emotion: formData.emotion
      };

      const storyId = await storyService.createStory(user.id, storyData);
      
      // 投稿成功時にストーリーリストに追加用のデータを作成
      const newStory: FailureStory = {
        id: storyId,
        authorId: user.id,
        content: {
          title: formData.title,
          category: formData.category,
          situation: formData.situation,
          action: formData.action,
          result: formData.result,
          learning: formData.learning,
          emotion: formData.emotion
        },
        metadata: {
          createdAt: new Date(),
          viewCount: 0,
          helpfulCount: 0,
          commentCount: 0,
          tags: [formData.category.main, formData.category.sub, formData.emotion]
        }
      };
      
      addStory(newStory);
      Alert.alert('成功', '失敗談を投稿しました', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('エラー', '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // メインカテゴリ変更時の処理
  const handleMainCategoryChange = (mainCategory: MainCategory) => {
    setFormData({
      ...formData,
      category: {
        main: mainCategory,
        sub: '' as SubCategory // サブカテゴリをリセット
      }
    });
    // エラーをクリア
    if (errors.mainCategory) {
      setErrors({ ...errors, mainCategory: '', subCategory: '' });
    }
  };

  // サブカテゴリ変更時の処理
  const handleSubCategoryChange = (subCategory: SubCategory) => {
    setFormData({
      ...formData,
      category: {
        ...formData.category,
        sub: subCategory
      }
    });
    // エラーをクリア
    if (errors.subCategory) {
      setErrors({ ...errors, subCategory: '' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            失敗談を投稿する
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            あなたの体験を共有し、他の人の学びに貢献しましょう
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                📝 基本情報
              </Text>
              
              <TextInput
                label="タイトル"
                value={formData.title}
                onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
                style={styles.input}
                error={!!errors.title}
                placeholder="例: 転職活動での大きな失敗"
                maxLength={50}
              />
              <HelperText type="error" visible={!!errors.title}>
                {errors.title}
              </HelperText>

              <Text variant="bodyMedium" style={styles.label}>
                メインカテゴリー
              </Text>
              <SegmentedButtons
                value={formData.category.main}
                onValueChange={handleMainCategoryChange}
                buttons={mainCategories.map(cat => ({
                  value: cat,
                  label: cat
                }))}
                style={styles.segmentedButtons}
              />
              <HelperText type="error" visible={!!errors.mainCategory}>
                {errors.mainCategory}
              </HelperText>

              <Text variant="bodyMedium" style={styles.label}>
                サブカテゴリー
              </Text>
              <SegmentedButtons
                value={formData.category.sub}
                onValueChange={handleSubCategoryChange}
                buttons={subCategories.map(cat => ({
                  value: cat,
                  label: cat
                }))}
                style={styles.segmentedButtons}
              />
              <HelperText type="error" visible={!!errors.subCategory}>
                {errors.subCategory}
              </HelperText>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                🎭 体験の詳細
              </Text>
              
              <TextInput
                label="状況（どんな状況だったか）"
                value={formData.situation}
                onChangeText={(value) => setFormData(prev => ({ ...prev, situation: value }))}
                style={styles.input}
                error={!!errors.situation}
                multiline
                numberOfLines={4}
                placeholder="どのような状況・環境で起こったことか詳しく説明してください"
                maxLength={500}
              />
              <HelperText type="error" visible={!!errors.situation}>
                {errors.situation}
              </HelperText>

              <TextInput
                label="行動（何をしたか）"
                value={formData.action}
                onChangeText={(value) => setFormData(prev => ({ ...prev, action: value }))}
                style={styles.input}
                error={!!errors.action}
                multiline
                numberOfLines={4}
                placeholder="具体的にどのような行動を取ったか説明してください"
                maxLength={500}
              />
              <HelperText type="error" visible={!!errors.action}>
                {errors.action}
              </HelperText>

              <TextInput
                label="結果（何が起こったか）"
                value={formData.result}
                onChangeText={(value) => setFormData(prev => ({ ...prev, result: value }))}
                style={styles.input}
                error={!!errors.result}
                multiline
                numberOfLines={4}
                placeholder="その行動の結果、どんなことが起こったか説明してください"
                maxLength={500}
              />
              <HelperText type="error" visible={!!errors.result}>
                {errors.result}
              </HelperText>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                💡 学びと感情
              </Text>
              
              <TextInput
                label="学び（何を学んだか）"
                value={formData.learning}
                onChangeText={(value) => setFormData(prev => ({ ...prev, learning: value }))}
                style={styles.input}
                error={!!errors.learning}
                multiline
                numberOfLines={4}
                placeholder="この体験から得た学びや気づきを教えてください"
                maxLength={500}
              />
              <HelperText type="error" visible={!!errors.learning}>
                {errors.learning}
              </HelperText>

              <Text variant="bodyMedium" style={styles.label}>
                そのときの感情
              </Text>
              <SegmentedButtons
                value={formData.emotion}
                onValueChange={(value) => setFormData(prev => ({ ...prev, emotion: value }))}
                buttons={emotions.map(emotion => ({
                  value: emotion,
                  label: emotion
                }))}
                style={styles.segmentedButtons}
              />
              <HelperText type="error" visible={!!errors.emotion}>
                {errors.emotion}
              </HelperText>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? <ActivityIndicator size="small" /> : '投稿する'}
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.cancelButton}
            >
              キャンセル
            </Button>
          </View>
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
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 8,
    marginTop: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 12,
  },
});

export default CreateStoryScreen; 