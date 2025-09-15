import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, AdminProfile, AdminSupportRequest } from '../types';
import { useAdminSupportStore } from '../stores/adminSupportStore';
import { useAuthStore } from '../stores/authStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import PixelAvatar from '../components/PixelAvatar';

interface AdminDashboardScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user: _user } = useAuthStore();
  const { admin, isAuthenticated, signOut } = useAdminAuthStore();
  const {
    userRequests,
    availableAdmins,
    isLoading,
    error: _error,
    getPendingRequests,
    getAvailableAdmins,
    assignRequest,
    startSession,
    updateAdminStatus,
    subscribeToRequests
  } = useAdminSupportStore();

  const [refreshing, setRefreshing] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(admin?.id || '');
  const [selectedRequest, setSelectedRequest] = useState<AdminSupportRequest | null>(null);
  const [showRequestDetail, setShowRequestDetail] = useState(false);

  // 管理者認証チェック
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🚨 管理者認証なし、ログイン画面に遷移');
      navigation?.navigate('AdminLogin');
      return;
    }
  }, [isAuthenticated, navigation]);

  // 管理者情報が変更されたらcurrentAdminIdを更新
  useEffect(() => {
    if (admin?.id && admin.id !== currentAdminId) {
      console.log('🔄 管理者ID更新:', admin.id);
      setCurrentAdminId(admin.id);
    }
  }, [admin, currentAdminId]);

  const loadInitialData = useCallback(async () => {
    try {
      await Promise.all([
        getAvailableAdmins(),
        getPendingRequests()
      ]);
    } catch (error) {
      console.error('初期データ読み込みエラー:', error);
    }
  }, [getAvailableAdmins, getPendingRequests]);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
      
      // 全てのリクエストを監視（管理者用）
      const unsubscribe = subscribeToRequests();
      
      return () => {
        unsubscribe();
      };
    }
  }, [isAuthenticated, subscribeToRequests, loadInitialData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getAvailableAdmins(),
        getPendingRequests()
      ]);
    } catch (error) {
      console.error('リフレッシュエラー:', error);
    }
    setRefreshing(false);
  };

  const handleAssignRequest = async (request: AdminSupportRequest) => {
    try {
      await assignRequest(request.id, currentAdminId);
      const sessionId = await startSession(request.id, currentAdminId);
      
      Alert.alert(
        '成功', 
        'リクエストを受け付けました。チャットを開始します。',
        [
          {
            text: 'チャットを開く',
            onPress: () => {
              navigation?.navigate('AdminChat', {
                sessionId: sessionId,
                userId: request.userId
              });
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('リクエスト受付エラー:', error);
      Alert.alert('エラー', 'リクエストの受付に失敗しました');
    }
  };

  const handleStatusChange = async (status: AdminProfile['status']) => {
    try {
      await updateAdminStatus(currentAdminId, status);
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      Alert.alert('エラー', 'ステータスの更新に失敗しました');
    }
  };

  const handleOpenChat = async (request: AdminSupportRequest) => {
    try {
      console.log('💬 チャットを開く:', request.id);
      
      // セッションが開始されていない場合は開始
      if (request.status === 'assigned') {
        const sessionId = await startSession(request.id, currentAdminId);
        navigation?.navigate('AdminChat', {
          sessionId: sessionId,
          userId: request.userId
        });
      } else if (request.status === 'in_progress') {
        // 既にセッションが開始されている場合は、セッションIDを使用
        if (request.sessionId) {
          navigation?.navigate('AdminChat', {
            sessionId: request.sessionId,
            userId: request.userId
          });
        } else {
          Alert.alert('エラー', 'セッションIDが見つかりません');
        }
      }
    } catch (error) {
      console.error('チャット開始エラー:', error);
      Alert.alert('エラー', 'チャットを開始できませんでした');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'ログアウト',
      '管理者としてログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation?.navigate('AdminLogin');
            } catch (error) {
              console.error('ログアウトエラー:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました');
            }
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority: AdminSupportRequest['priority']) => {
    switch (priority) {
      case 'urgent': return '#FF4444';
      case 'high': return '#FF8800';
      case 'normal': return '#00FF88';
      case 'low': return '#88CCFF';
      default: return '#CCCCCC';
    }
  };

  const getStatusColor = (status: AdminSupportRequest['status']) => {
    switch (status) {
      case 'pending': return '#FFB347';
      case 'assigned': return '#4ECDC4';
      case 'in_progress': return '#00FF88';
      case 'resolved': return '#95E1D3';
      case 'closed': return '#B0BEC5';
      default: return '#CCCCCC';
    }
  };

  const handleRequestPress = (request: AdminSupportRequest) => {
    setSelectedRequest(request);
    setShowRequestDetail(true);
  };

  const renderRequestCard = (request: AdminSupportRequest) => (
    <TouchableOpacity 
      key={request.id} 
      onPress={() => handleRequestPress(request)}
      style={styles.requestCardContainer}
    >
      <Card style={styles.requestCard}>
        <LinearGradient
          colors={['#1A0A2E', '#16213E']}
          style={styles.cardGradient}
        >
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <Text style={styles.requestId}>#{request.id.slice(-6)}</Text>
            <Text style={styles.requestTime}>
              {request.createdAt.toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          <View style={styles.requestBadges}>
            <Chip 
              style={[styles.priorityChip, { backgroundColor: getPriorityColor(request.priority) + '20' }]}
              textStyle={[styles.chipText, { color: getPriorityColor(request.priority) }]}
            >
              {request.priority.toUpperCase()}
            </Chip>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(request.status) + '20' }]}
              textStyle={[styles.chipText, { color: getStatusColor(request.status) }]}
            >
              {request.status.toUpperCase()}
            </Chip>
          </View>
        </View>
        
        <Text style={styles.requestMessage}>{request.message}</Text>
        
        <View style={styles.requestFooter}>
          <Chip 
            style={styles.emotionChip}
            textStyle={styles.emotionText}
          >
            {request.emotion}
          </Chip>
          
          <View style={styles.requestActions}>
            {request.status === 'pending' && (
              <Button
                mode="contained"
                style={styles.assignButton}
                labelStyle={styles.assignButtonText}
                onPress={() => handleAssignRequest(request)}
              >
                受け付ける
              </Button>
            )}
            
            {(request.status === 'assigned' || request.status === 'in_progress') && (
              <Button
                mode="outlined"
                style={styles.chatButton}
                labelStyle={styles.chatButtonText}
                onPress={() => handleOpenChat(request)}
              >
                チャットを開く
              </Button>
            )}
          </View>
        </View>
      </LinearGradient>
    </Card>
    </TouchableOpacity>
  );

  const renderAdminStatus = () => {
    const currentAdmin = availableAdmins.find(admin => admin.id === currentAdminId);
    
    return (
      <Card style={styles.statusCard}>
        <LinearGradient
          colors={['#0F3460', '#16213E']}
          style={styles.cardGradient}
        >
          <View style={styles.statusHeader}>
            <PixelAvatar
              size={48}
              emotion="neutral"
              color="green"
              style={styles.adminAvatar}
            />
            <View style={styles.adminInfo}>
              <Text style={styles.adminName}>
                {admin?.displayName || '管理者ダッシュボード'}
              </Text>
              <Text style={styles.adminRole}>サポート管理者</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>ログアウト</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusButtons}>
            {(['available', 'busy', 'away'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  currentAdmin?.status === status && styles.statusButtonActive
                ]}
                onPress={() => handleStatusChange(status)}
              >
                <Text style={[
                  styles.statusButtonText,
                  currentAdmin?.status === status && styles.statusButtonTextActive
                ]}>
                  {status === 'available' ? '対応可能' :
                   status === 'busy' ? '多忙' :
                   status === 'away' ? '離席中' : status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {currentAdmin && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentAdmin.activeChats}</Text>
                <Text style={styles.statLabel}>対応中</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentAdmin.satisfactionScore.toFixed(1)}</Text>
                <Text style={styles.statLabel}>満足度</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentAdmin.responseTimeAvg}分</Text>
                <Text style={styles.statLabel}>平均応答</Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </Card>
    );
  };

  // 認証されていない場合はローディング画面を表示
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0A0A0A', '#1A1A1A']}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00FF88" />
            <Text style={styles.loadingText}>認証中...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  const activeRequests = userRequests.filter(req => req.status === 'in_progress');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={styles.background}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#00FF88']}
              tintColor="#00FF88"
            />
          }
        >
          {/* 管理者ステータス */}
          {renderAdminStatus()}
          
          {/* 統計情報 */}
          <View style={styles.statsOverview}>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingRequests.length}</Text>
              <Text style={styles.statTitle}>待機中</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{activeRequests.length}</Text>
              <Text style={styles.statTitle}>対応中</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{availableAdmins.length}</Text>
              <Text style={styles.statTitle}>管理者</Text>
            </Surface>
          </View>
          
          {/* AIアバターからのサポートリクエスト */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 AIアバターからのサポートリクエスト</Text>
            {userRequests.length === 0 ? (
              <Text style={styles.emptyText}>現在サポートリクエストはありません</Text>
            ) : (
              userRequests.map(renderRequestCard)
            )}
          </View>
          
          {/* 対応中のリクエスト */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>対応中のリクエスト</Text>
            {activeRequests.length === 0 ? (
              <Text style={styles.emptyText}>現在対応中のリクエストはありません</Text>
            ) : (
              activeRequests.map(renderRequestCard)
            )}
          </View>
        </ScrollView>
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00FF88" />
          </View>
        )}

        {/* リクエスト詳細モーダル */}
        {showRequestDetail && selectedRequest && (
          <Modal
            visible={showRequestDetail}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowRequestDetail(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>サポートリクエスト詳細</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowRequestDetail(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>リクエストID</Text>
                    <Text style={styles.detailValue}>#{selectedRequest.id.slice(-6)}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>ユーザーID</Text>
                    <Text style={styles.detailValue}>{selectedRequest.userId}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>感情</Text>
                    <Chip style={styles.emotionChip}>
                      <Text style={styles.emotionText}>{selectedRequest.emotion}</Text>
                    </Chip>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>優先度</Text>
                    <Chip 
                      style={[styles.priorityChip, { backgroundColor: getPriorityColor(selectedRequest.priority) + '20' }]}
                    >
                      <Text style={[styles.chipText, { color: getPriorityColor(selectedRequest.priority) }]}>
                        {selectedRequest.priority.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>ステータス</Text>
                    <Chip 
                      style={[styles.statusChip, { backgroundColor: getStatusColor(selectedRequest.status) + '20' }]}
                    >
                      <Text style={[styles.chipText, { color: getStatusColor(selectedRequest.status) }]}>
                        {selectedRequest.status.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>メッセージ</Text>
                    <Text style={styles.messageText}>{selectedRequest.message}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>作成日時</Text>
                    <Text style={styles.detailValue}>
                      {selectedRequest.createdAt.toLocaleString('ja-JP')}
                    </Text>
                  </View>
                </ScrollView>
                
                <View style={styles.modalFooter}>
                  <Button
                    mode="outlined"
                    style={styles.cancelButton}
                    onPress={() => setShowRequestDetail(false)}
                  >
                    閉じる
                  </Button>
                  
                  {selectedRequest.status === 'pending' && (
                    <Button
                      mode="contained"
                      style={styles.acceptButton}
                      onPress={() => {
                        handleAssignRequest(selectedRequest);
                        setShowRequestDetail(false);
                      }}
                    >
                      受け付ける
                    </Button>
                  )}
                </View>
              </View>
            </View>
          </Modal>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  
  // ステータスカード
  statusCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  adminAvatar: {
    marginRight: 12,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  adminRole: {
    fontSize: 14,
    color: '#00FF88',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutButtonText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // ステータスボタン
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00FF88',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#00FF88',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#00FF88',
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#000000',
  },
  
  // 統計情報
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  
  // 統計概要
  statsOverview: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  statTitle: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
  },
  
  // セクション
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    padding: 20,
  },
  
  // リクエストカード
  requestCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  requestTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  requestBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  requestMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emotionChip: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  emotionText: {
    color: '#00FF88',
    fontSize: 12,
  },
  assignButton: {
    backgroundColor: '#00FF88',
  },
  assignButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  chatButton: {
    borderColor: '#00FF88',
  },
  chatButtonText: {
    color: '#00FF88',
    fontWeight: '600',
  },
  
  // ローディング
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00FF88',
    fontSize: 16,
    marginTop: 16,
  },
  
  // リクエストカード
  requestCardContainer: {
    marginBottom: 12,
  },
  
  // モーダル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A0A2E',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#16213E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF88',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    backgroundColor: '#16213E',
    padding: 12,
    borderRadius: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#16213E',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#666666',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#00FF88',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminDashboardScreen;
