import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../stores/authStore';
import { useFriendStore } from '../stores/friendStore';
import { User, RootStackParamList } from '../types';
import Header from '../components/Header';

type FriendsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Friends'>;

const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<FriendsScreenNavigationProp>();
  const { user } = useAuthStore();
  const { 
    friends, 
    friendRequests, 
    isLoading, 
    loadFriends, 
    loadFriendRequests,
    removeFriend,
    blockUser,
    subscribeToFriends,
    subscribeToFriendRequests
  } = useFriendStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends(user.id);
      loadFriendRequests(user.id);
      
      // リアルタイム更新の購読
      const unsubscribeFriends = subscribeToFriends(user.id);
      const unsubscribeRequests = subscribeToFriendRequests(user.id);
      
      // クリーンアップ関数
      return () => {
        unsubscribeFriends();
        unsubscribeRequests();
      };
    }
  }, [user, loadFriends, loadFriendRequests, subscribeToFriends, subscribeToFriendRequests]);

  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        loadFriends(user.id),
        loadFriendRequests(user.id)
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveFriend = (friend: User) => {
    if (!user) return;

    Alert.alert(
      'フレンド削除',
      `${friend.displayName}をフレンドから削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(user.id, friend.id);
              Alert.alert('削除完了', 'フレンドを削除しました');
            } catch {
              Alert.alert('エラー', 'フレンドの削除に失敗しました');
            }
          }
        }
      ]
    );
  };

  const handleBlockUser = (friend: User) => {
    if (!user) return;

    Alert.alert(
      'ユーザーブロック',
      `${friend.displayName}をブロックしますか？\nブロックすると、このユーザーとの全てのやり取りができなくなります。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ブロック',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(user.id, friend.id);
              Alert.alert('ブロック完了', 'ユーザーをブロックしました');
            } catch {
              Alert.alert('エラー', 'ユーザーのブロックに失敗しました');
            }
          }
        }
      ]
    );
  };

  const renderFriendItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate('Chat', {
        friendId: item.id,
        friendName: item.displayName,
      })}
      onLongPress={() => {
        Alert.alert(
          'フレンドオプション',
          `${item.displayName}に対する操作を選択してください`,
          [
            { text: 'キャンセル', style: 'cancel' },
            { text: 'チャット', onPress: () => navigation.navigate('Chat', {
              friendId: item.id,
              friendName: item.displayName,
            })},
            { text: 'フレンド削除', style: 'destructive', onPress: () => handleRemoveFriend(item) },
            { text: 'ブロック', style: 'destructive', onPress: () => handleBlockUser(item) },
          ]
        );
      }}
      activeOpacity={0.7}
    >
      <View style={styles.friendInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendStats}>
            投稿: {item.stats.totalPosts} | フレンド: {item.stats.friendsCount}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat', {
            friendId: item.id,
            friendName: item.displayName,
          })}
          testID="chat-friend-button"
        >
          <MaterialIcons name="chat" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="chat-bubble-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>チャットできるフレンドがいません</Text>
      <Text style={styles.emptyStateText}>
        フレンドを追加してチャットを始めてみましょう
      </Text>
      <TouchableOpacity
        style={styles.addFriendButton}
        onPress={() => navigation.navigate('FriendSearch')}
      >
        <Text style={styles.addFriendButtonText}>フレンドを探す</Text>
      </TouchableOpacity>
    </View>
  );



  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>チャット一覧を読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      <Header navigation={navigation} title="チャット" />

      {/* アクションボタン */}
      <View style={styles.actionHeader}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FriendRequests')}
            testID="friend-requests-button"
          >
            <MaterialIcons name="person-add" size={24} color="#007AFF" />
            {friendRequests && friendRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{friendRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FriendSearch')}
            testID="search-button"
          >
            <MaterialIcons name="search" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={friends || []}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
          />
        }
        contentContainerStyle={styles.listContainer}
        testID="friends-flatlist"
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  actionHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  friendItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  friendStats: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  chatButton: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFriendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
});

export default FriendsScreen;
