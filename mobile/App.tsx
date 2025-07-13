import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { useAuthStore } from './src/stores/authStore';

export default function App() {
  const { isSignedIn, isLoading, initializeAuth } = useAuthStore();

  // 認証状態の初期化
  React.useEffect(() => {
    const unsubscribe = initializeAuth();
    
    // クリーンアップ
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

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

  // 認証状態に応じて画面を切り替え
  return (
    <SafeAreaProvider>
      <PaperProvider>
        {isSignedIn ? <AppNavigator /> : <AuthScreen />}
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
