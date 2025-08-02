import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { likeService } from '../services/likeService';

interface LikeButtonProps {
  storyId: string;
  initialHelpfulCount?: number;
  initialIsLiked?: boolean;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  onLikeChange?: (isLiked: boolean, newCount: number) => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  storyId,
  initialHelpfulCount = 0,
  initialIsLiked = false,
  size = 'medium',
  showCount = true,
  onLikeChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const { user, signIn } = useAuthStore();

  // 初期値を設定（常に実行）
  useEffect(() => {
    console.log(`🔧 LikeButton初期化 [${storyId}]:`, { initialHelpfulCount, initialIsLiked });
    setHelpfulCount(initialHelpfulCount);
    setIsLiked(initialIsLiked);
  }, [storyId, initialHelpfulCount, initialIsLiked]);

  // ユーザーが認証されている場合、現在のいいね状態を取得
  useEffect(() => {
    if (user?.id) {
      loadCurrentLikeState();
    }
  }, [user?.id, storyId]);

  const loadCurrentLikeState = async () => {
    try {
      console.log(`🔄 いいね状態を取得中 [${storyId}]:`, { userId: user!.id });
      const currentIsLiked = await likeService.isLikedByUser(storyId, user!.id);
      console.log(`✅ いいね状態取得完了 [${storyId}]:`, { currentIsLiked });
      setIsLiked(currentIsLiked);
    } catch (error) {
      console.error('いいね状態の取得に失敗:', error);
      // エラー時は初期値を使用
      setIsLiked(initialIsLiked);
    }
  };

  const handleToggleLike = async () => {
    if (isLoading) return;

    console.log(`🔄 いいね切り替え開始 [${storyId}]:`, { currentIsLiked: isLiked, currentCount: helpfulCount });
    setIsLoading(true);
    
    try {
      let currentUser = user;
      
      // ユーザーが認証されていない場合は匿名認証を実行
      if (!currentUser?.id) {
        console.log('🔐 匿名認証を実行中...');
        await signIn();
        const authState = useAuthStore.getState();
        currentUser = authState.user;
        
        if (!currentUser?.id) {
          throw new Error('認証に失敗しました');
        }
      }
      
      // いいねの切り替え
      if (isLiked) {
        console.log(`🗑️ いいね削除 [${storyId}]`);
        await likeService.removeLike(storyId, currentUser.id);
        // helpfulCountを-1
        const newCount = helpfulCount - 1;
        setHelpfulCount(newCount);
        setIsLiked(false);
        console.log(`✅ いいね削除完了 [${storyId}]:`, { newCount });
        onLikeChange?.(false, newCount);
      } else {
        console.log(`❤️ いいね追加 [${storyId}]`);
        await likeService.addLike(storyId, currentUser.id);
        // helpfulCountを+1
        const newCount = helpfulCount + 1;
        setHelpfulCount(newCount);
        setIsLiked(true);
        console.log(`✅ いいね追加完了 [${storyId}]:`, { newCount });
        onLikeChange?.(true, newCount);
      }
      
    } catch (error) {
      console.error('いいねの切り替えに失敗しました:', error);
      // エラー時は元の状態に戻す
      setHelpfulCount(initialHelpfulCount);
      setIsLiked(initialIsLiked);
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { iconSize: 16, fontSize: 12, padding: 8 };
      case 'large':
        return { iconSize: 24, fontSize: 16, padding: 12 };
      default:
        return { iconSize: 20, fontSize: 14, padding: 10 };
    }
  };

  const { iconSize, fontSize, padding } = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { padding },
        isLiked && styles.liked
      ]}
      onPress={handleToggleLike}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size={iconSize} color={isLiked ? '#e74c3c' : '#666'} />
      ) : (
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={iconSize}
          color={isLiked ? '#e74c3c' : '#666'}
        />
      )}
      
      {showCount && (
        <Text style={[
          styles.count,
          { fontSize },
          isLiked && styles.likedText
        ]}>
          {helpfulCount}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  liked: {
    backgroundColor: '#fff5f5',
    borderColor: '#e74c3c',
  },
  count: {
    marginLeft: 4,
    color: '#666',
    fontWeight: '500',
  },
  likedText: {
    color: '#e74c3c',
  },
}); 