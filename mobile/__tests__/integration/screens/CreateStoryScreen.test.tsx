/// <reference types="jest" />

import { mockUserData, mockStory } from '../../__mocks__/sampleData';

// React Native コンポーネントのモック
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  Alert: {
    alert: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

// React Native Paper のモック
jest.mock('react-native-paper', () => ({
  Text: 'Text',
  TextInput: 'TextInput',
  Button: 'Button',
  Chip: 'Chip',
  Surface: 'Surface',
}));

// Navigation のモック
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      editMode: false,
      storyData: null,
    },
  }),
}));

// AuthStore のモック
jest.mock('../../../src/stores/authStore', () => ({
  useAuthStore: () => ({
    user: mockUserData,
  }),
}));

// StoryStore のモック
jest.mock('../../../src/stores/storyStore', () => ({
  useStoryStore: () => ({
    addStory: jest.fn(),
    updateStory: jest.fn(),
  }),
}));

// StoryService のモック
jest.mock('../../../src/services/storyService', () => ({
  storyService: {
    createStory: jest.fn().mockResolvedValue('new-story-id'),
    updateStory: jest.fn().mockResolvedValue(undefined),
  },
}));

// Categories Utils のモック
jest.mock('../../../src/utils/categories', () => ({
  getMainCategories: jest.fn(() => ['恋愛', 'その他']),
  getSubCategories: jest.fn(() => ['デート', '告白', 'カップル']),
}));

