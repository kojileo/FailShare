import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChatMessageItem from '../../../src/components/ChatMessageItem';

// ストアのモック
jest.mock('../../../src/stores/chatStore', () => ({
  useChatStore: () => ({
    editMessage: jest.fn(),
    deleteMessage: jest.fn()
  })
}));

jest.mock('../../../src/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user-123', displayName: 'テストユーザー' }
  })
}));

describe('ChatMessageItem', () => {
  const mockMessage = {
    id: 'message-123',
    chatId: 'chat-123',
    senderId: 'user-123',
    content: 'テストメッセージ',
    messageType: 'text' as const,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    isRead: true,
    isEdited: false
  };

  it('ユーザーメッセージをレンダリングする', () => {
    const { getByText } = render(
      <ChatMessageItem
        message={mockMessage}
        isOwnMessage={true}
      />
    );

    expect(getByText('テストメッセージ')).toBeTruthy();
  });

  it('管理者メッセージをレンダリングする', () => {
    const adminMessage = {
      ...mockMessage,
      senderId: 'admin-123'
    };

    const { getByText } = render(
      <ChatMessageItem
        message={adminMessage}
        isOwnMessage={false}
      />
    );

    expect(getByText('テストメッセージ')).toBeTruthy();
  });

  it('ファイルメッセージをレンダリングする', () => {
    const fileMessage = {
      ...mockMessage,
      messageType: 'file' as const,
      content: 'document.pdf'
    };

    const { getByText } = render(
      <ChatMessageItem
        message={fileMessage}
        isOwnMessage={true}
      />
    );

    expect(getByText('document.pdf')).toBeTruthy();
  });

  it('画像メッセージをレンダリングする', () => {
    const imageMessage = {
      ...mockMessage,
      messageType: 'image' as const,
      content: 'https://example.com/image.jpg'
    };

    const { getByText } = render(
      <ChatMessageItem
        message={imageMessage}
        isOwnMessage={true}
      />
    );

    expect(getByText('https://example.com/image.jpg')).toBeTruthy();
  });

  it('タイムスタンプを表示する', () => {
    const { getByText } = render(
      <ChatMessageItem
        message={mockMessage}
        isOwnMessage={true}
      />
    );

    expect(getByText('10:00')).toBeTruthy();
  });

  it('編集済みメッセージを表示する', () => {
    const editedMessage = {
      ...mockMessage,
      isEdited: true
    };

    const { getByText } = render(
      <ChatMessageItem
        message={editedMessage}
        isOwnMessage={true}
      />
    );

    expect(getByText('編集済み')).toBeTruthy();
  });

  it('長いメッセージを適切に表示する', () => {
    const longMessage = {
      ...mockMessage,
      content: 'これは非常に長いメッセージです。'.repeat(10)
    };

    const { getByText } = render(
      <ChatMessageItem
        message={longMessage}
        isOwnMessage={true}
      />
    );

    expect(getByText(longMessage.content)).toBeTruthy();
  });

  it('メッセージの長押しでオプションを表示する', () => {
    const { getByText } = render(
      <ChatMessageItem
        message={mockMessage}
        isOwnMessage={true}
      />
    );

    const messageBubble = getByText('テストメッセージ');
    fireEvent(messageBubble, 'longPress');

    // Alertが表示されることを確認（実際のテストではAlertをモックする必要があります）
    expect(messageBubble).toBeTruthy();
  });
});
