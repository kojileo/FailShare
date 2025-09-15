import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useAuthStore } from './src/stores/authStore';
import { realtimeManager } from './src/utils/realtimeManager';

export default function App() {
  const { isSignedIn, isLoading, isOnboardingCompleted, initializeAuth, completeOnboarding } = useAuthStore();

  // Web版でのURLルーティング設定
  const linking = {
    prefixes: Platform.OS === 'web' ? ['http://localhost:8081', 'http://localhost:8080'] : [],
    config: {
      screens: {
        Home: '/',
        Profile: '/profile',
        CreateStory: '/create-story',
        StoryDetail: '/story/:storyId',
        MyStories: '/my-stories',
        Friends: '/friends',
        FriendRequests: '/friend-requests',
        FriendSearch: '/friend-search',
        BlockedUsers: '/blocked-users',
        Chat: '/chat/:chatId',
        ChatList: '/chats',
        AiAvatar: '/ai-avatar',
        AdminLogin: '/admin-login',
        AdminDashboard: '/admin-dashboard',
      },
    },
  };

  // 認証状態の初期化
  React.useEffect(() => {
    const unsubscribe = initializeAuth();
    
    // クリーンアップ
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  // リアルタイムリスナーの管理
  React.useEffect(() => {
    // アプリ終了時に全リスナーを停止
    return () => {
      realtimeManager.removeAllListeners();
    };
  }, []);

  // ローディング中の表示
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  // オンボーディング完了ハンドラー
  const handleOnboardingComplete = async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('オンボーディング完了エラー:', error);
    }
  };

  // 認証状態に応じて画面を切り替え
  return (
    <SafeAreaProvider>
      <PaperProvider>
        {!isSignedIn ? (
          <AuthScreen />
        ) : !isOnboardingCompleted ? (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        ) : (
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
