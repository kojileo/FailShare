import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  AIResponse, 
  ConversationMessage, 
  EmotionAnalysis, 
  ConversationState, 
  AIUserProfile,
  EmotionType 
} from '../types';
import { EmotionType as AvatarEmotionType } from '../components/PixelAvatar';
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
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

// Gemini API設定
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

// サイバーパンク風AIアシスタントのプロンプト
const SPECTRA_PROMPT = `あなたはサイバーパンク世界のAIアシスタント「SPECTRA」です。ユーザーの失敗談や愚痴を聞いて、適切なアドバイスや励ましを提供してください。

【キャラクター設定】
- 名前: カノン
- 職業: AIアシスタント
- 性格: 親しみやすく、共感的で、時々皮肉屋
- 口調: カジュアルで親しみやすい、時々サイバーパンクらしい表現を使う

【対応方針】
1. ユーザーの感情に寄り添い、共感を示す
2. 失敗談には建設的なアドバイスを提供
3. 愚痴には適切な励ましと理解を示す
4. 必要に応じて「データ分析（アドバイス）」を提供
5. 匿名性を尊重し、プライバシーを保護する

【応答の特徴】
- 温かみのある口調
- 具体的で実用的なアドバイス
- 時々サイバーパンクらしい表現（「データを分析すると」「システムエラーは誰にでもある」など）
- 感情に応じた適切なトーン

ユーザーの話を聞いて、適切な応答をしてください。`;

class AIAvatarService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * 感情をアバターの表情にマッピング
   */
  private mapEmotionToAvatarExpression(emotion: EmotionType): AvatarEmotionType {
    const emotionMap: { [key in EmotionType]: AvatarEmotionType } = {
      '後悔': 'sad',
      '恥ずかしい': 'worried',
      '悲しい': 'sad',
      '不安': 'worried',
      '怒り': 'angry',
      '混乱': 'confused',
      'その他': 'neutral'
    };
    
    return emotionMap[emotion] || 'neutral';
  }

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
          advice: null,
          sentiment: 'neutral',
          keywords: [],
          avatarExpression: null
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
          advice: aiResponse.advice || null,
          sentiment: 'positive',
          keywords: emotionAnalysis.keywords || [],
          avatarExpression: this.mapEmotionToAvatarExpression(emotionAnalysis.primary)
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
      const responseText = response.text();

      // JSON解析（マークダウンのコードブロックを除去）
      let cleanText = responseText.trim();
      
      // ```json と ``` を除去
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // その他の不要な文字を除去
      cleanText = cleanText.replace(/^```|```$/g, '').trim();
      
      let emotionData;
      try {
        emotionData = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('JSON解析エラー:', parseError);
        console.error('解析対象テキスト:', cleanText);
        
        // フォールバック: テキストから感情を推測
        const lowerText = text.toLowerCase();
        if (lowerText.includes('後悔') || lowerText.includes('失敗')) {
          emotionData = { primary: '後悔', confidence: 0.7, intensity: 0.6, keywords: [] };
        } else if (lowerText.includes('恥ずかしい') || lowerText.includes('恥')) {
          emotionData = { primary: '恥ずかしい', confidence: 0.7, intensity: 0.6, keywords: [] };
        } else if (lowerText.includes('悲しい') || lowerText.includes('泣')) {
          emotionData = { primary: '悲しい', confidence: 0.7, intensity: 0.6, keywords: [] };
        } else if (lowerText.includes('不安') || lowerText.includes('心配')) {
          emotionData = { primary: '不安', confidence: 0.7, intensity: 0.6, keywords: [] };
        } else if (lowerText.includes('怒') || lowerText.includes('イライラ')) {
          emotionData = { primary: '怒り', confidence: 0.7, intensity: 0.6, keywords: [] };
        } else if (lowerText.includes('混乱') || lowerText.includes('分からない')) {
          emotionData = { primary: '混乱', confidence: 0.7, intensity: 0.6, keywords: [] };
        } else {
          emotionData = { primary: 'その他', confidence: 0.5, intensity: 0.5, keywords: [] };
        }
      }
      
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

      const prompt = `${SPECTRA_PROMPT}

【現在の状況】
お客様の感情: ${emotionAnalysis.primary} (強度: ${emotionAnalysis.intensity})
お客様のメッセージ: "${userMessage}"
${historyContext}${profileContext}

上記の情報を基に、AIアシスタント「SPECTRA」として適切な応答をしてください。
応答は親しみやすく、共感的で、必要に応じてアドバイスを含めてください。

応答例：
「お疲れ様です。その気持ち、よく分かります。システムエラーは誰にでもあることですし、そこから学べることがきっとあります。データを分析すると、失敗は成長の機会でもあります。気分転換をしてみてはいかがでしょうか？」

応答してください：`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiMessage = response.text();

      // アドバイス部分を抽出
      const advice = this.extractAdvice(aiMessage);
      
      // メッセージ本文からアドバイス部分を除去
      let cleanMessage = aiMessage;
      if (advice) {
        // アドバイス部分をメッセージ本文から除去
        cleanMessage = aiMessage.replace(advice, '').trim();
        // 余分な句読点や空白を整理
        cleanMessage = cleanMessage.replace(/[。、\s]+$/, '');
      }

      return {
        message: cleanMessage,
        emotion: emotionAnalysis.primary,
        advice: advice
      };

    } catch (error) {
      console.error('AI応答生成エラー:', error);
      // フォールバック応答
      return {
        message: '申し訳ありません。システムに一時的なエラーが発生しています。お疲れ様です。',
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
    // アドバイスキーワードを検索
    const adviceKeywords = ['アドバイス', 'おすすめ', '提案', 'どうですか', 'してみて', '気分転換', '試してみて'];
    
    // メッセージにアドバイスキーワードが含まれているかチェック
    const hasAdvice = adviceKeywords.some(keyword => message.includes(keyword));
    
    if (hasAdvice) {
      // アドバイス部分を抽出（最後の文またはアドバイスキーワード以降の部分）
      const sentences = message.split(/[。！？]/);
      const lastSentence = sentences[sentences.length - 1].trim();
      
      // 最後の文がアドバイスっぽい場合（短く、キーワードを含む）
      if (lastSentence.length < 50 && adviceKeywords.some(keyword => lastSentence.includes(keyword))) {
        return lastSentence;
      }
      
      // アドバイスキーワード以降の部分を抽出
      for (const keyword of adviceKeywords) {
        const index = message.indexOf(keyword);
        if (index !== -1) {
          const advicePart = message.substring(index).trim();
          if (advicePart.length > 0 && advicePart.length < 100) {
            return advicePart;
          }
        }
      }
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
