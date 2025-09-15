import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatInput from '../../../src/components/ChatInput';

// ストアのモック
jest.mock('../../../src/stores/chatStore', () => ({
  useChatStore: () => ({
    sendMessage: jest.fn()
  })
}));

jest.mock('../../../src/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user-123', displayName: 'テストユーザー' }
  })
}));

describe('ChatInput', () => {
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('レンダリングされる', () => {
    const { getByPlaceholderText } = render(
      <ChatInput
        chatId="chat-123"
        onSend={mockOnSend}
      />
    );

    expect(getByPlaceholderText('メッセージを入力...')).toBeTruthy();
  });

  it('メッセージを送信する', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ChatInput
        chatId="chat-123"
        onSend={mockOnSend}
      />
    );

    const input = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'テストメッセージ');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalled();
    });
  });

  it('Enterキーでメッセージを送信する', async () => {
    const { getByPlaceholderText } = render(
      <ChatInput
        chatId="chat-123"
        onSend={mockOnSend}
      />
    );

    const input = getByPlaceholderText('メッセージを入力...');
    
    fireEvent.changeText(input, 'テストメッセージ');
    fireEvent(input, 'submitEditing');

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalled();
    });
  });

  it('空のメッセージは送信しない', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ChatInput
        chatId="chat-123"
        onSend={mockOnSend}
      />
    );

    const input = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, '   '); // 空白のみ
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  it('送信後にテキストがクリアされる', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ChatInput
        chatId="chat-123"
        onSend={mockOnSend}
      />
    );

    const input = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'テストメッセージ');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(input.props.value).toBe('');
    });
  });

  it('最大文字数制限が適用される', () => {
    const { getByPlaceholderText } = render(
      <ChatInput
        chatId="chat-123"
        onSend={mockOnSend}
      />
    );

    const input = getByPlaceholderText('メッセージを入力...');
    expect(input.props.maxLength).toBe(1000);
  });

  it('マルチライン入力が有効', () => {
    const { getByPlaceholderText } = render(
      <ChatInput
        chatId="chat-123"
        onSend={mockOnSend}
      />
    );

    const input = getByPlaceholderText('メッセージを入力...');
    expect(input.props.multiline).toBe(true);
  });
});
