import { StoryCategory } from '../types';

/**
 * カテゴリ情報の型定義
 */
export interface CategoryInfo {
  name: StoryCategory;
  color: string;
  description: string;
  icon: string;
}

/**
 * カテゴリ一覧（二大コンテンツ：エンジニア関連・恋愛関連）
 * 新しいカテゴリを追加する場合は、この配列に追加するだけでOK
 */
export const CATEGORIES: CategoryInfo[] = [
  {
    name: 'エンジニア',
    color: '#1976D2',
    description: '開発・技術・キャリアに関する失敗体験',
    icon: '💻'
  },
  {
    name: '恋愛',
    color: '#F06292',
    description: 'デート・告白・人間関係に関する失敗体験',
    icon: '💕'
  }
];

/**
 * カテゴリ名の配列を取得（型安全）
 */
export const getCategoryNames = (): StoryCategory[] => {
  return CATEGORIES.map(cat => cat.name);
};

/**
 * カテゴリの色を取得
 */
export const getCategoryColor = (category: StoryCategory): string => {
  const categoryInfo = CATEGORIES.find(cat => cat.name === category);
  return categoryInfo?.color || '#757575';
};

/**
 * カテゴリの説明を取得
 */
export const getCategoryDescription = (category: StoryCategory): string => {
  const categoryInfo = CATEGORIES.find(cat => cat.name === category);
  return categoryInfo?.description || '';
};

/**
 * カテゴリのアイコンを取得
 */
export const getCategoryIcon = (category: StoryCategory): string => {
  const categoryInfo = CATEGORIES.find(cat => cat.name === category);
  return categoryInfo?.icon || '📝';
};

/**
 * カテゴリ情報を取得
 */
export const getCategoryInfo = (category: StoryCategory): CategoryInfo | undefined => {
  return CATEGORIES.find(cat => cat.name === category);
};

/**
 * 全カテゴリの色マップを取得（既存コードの互換性のため）
 */
export const getCategoryColorMap = (): { [key in StoryCategory]: string } => {
  const colorMap = {} as { [key in StoryCategory]: string };
  CATEGORIES.forEach(cat => {
    colorMap[cat.name] = cat.color;
  });
  return colorMap;
}; 