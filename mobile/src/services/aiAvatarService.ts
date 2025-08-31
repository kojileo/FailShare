import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  AIResponse, 
  ConversationMessage, 
  EmotionAnalysis, 
  ConversationState, 
  AIUserProfile,
  EmotionType 
} from '../types';
import { db } from './firebase';
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
  deleteDoc,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

// Gemini API設定
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

// サイバーパンク風バーテンダーAIのプロンプト
const BARTENDER_PROMPT = `あなたはサイバーパンク世界のバーで働く親しみやすいバーテンダー「ジル」です。お客様の失敗談や愚痴を聞いて、適切なアドバイスや励ましを提供してください。

【キャラクター設定】
- 名前: ジル
- 職業: バーテンダー
- 性格: 親しみやすく、共感的で、時々皮肉屋
- 口調: カジュアルで親しみやすい、時々バーテンダーらしい表現を使う

【対応方針】
1. お客様の感情に寄り添い、共感を示す
2. 失敗談には建設的なアドバイスを提供
3. 愚痴には適切な励ましと理解を示す
4. 必要に応じて「カクテル（アドバイス）」を提供
5. 匿名性を尊重し、プライバシーを保護する

【応答の特徴】
- 温かみのある口調
- 具体的で実用的なアドバイス
- 時々バーテンダーらしい表現（「お疲れ様」「一杯どうですか？」など）
- 感情に応じた適切なトーン

お客様の話を聞いて、適切な応答をしてください。`;

