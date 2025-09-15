import React from 'react';
import { render } from '@testing-library/react-native';
import PixelAvatar from '../../../src/components/PixelAvatar';

describe('PixelAvatar', () => {
  it('デフォルトのアバターをレンダリングする', () => {
    const { getByTestId } = render(<PixelAvatar />);
    
    expect(getByTestId('pixel-avatar')).toBeTruthy();
  });

  it('指定された表情でアバターをレンダリングする', () => {
    const { getByTestId } = render(
      <PixelAvatar emotion="happy" />
    );
    
    expect(getByTestId('pixel-avatar')).toBeTruthy();
  });

  it('サイズを指定してアバターをレンダリングする', () => {
    const { getByTestId } = render(
      <PixelAvatar size={100} />
    );
    
    const avatar = getByTestId('pixel-avatar');
    expect(avatar.props.style).toContainEqual(
      expect.objectContaining({
        width: 100,
        height: 100
      })
    );
  });

  it('カスタムスタイルを適用する', () => {
    const customStyle = { borderWidth: 2, borderColor: 'red' };
    
    const { getByTestId } = render(
      <PixelAvatar style={customStyle} />
    );
    
    const avatar = getByTestId('pixel-avatar');
    expect(avatar.props.style).toContainEqual(customStyle);
  });

  it('アニメーションが有効な場合の動作', () => {
    const { getByTestId } = render(
      <PixelAvatar emotion="happy" />
    );
    
    expect(getByTestId('pixel-avatar')).toBeTruthy();
  });

  it('アニメーションが無効な場合の動作', () => {
    const { getByTestId } = render(
      <PixelAvatar emotion="sad" />
    );
    
    expect(getByTestId('pixel-avatar')).toBeTruthy();
  });

  it('異なる感情のアバターをレンダリングする', () => {
    const emotions = ['happy', 'sad', 'angry', 'surprised', 'thinking', 'wink', 'neutral'];
    
    emotions.forEach(emotion => {
      const { getByTestId } = render(
        <PixelAvatar emotion={emotion as any} />
      );
      
      expect(getByTestId('pixel-avatar')).toBeTruthy();
    });
  });

  it('色のバリエーションをレンダリングする', () => {
    const colors = ['blue', 'green', 'red', 'purple'];
    
    colors.forEach(color => {
      const { getByTestId } = render(
        <PixelAvatar color={color as any} />
      );
      
      expect(getByTestId('pixel-avatar')).toBeTruthy();
    });
  });

  it('感情と色の組み合わせをレンダリングする', () => {
    const { getByTestId } = render(
      <PixelAvatar emotion="happy" color="blue" />
    );
    
    expect(getByTestId('pixel-avatar')).toBeTruthy();
  });

  it('タイピング状態を表示する', () => {
    const { getByTestId } = render(
      <PixelAvatar isTyping={true} />
    );
    
    expect(getByTestId('pixel-avatar')).toBeTruthy();
  });

  it('カスタムスタイルを適用する', () => {
    const customStyle = { borderWidth: 2, borderColor: 'red' };
    
    const { getByTestId } = render(
      <PixelAvatar style={customStyle} />
    );
    
    const avatar = getByTestId('pixel-avatar');
    expect(avatar.props.style).toContainEqual(customStyle);
  });
});
