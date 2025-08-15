/**
 * リアルタイムリスナーの設定とコスト最適化
 */

export interface RealtimeConfig {
  // リスナーの最大同時接続数
  maxConcurrentListeners: number;
  
  // リスナーの自動停止時間（ミリ秒）
  autoStopTimeout: number;
  
  // ポーリング間隔（ミリ秒）- リアルタイムの代わりに使用
  pollingInterval: number;
  
  // 各機能のリアルタイム設定
  features: {
    comments: {
      enabled: boolean;
      maxListeners: number;
      autoStopTimeout: number;
    };
    likes: {
      enabled: boolean;
      maxListeners: number;
      autoStopTimeout: number;
    };
    friends: {
      enabled: boolean;
      maxListeners: number;
      autoStopTimeout: number;
    };
    friendRequests: {
      enabled: boolean;
      maxListeners: number;
      autoStopTimeout: number;
    };
    chat: {
      enabled: boolean;
      maxListeners: number;
      autoStopTimeout: number;
    };
    chatMessages: {
      enabled: boolean;
      maxListeners: number;
      autoStopTimeout: number;
    };
    userChats: {
      enabled: boolean;
      maxListeners: number;
      autoStopTimeout: number;
    };
  };
}

// 開発環境用設定（コスト最適化重視）
export const developmentConfig: RealtimeConfig = {
  maxConcurrentListeners: 10,
  autoStopTimeout: 5 * 60 * 1000, // 5分
  pollingInterval: 30 * 1000, // 30秒
  
  features: {
    comments: {
      enabled: true,
      maxListeners: 3,
      autoStopTimeout: 3 * 60 * 1000, // 3分
    },
    likes: {
      enabled: true,
      maxListeners: 5,
      autoStopTimeout: 2 * 60 * 1000, // 2分
    },
    friends: {
      enabled: true,
      maxListeners: 2,
      autoStopTimeout: 10 * 60 * 1000, // 10分
    },
    friendRequests: {
      enabled: true,
      maxListeners: 1,
      autoStopTimeout: 5 * 60 * 1000, // 5分
    },
    chat: {
      enabled: true,
      maxListeners: 2,
      autoStopTimeout: 1 * 60 * 1000, // 1分
    },
    chatMessages: {
      enabled: true,
      maxListeners: 2,
      autoStopTimeout: 1 * 60 * 1000, // 1分
    },
    userChats: {
      enabled: true,
      maxListeners: 1,
      autoStopTimeout: 5 * 60 * 1000, // 5分
    },
  },
};

// 本番環境用設定（パフォーマンス重視）
export const productionConfig: RealtimeConfig = {
  maxConcurrentListeners: 20,
  autoStopTimeout: 10 * 60 * 1000, // 10分
  pollingInterval: 60 * 1000, // 1分
  
  features: {
    comments: {
      enabled: true,
      maxListeners: 5,
      autoStopTimeout: 5 * 60 * 1000, // 5分
    },
    likes: {
      enabled: true,
      maxListeners: 10,
      autoStopTimeout: 3 * 60 * 1000, // 3分
    },
    friends: {
      enabled: true,
      maxListeners: 3,
      autoStopTimeout: 15 * 60 * 1000, // 15分
    },
    friendRequests: {
      enabled: true,
      maxListeners: 2,
      autoStopTimeout: 10 * 60 * 1000, // 10分
    },
    chat: {
      enabled: true,
      maxListeners: 3,
      autoStopTimeout: 2 * 60 * 1000, // 2分
    },
    chatMessages: {
      enabled: true,
      maxListeners: 3,
      autoStopTimeout: 2 * 60 * 1000, // 2分
    },
    userChats: {
      enabled: true,
      maxListeners: 2,
      autoStopTimeout: 10 * 60 * 1000, // 10分
    },
  },
};

// 環境に応じた設定を取得
export const getRealtimeConfig = (): RealtimeConfig => {
  const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
  
  switch (environment) {
    case 'production':
      return productionConfig;
    case 'staging':
      return productionConfig; // ステージングも本番設定を使用
    default:
      return developmentConfig;
  }
};

// 現在の設定をエクスポート
export const realtimeConfig = getRealtimeConfig();

/**
 * リスナーの使用可否をチェック
 */
export const canUseListener = (feature: keyof RealtimeConfig['features']): boolean => {
  return realtimeConfig.features[feature].enabled;
};

/**
 * リスナーの最大数をチェック
 */
export const canAddListener = (
  feature: keyof RealtimeConfig['features'], 
  currentCount: number
): boolean => {
  const config = realtimeConfig.features[feature];
  return currentCount < config.maxListeners;
};

/**
 * 自動停止時間を取得
 */
export const getAutoStopTimeout = (feature: keyof RealtimeConfig['features']): number => {
  return realtimeConfig.features[feature].autoStopTimeout;
};
