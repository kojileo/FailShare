import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  limit, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  FriendRequest, 
  FriendRecommendation, 
  User, 
  FriendService 
} from '../types';
import { realtimeManager } from '../utils/realtimeManager';

export class FriendServiceImpl implements FriendService {
  
  // フレンド関係管理
  async sendFriendRequest(fromUserId: string, toUserId: string, message?: string): Promise<void> {
    try {
      // 自分自身へのリクエストを防ぐ
      if (fromUserId === toUserId) {
        throw new Error('自分自身にフレンドリクエストを送信できません');
      }

      // 既存のリクエストをチェック
      const existingRequest = await this.hasPendingRequest(fromUserId, toUserId);
      if (existingRequest) {
        throw new Error('既にフレンドリクエストを送信済みです');
      }

      // 既にフレンドかチェック
      const areFriends = await this.areFriends(fromUserId, toUserId);
      if (areFriends) {
        throw new Error('既にフレンドです');
      }

      // フレンドリクエストを作成
      const requestData = {
        fromUserId,
        toUserId,
        message: message || '',
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'friendRequests'), requestData);
    } catch (error) {
      console.error('フレンドリクエスト送信エラー:', error);
      throw error;
    }
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // リクエストを取得
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('フレンドリクエストが見つかりません');
      }
      
      const requestData = requestDoc.data() as FriendRequest;
      
      if (requestData.status !== 'pending') {
        throw new Error('このリクエストは既に処理済みです');
      }
      
      // リクエストを承認済みに更新
      batch.update(requestRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });
      
      // 双方向のフレンドシップを作成（適切なドキュメントIDを指定）
      const friendship1Id = `${requestData.fromUserId}_${requestData.toUserId}`;
      const friendship2Id = `${requestData.toUserId}_${requestData.fromUserId}`;
      
      const friendship1 = {
        userId: requestData.fromUserId,
        friendId: requestData.toUserId,
        status: 'accepted',
        createdAt: serverTimestamp(),
        acceptedAt: serverTimestamp()
      };
      
      const friendship2 = {
        userId: requestData.toUserId,
        friendId: requestData.fromUserId,
        status: 'accepted',
        createdAt: serverTimestamp(),
        acceptedAt: serverTimestamp()
      };
      
      batch.set(doc(db, 'friendships', friendship1Id), friendship1);
      batch.set(doc(db, 'friendships', friendship2Id), friendship2);
      
      // ユーザー統計を更新（増分処理）
      const user1Ref = doc(db, 'anonymousUsers', requestData.fromUserId);
      const user2Ref = doc(db, 'anonymousUsers', requestData.toUserId);
      
      batch.update(user1Ref, {
        'stats.friendsCount': increment(1)
      });
      
      batch.update(user2Ref, {
        'stats.friendsCount': increment(1)
      });
      
      await batch.commit();
    } catch (error) {
      console.error('フレンドリクエスト承認エラー:', error);
      throw error;
    }
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('フレンドリクエスト拒否エラー:', error);
      throw error;
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // 双方向のフレンドシップを削除（適切なドキュメントIDを使用）
      const friendship1Id = `${userId}_${friendId}`;
      const friendship2Id = `${friendId}_${userId}`;
      
      const friendship1Ref = doc(db, 'friendships', friendship1Id);
      const friendship2Ref = doc(db, 'friendships', friendship2Id);
      
      batch.delete(friendship1Ref);
      batch.delete(friendship2Ref);
      
      // ユーザー統計を更新（減分処理）
      const user1Ref = doc(db, 'anonymousUsers', userId);
      const user2Ref = doc(db, 'anonymousUsers', friendId);
      
      batch.update(user1Ref, {
        'stats.friendsCount': increment(-1)
      });
      
      batch.update(user2Ref, {
        'stats.friendsCount': increment(-1)
      });
      
      await batch.commit();
    } catch (error) {
      console.error('フレンド削除エラー:', error);
      throw error;
    }
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    try {
      // 既存のフレンドシップを削除
      await this.removeFriend(userId, blockedUserId);
      
      // ブロック関係を作成
      const blockData = {
        userId,
        blockedUserId,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'userBlocks'), blockData);
    } catch (error) {
      console.error('ユーザーブロックエラー:', error);
      throw error;
    }
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    try {
      const blocksQuery = query(
        collection(db, 'userBlocks'),
        where('userId', '==', userId),
        where('blockedUserId', '==', blockedUserId)
      );
      
      const blocksSnapshot = await getDocs(blocksQuery);
      const batch = writeBatch(db);
      
      blocksSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('ユーザーブロック解除エラー:', error);
      throw error;
    }
  }

  // フレンド情報取得
  async getFriends(userId: string): Promise<User[]> {
    try {
      // ユーザーIDで始まるフレンドシップを検索
      const friendshipsQuery = query(
        collection(db, 'friendships'),
        where('userId', '==', userId),
        where('status', '==', 'accepted')
      );
      
      const friendshipsSnapshot = await getDocs(friendshipsQuery);
      const friendIds = friendshipsSnapshot.docs.map(doc => doc.data().friendId);
      
      if (friendIds.length === 0) {
        return [];
      }
      
      // フレンドのユーザー情報を取得
      const users: User[] = [];
      for (const friendId of friendIds) {
        try {
          const userDoc = await getDoc(doc(db, 'anonymousUsers', friendId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            users.push({
              id: userDoc.id,
              displayName: userData.displayName || '匿名ユーザー',
              avatar: userData.avatar || '',
              joinedAt: userData.joinedAt?.toDate() || new Date(),
              lastActive: userData.lastActive?.toDate() || new Date(),
              stats: userData.stats || {
                totalPosts: 0,
                totalComments: 0,
                helpfulVotes: 0,
                learningPoints: 0,
                totalLikes: 0,
                receivedLikes: 0,
                friendsCount: 0,
                communitiesCount: 0
              }
            });
          }
        } catch (userError) {
          console.error(`ユーザー ${friendId} の取得エラー:`, userError);
          // 個別のユーザー取得エラーは無視して続行
        }
      }
      
      return users;
    } catch (error) {
      console.error('フレンド取得エラー:', error);
      // エラーが発生した場合は空配列を返す
      return [];
    }
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      // インデックスが不要な単純なクエリに変更
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('toUserId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FriendRequest[];
      
      // クライアント側でソート
      return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('フレンドリクエスト取得エラー:', error);
      // エラーが発生した場合は空配列を返す
      return [];
    }
  }

  async getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      // インデックスが不要な単純なクエリに変更
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FriendRequest[];
      
      // クライアント側でソート
      return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('送信済みフレンドリクエスト取得エラー:', error);
      // エラーが発生した場合は空配列を返す
      return [];
    }
  }

  async getBlockedUsers(userId: string): Promise<User[]> {
    try {
      const blocksQuery = query(
        collection(db, 'userBlocks'),
        where('userId', '==', userId)
      );
      
      const blocksSnapshot = await getDocs(blocksQuery);
      const blockedUserIds = blocksSnapshot.docs.map(doc => doc.data().blockedUserId);
      
      if (blockedUserIds.length === 0) {
        return [];
      }
      
      // ブロックされたユーザーの情報を取得
      const users: User[] = [];
      for (const blockedUserId of blockedUserIds) {
        try {
          const userDoc = await getDoc(doc(db, 'anonymousUsers', blockedUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            users.push({
              id: userDoc.id,
              displayName: userData.displayName || '匿名ユーザー',
              avatar: userData.avatar || '',
              joinedAt: userData.joinedAt?.toDate() || new Date(),
              lastActive: userData.lastActive?.toDate() || new Date(),
              stats: userData.stats || {
                totalPosts: 0,
                totalComments: 0,
                helpfulVotes: 0,
                learningPoints: 0,
                totalLikes: 0,
                receivedLikes: 0,
                friendsCount: 0,
                communitiesCount: 0
              }
            });
          }
        } catch (userError) {
          console.error(`ブロックユーザー ${blockedUserId} の取得エラー:`, userError);
          // 個別のユーザー取得エラーは無視して続行
        }
      }
      
      return users;
    } catch (error) {
      console.error('ブロックユーザー取得エラー:', error);
      // エラーが発生した場合は空配列を返す
      return [];
    }
  }

  async getFriendRecommendations(userId: string, limitCount: number = 10): Promise<FriendRecommendation[]> {
    try {
      // 現在のフレンドを取得
      const currentFriends = await this.getFriends(userId);
      const currentFriendIds = currentFriends.map(friend => friend.id);
      
      // ブロックされたユーザーを取得
      const blockedUsers = await this.getBlockedUsers(userId);
      const blockedUserIds = blockedUsers.map(user => user.id);
      
      // 除外するユーザーIDリスト
      const excludeIds = [...currentFriendIds, ...blockedUserIds, userId];
      
      // 効率的なクエリでユーザーを取得（制限付き）
      const usersQuery = query(
        collection(db, 'anonymousUsers'),
        limit(50) // パフォーマンスのため制限
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User))
        .filter(user => !excludeIds.includes(user.id))
        .filter(user => user.displayName && user.displayName !== '匿名ユーザー'); // 有効なユーザーのみ
      
      // 推薦スコアを計算
      const recommendations: FriendRecommendation[] = allUsers.map(user => {
        // 簡単な推薦アルゴリズム（実際の実装ではより高度なアルゴリズムを使用）
        const score = Math.random() * 100; // 仮のスコア計算
        
        return {
          userId: user.id,
          displayName: user.displayName || '匿名ユーザー',
          avatar: user.avatar || '',
          commonInterests: [], // 実際の実装では共通の興味を計算
          mutualFriends: 0, // 実際の実装では共通のフレンド数を計算
          score
        };
      });
      
      // スコアでソートして上位を返す
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limitCount);
    } catch (error) {
      console.error('フレンド推薦取得エラー:', error);
      // エラーが発生した場合は空配列を返す
      return [];
    }
  }

  // フレンド関係確認
  async areFriends(userId: string, friendId: string): Promise<boolean> {
    try {
      const friendshipId = `${userId}_${friendId}`;
      const friendshipDoc = await getDoc(doc(db, 'friendships', friendshipId));
      return friendshipDoc.exists() && friendshipDoc.data().status === 'accepted';
    } catch (error) {
      console.error('フレンド関係確認エラー:', error);
      return false;
    }
  }

  async hasPendingRequest(fromUserId: string, toUserId: string): Promise<boolean> {
    try {
      const requestQuery = query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', fromUserId),
        where('toUserId', '==', toUserId),
        where('status', '==', 'pending')
      );
      
      const requestSnapshot = await getDocs(requestQuery);
      return !requestSnapshot.empty;
    } catch (error) {
      console.error('フレンドリクエスト確認エラー:', error);
      return false;
    }
  }

  async isBlocked(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      const blockQuery = query(
        collection(db, 'userBlocks'),
        where('userId', '==', userId),
        where('blockedUserId', '==', blockedUserId)
      );
      
      const blockSnapshot = await getDocs(blockQuery);
      return !blockSnapshot.empty;
    } catch (error) {
      console.error('ブロック状態確認エラー:', error);
      return false;
    }
  }

  // リアルタイム更新
  subscribeToFriends(userId: string, callback: (friends: User[]) => void): () => void {
    // リスナーキーを生成
    const listenerKey = `friends:${userId}`;
    
    const friendshipsQuery = query(
      collection(db, 'friendships'),
      where('userId', '==', userId),
      where('status', '==', 'accepted')
    );
    
    const unsubscribe = onSnapshot(friendshipsQuery, async (snapshot) => {
      try {
        const friendIds = snapshot.docs.map(doc => doc.data().friendId);
        
        if (friendIds.length === 0) {
          callback([]);
          return;
        }
        
        // フレンドのユーザー情報を取得
        const users: User[] = [];
        for (const friendId of friendIds) {
          const userDoc = await getDoc(doc(db, 'anonymousUsers', friendId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            users.push({
              id: userDoc.id,
              displayName: userData.displayName || '匿名ユーザー',
              avatar: userData.avatar || '',
              joinedAt: userData.joinedAt?.toDate() || new Date(),
              lastActive: userData.lastActive?.toDate() || new Date(),
              stats: userData.stats || {
                totalPosts: 0,
                totalComments: 0,
                helpfulVotes: 0,
                learningPoints: 0,
                totalLikes: 0,
                receivedLikes: 0,
                friendsCount: 0,
                communitiesCount: 0
              }
            });
          }
        }
        
        callback(users);
      } catch (error) {
        console.error('フレンドリアルタイム更新エラー:', error);
        callback([]);
      }
    });
    
    // リスナーを管理システムに登録
    const success = realtimeManager.registerListener(listenerKey, unsubscribe, 'friends');
    
    // カスタムアンサブスクライブ関数を返す
    return () => {
      if (success) {
        realtimeManager.removeListener(listenerKey);
      }
    };
  }

  subscribeToFriendRequests(userId: string, callback: (requests: FriendRequest[]) => void): () => void {
    // リスナーキーを生成
    const listenerKey = `friendRequests:${userId}`;
    
    const requestsQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FriendRequest[];
      
      // クライアント側でソート
      const sortedRequests = requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(sortedRequests);
    });
    
    // リスナーを管理システムに登録
    const success = realtimeManager.registerListener(listenerKey, unsubscribe, 'friendRequests');
    
    // カスタムアンサブスクライブ関数を返す
    return () => {
      if (success) {
        realtimeManager.removeListener(listenerKey);
      }
    };
  }
}

// シングルトンインスタンスをエクスポート
export const friendService = new FriendServiceImpl();