class AIAvatarService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * AIアバターとの対話を開始
   */
  async startConversation(userId: string): Promise<string> {
    try {
      const conversationData = {
        userId,
        status: 'active',
        lastActivity: serverTimestamp(),
        messageCount: 0,
        averageEmotion: 'その他' as EmotionType,
        topics: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'aiConversations'), conversationData);
      return docRef.id;
    } catch (error) {
      console.error('対話開始エラー:', error);
      throw new Error('対話を開始できませんでした');
    }
  }

  /**
   * メッセージを送信してAI応答を取得
   */
  async sendMessage(conversationId: string, userId: string, message: string): Promise<AIResponse> {
    try {
      // 1. ユーザーメッセージを保存
      const userMessage: ConversationMessage = {
        id: '',
        conversationId,
        senderId: userId,
        senderType: 'user',
        content: message,
        timestamp: new Date(),
        metadata: {
          sentiment: 'neutral',
          keywords: []
        }
      };

      const userMessageRef = await addDoc(collection(db, 'aiMessages'), userMessage);
      userMessage.id = userMessageRef.id;

      // 2. 感情分析
      const emotionAnalysis = await this.analyzeEmotion(message);

      // 3. 対話履歴を取得
      const conversationHistory = await this.getConversationHistory(conversationId);

      // 4. ユーザープロファイルを取得
      const userProfile = await this.getUserProfile(userId);

      // 5. AI応答を生成
      const aiResponse = await this.generateAIResponse(
        message, 
        emotionAnalysis, 
        conversationHistory, 
        userProfile
      );

      // 6. AI応答を保存
      const aiMessage: ConversationMessage = {
        id: '',
        conversationId,
        senderId: 'ai',
        senderType: 'ai',
        content: aiResponse.message,
        emotion: aiResponse.emotion,
        timestamp: new Date(),
        metadata: {
          advice: aiResponse.advice,
          sentiment: 'positive',
          keywords: emotionAnalysis.keywords
        }
      };

      const aiMessageRef = await addDoc(collection(db, 'aiMessages'), aiMessage);
      aiMessage.id = aiMessageRef.id;

      // 7. 対話状態を更新
      await this.updateConversationState(conversationId, emotionAnalysis);

      return {
        id: aiMessage.id,
        conversationId,
        message: aiResponse.message,
        emotion: aiResponse.emotion,
        advice: aiResponse.advice,
        timestamp: new Date(),
        isTyping: false
      };

    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      throw new Error('メッセージの送信に失敗しました');
    }
  }

  /**
   * 対話履歴を取得
   */
  async getConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
    try {
      const messagesQuery = query(
        collection(db, 'aiMessages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );

      const querySnapshot = await getDocs(messagesQuery);
      const messages: ConversationMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderType: data.senderType,
          content: data.content,
          emotion: data.emotion,
          timestamp: data.timestamp?.toDate() || new Date(),
          metadata: data.metadata
        });
      });

      return messages;
    } catch (error) {
      console.error('対話履歴取得エラー:', error);
      return [];
    }
  }

  /**
   * 対話を終了
   */
  async endConversation(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(db, 'aiConversations', conversationId);
      await updateDoc(conversationRef, {
        status: 'ended',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('対話終了エラー:', error);
      throw new Error('対話を終了できませんでした');
    }
  }

  /**
   * 感情分析
   */
  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    try {
      const prompt = `
以下のテキストの感情を分析してください。

テキスト: "${text}"

以下の感情から最も適切なものを選択し、信頼度（0-1）と強度（0-1）を提供してください：
- 後悔
- 恥ずかしい
- 悲しい
- 不安
- 怒り
- 混乱
- その他

JSON形式で回答してください：
{
  "primary": "感情名",
  "confidence": 0.8,
  "intensity": 0.7,
  "keywords": ["キーワード1", "キーワード2"]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSON解析
      const emotionData = JSON.parse(text);
      
      return {
        primary: emotionData.primary as EmotionType,
        confidence: emotionData.confidence,
        intensity: emotionData.intensity,
        keywords: emotionData.keywords || []
      };
    } catch (error) {
      console.error('感情分析エラー:', error);
      // デフォルト値を返す
      return {
        primary: 'その他',
        confidence: 0.5,
        intensity: 0.5,
        keywords: []
      };
    }
  }

  /**
   * ユーザープロファイルを取得
   */
  async getUserProfile(userId: string): Promise<AIUserProfile | null> {
    try {
      const profileQuery = query(
        collection(db, 'aiUserProfiles'),
        where('userId', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(profileQuery);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        userId: data.userId,
        preferredTopics: data.preferredTopics || [],
        communicationStyle: data.communicationStyle || 'friendly',
        emotionalTendencies: data.emotionalTendencies || [],
        conversationHistory: data.conversationHistory || [],
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    } catch (error) {
      console.error('ユーザープロファイル取得エラー:', error);
      return null;
    }
  }

  /**
   * ユーザープロファイルを更新
   */
  async updateUserProfile(userId: string, profile: AIUserProfile): Promise<void> {
    try {
      const profileQuery = query(
        collection(db, 'aiUserProfiles'),
        where('userId', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(profileQuery);
      
      if (querySnapshot.empty) {
        // 新規作成
        await addDoc(collection(db, 'aiUserProfiles'), {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // 更新
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...profile,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('ユーザープロファイル更新エラー:', error);
      throw new Error('プロファイルの更新に失敗しました');
    }
  }

  /**
   * AI応答を生成
   */
  private async generateAIResponse(
    userMessage: string,
    emotionAnalysis: EmotionAnalysis,
    conversationHistory: ConversationMessage[],
    userProfile: AIUserProfile | null
  ): Promise<{ message: string; emotion: EmotionType; advice?: string }> {
    try {
      // 対話履歴をプロンプトに含める
      let historyContext = '';
      if (conversationHistory.length > 0) {
        historyContext = '\n\n【対話履歴】\n';
        conversationHistory.slice(-5).forEach(msg => {
          const sender = msg.senderType === 'user' ? 'お客様' : 'ジル';
          historyContext += `${sender}: ${msg.content}\n`;
        });
      }

      // ユーザープロファイル情報
      let profileContext = '';
      if (userProfile) {
        profileContext = `\n\n【お客様の傾向】\n`;
        profileContext += `- 好みの話題: ${userProfile.preferredTopics.join(', ')}\n`;
        profileContext += `- コミュニケーションスタイル: ${userProfile.communicationStyle}\n`;
        profileContext += `- 感情の傾向: ${userProfile.emotionalTendencies.join(', ')}\n`;
      }

      const prompt = `${BARTENDER_PROMPT}

【現在の状況】
お客様の感情: ${emotionAnalysis.primary} (強度: ${emotionAnalysis.intensity})
お客様のメッセージ: "${userMessage}"
${historyContext}${profileContext}

上記の情報を基に、バーテンダー「ジル」として適切な応答をしてください。
応答は親しみやすく、共感的で、必要に応じてアドバイスを含めてください。

応答例：
「お疲れ様です。その気持ち、よく分かります。失敗は誰にでもあることですし、そこから学べることがきっとあります。一杯どうですか？気分転換になるかもしれませんよ。」

応答してください：`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiMessage = response.text();

      return {
        message: aiMessage,
        emotion: emotionAnalysis.primary,
        advice: this.extractAdvice(aiMessage)
      };

    } catch (error) {
      console.error('AI応答生成エラー:', error);
      // フォールバック応答
      return {
        message: '申し訳ありません。少し時間をいただけますか？お疲れ様です。',
        emotion: 'その他',
        advice: '少し休憩を取って、気分転換をしてみてください。'
      };
    }
  }

  /**
   * 対話状態を更新
   */
  private async updateConversationState(conversationId: string, emotionAnalysis: EmotionAnalysis): Promise<void> {
    try {
      const conversationRef = doc(db, 'aiConversations', conversationId);
      await updateDoc(conversationRef, {
        lastActivity: serverTimestamp(),
        messageCount: await this.getMessageCount(conversationId),
        averageEmotion: emotionAnalysis.primary,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('対話状態更新エラー:', error);
    }
  }

  /**
   * メッセージ数を取得
   */
  private async getMessageCount(conversationId: string): Promise<number> {
    try {
      const messagesQuery = query(
        collection(db, 'aiMessages'),
        where('conversationId', '==', conversationId)
      );

      const querySnapshot = await getDocs(messagesQuery);
      return querySnapshot.size;
    } catch (error) {
      console.error('メッセージ数取得エラー:', error);
      return 0;
    }
  }

  /**
   * アドバイスを抽出
   */
  private extractAdvice(message: string): string | undefined {
    // 簡単なアドバイス抽出ロジック
    const adviceKeywords = ['アドバイス', 'おすすめ', '提案', 'どうですか', 'してみて'];
    const hasAdvice = adviceKeywords.some(keyword => message.includes(keyword));
    
    if (hasAdvice) {
      return message;
    }
    
    return undefined;
  }

  /**
   * リアルタイム対話監視
   */
  subscribeToConversation(conversationId: string, callback: (message: ConversationMessage) => void): () => void {
    const messagesQuery = query(
      collection(db, 'aiMessages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const message: ConversationMessage = {
            id: change.doc.id,
            conversationId: data.conversationId,
            senderId: data.senderId,
            senderType: data.senderType,
            content: data.content,
            emotion: data.emotion,
            timestamp: data.timestamp?.toDate() || new Date(),
            metadata: data.metadata
          };
          callback(message);
        }
      });
    });
  }

  /**
   * 対話状態のリアルタイム監視
   */
  subscribeToConversationState(conversationId: string, callback: (state: ConversationState) => void): () => void {
    const conversationRef = doc(db, 'aiConversations', conversationId);

    return onSnapshot(conversationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const state: ConversationState = {
          id: doc.id,
          userId: data.userId,
          status: data.status,
          lastActivity: data.lastActivity?.toDate() || new Date(),
          messageCount: data.messageCount || 0,
          averageEmotion: data.averageEmotion || 'その他',
          topics: data.topics || []
        };
        callback(state);
      }
    });
  }
}

export const aiAvatarService = new AIAvatarService();
