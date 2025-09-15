import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { AdminProfile } from '../types';

class AdminAuthService {
  private readonly ADMINS_COLLECTION = 'adminProfiles';

  /**
   * 管理者ログイン
   */
  async signIn(adminId: string, password: string): Promise<AdminProfile> {
    try {
      console.log('🔐 管理者ログイン開始:', { adminId });

      // 管理者情報をFirestoreから取得
      const adminDoc = await getDoc(doc(db, this.ADMINS_COLLECTION, adminId));
      
      if (!adminDoc.exists()) {
        throw new Error('管理者が見つかりません');
      }
      
      const adminData = adminDoc.data();
      
      // パスワードチェック（開発環境では平文比較）
      if (adminData.password !== password) {
        throw new Error('パスワードが間違っています');
      }

      // 管理者プロファイルを構築
      const adminProfile: AdminProfile = {
        id: adminId,
        displayName: adminData.displayName || '管理者',
        avatar: adminData.avatar || 'default',
        isOnline: true,
        status: 'available',
        specialties: adminData.specialties || [],
        responseTimeAvg: adminData.responseTimeAvg || 30,
        satisfactionScore: adminData.satisfactionScore || 4.5,
        activeChats: adminData.activeChats || 0,
        maxConcurrentChats: adminData.maxConcurrentChats || 5,
        lastActiveAt: new Date()
      };
      
      // 最終ログイン時間を更新
      await updateDoc(doc(db, this.ADMINS_COLLECTION, adminId), {
        lastLoginAt: serverTimestamp(),
        isOnline: true,
        status: 'available',
        lastActiveAt: serverTimestamp()
      });
      
      console.log('✅ 管理者ログイン成功:', adminProfile.displayName);
      return adminProfile;
    } catch (error) {
      console.error('❌ 管理者ログインエラー:', error);
      throw error;
    }
  }

  /**
   * 管理者ログアウト
   */
  async signOut(adminId: string): Promise<void> {
    try {
      console.log('🔄 管理者ログアウト開始:', { adminId });

      await updateDoc(doc(db, this.ADMINS_COLLECTION, adminId), {
        isOnline: false,
        status: 'offline',
        lastActiveAt: serverTimestamp()
      });

      console.log('✅ 管理者ログアウト成功:', adminId);
    } catch (error) {
      console.error('❌ 管理者ログアウトエラー:', error);
      throw error;
    }
  }

  /**
   * 管理者情報取得
   */
  async getAdminProfile(adminId: string): Promise<AdminProfile | null> {
    try {
      const adminDoc = await getDoc(doc(db, this.ADMINS_COLLECTION, adminId));
      
      if (!adminDoc.exists()) {
        return null;
      }
      
      const adminData = adminDoc.data();
      
      return {
        id: adminDoc.id,
        displayName: adminData.displayName || '管理者',
        avatar: adminData.avatar || 'default',
        isOnline: adminData.isOnline || false,
        status: adminData.status || 'offline',
        specialties: adminData.specialties || [],
        responseTimeAvg: adminData.responseTimeAvg || 30,
        satisfactionScore: adminData.satisfactionScore || 4.5,
        activeChats: adminData.activeChats || 0,
        maxConcurrentChats: adminData.maxConcurrentChats || 5,
        lastActiveAt: adminData.lastActiveAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('❌ 管理者情報取得エラー:', error);
      throw error;
    }
  }

  /**
   * 管理者権限チェック
   */
  checkAdminPermission(admin: AdminProfile, action: string): boolean {
    const adminPermissions = {
      'admin': ['read', 'write', 'support'],
      'super-admin': ['read', 'write', 'support', 'manage', 'delete']
    };
    
    // 現在の実装では、roleが定義されていないため、基本的な権限を付与
    const role = 'admin'; // デフォルトロール
    
    return adminPermissions[role]?.includes(action) || false;
  }
}

export const adminAuthService = new AdminAuthService();
