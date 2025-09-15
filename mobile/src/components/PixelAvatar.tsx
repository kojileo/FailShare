import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';


export type EmotionType = 'neutral' | 'happy' | 'sad' | 'worried' | 'angry' | 'confused' | 'surprised' | 'thinking';

export type AvatarColorType = 'green' | 'blue';

interface PixelAvatarProps {
  size?: number;
  emotion?: EmotionType;
  color?: AvatarColorType;
  isTyping?: boolean;
  style?: object;
}

// 感情と画像ファイルのマッピング
const emotionImageMapping = {
  neutral: 'neutral',
  happy: 'happy',
  sad: 'thinking', // 悲しい → 考えている表情を使用
  worried: 'thinking', // 心配 → 考えている表情を使用
  angry: 'angry',
  confused: 'wink', // 混乱 → ウィンク表情を使用
  surprised: 'surprised',
  thinking: 'thinking'
};

// 画像アセットのマッピング
/* eslint-disable @typescript-eslint/no-require-imports */
const getAvatarImage = (color: AvatarColorType, emotion: EmotionType) => {
  const mappedEmotion = emotionImageMapping[emotion];
  
  // greenバリエーション
  const getGreenImage = (emotion: string) => {
    switch (emotion) {
      case 'neutral': return require('../../assets/avatars/spectra_green_neutral.png');
      case 'happy': return require('../../assets/avatars/spectra_green_happy.png');
      case 'angry': return require('../../assets/avatars/spectra_green_angry.png');
      case 'surprised': return require('../../assets/avatars/spectra_green_surprised.png');
      case 'thinking': return require('../../assets/avatars/spectra_green_thinking.png');
      case 'wink': return require('../../assets/avatars/spectra_green_wink.png');
      default: return require('../../assets/avatars/spectra_green_neutral.png');
    }
  };

  // blueバリエーション
  const getBlueImage = (emotion: string) => {
    switch (emotion) {
      case 'neutral': return require('../../assets/avatars/spectra_blue_neutral.png');
      case 'happy': return require('../../assets/avatars/spectra_blue_happy.png');
      case 'angry': return require('../../assets/avatars/spectra_blue_angry.png');
      case 'surprised': return require('../../assets/avatars/spectra_blue_surprised.png');
      case 'thinking': return require('../../assets/avatars/spectra_blue_thinking.png');
      case 'wink': return require('../../assets/avatars/spectra_blue_wink.png');
      default: return require('../../assets/avatars/spectra_blue_neutral.png');
    }
  };

  if (color === 'green') {
    return getGreenImage(mappedEmotion);
  } else { // blue
    return getBlueImage(mappedEmotion);
  }
};
/* eslint-enable @typescript-eslint/no-require-imports */

const PixelAvatar: React.FC<PixelAvatarProps> = ({ 
  size = 120, 
  emotion = 'neutral',
  color = 'green',
  isTyping = false,
  style 
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>(emotion);
  const [currentColor, setCurrentColor] = useState<AvatarColorType>(color);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  // 感情が変わった時のアニメーション
  useEffect(() => {
    if (emotion !== currentEmotion) {
      // フェードアウト → 感情変更 → フェードイン
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      // 感情変化時のパルスアニメーション
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentEmotion(emotion);
    }
  }, [emotion, currentEmotion, fadeAnim, pulseAnim]);

  // カラーが変わった時の処理
  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  // タイピング時のグロウアニメーション
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isTyping, glowAnim]);

  // 現在の画像ソースを取得
  const avatarImageSource = getAvatarImage(currentColor, currentEmotion);

  // グロウエフェクトの色をカラーに応じて変更
  const getGlowColor = (color: AvatarColorType) => {
    return color === 'green' ? '#00FF88' : '#00AAFF';
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* グロウ効果 */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            width: size + 20,
            height: size + 20,
            opacity: glowAnim,
            shadowColor: getGlowColor(currentColor),
            shadowRadius: 15,
          },
        ]}
      />
      
      {/* アバター本体 */}
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* 美少女アバター画像 */}
        {avatarImageSource ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Image
              source={avatarImageSource}
              style={[
                styles.avatarImage,
                {
                  width: size,
                  height: size,
                },
              ]}
              contentFit="contain"
            />
          </Animated.View>
        ) : (
          /* フォールバック用のシンプルな表示 */
          <View style={[styles.fallbackAvatar, { width: size, height: size }]}>
            <Text style={styles.fallbackText}>カノン</Text>
          </View>
        )}
        
        {/* タイピング時の点滅効果 */}
        {isTyping && (
          <Animated.View
            style={[
              styles.typingIndicator,
              {
                width: size,
                height: size,
                opacity: glowAnim,
                backgroundColor: `${getGlowColor(currentColor)}20`, // 20% opacity
              },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    borderRadius: 10,
  },
  fallbackAvatar: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00FF88',
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00FF88',
    letterSpacing: 1,
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 15,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    elevation: 15,
  },
  typingIndicator: {
    position: 'absolute',
    borderRadius: 10,
    top: 0,
    left: 0,
  },
  nameContainer: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  nameText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});

export default PixelAvatar;
