import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatService, Chat, ChatMessage, ChatPreview } from '../types';

class ChatServiceImpl implements ChatService {
  // チャット管理
  async createChat(participants: string[]): Promise<string> {
    try {
      const chatData = {
        participants: participants.sort(), // 一意性のためソート
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCount: participants.reduce((acc, userId) => {
          acc[userId] = 0;
          return acc;
        }, {} as { [userId: string]: number })
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      return docRef.id;
    } catch (error) {
      console.error('チャット作成エラー:', error);
      throw new Error('チャットの作成に失敗しました');
    }
  }

  async getChat(chatId: string): Promise<Chat | null> {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) {
        return null;
      }

      const data = chatDoc.data();
      return {
        id: chatDoc.id,
        participants: data.participants,
        lastMessage: data.lastMessage ? this.convertFirestoreMessage(data.lastMessage) : undefined,
        lastMessageAt: data.lastMessageAt?.toDate(),
        unreadCount: data.unreadCount || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('チャット取得エラー:', error);
      throw new Error('チャットの取得に失敗しました');
    }
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(chatsQuery);
      const chats: Chat[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage ? this.convertFirestoreMessage(data.lastMessage) : undefined,
          lastMessageAt: data.lastMessageAt?.toDate(),
          unreadCount: data.unreadCount || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });

