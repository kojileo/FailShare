import { StoryCategory } from '../types';

export interface CategoryInfo {
  name: StoryCategory;
  color: string;
  description: string;
  icon: string;
}

/**
 * カテゴリ一覧（恋愛特化版）
 * 新しいカテゴリを追加する場合は、この配列に追加するだけでOK
 */
export const CATEGORIES: CategoryInfo[] = [
  {
    name: 'デート',
    color: '#F06292',
    description: '初デート・デートプランの失敗体験',
    icon: '💕'
  },
  {
    name: '告白',
    color: '#EC407A',
    description: '告白・プロポーズに関する失敗体験',
    icon: '💌'
  },
  {
    name: 'カップル',
    color: '#E91E63',
    description: '交際中の関係性・コミュニケーションの失敗',
    icon: '💑'
  },
  {
    name: '片想い',
    color: '#AD1457',
    description: '片思い・恋愛アプローチの失敗体験',
    icon: '💭'
  },
  {
    name: '別れ',
    color: '#880E4F',
    description: '別れ・復縁に関する失敗体験',
    icon: '💔'
  },
  {
    name: 'その他',
    color: '#9C27B0',
    description: '恋愛関連のその他の失敗体験',
    icon: '💜'
  }
];

/**
 * カテゴリ名の配列を取得
 */
export const getCategoryNames = (): StoryCategory[] => {
  return CATEGORIES.map(category => category.name);
};

/**
 * カテゴリ情報を取得
 */
export const getCategoryInfo = (categoryName: StoryCategory): CategoryInfo | undefined => {
  return CATEGORIES.find(category => category.name === categoryName);
};

/**
 * カテゴリの色を取得
 */
export const getCategoryColor = (categoryName: StoryCategory): string => {
  const categoryInfo = getCategoryInfo(categoryName);
  return categoryInfo?.color || '#9C27B0';
};

/**
 * カテゴリのアイコンを取得
 */
export const getCategoryIcon = (categoryName: StoryCategory): string => {
  const categoryInfo = getCategoryInfo(categoryName);
  return categoryInfo?.icon || '💜';
};

/**
 * カテゴリの説明を取得
 */
export const getCategoryDescription = (categoryName: StoryCategory): string => {
  const categoryInfo = getCategoryInfo(categoryName);
  return categoryInfo?.description || '';
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