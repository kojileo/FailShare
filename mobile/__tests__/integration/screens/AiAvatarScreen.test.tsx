import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AiAvatarScreen from '../../../src/screens/AiAvatarScreen';
import { useAIAvatarStore } from '../../../src/stores/aiAvatarStore';

// ストアのモック
jest.mock('../../../src/stores/aiAvatarStore', () => ({
  useAIAvatarStore: jest.fn()
}));

// ナビゲーションのモック
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack
  })
}));

const mockUseAIAvatarStore = useAIAvatarStore as jest.MockedFunction<typeof useAIAvatarStore>;

describe('AiAvatarScreen', () => {
  const mockStartConversation = jest.fn();
  const mockSendMessage = jest.fn();
  const mockEndConversation = jest.fn();
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: null,
      conversationMessages: [],
      userProfile: null,
      isLoading: false,
      isTyping: false,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });
  });

  it('レンダリングされる', () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    expect(getByText('AIアシスタント')).toBeTruthy();
    expect(getByTestId('ai-avatar')).toBeTruthy();
    expect(getByTestId('chat-input')).toBeTruthy();
  });

  it('対話を開始する', async () => {
    const mockConversation = {
      id: 'conversation-123',
      userId: 'user-123',
      status: 'active' as const,
      lastActivity: new Date(),
      messageCount: 0,
      averageEmotion: 'その他',
      topics: []
    };

    mockStartConversation.mockResolvedValue(undefined);
    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: mockConversation,
      conversationMessages: [],
      userProfile: null,
      isLoading: false,
      isTyping: false,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    const startButton = getByTestId('start-conversation-button');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(mockStartConversation).toHaveBeenCalledWith('user-123');
    });
  });

  it('メッセージを送信する', async () => {
    const mockConversation = {
      id: 'conversation-123',
      userId: 'user-123',
      status: 'active' as const,
      lastActivity: new Date(),
      messageCount: 0,
      averageEmotion: 'その他',
      topics: []
    };

    mockSendMessage.mockResolvedValue(undefined);
    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: mockConversation,
      conversationMessages: [],
      userProfile: null,
      isLoading: false,
      isTyping: false,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByTestId, getByPlaceholderText } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    const messageInput = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, 'こんにちは');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('conversation-123', 'user-123', 'こんにちは');
    });
  });

  it('対話を終了する', async () => {
    const mockConversation = {
      id: 'conversation-123',
      userId: 'user-123',
      status: 'active' as const,
      lastActivity: new Date(),
      messageCount: 0,
      averageEmotion: 'その他',
      topics: []
    };

    mockEndConversation.mockResolvedValue(undefined);
    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: mockConversation,
      conversationMessages: [],
      userProfile: null,
      isLoading: false,
      isTyping: false,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    const endButton = getByTestId('end-conversation-button');
    fireEvent.press(endButton);

    await waitFor(() => {
      expect(mockEndConversation).toHaveBeenCalled();
    });
  });

  it('メッセージ履歴を表示する', () => {
    const mockMessages = [
      {
        id: 'message-1',
        conversationId: 'conversation-123',
        senderId: 'user-123',
        senderType: 'user' as const,
        content: 'こんにちは',
        timestamp: new Date(),
        metadata: {}
      },
      {
        id: 'message-2',
        conversationId: 'conversation-123',
        senderId: 'ai',
        senderType: 'ai' as const,
        content: 'こんにちは！お疲れ様です。',
        emotion: 'その他',
        timestamp: new Date(),
        metadata: {}
      }
    ];

    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: {
        id: 'conversation-123',
        userId: 'user-123',
        status: 'active' as const,
        lastActivity: new Date(),
        messageCount: 2,
        averageEmotion: 'その他',
        topics: []
      },
      conversationMessages: mockMessages,
      userProfile: null,
      isLoading: false,
      isTyping: false,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByText } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    expect(getByText('こんにちは')).toBeTruthy();
    expect(getByText('こんにちは！お疲れ様です。')).toBeTruthy();
  });

  it('タイピング状態を表示する', () => {
    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: {
        id: 'conversation-123',
        userId: 'user-123',
        status: 'active' as const,
        lastActivity: new Date(),
        messageCount: 0,
        averageEmotion: 'その他',
        topics: []
      },
      conversationMessages: [],
      userProfile: null,
      isLoading: false,
      isTyping: true,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    expect(getByTestId('typing-indicator')).toBeTruthy();
  });

  it('ローディング状態を表示する', () => {
    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: null,
      conversationMessages: [],
      userProfile: null,
      isLoading: true,
      isTyping: false,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('エラーメッセージを表示する', () => {
    const errorMessage = 'エラーが発生しました';
    
    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: null,
      conversationMessages: [],
      userProfile: null,
      isLoading: false,
      isTyping: false,
      error: errorMessage,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByText } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('アバターの表情が変化する', () => {
    const mockMessages = [
      {
        id: 'message-1',
        conversationId: 'conversation-123',
        senderId: 'ai',
        senderType: 'ai' as const,
        content: '悲しい気持ちですね',
        emotion: 'sad',
        timestamp: new Date(),
        metadata: {
          avatarExpression: 'sad'
        }
      }
    ];

    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: {
        id: 'conversation-123',
        userId: 'user-123',
        status: 'active' as const,
        lastActivity: new Date(),
        messageCount: 1,
        averageEmotion: 'sad',
        topics: []
      },
      conversationMessages: mockMessages,
      userProfile: null,
      isLoading: false,
      isTyping: false,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    const avatar = getByTestId('ai-avatar');
    expect(avatar.props.emotion).toBe('sad');
  });

  it('アドバイスを表示する', () => {
    const mockMessages = [
      {
        id: 'message-1',
        conversationId: 'conversation-123',
        senderId: 'ai',
        senderType: 'ai' as const,
        content: 'お疲れ様です',
        emotion: 'その他',
        timestamp: new Date(),
        metadata: {
          advice: '気分転換をしてみてください'
        }
      }
    ];

    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: {
        id: 'conversation-123',
        userId: 'user-123',
        status: 'active' as const,
        lastActivity: new Date(),
        messageCount: 1,
        averageEmotion: 'その他',
        topics: []
      },
      conversationMessages: mockMessages,
      userProfile: null,
      isLoading: false,
      isTyping: false,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByText } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    expect(getByText('気分転換をしてみてください')).toBeTruthy();
  });

  it('戻るボタンが機能する', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('空のメッセージは送信しない', async () => {
    const mockConversation = {
      id: 'conversation-123',
      userId: 'user-123',
      status: 'active' as const,
      lastActivity: new Date(),
      messageCount: 0,
      averageEmotion: 'その他',
      topics: []
    };

    mockUseAIAvatarStore.mockReturnValue({
      currentConversation: mockConversation,
      conversationMessages: [],
      userProfile: null,
      isLoading: false,
      isTyping: false,
      error: null,
      startConversation: mockStartConversation,
      sendMessage: mockSendMessage,
      endConversation: mockEndConversation,
      loadConversationHistory: jest.fn(),
      updateUserProfile: jest.fn(),
      subscribeToConversation: jest.fn(),
      setLoading: jest.fn(),
      setTyping: jest.fn(),
      setError: mockSetError,
      reset: jest.fn()
    });

    const { getByTestId, getByPlaceholderText } = render(
      <NavigationContainer>
        <AiAvatarScreen />
      </NavigationContainer>
    );

    const messageInput = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, '   '); // 空白のみ
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });
});
