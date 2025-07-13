import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';

const AuthScreen: React.FC = () => {
  const { signIn, isLoading, error } = useAuthStore();

  const handleSignIn = async () => {
    await signIn();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* アプリロゴ・アイコン */}
        <View style={styles.logoContainer}>
          <Text variant="headlineLarge" style={styles.appTitle}>
            FailShare
          </Text>
          <Text variant="bodyLarge" style={styles.appSubtitle}>
            失敗を成長の糧に変える
          </Text>
        </View>

        {/* 説明カード */}
        <Card style={styles.descriptionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              安全な匿名コミュニティ
            </Text>
            <Text variant="bodyMedium" style={styles.cardDescription}>
              • 完全匿名で身バレしない安全な環境{'\n'}
              • 失敗談を共有し、お互いに学び合う{'\n'}
              • 建設的なアドバイスと励ましの場{'\n'}
              • あなたの失敗が誰かの学びになる
            </Text>
          </Card.Content>
        </Card>

        {/* エラーメッセージ */}
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* サインインボタン */}
        <Button
          mode="contained"
          onPress={handleSignIn}
          loading={isLoading}
          disabled={isLoading}
          style={styles.signInButton}
          contentStyle={styles.buttonContent}
        >
          匿名で始める
        </Button>

        {/* プライバシー説明 */}
        <Text variant="bodySmall" style={styles.privacyText}>
          匿名でサインインします。個人情報は一切収集されません。{'\n'}
          いつでもアカウントを削除できます。
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appTitle: {
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  appSubtitle: {
    color: '#666',
    textAlign: 'center',
  },
  descriptionCard: {
    marginBottom: 24,
  },
  cardTitle: {
    marginBottom: 12,
    color: '#333',
  },
  cardDescription: {
    lineHeight: 20,
    color: '#666',
  },
  errorCard: {
    marginBottom: 24,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
  },
  signInButton: {
    marginBottom: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  privacyText: {
    textAlign: 'center',
    color: '#888',
    lineHeight: 16,
  },
});

export default AuthScreen; 