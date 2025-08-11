import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { IconButton } from 'react-native-paper';
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

  // 初期値を設定
  useEffect(() => {
    console.log(`🔧 LikeButton初期化 [${storyId}]:`, { initialHelpfulCount, initialIsLiked });
    setHelpfulCount(initialHelpfulCount);
    setIsLiked(initialIsLiked);
  }, [storyId, initialHelpfulCount, initialIsLiked]);

  const loadCurrentLikeState = async () => {
    try {
      console.log(`🔄 いいね状態を取得中 [${storyId}]:`, { userId: user!.id });
      const currentIsLiked = await likeService.isLikedByUser(storyId, user!.id);
      console.log(`✅ いいね状態取得完了 [${storyId}]:`, { currentIsLiked });
      setIsLiked(currentIsLiked);
    } catch (error) {
      console.error('いいね状態の取得に失敗:', error);
      setIsLiked(initialIsLiked);
    }
  };

  // ユーザーが認証されている場合、現在のいいね状態を取得
  useEffect(() => {
    if (user?.id) {
      loadCurrentLikeState();
    }
  }, [user?.id, storyId, loadCurrentLikeState]);

  const handleToggleLike = async () => {
    if (isLoading) return;

    console.log(`🔄 いいね切り替え開始 [${storyId}]:`, { currentIsLiked: isLiked, currentCount: helpfulCount });
    setIsLoading(true);
    
    // 現在の状態を保存（エラー時に戻すため）
    const previousIsLiked = isLiked;
    const previousCount = helpfulCount;
    
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
      
      // 即座にUI状態を更新（楽観的更新）
      const newIsLiked = !isLiked;
      const newCount = newIsLiked ? helpfulCount + 1 : helpfulCount - 1;
      
      console.log(`🔄 UI状態更新 [${storyId}]:`, { 
        from: { isLiked, helpfulCount }, 
        to: { isLiked: newIsLiked, helpfulCount: newCount } 
      });
      
      setIsLiked(newIsLiked);
      setHelpfulCount(newCount);
      onLikeChange?.(newIsLiked, newCount);
      
      // Firestore操作
      if (newIsLiked) {
        console.log(`❤️ いいね追加Firestore処理 [${storyId}]`);
        await likeService.addLike(storyId, currentUser.id);
        console.log(`✅ いいね追加完了 [${storyId}]`);
      } else {
        console.log(`🗑️ いいね削除Firestore処理 [${storyId}]`);
        await likeService.removeLike(storyId, currentUser.id);
        console.log(`✅ いいね削除完了 [${storyId}]`);
      }
      
    } catch (error) {
      console.error('いいねの切り替えに失敗しました:', error);
      // エラー時は元の状態に戻す
      console.log(`🔄 エラー復旧 [${storyId}]:`, { 
        from: { isLiked, helpfulCount }, 
        to: { isLiked: previousIsLiked, helpfulCount: previousCount } 
      });
      setHelpfulCount(previousCount);
      setIsLiked(previousIsLiked);
      onLikeChange?.(previousIsLiked, previousCount);
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
        <IconButton
          icon={isLiked ? 'heart' : 'heart-outline'}
          size={iconSize}
          iconColor={isLiked ? '#e74c3c' : '#666'}
          style={styles.iconButton}
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
  iconButton: {
    margin: 0,
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