      return chats;
    } catch (error) {
      console.error('ユーザーチャット取得エラー:', error);
      throw new Error('チャット一覧の取得に失敗しました');
    }
  }

  async getChatPreview(userId: string): Promise<ChatPreview[]> {
    try {
      const chats = await this.getUserChats(userId);
      const previews: ChatPreview[] = [];

      for (const chat of chats) {
        // 相手のユーザーIDを取得
        const friendId = chat.participants.find(id => id !== userId);
        if (!friendId) continue;

        // 相手のユーザー情報を取得
        const userDoc = await getDoc(doc(db, 'users', friendId));
        if (!userDoc.exists()) continue;

        const userData = userDoc.data();
        const unreadCount = chat.unreadCount[userId] || 0;

        previews.push({
          chatId: chat.id,
          friendId: friendId,
          friendName: userData.displayName || '不明なユーザー',
          friendAvatar: userData.avatar || '',
          lastMessage: chat.lastMessage?.content,
          lastMessageAt: chat.lastMessageAt,
          unreadCount: unreadCount,
          isOnline: false // TODO: オンライン状態の実装
        });
      }

      return previews.sort((a, b) => {
        const aTime = a.lastMessageAt?.getTime() || 0;
        const bTime = b.lastMessageAt?.getTime() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('チャットプレビュー取得エラー:', error);
      throw new Error('チャット一覧の取得に失敗しました');
    }
  }

  // メッセージ管理
  async sendMessage(chatId: string, senderId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<string> {
    try {
      const batch = writeBatch(db);

      // メッセージを作成
      const messageData = {
        chatId,
        senderId,
        content,
        messageType,
        createdAt: serverTimestamp(),
        isRead: false,
        isEdited: false
      };

      const messageRef = doc(collection(db, 'messages'));
      batch.set(messageRef, messageData);

      // チャットの最終メッセージ情報を更新
      const chatRef = doc(db, 'chats', chatId);
      const lastMessage = {
        id: messageRef.id,
        chatId,
        senderId,
        content,
        messageType,
        createdAt: serverTimestamp(),
        isRead: false,
        isEdited: false
      };

      batch.update(chatRef, {
        lastMessage,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [`unreadCount.${senderId}`]: 0 // 送信者の未読数をリセット
      });

      // 他の参加者の未読数を増やす
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        chatData.participants.forEach((participantId: string) => {
          if (participantId !== senderId) {
            batch.update(chatRef, {
              [`unreadCount.${participantId}`]: (chatData.unreadCount?.[participantId] || 0) + 1
            });
          }
        });
      }

      await batch.commit();
      return messageRef.id;
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      throw new Error('メッセージの送信に失敗しました');
    }
  }

  async editMessage(messageId: string, content: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        content,
        isEdited: true,
        editedAt: serverTimestamp()
      });

      // チャットの最終メッセージも更新
      const messageDoc = await getDoc(messageRef);
      if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        const chatRef = doc(db, 'chats', messageData.chatId);
        await updateDoc(chatRef, {
          'lastMessage.content': content,
          'lastMessage.isEdited': true,
          'lastMessage.editedAt': serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('メッセージ編集エラー:', error);
      throw new Error('メッセージの編集に失敗しました');
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        
        // メッセージを削除
        await deleteDoc(messageRef);

        // チャットの最終メッセージを更新（必要に応じて）
        const chatRef = doc(db, 'chats', messageData.chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (chatDoc.exists() && chatDoc.data().lastMessage?.id === messageId) {
          // 最新のメッセージを取得して更新
          const messagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', messageData.chatId),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          if (!messagesSnapshot.empty) {
            const latestMessage = messagesSnapshot.docs[0];
            const latestData = latestMessage.data();
            
            await updateDoc(chatRef, {
              lastMessage: {
                id: latestMessage.id,
                chatId: latestData.chatId,
                senderId: latestData.senderId,
                content: latestData.content,
                messageType: latestData.messageType,
                createdAt: latestData.createdAt,
                isRead: latestData.isRead,
                isEdited: latestData.isEdited
              },
              lastMessageAt: latestData.createdAt,
              updatedAt: serverTimestamp()
            });
          } else {
            // メッセージがない場合は最終メッセージをクリア
            await updateDoc(chatRef, {
              lastMessage: null,
              lastMessageAt: null,
              updatedAt: serverTimestamp()
            });
          }
        }
      }
    } catch (error) {
      console.error('メッセージ削除エラー:', error);
      throw new Error('メッセージの削除に失敗しました');
    }
  }

  async markMessageAsRead(messageId: string, _userId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        isRead: true
      });
    } catch (error) {
      console.error('メッセージ既読エラー:', error);
      throw new Error('メッセージの既読処理に失敗しました');
    }
  }

  async markChatAsRead(chatId: string, userId: string): Promise<void> {
    try {
      // チャットの未読数のみリセット（シンプルな方法）
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('チャット既読エラー:', error);
      // エラーを無視して続行（ユーザー体験を優先）
      console.warn('既読処理に失敗しましたが、チャット機能は継続します');
    }
  }

  // メッセージ取得
  async getChatMessages(chatId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(messagesQuery);
      const messages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          chatId: data.chatId,
          senderId: data.senderId,
          content: data.content,
          messageType: data.messageType || 'text',
          createdAt: data.createdAt?.toDate() || new Date(),
          isRead: data.isRead || false,
          isEdited: data.isEdited || false,
          editedAt: data.editedAt?.toDate()
        });
      });

      return messages.reverse(); // 時系列順に並び替え
    } catch (error) {
      console.error('チャットメッセージ取得エラー:', error);
      throw new Error('メッセージの取得に失敗しました');
    }
  }

  async getUnreadMessages(_userId: string): Promise<ChatMessage[]> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('senderId', '!=', _userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(messagesQuery);
      const messages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          chatId: data.chatId,
          senderId: data.senderId,
          content: data.content,
          messageType: data.messageType || 'text',
          createdAt: data.createdAt?.toDate() || new Date(),
          isRead: data.isRead || false,
          isEdited: data.isEdited || false,
          editedAt: data.editedAt?.toDate()
        });
      });

      return messages;
    } catch (error) {
      console.error('未読メッセージ取得エラー:', error);
      throw new Error('未読メッセージの取得に失敗しました');
    }
  }

  // リアルタイム更新
  subscribeToChat(chatId: string, callback: (chat: Chat) => void): () => void {
    const chatRef = doc(db, 'chats', chatId);
    
    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const chat: Chat = {
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage ? this.convertFirestoreMessage(data.lastMessage) : undefined,
          lastMessageAt: data.lastMessageAt?.toDate(),
          unreadCount: data.unreadCount || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        callback(chat);
      }
    });

    return unsubscribe;
  }

  subscribeToChatMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          chatId: data.chatId,
          senderId: data.senderId,
          content: data.content,
          messageType: data.messageType || 'text',
          createdAt: data.createdAt?.toDate() || new Date(),
          isRead: data.isRead || false,
          isEdited: data.isEdited || false,
          editedAt: data.editedAt?.toDate()
        });
      });
      callback(messages);
    });

    return unsubscribe;
  }

  subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const chats: Chat[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage ? this.convertFirestoreMessage(data.lastMessage) : undefined,
          lastMessageAt: data.lastMessageAt?.toDate(),
          unreadCount: data.unreadCount || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      callback(chats);
    });

    return unsubscribe;
  }

  // ヘルパーメソッド
  private convertFirestoreMessage(firestoreMessage: { id: string; chatId: string; senderId: string; content: string; messageType?: string; createdAt?: { toDate: () => Date }; isRead?: boolean; isEdited?: boolean; editedAt?: { toDate: () => Date } }): ChatMessage {
    return {
      id: firestoreMessage.id,
      chatId: firestoreMessage.chatId,
      senderId: firestoreMessage.senderId,
      content: firestoreMessage.content,
             messageType: (firestoreMessage.messageType as 'text' | 'image' | 'file') || 'text',
      createdAt: firestoreMessage.createdAt?.toDate() || new Date(),
      isRead: firestoreMessage.isRead || false,
      isEdited: firestoreMessage.isEdited || false,
      editedAt: firestoreMessage.editedAt?.toDate()
    };
  }
}

export const chatService: ChatService = new ChatServiceImpl();
