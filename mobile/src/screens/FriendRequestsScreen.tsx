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
import { FriendRequest, RootStackParamList } from '../types';
import Header from '../components/Header';

type FriendRequestsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FriendRequests'>;

const FriendRequestsScreen: React.FC = () => {
  const navigation = useNavigation<FriendRequestsScreenNavigationProp>();
  const { user } = useAuthStore();
  const { 
    friendRequests, 
    sentRequests,
    isLoading, 
    loadFriendRequests,
    loadSentRequests,
    acceptFriendRequest,
    rejectFriendRequest
  } = useFriendStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    if (user) {
      loadFriendRequests(user.id);
      loadSentRequests(user.id);
    }
  }, [user, loadFriendRequests, loadSentRequests]);

  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        loadFriendRequests(user.id),
        loadSentRequests(user.id)
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await acceptFriendRequest(request.id);
      Alert.alert('承認完了', 'フレンドリクエストを承認しました');
    } catch {
      Alert.alert('エラー', 'フレンドリクエストの承認に失敗しました');
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    Alert.alert(
      'リクエスト拒否',
      'このフレンドリクエストを拒否しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '拒否',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectFriendRequest(request.id);
              Alert.alert('拒否完了', 'フレンドリクエストを拒否しました');
            } catch {
              Alert.alert('エラー', 'フレンドリクエストの拒否に失敗しました');
            }
          }
        }
      ]
    );
  };

  const renderReceivedRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.fromUserId.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.requestDetails}>
          <Text style={styles.requestTitle}>フレンドリクエスト</Text>
          <Text style={styles.requestText}>
            {item.message || 'フレンドになりませんか？'}
          </Text>
          <Text style={styles.requestDate}>
            {new Date(item.createdAt).toLocaleDateString('ja-JP')}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item)}
          testID="accept-request-button"
        >
          <MaterialIcons name="check" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(item)}
          testID="reject-request-button"
        >
          <MaterialIcons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.toUserId.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.requestDetails}>
          <Text style={styles.requestTitle}>送信済みリクエスト</Text>
          <Text style={styles.requestText}>
            {item.message || 'フレンドリクエストを送信しました'}
          </Text>
          <Text style={styles.requestDate}>
            {new Date(item.createdAt).toLocaleDateString('ja-JP')}
          </Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>待機中</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name={activeTab === 'received' ? 'person-add' : 'send'} 
        size={64} 
        color="#ccc" 
      />
      <Text style={styles.emptyStateTitle}>
        {activeTab === 'received' ? 'フレンドリクエストがありません' : '送信済みリクエストがありません'}
      </Text>
      <Text style={styles.emptyStateText}>
        {activeTab === 'received' 
          ? '新しいフレンドリクエストが届くとここに表示されます'
          : 'フレンドリクエストを送信するとここに表示されます'
        }
      </Text>
      {activeTab === 'received' && (
        <TouchableOpacity
          style={styles.addFriendButton}
          onPress={() => navigation.navigate('FriendSearch')}
        >
          <Text style={styles.addFriendButtonText}>フレンドを探す</Text>
        </TouchableOpacity>
      )}
    </View>
  );



  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>リクエストを読み込み中...</Text>
      </View>
    );
  }

  const currentData = activeTab === 'received' ? (friendRequests || []) : (sentRequests || []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      
      {/* モダンヘッダー */}
      <Header navigation={navigation} />

      {/* タブコンテナ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            受信 ({friendRequests ? friendRequests.length : 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            送信 ({sentRequests ? sentRequests.length : 0})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentData}
        renderItem={activeTab === 'received' ? renderReceivedRequest : renderSentRequest}
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
        testID="requests-flatlist"
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  requestItem: {
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
  requestInfo: {
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
  requestDetails: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  requestText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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

export default FriendRequestsScreen;
