import React from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, Surface, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';

const AuthScreen: React.FC = () => {
  const { signIn, isLoading, error } = useAuthStore();

  const handleSignIn = async () => {
    await signIn();
  };

  const features = [
    {
      icon: '🔒',
      title: '完全匿名',
      description: '身バレしない\n安全な環境'
    },
    {
      icon: '📚',
      title: '学び合い',
      description: '失敗談を通じて\n知識を共有'
    },
    {
      icon: '💡',
      title: '成長支援',
      description: '実体験から\n学びを得る'
    },
    {
      icon: '🤝',
      title: 'コミュニティ',
      description: '同じ経験者と\n支え合い'
    }
  ];

  const categories = [
    { emoji: '💕', name: 'デート', desc: '初デート・プランニング' },
    { emoji: '💌', name: '告白', desc: '告白・プロポーズ' },
    { emoji: '💑', name: 'カップル', desc: '交際中の関係性' },
    { emoji: '💭', name: '片想い', desc: 'アプローチ・片思い' },
    { emoji: '💔', name: '別れ', desc: '別れ・復縁' },
    { emoji: '🤝', name: '職場関係', desc: '同僚・上司・部下' },
    { emoji: '📈', name: 'キャリア', desc: '転職・昇進' },
    { emoji: '📊', name: 'プレゼン', desc: '会議・発表' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ヒーローセクション */}
        <LinearGradient
          colors={['#1DA1F2', '#1991DB']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Surface style={styles.logoContainer} elevation={3}>
              <Text style={styles.logoEmoji}>💡</Text>
            </Surface>
            
            <Text style={styles.appTitle}>FailShare</Text>
            <Text style={styles.appSubtitle}>失敗を成長の糧に変える</Text>
            
            <Surface style={styles.heroCard} elevation={2}>
              <Text style={styles.heroCardTitle}>失敗から学ぶコミュニティ</Text>
              <Text style={styles.heroCardDesc}>
                あなたの失敗談が、誰かの貴重な学びになります
              </Text>
              
              {/* メイン CTAボタン */}
              <LinearGradient
                colors={['#1DA1F2', '#1991DB']}
                style={styles.heroSignInButton}
              >
                <TouchableOpacity 
                  style={styles.heroSignInButtonInner} 
                  onPress={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Text style={styles.heroSignInButtonText}>接続中...</Text>
                  ) : (
                    <>
                      <IconButton icon="account-plus" size={20} iconColor="#FFFFFF" style={styles.heroSignInIcon} />
                      <Text style={styles.heroSignInButtonText}>匿名で始める</Text>
                    </>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </Surface>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* 特徴セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ 特徴</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <Surface key={index} style={styles.featureCard} elevation={1}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                </Surface>
              ))}
            </View>
          </View>

          {/* 使い方セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 使い方</Text>
            <Surface style={styles.stepsCard} elevation={2}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>失敗談を投稿</Text>
                  <Text style={styles.stepDesc}>状況・行動・結果・学びを整理して投稿</Text>
                </View>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>カテゴリー別に検索</Text>
                  <Text style={styles.stepDesc}>似た経験の失敗談を見つけて学ぶ</Text>
                </View>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>共感とアドバイス</Text>
                  <Text style={styles.stepDesc}>同じ経験をした人と支え合う</Text>
                </View>
              </View>
            </Surface>
          </View>

          {/* カテゴリセクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ カテゴリー</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <Surface key={index} style={styles.categoryChip} elevation={1}>
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDesc}>{category.desc}</Text>
                </Surface>
              ))}
            </View>
          </View>

          {/* エラーメッセージ */}
          {error && (
            <Surface style={styles.errorCard} elevation={1}>
              <IconButton icon="alert-circle" size={24} iconColor="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </Surface>
          )}

          {/* プライバシー説明 */}
          <Surface style={styles.privacyCard} elevation={1}>
            <IconButton icon="shield-check" size={20} iconColor="#10B981" style={styles.privacyIcon} />
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>プライバシー保護</Text>
              <Text style={styles.privacyText}>
                個人情報は一切収集されません。いつでもアカウントを削除できます。
              </Text>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 32,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxWidth: 280,
  },
  heroCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroCardDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroSignInButton: {
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#1DA1F2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  heroSignInButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  heroSignInIcon: {
    margin: 0,
  },
  heroSignInButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1DA1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryChip: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  categoryDesc: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
    marginLeft: 8,
  },
  signInSection: {
    marginTop: 8,
  },
  signInButton: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#1DA1F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  signInIcon: {
    margin: 0,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  privacyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyIcon: {
    margin: 0,
    marginRight: 8,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
  },
});

export default AuthScreen; 