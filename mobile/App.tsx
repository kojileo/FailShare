import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useAuthStore } from './src/stores/authStore';
import { storyService } from './src/services/storyService';

export default function App() {
  const { isSignedIn, isLoading, isOnboardingCompleted, initializeAuth, completeOnboarding } = useAuthStore();

  // 認証状態の初期化
  React.useEffect(() => {
    const unsubscribe = initializeAuth();
    
    // クリーンアップ
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  // サンプルデータの初期化（恋愛関連データに更新）
  React.useEffect(() => {
    if (isSignedIn) {
      // Development環境のみでサンプルデータをリセット＆更新
      // Production環境では権限エラーが発生するため無効化
      if (process.env.NODE_ENV === 'development' || __DEV__) {
        storyService.resetSampleData().catch(error => {
          console.error('サンプルデータ初期化エラー:', error);
        });
      } else {
        console.log('🚫 Production環境のため、サンプルデータ生成をスキップしました');
      }
    }
  }, [isSignedIn]);

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
          <AppNavigator />
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
