import { Unsubscribe } from 'firebase/firestore';
import { realtimeConfig, canUseListener, canAddListener, getAutoStopTimeout } from '../config/realtimeConfig';

/**
 * リアルタイムリスナーの管理とコスト最適化のためのユーティリティ
 */
export class RealtimeManager {
  private static instance: RealtimeManager;
  private activeListeners: Map<string, Unsubscribe> = new Map();
  private listenerCounts: Map<string, number> = new Map();
  private isAppActive: boolean = true;
  private autoStopTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  private constructor() {
    // アプリの状態監視
    this.setupAppStateListener();
  }

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * リスナーを登録（重複チェック付き）
   */
  public addListener(
    key: string, 
    unsubscribe: Unsubscribe, 
    context: string = 'unknown'
  ): boolean {
    return this.registerListener(key, unsubscribe, context);
  }

  public registerListener(
    key: string, 
    unsubscribe: Unsubscribe, 
    context: string = 'unknown'
  ): boolean {
    // 機能の使用可否をチェック
    if (!canUseListener(context as any)) {
      console.warn(`⚠️ リスナー無効化 [${context}]: ${key}`);
      return false;
    }
    
    // 最大リスナー数をチェック
    const currentCount = this.getListenerCountByContext(context);
    if (!canAddListener(context as any, currentCount)) {
      console.warn(`⚠️ リスナー数上限 [${context}]: ${currentCount}/${realtimeConfig.features[context as any]?.maxListeners}`);
      return false;
    }
    
    // 既存のリスナーがあれば停止
    this.removeListener(key);
    
    this.activeListeners.set(key, unsubscribe);
    this.listenerCounts.set(key, (this.listenerCounts.get(key) || 0) + 1);
    
    // 自動停止タイマーを設定
    this.setupAutoStopTimer(key, context);
    
    console.log(`📡 リスナー登録 [${context}]: ${key} (総数: ${this.activeListeners.size})`);
    return true;
  }

  /**
   * リスナーを削除
   */
  public removeListener(key: string): void {
    const unsubscribe = this.activeListeners.get(key);
    if (unsubscribe) {
      try {
        unsubscribe();
        this.activeListeners.delete(key);
        const count = this.listenerCounts.get(key) || 0;
        if (count > 1) {
          this.listenerCounts.set(key, count - 1);
        } else {
          this.listenerCounts.delete(key);
        }
        
        // 自動停止タイマーをクリア
        const timer = this.autoStopTimers.get(key);
        if (timer) {
          clearTimeout(timer);
          this.autoStopTimers.delete(key);
        }
        
        console.log(`📡 リスナー削除: ${key} (残り: ${this.activeListeners.size})`);
      } catch (error) {
        console.error(`❌ リスナー削除エラー [${key}]:`, error);
      }
    }
  }

  /**
   * 特定のコンテキストのリスナーを一括削除
   */
  public removeListenersByContext(context: string): void {
    const keysToRemove: string[] = [];
    
    this.activeListeners.forEach((_, key) => {
      if (key.includes(context)) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => this.removeListener(key));
  }

  /**
   * 全リスナーを停止
   */
  public removeAllListeners(): void {
    console.log(`📡 全リスナー停止開始 (${this.activeListeners.size}個)`);
    
    this.activeListeners.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
        console.log(`📡 リスナー停止: ${key}`);
      } catch (error) {
        console.error(`❌ リスナー停止エラー [${key}]:`, error);
      }
    });
    
    // 全タイマーをクリア
    this.autoStopTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    
    this.activeListeners.clear();
    this.listenerCounts.clear();
    this.autoStopTimers.clear();
    console.log('📡 全リスナー停止完了');
  }

  /**
   * アクティブなリスナー数を取得
   */
  public getActiveListenerCount(): number {
    return this.activeListeners.size;
  }

  /**
   * 特定のコンテキストのリスナー数を取得
   */
  public getListenerCountByContext(context: string): number {
    let count = 0;
    this.activeListeners.forEach((_, key) => {
      if (key.includes(context)) {
        count++;
      }
    });
    return count;
  }

  /**
   * 自動停止タイマーを設定
   */
  private setupAutoStopTimer(key: string, context: string): void {
    const timeout = getAutoStopTimeout(context as any);
    if (timeout > 0) {
      const timer = setTimeout(() => {
        console.log(`⏰ 自動停止タイマー発動: ${key}`);
        this.removeListener(key);
      }, timeout);
      
      this.autoStopTimers.set(key, timer);
    }
  }

  /**
   * リスナー統計を取得
   */
  public getListenerStats(): { total: number; byContext: Record<string, number> } {
    const byContext: Record<string, number> = {};
    
    this.activeListeners.forEach((_, key) => {
      const context = key.split(':')[0] || 'unknown';
      byContext[context] = (byContext[context] || 0) + 1;
    });
    
    return {
      total: this.activeListeners.size,
      byContext
    };
  }

  /**
   * アプリの状態監視を設定
   */
  private setupAppStateListener(): void {
    // React Native AppState の代わりに、手動でアプリの状態を管理
    // 実際の実装では AppState を使用することを推奨
    
    // 開発環境でのみ統計を表示
    if (process.env.EXPO_PUBLIC_ENVIRONMENT !== 'production') {
      setInterval(() => {
        const stats = this.getListenerStats();
        if (stats.total > 0) {
          console.log('📊 リアルタイムリスナー統計:', stats);
        }
      }, 30000); // 30秒ごと
    }
  }

  /**
   * アプリが非アクティブになった時の処理
   */
  public onAppInactive(): void {
    this.isAppActive = false;
    console.log('📱 アプリ非アクティブ: リスナー管理モード');
  }

  /**
   * アプリがアクティブになった時の処理
   */
  public onAppActive(): void {
    this.isAppActive = true;
    console.log('📱 アプリアクティブ: リスナー復旧');
  }

  /**
   * アプリがアクティブかどうかを確認
   */
  public isAppActiveState(): boolean {
    return this.isAppActive;
  }
}

// シングルトンインスタンスをエクスポート
export const realtimeManager = RealtimeManager.getInstance();

/**
 * リスナーキーの生成ヘルパー
 */
export const createListenerKey = (context: string, id: string): string => {
  return `${context}:${id}`;
};

/**
 * リスナーの自動クリーンアップ用フック
 */
export const useRealtimeCleanup = (context: string) => {
  return () => {
    realtimeManager.removeListenersByContext(context);
  };
};
