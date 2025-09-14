import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  AdminSupportRequest, 
  AdminProfile, 
  AdminSupportMessage, 
  AdminSupportSession,
  EmotionType 
} from '../types';

class AdminSupportService {
  private readonly REQUESTS_COLLECTION = 'adminSupportRequests';
  private readonly SESSIONS_COLLECTION = 'adminSupportSessions';
  private readonly MESSAGES_COLLECTION = 'adminSupportMessages';
  private readonly ADMINS_COLLECTION = 'adminProfiles';

  /**
   * ユーザーがサポートをリクエスト
   */
  async requestSupport(
    userId: string, 
    message: string, 
    emotion: EmotionType,
    priority: AdminSupportRequest['priority'] = 'normal'
  ): Promise<string> {
    try {
      console.log('🆘 サポートリクエスト開始:', { userId, message, emotion, priority });

      const requestData = {
        userId,
        message,
        emotion,
        priority,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: [emotion, priority]
      };

      const docRef = await addDoc(collection(db, this.REQUESTS_COLLECTION), requestData);
      
      console.log('✅ サポートリクエスト作成成功:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ サポートリクエスト作成エラー:', error);
      throw error;
    }
  }

  /**
   * 利用可能な管理者を取得
   */
  async getAvailableAdmins(): Promise<AdminProfile[]> {
    try {
      // インデックス構築中は簡素化されたクエリを使用
      const q = query(
        collection(db, this.ADMINS_COLLECTION),
        where('status', 'in', ['available', 'busy'])
      );

      const querySnapshot = await getDocs(q);
      const admins: AdminProfile[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        admins.push({
          id: doc.id,
          displayName: data.displayName,
          avatar: data.avatar,
          isOnline: data.isOnline,
          status: data.status,
          specialties: data.specialties || [],
          responseTimeAvg: data.responseTimeAvg || 30,
          satisfactionScore: data.satisfactionScore || 4.5,
          activeChats: data.activeChats || 0,
          maxConcurrentChats: data.maxConcurrentChats || 5,
          lastActiveAt: data.lastActiveAt?.toDate() || new Date()
        });
      });

      // JavaScriptで並び替え（インデックス構築完了まで）
      const sortedAdmins = admins.sort((a, b) => {
        // 利用可能性で並び替え（available > busy）
        if (a.status !== b.status) {
          return a.status === 'available' ? -1 : 1;
        }
        // アクティブチャット数で並び替え
        if (a.activeChats !== b.activeChats) {
          return a.activeChats - b.activeChats;
        }
        // 平均応答時間で並び替え
        return a.responseTimeAvg - b.responseTimeAvg;
      });

      console.log('👥 利用可能管理者取得:', sortedAdmins.length);
      return sortedAdmins;
    } catch (error) {
      console.error('❌ 管理者取得エラー:', error);
      throw error;
    }
  }

  /**
   * 最適な管理者を自動選択
   */
  async assignBestAdmin(requestId: string): Promise<string | null> {
    try {
      const admins = await this.getAvailableAdmins();
      
      if (admins.length === 0) {
        console.log('⚠️ 利用可能な管理者がいません');
        return null;
      }

      // 最適な管理者を選択（負荷が少なく、応答時間が短い管理者を優先）
      const bestAdmin = admins
        .filter(admin => admin.activeChats < admin.maxConcurrentChats)
        .sort((a, b) => {
          // 1. アクティブチャット数の少ない順
          if (a.activeChats !== b.activeChats) {
            return a.activeChats - b.activeChats;
          }
          // 2. 平均応答時間の短い順
          if (a.responseTimeAvg !== b.responseTimeAvg) {
            return a.responseTimeAvg - b.responseTimeAvg;
          }
          // 3. 満足度スコアの高い順
          return b.satisfactionScore - a.satisfactionScore;
        })[0];

      if (!bestAdmin) {
        console.log('⚠️ 対応可能な管理者がいません（全員満杯）');
        return null;
      }

      await this.assignRequest(requestId, bestAdmin.id);
      console.log('✅ 管理者自動割り当て完了:', bestAdmin.displayName);
      return bestAdmin.id;
    } catch (error) {
      console.error('❌ 管理者自動割り当てエラー:', error);
      throw error;
    }
  }

  /**
   * リクエストに管理者を割り当て
   */
  async assignRequest(requestId: string, adminId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // リクエストを更新
      const requestRef = doc(db, this.REQUESTS_COLLECTION, requestId);
      batch.update(requestRef, {
        assignedAdminId: adminId,
        status: 'assigned',
        updatedAt: serverTimestamp()
      });

      // 管理者のアクティブチャット数を増加
      const adminRef = doc(db, this.ADMINS_COLLECTION, adminId);
      batch.update(adminRef, {
        activeChats: increment(1),
        lastActiveAt: serverTimestamp()
      });

      await batch.commit();
      console.log('✅ リクエスト割り当て完了:', { requestId, adminId });
    } catch (error) {
      console.error('❌ リクエスト割り当てエラー:', error);
      throw error;
    }
  }

  /**
   * サポートセッションを開始
   */
  async startSession(requestId: string, adminId: string): Promise<string> {
    try {
      // リクエスト情報を取得
      const requestDoc = await getDoc(doc(db, this.REQUESTS_COLLECTION, requestId));
      if (!requestDoc.exists()) {
        throw new Error('リクエストが見つかりません');
      }

      const requestData = requestDoc.data();

      // セッションを作成
      const sessionData = {
        userId: requestData.userId,
        adminId,
        status: 'active' as const,
        startedAt: serverTimestamp(),
        tags: requestData.tags || [],
        messages: []
      };

      const sessionRef = await addDoc(collection(db, this.SESSIONS_COLLECTION), sessionData);

      // 初期メッセージを追加（ユーザーの最初のメッセージ）
      await this.addMessage(sessionRef.id, requestData.userId, 'user', requestData.message);

      // リクエストステータスを更新
      await updateDoc(doc(db, this.REQUESTS_COLLECTION, requestId), {
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });

      console.log('✅ サポートセッション開始:', sessionRef.id);
      return sessionRef.id;
    } catch (error) {
      console.error('❌ サポートセッション開始エラー:', error);
      throw error;
    }
  }

  /**
   * メッセージを追加
   */
  async addMessage(
    sessionId: string, 
    senderId: string, 
    senderType: 'user' | 'admin',
    content: string,
    messageType: AdminSupportMessage['messageType'] = 'text',
    isPrivate: boolean = false,
    metadata?: AdminSupportMessage['metadata']
  ): Promise<string> {
    try {
      const messageData = {
        supportRequestId: sessionId,
        senderId,
        senderType,
        content,
        messageType,
        isPrivate,
        timestamp: serverTimestamp(),
        readBy: [senderId], // 送信者は既読
        metadata: metadata || {}
      };

      const docRef = await addDoc(collection(db, this.MESSAGES_COLLECTION), messageData);
      
      // セッションの最終更新時間を更新
      await updateDoc(doc(db, this.SESSIONS_COLLECTION, sessionId), {
        updatedAt: serverTimestamp()
      });

      console.log('💬 メッセージ追加完了:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ メッセージ追加エラー:', error);
      throw error;
    }
  }

  /**
   * セッションを終了
   */
  async endSession(sessionId: string, adminId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // セッションを終了
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      batch.update(sessionRef, {
        status: 'completed',
        endedAt: serverTimestamp()
      });

      // 管理者のアクティブチャット数を減少
      const adminRef = doc(db, this.ADMINS_COLLECTION, adminId);
      batch.update(adminRef, {
        activeChats: increment(-1),
        lastActiveAt: serverTimestamp()
      });

      await batch.commit();
      console.log('✅ サポートセッション終了:', sessionId);
    } catch (error) {
      console.error('❌ サポートセッション終了エラー:', error);
      throw error;
    }
  }

  /**
   * セッションメッセージをリアルタイム監視
   */
  subscribeToSessionMessages(
    sessionId: string,
    callback: (messages: AdminSupportMessage[]) => void
  ): () => void {
    const q = query(
      collection(db, this.MESSAGES_COLLECTION),
      where('supportRequestId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages: AdminSupportMessage[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          supportRequestId: data.supportRequestId,
          senderId: data.senderId,
          senderType: data.senderType,
          content: data.content,
          messageType: data.messageType || 'text',
          isPrivate: data.isPrivate || false,
          timestamp: data.timestamp?.toDate() || new Date(),
          readBy: data.readBy || [],
          metadata: data.metadata || {}
        });
      });

      callback(messages);
    });
  }

  /**
   * ユーザーのサポートリクエストを監視
   */
  subscribeToUserRequests(
    userId: string,
    callback: (requests: AdminSupportRequest[]) => void
  ): () => void {
    const q = query(
      collection(db, this.REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const requests: AdminSupportRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          userId: data.userId,
          message: data.message,
          emotion: data.emotion,
          priority: data.priority,
          status: data.status,
          assignedAdminId: data.assignedAdminId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          tags: data.tags || []
        });
      });

      callback(requests);
    });
  }

  /**
   * 管理者ステータスを更新
   */
  async updateAdminStatus(adminId: string, status: AdminProfile['status']): Promise<void> {
    try {
      await updateDoc(doc(db, this.ADMINS_COLLECTION, adminId), {
        status,
        isOnline: status !== 'offline',
        lastActiveAt: serverTimestamp()
      });

      console.log('✅ 管理者ステータス更新:', { adminId, status });
    } catch (error) {
      console.error('❌ 管理者ステータス更新エラー:', error);
      throw error;
    }
  }

  /**
   * セッション満足度評価を追加
   */
  async rateSession(sessionId: string, rating: number, feedback?: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.SESSIONS_COLLECTION, sessionId), {
        userSatisfactionRating: rating,
        userFeedback: feedback,
        updatedAt: serverTimestamp()
      });

      console.log('✅ セッション評価完了:', { sessionId, rating });
    } catch (error) {
      console.error('❌ セッション評価エラー:', error);
      throw error;
    }
  }
}

export const adminSupportService = new AdminSupportService();
