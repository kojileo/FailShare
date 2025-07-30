// Google AdSense審査用設定
export const ADSENSE_REVIEW_CONFIG = {
  // 審査段階での設定
  REVIEW_MODE: true,
  
  // 審査要件チェックリスト
  REQUIREMENTS: {
    // コンテンツ要件
    CONTENT: {
      ORIGINAL_CONTENT: true,        // オリジナルコンテンツ
      MIN_CONTENT_LENGTH: true,      // 十分なコンテンツ量
      NO_COPYRIGHT_VIOLATION: true,  // 著作権侵害なし
      APPROPRIATE_CONTENT: true,     // 適切なコンテンツ
    },
    
    // 技術要件
    TECHNICAL: {
      RESPONSIVE_DESIGN: true,       // レスポンシブデザイン
      FAST_LOADING: true,            // 高速読み込み
      MOBILE_FRIENDLY: true,         // モバイル対応
      HTTPS_ENABLED: true,           // HTTPS対応
    },
    
    // ユーザー体験要件
    UX: {
      CLEAR_NAVIGATION: true,        // 明確なナビゲーション
      NO_INTRUSIVE_ADS: true,        // 邪魔な広告なし
      GOOD_LAYOUT: true,             // 良いレイアウト
      ACCESSIBILITY: true,           // アクセシビリティ
    },
    
    // 法的要件
    LEGAL: {
      PRIVACY_POLICY: true,          // プライバシーポリシー
      TERMS_OF_SERVICE: true,        // 利用規約
      COOKIE_POLICY: true,           // クッキーポリシー
      GDPR_COMPLIANT: true,          // GDPR準拠
    }
  },
  
  // 審査用プレースホルダー設定
  PLACEHOLDER: {
    ENABLED: true,
    STYLE: {
      backgroundColor: '#f8f9fa',
      border: '2px dashed #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center',
      color: '#6c757d',
      fontSize: '14px',
      margin: '10px 0',
    }
  },
  
  // 審査チェックリスト
  CHECKLIST: [
    'オリジナルコンテンツが十分にある',
    'サイトが6ヶ月以上運営されている',
    '月間ページビューが10,000以上',
    '明確なナビゲーション構造',
    'モバイル対応している',
    'HTTPSで保護されている',
    'プライバシーポリシーがある',
    '利用規約がある',
    '著作権侵害がない',
    '適切なコンテンツのみ',
    '広告スペースが適切に配置されている',
    'ユーザー体験を損なわない',
  ]
};

// 審査用プレースホルダーコンポーネント
export const createReviewPlaceholder = (position: string) => {
  return {
    type: 'review_placeholder',
    position,
    message: `📋 AdSense審査用プレースホルダー (${position})`,
    note: '審査通過後に実際の広告が表示されます'
  };
};

// 審査ステータス管理
export enum ReviewStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// 審査進捗管理
export interface ReviewProgress {
  status: ReviewStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectionReason?: string;
  checklistCompleted: boolean;
  requirementsMet: boolean;
} 