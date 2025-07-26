import { StoryCategory, MainCategory, SubCategory, CategoryHierarchy } from '../types';

export interface SubCategoryInfo {
  name: SubCategory;
  color: string;
  description: string;
  icon: string;
}

export interface MainCategoryInfo {
  name: MainCategory;
  color: string;
  description: string;
  icon: string;
  subCategories: SubCategoryInfo[];
}

/**
 * メインカテゴリとサブカテゴリの階層構造定義
 */
export const CATEGORY_HIERARCHY: MainCategoryInfo[] = [
  {
    name: '恋愛',
    color: '#E91E63',
    description: '恋愛・人間関係に関する失敗体験',
    icon: '💕',
    subCategories: [
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
      }
    ]
  },
  {
    name: '仕事',
    color: '#1976D2',
    description: '職場・キャリアに関する失敗体験',
    icon: '💼',
    subCategories: [
      {
        name: '職場人間関係',
        color: '#2196F3',
        description: '同僚・上司・部下との人間関係の失敗',
        icon: '🤝'
      },
      {
        name: '転職・キャリア',
        color: '#1976D2',
        description: '転職活動・キャリア選択の失敗体験',
        icon: '📈'
      },
      {
        name: 'プレゼン・会議',
        color: '#1565C0',
        description: 'プレゼンテーション・会議での失敗',
        icon: '📊'
      },
      {
        name: 'プロジェクト管理',
        color: '#0D47A1',
        description: 'プロジェクト管理・チームマネジメントの失敗',
        icon: '📋'
      },
      {
        name: 'スキル習得',
        color: '#1E88E5',
        description: '技術習得・資格取得での失敗体験',
        icon: '📚'
      }
    ]
  },
  {
    name: 'その他',
    color: '#9C27B0',
    description: 'その他の失敗体験',
    icon: '💜',
    subCategories: [
      {
        name: 'その他',
        color: '#9C27B0',
        description: '上記以外の失敗体験',
        icon: '💜'
      }
    ]
  }
];

/**
 * 後方互換性のための従来のカテゴリ配列（フラット構造）
 */
export const CATEGORIES: SubCategoryInfo[] = CATEGORY_HIERARCHY.flatMap(main => main.subCategories);

/**
 * メインカテゴリ一覧を取得
 */
export const getMainCategories = (): MainCategory[] => {
  return CATEGORY_HIERARCHY.map(category => category.name);
};

/**
 * 指定メインカテゴリのサブカテゴリ一覧を取得
 */
export const getSubCategories = (mainCategory: MainCategory): SubCategory[] => {
  const main = CATEGORY_HIERARCHY.find(cat => cat.name === mainCategory);
  return main ? main.subCategories.map(sub => sub.name) : [];
};

/**
 * 階層カテゴリ情報を取得
 */
export const getCategoryHierarchyInfo = (category: CategoryHierarchy): { main: MainCategoryInfo | undefined, sub: SubCategoryInfo | undefined } => {
  const mainInfo = CATEGORY_HIERARCHY.find(main => main.name === category.main);
  const subInfo = mainInfo?.subCategories.find(sub => sub.name === category.sub);
  return { main: mainInfo, sub: subInfo };
};

/**
 * サブカテゴリからメインカテゴリを取得
 */
export const getMainCategoryFromSub = (subCategory: SubCategory): MainCategory | undefined => {
  for (const main of CATEGORY_HIERARCHY) {
    if (main.subCategories.some(sub => sub.name === subCategory)) {
      return main.name;
    }
  }
  return undefined;
};

/**
 * 階層カテゴリの表示用文字列を取得
 */
export const getCategoryDisplayString = (category: CategoryHierarchy): string => {
  return `${category.main} - ${category.sub}`;
};

/**
 * 階層カテゴリのメイン部分のみを取得
 */
export const getMainCategoryString = (category: CategoryHierarchy): string => {
  return category.main;
};

/**
 * 階層カテゴリのサブ部分のみを取得
 */
export const getSubCategoryString = (category: CategoryHierarchy): string => {
  return category.sub;
};

/**
 * 階層カテゴリの色を取得（サブカテゴリの色を優先）
 */
export const getCategoryHierarchyColor = (category: CategoryHierarchy): string => {
  const { sub } = getCategoryHierarchyInfo(category);
  return sub?.color || '#9C27B0';
};

/**
 * 階層カテゴリのアイコンを取得（サブカテゴリのアイコンを優先）
 */
export const getCategoryHierarchyIcon = (category: CategoryHierarchy): string => {
  const { sub } = getCategoryHierarchyInfo(category);
  return sub?.icon || '💜';
};

// 従来の関数群（後方互換性のため）
/**
 * カテゴリ名の配列を取得
 */
export const getCategoryNames = (): StoryCategory[] => {
  return CATEGORIES.map(category => category.name as StoryCategory);
};

/**
 * カテゴリ情報を取得
 */
export const getCategoryInfo = (categoryName: StoryCategory): SubCategoryInfo | undefined => {
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
    colorMap[cat.name as StoryCategory] = cat.color;
  });
  return colorMap;
}; 