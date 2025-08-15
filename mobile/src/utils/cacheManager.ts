/**
 * Firestore読み取り回数削減のためのキャッシュマネージャー
 * 無料枠の効率的な活用を目的としています
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live (ミリ秒)
}

interface CacheConfig {
  defaultTTL: number; // デフォルトのキャッシュ時間（ミリ秒）
  maxSize: number;    // 最大キャッシュサイズ
  cleanupInterval: number; // クリーンアップ間隔（ミリ秒）
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<any>> = new Map();
  private config: CacheConfig;
  private cleanupTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5分
      maxSize: 1000,
      cleanupInterval: 10 * 60 * 1000, // 10分
      ...config
    };

    this.startCleanupTimer();
  }

  public static getInstance(config?: Partial<CacheConfig>): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  /**
   * データをキャッシュに保存
   */
  public set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const cacheTTL = ttl || this.config.defaultTTL;

    // キャッシュサイズ制限チェック
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: cacheTTL
    });

    console.log(`💾 キャッシュ保存: ${key} (TTL: ${cacheTTL / 1000}秒)`);
  }

  /**
   * キャッシュからデータを取得
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`❌ キャッシュ未ヒット: ${key}`);
      return null;
    }

    const now = Date.now();
    const isExpired = (now - item.timestamp) > item.ttl;

    if (isExpired) {
      console.log(`⏰ キャッシュ期限切れ: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ キャッシュヒット: ${key}`);
    return item.data as T;
  }

  /**
   * キャッシュからデータを削除
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ キャッシュ削除: ${key}`);
    }
    return deleted;
  }

  /**
   * 特定のパターンに一致するキーを削除
   */
  public deletePattern(pattern: string): number {
    let deletedCount = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🗑️ パターン削除: ${pattern} (${deletedCount}件)`);
    }

    return deletedCount;
  }

  /**
   * 全キャッシュをクリア
   */
  public clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ 全キャッシュクリア: ${size}件`);
  }

  /**
   * キャッシュ統計を取得
   */
  public getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
  } {
    const totalRequests = this.totalHits + this.totalMisses;
    const hitRate = totalRequests > 0 ? (this.totalHits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses
    };
  }

  /**
   * 古いキャッシュを削除
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ 古いキャッシュ削除: ${oldestKey}`);
    }
  }

  /**
   * 期限切れのキャッシュをクリーンアップ
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if ((now - item.timestamp) > item.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 キャッシュクリーンアップ: ${cleanedCount}件`);
    }
  }

  /**
   * クリーンアップタイマーを開始
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * クリーンアップタイマーを停止
   */
  public stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // 統計情報
  private totalHits = 0;
  private totalMisses = 0;

  /**
   * キャッシュヒットを記録
   */
  private recordHit(): void {
    this.totalHits++;
  }

  /**
   * キャッシュミスを記録
   */
  private recordMiss(): void {
    this.totalMisses++;
  }
}

// プリセット設定
export const cacheConfigs = {
  // ストーリー用キャッシュ（5分）
  stories: {
    defaultTTL: 5 * 60 * 1000,
    maxSize: 200,
    cleanupInterval: 5 * 60 * 1000
  },
  
  // コメント用キャッシュ（3分）
  comments: {
    defaultTTL: 3 * 60 * 1000,
    maxSize: 500,
    cleanupInterval: 3 * 60 * 1000
  },
  
  // いいね用キャッシュ（2分）
  likes: {
    defaultTTL: 2 * 60 * 1000,
    maxSize: 300,
    cleanupInterval: 2 * 60 * 1000
  },
  
  // ユーザー用キャッシュ（10分）
  users: {
    defaultTTL: 10 * 60 * 1000,
    maxSize: 100,
    cleanupInterval: 10 * 60 * 1000
  }
};

// インスタンス作成
export const storyCache = CacheManager.getInstance(cacheConfigs.stories);
export const commentCache = CacheManager.getInstance(cacheConfigs.comments);
export const likeCache = CacheManager.getInstance(cacheConfigs.likes);
export const userCache = CacheManager.getInstance(cacheConfigs.users);

// 開発環境での統計表示
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const stats = {
      stories: storyCache.getStats(),
      comments: commentCache.getStats(),
      likes: likeCache.getStats(),
      users: userCache.getStats()
    };
    
    console.log('📊 キャッシュ統計:', stats);
  }, 60 * 1000); // 1分ごと
}
