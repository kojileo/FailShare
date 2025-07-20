import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Avatar, Divider, TextInput, Dialog, Portal, IconButton } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../stores/authStore';
import { updateDisplayName, updateAvatar, generateNewNickname } from '../services/authService';
import { storyService } from '../services/storyService';
import { RootStackParamList } from '../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ProfileScreenProps {
  navigation?: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut, isLoading, setUser } = useAuthStore();
  const [nicknameDialogVisible, setNicknameDialogVisible] = useState(false);
  const [avatarDialogVisible, setAvatarDialogVisible] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [updating, setUpdating] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'サインアウト確認',
      '匿名ユーザーではサインアウト後に同じアカウントで再ログインできません。\n\n投稿した失敗談やプロフィール情報は完全に削除されます。\n\n本当にサインアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'サインアウト',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleNicknameEdit = () => {
    setNewNickname(user?.displayName || '');
    setNicknameDialogVisible(true);
  };

  const handleNicknameUpdate = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const updatedUser = await updateDisplayName(user.id, newNickname);
      if (updatedUser) {
        setUser(updatedUser);
        setNicknameDialogVisible(false);
        Alert.alert('完了', 'ニックネームを更新しました');
      }
    } catch (error) {
      console.error('ニックネーム更新エラー:', error);
      Alert.alert('エラー', error instanceof Error ? error.message : 'ニックネームの更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateNewNickname = () => {
    const newName = generateNewNickname();
    setNewNickname(newName);
  };

  const handleAvatarChange = async (avatarNumber: number) => {
    if (!user) return;

    setUpdating(true);
    try {
      const newAvatar = `avatar_${avatarNumber}.png`;
      const updatedUser = await updateAvatar(user.id, newAvatar);
      if (updatedUser) {
        setUser(updatedUser);
        setAvatarDialogVisible(false);
        Alert.alert('完了', 'アバターを更新しました');
      }
    } catch (error) {
      console.error('アバター更新エラー:', error);
      Alert.alert('エラー', error instanceof Error ? error.message : 'アバターの更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const handleCleanupUsers = async () => {
    Alert.alert(
      '重複ユーザークリーンアップ',
      '重複している匿名ユーザーを削除しますか？\n\n※この操作は元に戻せません',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '実行',
          style: 'destructive',
          onPress: async () => {
            setDebugLoading(true);
            try {
              const { cleanupDuplicates } = useAuthStore.getState();
              const result = await cleanupDuplicates();
              Alert.alert('完了', `${result.cleaned}個のユーザーを削除しました\n（全体: ${result.total}）`);
            } catch (error) {
              Alert.alert('エラー', error instanceof Error ? error.message : 'クリーンアップに失敗しました');
            } finally {
              setDebugLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleShowStats = async () => {
    setDebugLoading(true);
    try {
      const { showStats } = useAuthStore.getState();
      await showStats();
      Alert.alert('統計情報', 'コンソールログを確認してください');
    } catch (error) {
      Alert.alert('エラー', error instanceof Error ? error.message : '統計取得に失敗しました');
    } finally {
      setDebugLoading(false);
    }
  };

  const handleCleanupSampleData = async () => {
    Alert.alert(
      'サンプルデータクリーンアップ',
      '重複しているサンプルデータを削除しますか？\n\n※この操作は元に戻せません',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '実行',
          style: 'destructive',
          onPress: async () => {
            setDebugLoading(true);
            try {
              await storyService.resetSampleData();
              Alert.alert('完了', 'サンプルデータをリセットしました');
            } catch (error) {
              Alert.alert('エラー', error instanceof Error ? error.message : 'クリーンアップに失敗しました');
            } finally {
              setDebugLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>ユーザー情報を読み込めません</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* プロフィール情報 */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Avatar.Image 
                  size={80} 
                  source={{ uri: `https://robohash.org/${user.displayName}?set=set4` }}
                />
                <IconButton
                  icon="pencil"
                  size={20}
                  style={styles.editAvatarButton}
                  onPress={() => setAvatarDialogVisible(true)}
                />
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nicknameContainer}>
                  <Text variant="headlineSmall" style={styles.displayName}>
                    {user.displayName}
                  </Text>
                  <IconButton
                    icon="pencil"
                    size={20}
                    style={styles.editNicknameButton}
                    onPress={handleNicknameEdit}
                  />
                </View>
                <Text variant="bodyMedium" style={styles.joinDate}>
                  {user.joinedAt instanceof Date ? user.joinedAt.toLocaleDateString('ja-JP') : '不明'} から参加
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 統計情報 */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statsTitle}>
              あなたの活動
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {user.stats.totalPosts}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  投稿数
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {user.stats.totalComments}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  コメント数
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {user.stats.helpfulVotes}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  役立った数
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {user.stats.learningPoints}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  学習ポイント
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 設定セクション */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.settingsTitle}>
              設定
            </Text>
            <View style={styles.settingItem}>
              <Text variant="bodyMedium">匿名モード</Text>
              <Text variant="bodySmall" style={styles.settingDescription}>
                常に匿名で投稿・コメントします
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.settingItem}>
              <Text variant="bodyMedium">プライバシー</Text>
              <Text variant="bodySmall" style={styles.settingDescription}>
                個人情報は一切収集されません
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* 開発者デバッグツール (Development環境のみ) */}
        {(__DEV__ || process.env.NODE_ENV === 'development') && (
          <Card style={styles.debugCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.debugTitle}>
                🛠️ 開発者ツール
              </Text>
              <Text variant="bodySmall" style={styles.debugDescription}>
                ※ Development環境でのみ表示されます
              </Text>
              <Divider style={styles.divider} />
              
              <View style={styles.debugButtonRow}>
                <Button
                  mode="outlined"
                  onPress={handleShowStats}
                  loading={debugLoading}
                  disabled={debugLoading}
                  style={styles.debugButton}
                  compact
                >
                  📊 統計表示
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleCleanupUsers}
                  loading={debugLoading}
                  disabled={debugLoading}
                  style={styles.debugButton}
                  compact
                >
                  🧹 重複ユーザー削除
                </Button>
              </View>
              
              <View style={styles.debugButtonRow}>
                <Button
                  mode="outlined"
                  onPress={handleCleanupSampleData}
                  loading={debugLoading}
                  disabled={debugLoading}
                  style={styles.debugButton}
                  compact
                >
                  🗑️ サンプルデータ削除
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* アクションボタン */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={() => navigation?.navigate('MyStories')}
            style={styles.myStoriesButton}
            icon="folder"
          >
            マイ投稿
          </Button>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            loading={isLoading}
            disabled={isLoading}
            style={styles.signOutButton}
          >
            サインアウト
          </Button>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            FailShare v1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.footerText}>
            失敗を成長の糧に変える
          </Text>
        </View>
      </View>

      {/* ニックネーム編集ダイアログ */}
      <Portal>
        <Dialog visible={nicknameDialogVisible} onDismiss={() => setNicknameDialogVisible(false)}>
          <Dialog.Title>ニックネーム変更</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="新しいニックネーム"
              value={newNickname}
              onChangeText={setNewNickname}
              maxLength={20}
              style={styles.dialogInput}
            />
            <Button
              mode="outlined"
              onPress={handleGenerateNewNickname}
              style={styles.generateButton}
            >
              ランダム生成
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNicknameDialogVisible(false)}>
              キャンセル
            </Button>
            <Button
              onPress={handleNicknameUpdate}
              loading={updating}
              disabled={updating || !newNickname.trim()}
            >
              更新
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* アバター選択ダイアログ */}
        <Dialog visible={avatarDialogVisible} onDismiss={() => setAvatarDialogVisible(false)}>
          <Dialog.Title>アバター変更</Dialog.Title>
          <Dialog.Content>
            <View style={styles.avatarGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                <Button
                  key={number}
                  mode="outlined"
                  onPress={() => handleAvatarChange(number)}
                  style={styles.avatarOption}
                  disabled={updating}
                >
                  <Avatar.Image
                    size={40}
                    source={{ uri: `https://robohash.org/avatar_${number}?set=set4` }}
                  />
                </Button>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAvatarDialogVisible(false)}>
              キャンセル
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  editAvatarButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#6200EE',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontWeight: 'bold',
    marginBottom: 4,
    flex: 1,
  },
  editNicknameButton: {
    marginLeft: 4,
  },
  joinDate: {
    color: '#666',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: '25%',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#6200EE',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingsTitle: {
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 8,
  },
  settingDescription: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  actionButtons: {
    marginBottom: 32,
  },
  myStoriesButton: {
    marginBottom: 16,
  },
  signOutButton: {
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  footerText: {
    color: '#888',
    marginBottom: 4,
  },
  dialogInput: {
    marginBottom: 16,
  },
  generateButton: {
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  avatarOption: {
    width: '18%',
    marginBottom: 8,
  },
  // デバッグツール用スタイル
  debugCard: {
    marginBottom: 16,
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  debugTitle: {
    marginBottom: 8,
    color: '#856404',
    fontWeight: 'bold',
  },
  debugDescription: {
    color: '#856404',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  debugButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    gap: 8,
  },
  debugButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#ffc107',
  },
});

export default ProfileScreen; 