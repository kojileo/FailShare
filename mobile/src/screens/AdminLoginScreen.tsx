import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAdminAuthStore } from '../stores/adminAuthStore';

interface AdminLoginScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'AdminLogin'>;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ navigation }) => {
  const { signIn, isLoading, error, setError } = useAdminAuthStore();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');

  // エラー表示
  useEffect(() => {
    if (error) {
      Alert.alert('ログインエラー', error, [
        { text: 'OK', onPress: () => setError(null) }
      ]);
    }
  }, [error, setError]);

  const handleLogin = async () => {
    try {
      console.log('🔐 ログイン処理開始:');
      console.log('  - adminId:', adminId, '(length:', adminId.length, ')');
      console.log('  - password:', password.length, '文字');
      
      // 入力値の検証
      if (!adminId || !adminId.trim()) {
        console.log('❌ adminId が空です');
        setError('管理者IDを入力してください');
        return;
      }
      
      if (!password || !password.trim()) {
        console.log('❌ password が空です');
        setError('パスワードを入力してください');
        return;
      }

      console.log('🔐 管理者認証を実行中...');
      await signIn(adminId.trim(), password);
      
      console.log('✅ ログイン成功、ダッシュボードに遷移中...');
      // ログイン成功時は自動的にAdminDashboardに遷移
      navigation?.navigate('AdminDashboard');
    } catch (error) {
      console.error('❌ ログイン処理でエラーが発生:', error);
      // エラーは既にストアで処理済み
      setError(error instanceof Error ? error.message : 'ログインに失敗しました');
    }
  };

  const handleBackToHome = () => {
    navigation?.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A2E" />
      
      <LinearGradient
        colors={['#1A0A2E', '#16213E', '#0F3460']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.content}>
            {/* ヘッダー */}
            <View style={styles.header}>
              <Text style={styles.title}>管理者ログイン</Text>
              <Text style={styles.subtitle}>FailShare Admin Portal</Text>
            </View>

            {/* ログインフォーム */}
            <Surface style={styles.loginCard} elevation={4}>
              <View style={styles.form}>
                <Text style={styles.inputLabel}>管理者ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="IDを入力"
                  value={adminId}
                  onChangeText={(text) => {
                    console.log('📝 adminId 変更:', text);
                    setAdminId(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />

                <Text style={styles.inputLabel}>パスワード</Text>
                <TextInput
                  style={styles.input}
                  placeholder="パスワードを入力"
                  value={password}
                  onChangeText={(text) => {
                    console.log('📝 password 変更:', text.length, '文字');
                    setPassword(text);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonText}
                >
                  ログイン
                </Button>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackToHome}
                  disabled={isLoading}
                >
                  <Text style={styles.backButtonText}>← ホームに戻る</Text>
                </TouchableOpacity>
              </View>
            </Surface>

            {/* 開発用情報 */}
            {__DEV__ && (
              <Surface style={styles.devInfo} elevation={2}>
                <Text style={styles.devInfoTitle}>開発用情報</Text>
                <Text style={styles.devInfoText}>
                  管理者ID: admin-1{'\n'}
                  パスワード: password123
                </Text>
              </Surface>
            )}
          </View>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  
  // ヘッダー
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#00FF88',
    opacity: 0.8,
  },
  
  // ログインカード
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A0A2E',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1A0A2E',
  },
  loginButton: {
    backgroundColor: '#00FF88',
    marginTop: 8,
    paddingVertical: 4,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#666666',
    fontSize: 14,
  },
  
  // 開発用情報
  devInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  devInfoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 8,
  },
  devInfoText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AdminLoginScreen;
