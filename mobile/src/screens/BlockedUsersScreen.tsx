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
import { Avatar } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { useFriendStore } from '../stores/friendStore';
import { User, RootStackParamList } from '../types';
import Header from '../components/Header';

type BlockedUsersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BlockedUsers'>;

const BlockedUsersScreen: React.FC = () => {
  const navigation = useNavigation<BlockedUsersScreenNavigationProp>();
  const { user } = useAuthStore();
  const { 
    blockedUsers, 
    isLoading, 
    loadBlockedUsers,
    unblockUser
  } = useFriendStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadBlockedUsers(user.id);
    }
  }, [user, loadBlockedUsers]);

  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await loadBlockedUsers(user.id);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnblockUser = (blockedUser: User) => {
    if (!user) return;

    Alert.alert(
      'ブロック解除',
      `${blockedUser.displayName}のブロックを解除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '解除',
          onPress: async () => {
            try {
              await unblockUser(user.id, blockedUser.id);
              Alert.alert('解除完了', 'ブロックを解除しました');
            } catch {
              Alert.alert('エラー', 'ブロック解除に失敗しました');
            }
          }
        }
      ]
    );
  };

  const renderBlockedUserItem = ({ item }: { item: User }) => (
    <View style={styles.blockedUserItem}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userStats}>
            投稿: {item.stats.totalPosts} | フレンド: {item.stats.friendsCount}
          </Text>
        </View>
      </View>
                   <TouchableOpacity
               style={styles.unblockButton}
               onPress={() => handleUnblockUser(item)}
               testID="unblock-user-button"
             >
               <MaterialIcons name="block" size={20} color="#fff" />
             </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="block" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>ブロックしたユーザーがいません</Text>
      <Text style={styles.emptyStateText}>
        ブロックしたユーザーはここに表示されます
      </Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>ブロックユーザーを読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      
      {/* モダンヘッダー */}
      <Header
        navigation={navigation}
        rightComponent={user ? (
          <Avatar.Image 
            size={32} 
            source={{ uri: `https://robohash.org/${user.displayName}?set=set4` }}
            style={styles.headerAvatar}
          />
        ) : undefined}
      />

                   <FlatList
               data={blockedUsers || []}
               renderItem={renderBlockedUserItem}
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
               testID="blocked-users-flatlist"
             />
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
  headerBackButton: {
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
  blockedUserItem: {
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
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userStats: {
    fontSize: 12,
    color: '#666',
  },
  unblockButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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

export default BlockedUsersScreen;
