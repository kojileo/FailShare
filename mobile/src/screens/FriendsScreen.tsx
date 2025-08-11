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
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, Avatar } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { useFriendStore } from '../stores/friendStore';
import { User, RootStackParamList } from '../types';

type FriendsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Friends'>;

const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<FriendsScreenNavigationProp>();
  const { user } = useAuthStore();
  const { 
    friends, 
    friendRequests, 
    isLoading, 
    error,
    loadFriends, 
    loadFriendRequests,
    removeFriend,
    blockUser
  } = useFriendStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends(user.id);
      loadFriendRequests(user.id);
    }
  }, [user]);

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
            } catch (error) {
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
            } catch (error) {
              Alert.alert('エラー', 'ユーザーのブロックに失敗しました');
            }
          }
        }
      ]
    );
  };

  const renderFriendItem = ({ item }: { item: User }) => (
    <View style={styles.friendItem}>
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
          style={styles.actionButton}
          onPress={() => handleRemoveFriend(item)}
        >
          <MaterialIcons name="person-remove" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBlockUser(item)}
        >
          <MaterialIcons name="block" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>フレンドがいません</Text>
      <Text style={styles.emptyStateText}>
        失敗談を通じて新しいフレンドを見つけてみましょう
      </Text>
      <TouchableOpacity
        style={styles.addFriendButton}
        onPress={() => navigation.navigate('FriendSearch')}
      >
        <Text style={styles.addFriendButtonText}>フレンドを探す</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>フレンド</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('FriendRequests')}
          >
            <MaterialIcons name="person-add" size={24} color="#007AFF" />
            {friendRequests && friendRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{friendRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('FriendSearch')}
          >
            <MaterialIcons name="search" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.subtitle}>
        {friends ? friends.length : 0}人のフレンド
      </Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>フレンドを読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      
      {/* モダンヘッダー */}
      <LinearGradient
        colors={['#1DA1F2', '#1991DB']}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>フレンド</Text>
            <Text style={styles.headerSubtitle}>
              {friends ? friends.length : 0}人のフレンド
            </Text>
          </View>
          <View style={styles.headerRight}>
            {user && (
              <Avatar.Image 
                size={32} 
                source={{ uri: `https://robohash.org/${user.displayName}?set=set4` }}
                style={styles.headerAvatar}
              />
            )}
          </View>
        </View>
      </LinearGradient>

      {/* アクションボタン */}
      <View style={styles.actionHeader}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FriendRequests')}
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
      />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modernHeader: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  headerAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
