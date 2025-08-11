import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { 
  Text, 
  Avatar, 
  Button, 
  IconButton,
  Surface
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FailureStory } from '../types';

import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

interface ProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();
  const { stories } = useStoryStore();
  const [userStories, setUserStories] = useState<FailureStory[]>([]);

  useEffect(() => {
    if (user) {
      const filtered = stories.filter(story => story.authorId === user.id);
      setUserStories(filtered);
    }
  }, [user, stories]);

  const _handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          style: 'destructive',
          onPress: () => {
            signOut();
            Alert.alert('完了', 'ログアウトしました');
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('プロフィール編集', 'この機能は開発中です');
  };

  const handleSupport = () => {
    Alert.alert('サポート', 'この機能は開発中です');
  };

  const handlePrivacy = () => {
    Alert.alert('プライバシー', 'この機能は開発中です');
  };

  const handleTerms = () => {
    Alert.alert('利用規約', 'この機能は開発中です');
  };

  const getJoinedDays = () => {
    if (!user) return 0;
    const now = new Date();
    const joined = new Date(user.joinedAt || now);
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalStats = () => {
    return {
      totalViews: userStories.reduce((sum, story) => sum + story.metadata.viewCount, 0),
      totalLikes: userStories.reduce((sum, story) => sum + story.metadata.helpfulCount, 0),
      totalComments: userStories.reduce((sum, story) => sum + story.metadata.commentCount, 0),
    };
  };

  const stats = getTotalStats();

  const menuItems = [
    {
      title: 'プロフィール編集',
      subtitle: 'アバターと表示名を変更',
      icon: 'account-edit-outline',
      onPress: handleEditProfile,
    },
    {
      title: 'フレンド',
      subtitle: `${user?.stats.friendsCount || 0}人のフレンド`,
      icon: 'account-group-outline',
      onPress: () => navigation.navigate('Friends'),
    },
  ];

  const supportItems = [
    {
      title: 'ヘルプ・サポート',
      subtitle: 'よくある質問とお問い合わせ',
      icon: 'help-circle-outline',
      onPress: handleSupport,
    },
    {
      title: 'プライバシーポリシー',
      subtitle: '個人情報の取り扱いについて',
      icon: 'shield-account-outline',
      onPress: handlePrivacy,
    },
    {
      title: '利用規約',
      subtitle: 'サービス利用時の規約',
      icon: 'file-document-outline',
      onPress: handleTerms,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      
      {/* モダンヘッダー */}
      <LinearGradient
        colors={['#1DA1F2', '#1991DB']}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modernHeaderTitle}>プロフィール</Text>
          <TouchableOpacity onPress={() => signOut()}>
            <IconButton icon="logout" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}
      >
        {/* ユーザー情報カード */}
        <Surface style={styles.userCard} elevation={3}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.userCardGradient}
          >
            <View style={styles.userHeader}>
              <Avatar.Image 
                size={80} 
                source={{ uri: `https://robohash.org/${user?.displayName}?set=set4` }}
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.displayName}>{user?.displayName || '匿名ユーザー'}</Text>
                                 <Text style={styles.userEmail}>匿名アカウント</Text>
                <View style={styles.joinedInfo}>
                  <IconButton icon="calendar-outline" size={16} iconColor="#8E9AAF" style={styles.joinedIcon} />
                  <Text style={styles.joinedText}>{getJoinedDays()}日前に参加</Text>
                </View>
              </View>
            </View>

            {/* 統計情報 */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStories.length}</Text>
                <Text style={styles.statLabel}>投稿</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalViews}</Text>
                <Text style={styles.statLabel}>閲覧</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalLikes}</Text>
                <Text style={styles.statLabel}>いいね</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalComments}</Text>
                <Text style={styles.statLabel}>コメント</Text>
              </View>
            </View>

            {/* アクションボタン */}
            <View style={styles.actionRow}>
              <Button
                mode="contained"
                onPress={() => navigation?.navigate('CreateStory')}
                style={styles.createButton}
                labelStyle={styles.createButtonText}
                icon="plus"
              >
                投稿する
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation?.navigate('MyStories')}
                style={styles.viewButton}
                labelStyle={styles.viewButtonText}
              >
                マイ失敗談を確認する
              </Button>
            </View>
          </LinearGradient>
        </Surface>

        {/* メニューセクション */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>アカウント</Text>
          {menuItems.map((item, index) => (
            <Surface key={index} style={styles.menuCard} elevation={1}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={item.onPress}
                disabled={!item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <IconButton icon={item.icon} size={24} iconColor="#1DA1F2" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <View style={styles.menuTitleRow}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.menuItemRight}>
                </View>
              </TouchableOpacity>
            </Surface>
          ))}
        </View>

        {/* サポートセクション */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>サポート</Text>
          {supportItems.map((item, index) => (
            <Surface key={index} style={styles.menuCard} elevation={1}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <IconButton icon={item.icon} size={24} iconColor="#8E9AAF" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <IconButton icon="chevron-right" size={20} iconColor="#8E9AAF" />
              </TouchableOpacity>
            </Surface>
          ))}
        </View>

        {/* ログアウトボタン */}
        <Surface style={styles.logoutCard} elevation={1}>
                     <TouchableOpacity style={styles.logoutButton} onPress={() => signOut()}>
            <IconButton icon="logout" size={24} iconColor="#EF4444" />
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
        </Surface>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modernHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
  },
  userCard: {
    margin: 16,
    marginTop: -10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userCardGradient: {
    padding: 24,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  userAvatar: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  userInfo: {
    marginLeft: 20,
    flex: 1,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  joinedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinedIcon: {
    margin: 0,
  },
  joinedText: {
    fontSize: 14,
    color: '#8E9AAF',
    marginLeft: -6,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E9AAF',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#1DA1F2',
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#1DA1F2',
    borderRadius: 12,
  },
  viewButtonText: {
    color: '#1DA1F2',
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  badge: {
    backgroundColor: '#1DA1F2',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#8E9AAF',
  },
  menuItemRight: {
    marginLeft: 12,
  },
  logoutCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 40,
  },
});

export default ProfileScreen; 