import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, Divider } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';

const ProfileScreen: React.FC = () => {
  const { user, signOut, isLoading } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
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
              <Avatar.Image 
                size={80} 
                source={{ uri: `https://robohash.org/${user.displayName}?set=set4` }}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.displayName}>
                  {user.displayName}
                </Text>
                <Text variant="bodyMedium" style={styles.joinDate}>
                  {user.joinedAt.toLocaleDateString('ja-JP')} から参加
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

        {/* アクションボタン */}
        <View style={styles.actionButtons}>
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
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  displayName: {
    fontWeight: 'bold',
    marginBottom: 4,
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
});

export default ProfileScreen; 