import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert, StatusBar } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  HelperText,
  Chip,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmotionType, FailureStory, MainCategory, SubCategory, CategoryHierarchy, PostType } from '../types';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';
import { getMainCategories, getSubCategories } from '../utils/categories';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import Header from '../components/Header';

interface CreateStoryScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateStory'>;
  route?: {
    params?: {
      editMode?: boolean;
      storyData?: FailureStory;
    };
  };
}

const CreateStoryScreen: React.FC<CreateStoryScreenProps> = ({ navigation, route }) => {
  const { user } = useAuthStore();
  const { addStory, updateStory } = useStoryStore();
  
  // 編集モードの判定
  const isEditMode = route?.params?.editMode || false;
  const storyToEdit = route?.params?.storyData;
  
  const [formData, setFormData] = useState({
    title: storyToEdit?.content.title || '',
    category: storyToEdit?.content.category || { main: '' as MainCategory, sub: '' as SubCategory } as CategoryHierarchy,
    situation: storyToEdit?.content.situation || '',
    action: storyToEdit?.content.action || '',
    result: storyToEdit?.content.result || '',
    learning: storyToEdit?.content.learning || '',
    emotion: storyToEdit?.content.emotion || '' as EmotionType,
    postType: storyToEdit?.content.postType || 'failure' as PostType
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState(1);

  const mainCategories = getMainCategories();
  const subCategories = formData.category.main ? getSubCategories(formData.category.main) : [];
  const emotions: EmotionType[] = ['後悔', '恥ずかしい', '悲しい', '不安', '怒り', '混乱', 'その他'];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) newErrors.title = 'タイトルは必須です';
    if (!formData.category.main) newErrors.mainCategory = 'カテゴリーを選択してください';
    if (!formData.category.sub) newErrors.subCategory = 'サブカテゴリーを選択してください';
    if (!formData.situation.trim()) newErrors.situation = '状況の説明は必須です';
    if (!formData.action.trim()) newErrors.action = '行動の説明は必須です';
    if (!formData.result.trim()) newErrors.result = '結果の説明は必須です';
    if (!formData.learning.trim()) newErrors.learning = '学びの内容は必須です';
    if (!formData.emotion) newErrors.emotion = '感情を選択してください';

    // 文字数チェック
    if (formData.title.length > 100) newErrors.title = 'タイトルは100文字以内で入力してください';
    if (formData.situation.length > 280) newErrors.situation = '状況は280文字以内で入力してください';
    if (formData.action.length > 280) newErrors.action = '行動は280文字以内で入力してください';
    if (formData.result.length > 280) newErrors.result = '結果は280文字以内で入力してください';
    if (formData.learning.length > 280) newErrors.learning = '学びは280文字以内で入力してください';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log(`🚀 ${isEditMode ? '編集' : '投稿'}処理開始`);
    
    if (!validateForm()) {
      console.log('❌ バリデーション失敗');
      return;
    }
    
    if (!user) {
      console.log('❌ ユーザーログインなし');
      Alert.alert('エラー', 'ログインが必要です');
      return;
    }

    console.log('✅ バリデーション成功、処理中...');
    setLoading(true);
    
    try {
      const storyData = {
        title: formData.title,
        category: formData.category,
        situation: formData.situation,
        action: formData.action,
        result: formData.result,
        learning: formData.learning,
        emotion: formData.emotion,
        postType: formData.postType
      };

      if (isEditMode && storyToEdit) {
        // 編集モード
        console.log('📝 編集データ:', storyData);
        await storyService.updateStory(storyToEdit.id, user.id, storyData);
        console.log('✅ Firestore編集成功');
        
        // グローバルstateを更新
        console.log('📊 グローバルstate更新中...');
        updateStory(storyToEdit.id, {
          ...storyToEdit,
          content: storyData
        });
        console.log('✅ グローバルstate更新完了');
        
        // マイストーリー画面に遷移
        console.log('📱 マイストーリー画面への遷移実行中...');
        navigation.navigate('MyStories');
        console.log('✅ マイストーリー画面への遷移実行完了');
        
        // 成功フィードバック
        setTimeout(() => {
          Alert.alert(
            '✅ 編集完了！', 
            '失敗談を更新しました。'
          );
        }, 500);
      } else {
        // 新規投稿モード
        console.log('📝 投稿データ:', storyData);
        const storyId = await storyService.createStory(user.id, storyData);
        console.log('✅ Firestore投稿成功 ID:', storyId);
        
        const newStory: FailureStory = {
          id: storyId,
          authorId: user.id,
          content: storyData,
          metadata: {
            createdAt: new Date(),
            viewCount: 0,
            helpfulCount: 0,
            commentCount: 0,
            tags: [formData.category.main, formData.category.sub, formData.emotion]
          }
        };
        
        // グローバルstateに追加
        console.log('📊 グローバルstateに追加中...');
        addStory(newStory);
        console.log('✅ グローバルstate追加完了');
        
        // フォームをリセット
        setFormData({
          title: '',
          category: { main: '' as MainCategory, sub: '' as SubCategory } as CategoryHierarchy,
          situation: '',
          action: '',
          result: '',
          learning: '',
          emotion: '' as EmotionType,
          postType: 'failure' as PostType
        });
        setCurrentStep(1);
        console.log('🔄 フォームリセット完了');
        
        // ホーム画面に遷移
        console.log('📱 ホーム画面への遷移実行中...');
        navigation.navigate('Home');
        console.log('✅ ホーム画面への遷移実行完了');
        
        // 成功フィードバック
        setTimeout(() => {
          Alert.alert(
            '🎉 投稿完了！', 
            'あなたの失敗談を投稿しました。\nホーム画面で確認できます。'
          );
        }, 500);
      }
    } catch (error) {
      console.error('❌ 投稿エラー:', error);
      Alert.alert('❌ 投稿失敗', '投稿に失敗しました。\nもう一度お試しください。');
    } finally {
      console.log('🔄 ローディング終了');
      setLoading(false);
    }
  };

  const handleMainCategoryChange = (mainCategory: MainCategory) => {
    setFormData({
      ...formData,
      category: {
        main: mainCategory,
        sub: '' as SubCategory
      }
    });
    if (errors.mainCategory) {
      setErrors({ ...errors, mainCategory: '', subCategory: '' });
    }
  };

  const handleSubCategoryChange = (subCategory: SubCategory) => {
    setFormData({
      ...formData,
      category: {
        ...formData.category,
        sub: subCategory
      }
    });
    if (errors.subCategory) {
      setErrors({ ...errors, subCategory: '' });
    }
  };

  const getCharacterCount = (text: string, limit: number) => {
    const percentage = (text.length / limit) * 100;
    let color = '#8E9AAF';
    if (percentage > 90) color = '#EF4444';
    else if (percentage > 75) color = '#F59E0B';
    return { count: text.length, limit, color };
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.title.trim() && formData.category.main && formData.category.sub && formData.postType;
      case 2: return formData.situation.trim() && formData.action.trim();
      case 3: {
        const baseValid = formData.result.trim() && formData.emotion;
        // 愚痴投稿では学びは任意
        if (formData.postType === 'complaint') {
          return baseValid;
        }
        return baseValid && formData.learning.trim();
      }
      default: return false;
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle, 
            currentStep >= step ? styles.stepCircleActive : styles.stepCircleInactive
          ]}>
            <Text style={[
              styles.stepText,
              currentStep >= step ? styles.stepTextActive : styles.stepTextInactive
            ]}>
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View style={[
              styles.stepLine,
              currentStep > step ? styles.stepLineActive : styles.stepLineInactive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      {/* 投稿タイプ選択 */}
      <Surface style={styles.inputSection} elevation={1}>
        <Text style={styles.sectionTitle}>📝 投稿タイプ</Text>
        <Text style={styles.sectionDesc}>どのような投稿をしますか？</Text>
        
        <View style={styles.chipGrid}>
          <Chip
            selected={formData.postType === 'failure'}
            onPress={() => {
              setFormData(prev => ({ ...prev, postType: 'failure' }));
              if (errors.postType) setErrors(prev => ({ ...prev, postType: '' }));
            }}
            style={[
              styles.chip,
              formData.postType === 'failure' && styles.chipSelected
            ]}
            textStyle={[
              styles.chipText,
              formData.postType === 'failure' && styles.chipTextSelected
            ]}
          >
            💔 失敗談
          </Chip>
          <Chip
            selected={formData.postType === 'complaint'}
            onPress={() => {
              setFormData(prev => ({ ...prev, postType: 'complaint' }));
              if (errors.postType) setErrors(prev => ({ ...prev, postType: '' }));
            }}
            style={[
              styles.chip,
              formData.postType === 'complaint' && styles.chipSelected
            ]}
            textStyle={[
              styles.chipText,
              formData.postType === 'complaint' && styles.chipTextSelected
            ]}
          >
            😤 愚痴
          </Chip>
        </View>
        <HelperText type="error" visible={!!errors.postType}>
          {errors.postType}
        </HelperText>
      </Surface>

      {/* タイトル */}
      <Surface style={styles.inputSection} elevation={1}>
        <Text style={styles.sectionTitle}>
          {formData.postType === 'failure' ? '📝 失敗談のタイトル' : '📝 愚痴のタイトル'}
        </Text>
        <Text style={styles.sectionDesc}>
          {formData.postType === 'failure' ? '何についての失敗でしたか？' : '何についての愚痴ですか？'}
        </Text>
        <TextInput
          mode="outlined"
          placeholder="例: 初デートで大失敗..."
          value={formData.title}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, title: value }));
            if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
          }}
          style={styles.textInput}
          multiline
          error={!!errors.title}
          outlineColor="transparent"
          activeOutlineColor="#1DA1F2"
          theme={{ colors: { background: '#F8FAFC' } }}
        />
        <View style={styles.charCountContainer}>
          <Text style={[styles.charCount, { color: getCharacterCount(formData.title, 100).color }]}>
            {getCharacterCount(formData.title, 100).count}/100
          </Text>
        </View>
        <HelperText type="error" visible={!!errors.title}>
          {errors.title}
        </HelperText>
      </Surface>

      {/* カテゴリ選択 */}
      <Surface style={styles.inputSection} elevation={1}>
        <Text style={styles.sectionTitle}>🏷️ カテゴリー選択</Text>
        <Text style={styles.sectionDesc}>どの分野の失敗ですか？</Text>
        
        <View style={styles.chipGrid}>
          {mainCategories.map((category) => (
            <Chip
              key={category}
              selected={formData.category.main === category}
              onPress={() => handleMainCategoryChange(category)}
              style={[
                styles.categoryChip,
                formData.category.main === category && styles.selectedChip
              ]}
              textStyle={[
                styles.chipText,
                formData.category.main === category && styles.selectedChipText
              ]}
            >
              {category}
            </Chip>
          ))}
        </View>
        <HelperText type="error" visible={!!errors.mainCategory}>
          {errors.mainCategory}
        </HelperText>

        {formData.category.main && (
          <>
            <Text style={styles.subSectionTitle}>詳細カテゴリー</Text>
            <View style={styles.chipGrid}>
              {subCategories.map((category) => (
                <Chip
                  key={category}
                  selected={formData.category.sub === category}
                  onPress={() => handleSubCategoryChange(category)}
                  style={[
                    styles.subCategoryChip,
                    formData.category.sub === category && styles.selectedSubChip
                  ]}
                  textStyle={[
                    styles.chipText,
                    formData.category.sub === category && styles.selectedChipText
                  ]}
                >
                  {category}
                </Chip>
              ))}
            </View>
            <HelperText type="error" visible={!!errors.subCategory}>
              {errors.subCategory}
            </HelperText>
          </>
        )}
      </Surface>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      {/* 状況 */}
      <Surface style={styles.inputSection} elevation={1}>
        <Text style={styles.sectionTitle}>📍 状況</Text>
        <Text style={styles.sectionDesc}>どんな状況でしたか？</Text>
        <TextInput
          mode="outlined"
          placeholder="その時の状況を詳しく教えてください..."
          value={formData.situation}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, situation: value }));
            if (errors.situation) setErrors(prev => ({ ...prev, situation: '' }));
          }}
          style={styles.textAreaInput}
          multiline
          numberOfLines={4}
          error={!!errors.situation}
          outlineColor="transparent"
          activeOutlineColor="#1DA1F2"
          theme={{ colors: { background: '#F8FAFC' } }}
        />
        <View style={styles.charCountContainer}>
          <Text style={[styles.charCount, { color: getCharacterCount(formData.situation, 280).color }]}>
            {getCharacterCount(formData.situation, 280).count}/280
          </Text>
        </View>
        <HelperText type="error" visible={!!errors.situation}>
          {errors.situation}
        </HelperText>
      </Surface>

      {/* 行動 */}
      <Surface style={styles.inputSection} elevation={1}>
        <Text style={styles.sectionTitle}>⚡ 行動</Text>
        <Text style={styles.sectionDesc}>何をしましたか？</Text>
        <TextInput
          mode="outlined"
          placeholder="どのような行動を取りましたか？"
          value={formData.action}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, action: value }));
            if (errors.action) setErrors(prev => ({ ...prev, action: '' }));
          }}
          style={styles.textAreaInput}
          multiline
          numberOfLines={4}
          error={!!errors.action}
          outlineColor="transparent"
          activeOutlineColor="#1DA1F2"
          theme={{ colors: { background: '#F8FAFC' } }}
        />
        <View style={styles.charCountContainer}>
          <Text style={[styles.charCount, { color: getCharacterCount(formData.action, 280).color }]}>
            {getCharacterCount(formData.action, 280).count}/280
          </Text>
        </View>
        <HelperText type="error" visible={!!errors.action}>
          {errors.action}
        </HelperText>
      </Surface>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      {/* 結果 */}
      <Surface style={styles.inputSection} elevation={1}>
        <Text style={styles.sectionTitle}>💥 結果</Text>
        <Text style={styles.sectionDesc}>何が起こりましたか？</Text>
        <TextInput
          mode="outlined"
          placeholder="その結果、何が起こりましたか？"
          value={formData.result}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, result: value }));
            if (errors.result) setErrors(prev => ({ ...prev, result: '' }));
          }}
          style={styles.textAreaInput}
          multiline
          numberOfLines={4}
          error={!!errors.result}
          outlineColor="transparent"
          activeOutlineColor="#1DA1F2"
          theme={{ colors: { background: '#F8FAFC' } }}
        />
        <View style={styles.charCountContainer}>
          <Text style={[styles.charCount, { color: getCharacterCount(formData.result, 280).color }]}>
            {getCharacterCount(formData.result, 280).count}/280
          </Text>
        </View>
        <HelperText type="error" visible={!!errors.result}>
          {errors.result}
        </HelperText>
      </Surface>

      {/* 学び */}
      <Surface style={styles.inputSection} elevation={1}>
        <Text style={styles.sectionTitle}>
          {formData.postType === 'failure' ? '💡 学び' : '💡 学び（任意）'}
        </Text>
        <Text style={styles.sectionDesc}>
          {formData.postType === 'failure' 
            ? '何を学びましたか？' 
            : '何か学びがあれば教えてください（任意）'}
        </Text>
        <TextInput
          mode="outlined"
          placeholder="この経験から何を学びましたか？"
          value={formData.learning}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, learning: value }));
            if (errors.learning) setErrors(prev => ({ ...prev, learning: '' }));
          }}
          style={styles.textAreaInput}
          multiline
          numberOfLines={4}
          error={!!errors.learning}
          outlineColor="transparent"
          activeOutlineColor="#1DA1F2"
          theme={{ colors: { background: '#F8FAFC' } }}
        />
        <View style={styles.charCountContainer}>
          <Text style={[styles.charCount, { color: getCharacterCount(formData.learning, 280).color }]}>
            {getCharacterCount(formData.learning, 280).count}/280
          </Text>
        </View>
        <HelperText type="error" visible={!!errors.learning}>
          {errors.learning}
        </HelperText>
      </Surface>

      {/* 感情 */}
      <Surface style={styles.inputSection} elevation={1}>
        <Text style={styles.sectionTitle}>😔 その時の気持ち</Text>
        <Text style={styles.sectionDesc}>どんな気持ちでしたか？</Text>
        <View style={styles.chipGrid}>
          {emotions.map((emotion) => (
            <Chip
              key={emotion}
              selected={formData.emotion === emotion}
              onPress={() => {
                setFormData(prev => ({ ...prev, emotion }));
                if (errors.emotion) setErrors(prev => ({ ...prev, emotion: '' }));
              }}
              style={[
                styles.emotionChip,
                formData.emotion === emotion && styles.selectedEmotionChip
              ]}
              textStyle={[
                styles.chipText,
                formData.emotion === emotion && styles.selectedChipText
              ]}
            >
              {emotion}
            </Chip>
          ))}
        </View>
        <HelperText type="error" visible={!!errors.emotion}>
          {errors.emotion}
        </HelperText>
      </Surface>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      
      {/* モダンヘッダー */}
      <Header 
        navigation={navigation} 
        title={isEditMode ? '失敗談を編集' : '失敗談を投稿'}
      />

      {/* ステップインジケーター */}
      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ナビゲーションボタン */}
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <Button
            mode="outlined"
            onPress={() => setCurrentStep(currentStep - 1)}
            style={styles.prevButton}
            labelStyle={styles.prevButtonText}
          >
            前へ
          </Button>
        )}
        
        {currentStep < 3 ? (
          <Button
            mode="contained"
            onPress={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid()}
            style={[styles.nextButton, !isStepValid() && styles.disabledButton]}
            labelStyle={styles.nextButtonText}
          >
            次へ
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={loading || !isStepValid()}
            style={[styles.submitButton, (!isStepValid() || loading) && styles.disabledButton]}
            labelStyle={styles.submitButtonText}
          >
            {loading ? (isEditMode ? '更新中...' : '投稿中...') : (isEditMode ? '更新する' : '投稿する')}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#1DA1F2',
  },
  stepCircleInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepTextInactive: {
    color: '#8E9AAF',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#1DA1F2',
  },
  stepLineInactive: {
    backgroundColor: '#E2E8F0',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  stepContent: {
    paddingHorizontal: 16,
  },
  inputSection: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#8E9AAF',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  textAreaInput: {
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    minHeight: 100,
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#1DA1F2',
    borderColor: '#1DA1F2',
  },
  chipText: {
    color: '#64748B',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  subCategoryChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  emotionChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  selectedChip: {
    backgroundColor: '#1DA1F2',
  },
  selectedSubChip: {
    backgroundColor: '#1DA1F2',
  },
  selectedEmotionChip: {
    backgroundColor: '#E0245E',
  },

  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  prevButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#1DA1F2',
  },
  prevButtonText: {
    color: '#1DA1F2',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#1DA1F2',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#10B981',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
  },
  bottomSpace: {
    height: 40,
  },
});

export default CreateStoryScreen; 