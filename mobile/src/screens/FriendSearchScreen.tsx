import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, Avatar } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { useFriendStore } from '../stores/friendStore';
import { FriendRecommendation, RootStackParamList } from '../types';

type FriendSearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FriendSearch'>;

const FriendSearchScreen: React.FC = () => {
  const navigation = useNavigation<FriendSearchScreenNavigationProp>();
  const { user } = useAuthStore();
  const { 
    recommendations, 
    isLoading, 
    error,
    loadRecommendations,
    sendFriendRequest
  } = useFriendStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecommendations, setFilteredRecommendations] = useState<FriendRecommendation[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<FriendRecommendation | null>(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadRecommendations(user.id);
    }
  }, [user]);

  useEffect(() => {
    // 検索クエリに基づいて推薦リストをフィルタリング
    if (searchQuery.trim() === '') {
      setFilteredRecommendations(recommendations || []);
    } else {
      const filtered = (recommendations || []).filter(rec =>
        rec.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.commonInterests.some(interest => 
          interest.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredRecommendations(filtered);
    }
  }, [searchQuery, recommendations]);

  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await loadRecommendations(user.id);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendFriendRequest = async (recommendation: FriendRecommendation) => {
    if (!user) return;

    setSelectedRecommendation(recommendation);
    setRequestMessage('');
    setModalVisible(true);
  };

  const handleConfirmSendRequest = async () => {
    if (!user || !selectedRecommendation) return;

    try {
      await sendFriendRequest(user.id, selectedRecommendation.userId, requestMessage);
      Alert.alert('送信完了', 'フレンドリクエストを送信しました');
      setModalVisible(false);
      setSelectedRecommendation(null);
      setRequestMessage('');
    } catch (error) {
      Alert.alert('エラー', 'フレンドリクエストの送信に失敗しました');
    }
  };

  const handleCancelSendRequest = () => {
    setModalVisible(false);
    setSelectedRecommendation(null);
    setRequestMessage('');
  };

  const renderRecommendationItem = ({ item }: { item: FriendRecommendation }) => (
    <View style={styles.recommendationItem}>
      <View style={styles.recommendationInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.recommendationDetails}>
          <Text style={styles.recommendationName}>{item.displayName}</Text>
          {item.commonInterests.length > 0 && (
            <Text style={styles.commonInterests}>
              共通の興味: {item.commonInterests.join(', ')}
            </Text>
          )}
          <Text style={styles.recommendationStats}>
            共通のフレンド: {item.mutualFriends}人 | 推薦スコア: {Math.round(item.score)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleSendFriendRequest(item)}
      >
        <MaterialIcons name="person-add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="search-off" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery.trim() === '' ? '推薦ユーザーがありません' : '検索結果がありません'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery.trim() === '' 
          ? '現在、あなたに合うユーザーの推薦がありません。\nしばらく時間をおいてから再度お試しください。'
          : `「${searchQuery}」に一致するユーザーが見つかりませんでした。\n別のキーワードで検索してみてください。`
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>フレンドを探す</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="名前や興味で検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.subtitle}>
        {filteredRecommendations.length}人のユーザーを推薦
      </Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>ユーザーを読み込み中...</Text>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
            <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>フレンドを探す</Text>
            <Text style={styles.headerSubtitle}>
              {recommendations ? recommendations.length : 0}人のおすすめ
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

      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="名前や興味で検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredRecommendations}
        renderItem={renderRecommendationItem}
        keyExtractor={(item) => item.userId}
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

      {/* フレンドリクエスト送信モーダル */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelSendRequest}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedRecommendation?.displayName}にフレンドリクエストを送信
            </Text>
            <Text style={styles.modalSubtitle}>
              メッセージを入力してください（任意）
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="メッセージを入力..."
              value={requestMessage}
              onChangeText={setRequestMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelSendRequest}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleConfirmSendRequest}
              >
                <Text style={styles.sendButtonText}>送信</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  recommendationItem: {
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
  recommendationInfo: {
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
  recommendationDetails: {
    flex: 1,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  commonInterests: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  recommendationStats: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendSearchScreen;