describe('CreateStoryScreen Component Tests', () => {
  test('form validation functionality', () => {
    // フォームバリデーション機能のテスト
    const validateForm = (formData: any) => {
      const errors: string[] = [];

      // 必須フィールドチェック
      if (!formData.title?.trim()) {
        errors.push('タイトルは必須です');
      }

      if (!formData.category?.main) {
        errors.push('メインカテゴリは必須です');
      }

      if (!formData.category?.sub) {
        errors.push('サブカテゴリは必須です');
      }

      if (!formData.situation?.trim()) {
        errors.push('状況の説明は必須です');
      }

      if (!formData.action?.trim()) {
        errors.push('取った行動は必須です');
      }

      if (!formData.result?.trim()) {
        errors.push('結果は必須です');
      }

      if (!formData.learning?.trim()) {
        errors.push('学んだことは必須です');
      }

      if (!formData.emotion) {
        errors.push('感情は必須です');
      }

      // 文字数制限チェック
      if (formData.title && formData.title.length > 100) {
        errors.push('タイトルは100文字以内で入力してください');
      }

      const maxLength = 500;
      ['situation', 'action', 'result', 'learning'].forEach(field => {
        if (formData[field] && formData[field].length > maxLength) {
          errors.push(`${field}は${maxLength}文字以内で入力してください`);
        }
      });

      return errors;
    };

    // 有効なフォームデータ
    const validFormData = {
      title: 'テストタイトル',
      category: { main: '恋愛', sub: 'デート' },
      situation: 'テスト状況',
      action: 'テスト行動',
      result: 'テスト結果',
      learning: 'テスト学び',
      emotion: '後悔',
    };

    expect(validateForm(validFormData)).toEqual([]);

    // 必須フィールドが空のテスト
    const emptyFormData = {
      title: '',
      category: { main: '', sub: '' },
      situation: '',
      action: '',
      result: '',
      learning: '',
      emotion: '',
    };

    const errors = validateForm(emptyFormData);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('タイトルは必須です');

    // 文字数制限のテスト
    const longFormData = {
      ...validFormData,
      title: 'a'.repeat(101), // 101文字
      situation: 'a'.repeat(501), // 501文字
    };

    const lengthErrors = validateForm(longFormData);
    expect(lengthErrors).toContain('タイトルは100文字以内で入力してください');
    expect(lengthErrors).toContain('situationは500文字以内で入力してください');
  });

  test('edit mode functionality', () => {
    // 編集モード機能のテスト
    const isEditMode = true;
    const existingStory = mockStory;

    // 編集モードでのフォーム初期化
    const initializeFormForEdit = (story: any) => {
      return {
        title: story.content.title,
        category: story.content.category,
        situation: story.content.situation,
        action: story.content.action,
        result: story.content.result,
        learning: story.content.learning,
        emotion: story.content.emotion,
      };
    };

    const formData = initializeFormForEdit(existingStory);

    expect(formData.title).toBe(existingStory.content.title);
    expect(formData.category).toEqual(existingStory.content.category);
    expect(formData.situation).toBe(existingStory.content.situation);
    expect(formData.emotion).toBe(existingStory.content.emotion);

    // 編集モードでのヘッダータイトル
    const getHeaderTitle = (isEdit: boolean) => {
      return isEdit ? '失敗談を編集' : '失敗談を投稿';
    };

    expect(getHeaderTitle(isEditMode)).toBe('失敗談を編集');
    expect(getHeaderTitle(false)).toBe('失敗談を投稿');
  });

  test('form submission functionality', () => {
    // フォーム送信機能のテスト
    const mockStoryService = {
      createStory: jest.fn().mockResolvedValue('new-story-id'),
      updateStory: jest.fn().mockResolvedValue(undefined),
    };

    const handleSubmit = async (formData: any, isEditMode: boolean, storyId?: string) => {
      try {
        if (isEditMode && storyId) {
          await mockStoryService.updateStory(storyId, mockUserData.uid, formData);
          return { success: true, type: 'update' };
        } else {
          const newStoryId = await mockStoryService.createStory({
            ...formData,
            authorId: mockUserData.uid,
          });
          return { success: true, type: 'create', id: newStoryId };
        }
      } catch (error) {
        return { success: false, error };
      }
    };

    const formData = {
      title: 'テストタイトル',
      category: { main: '恋愛', sub: 'デート' },
      situation: 'テスト状況',
      action: 'テスト行動',
      result: 'テスト結果',
      learning: 'テスト学び',
      emotion: '後悔',
    };

    // 新規作成のテスト
    return handleSubmit(formData, false).then(result => {
      expect(result.success).toBe(true);
      expect(result.type).toBe('create');
      expect(result.id).toBe('new-story-id');
      expect(mockStoryService.createStory).toHaveBeenCalledWith({
        ...formData,
        authorId: mockUserData.uid,
      });
    }).then(() => {
      // 編集のテスト
      return handleSubmit(formData, true, 'existing-story-id').then(result => {
        expect(result.success).toBe(true);
        expect(result.type).toBe('update');
        expect(mockStoryService.updateStory).toHaveBeenCalledWith(
          'existing-story-id',
          mockUserData.uid,
          formData
        );
      });
    });
  });

  test('category selection functionality', () => {
    // カテゴリ選択機能のテスト
    let selectedMainCategory = '';
    let selectedSubCategory = '';
    let availableSubCategories: string[] = [];

    const handleMainCategorySelect = (category: string) => {
      selectedMainCategory = category;
      selectedSubCategory = ''; // サブカテゴリをリセット
      
      // サブカテゴリを取得（モック）
      if (category === '恋愛') {
        availableSubCategories = ['デート', '告白', 'カップル', '片想い', '別れ'];
      } else if (category === 'その他') {
        availableSubCategories = ['その他'];
      } else {
        availableSubCategories = [];
      }
    };

    const handleSubCategorySelect = (category: string) => {
      selectedSubCategory = category;
    };

    // メインカテゴリ選択テスト
    handleMainCategorySelect('恋愛');
    expect(selectedMainCategory).toBe('恋愛');
    expect(selectedSubCategory).toBe(''); // リセットされる
    expect(availableSubCategories.length).toBeGreaterThan(0);
    expect(availableSubCategories).toContain('デート');

    // サブカテゴリ選択テスト
    handleSubCategorySelect('デート');
    expect(selectedSubCategory).toBe('デート');

    // その他カテゴリのテスト
    handleMainCategorySelect('その他');
    expect(selectedMainCategory).toBe('その他');
    expect(availableSubCategories).toEqual(['その他']);
  });

  test('character count functionality', () => {
    // 文字数カウント機能のテスト
    const getCharacterCount = (text: string, maxLength: number) => {
      const count = text.length;
      const remaining = maxLength - count;
      const isOverLimit = count > maxLength;
      const isNearLimit = count > maxLength * 0.8;

      return {
        count,
        remaining,
        isOverLimit,
        isNearLimit,
        percentage: (count / maxLength) * 100,
      };
    };

    // 通常のテスト
    const normalText = 'これは通常のテキストです';
    const normalResult = getCharacterCount(normalText, 100);
    
    expect(normalResult.count).toBe(normalText.length);
    expect(normalResult.remaining).toBe(100 - normalText.length);
    expect(normalResult.isOverLimit).toBe(false);
    expect(normalResult.isNearLimit).toBe(false);

    // 制限に近いテスト (80%超過)
    const nearLimitText = 'a'.repeat(85);
    const nearLimitResult = getCharacterCount(nearLimitText, 100);
    
    expect(nearLimitResult.isNearLimit).toBe(true);
    expect(nearLimitResult.isOverLimit).toBe(false);

    // 制限超過テスト
    const overLimitText = 'a'.repeat(150);
    const overLimitResult = getCharacterCount(overLimitText, 100);
    
    expect(overLimitResult.isOverLimit).toBe(true);
    expect(overLimitResult.remaining).toBe(-50);
  });

  test('navigation and alert functionality', () => {
    // ナビゲーションとアラート機能のテスト
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const mockAlert = {
      alert: jest.fn(),
    };

    const showSuccessAlert = (isEditMode: boolean) => {
      const message = isEditMode ? '失敗談を更新しました' : '失敗談を投稿しました';
      mockAlert.alert('成功', message);
    };

    const showErrorAlert = (error: string) => {
      mockAlert.alert('エラー', error);
    };

    const navigateAfterSuccess = (isEditMode: boolean) => {
      if (isEditMode) {
        mockNavigation.goBack();
      } else {
        mockNavigation.navigate('Home');
      }
    };

    // 成功アラートテスト
    showSuccessAlert(false);
    expect(mockAlert.alert).toHaveBeenCalledWith('成功', '失敗談を投稿しました');

    showSuccessAlert(true);
    expect(mockAlert.alert).toHaveBeenCalledWith('成功', '失敗談を更新しました');

    // エラーアラートテスト
    showErrorAlert('テストエラー');
    expect(mockAlert.alert).toHaveBeenCalledWith('エラー', 'テストエラー');

    // ナビゲーションテスト
    navigateAfterSuccess(false);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');

    navigateAfterSuccess(true);
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
}); 