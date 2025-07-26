import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: '💫',
      title: 'FailShareへようこそ！',
      description: '失敗を成長の糧に変える\n安全なコミュニティです',
      details: [
        '完全匿名で失敗体験を共有',
        '同じ経験をした人同士で学び合い',
        '恋愛・仕事・その他の失敗から学習'
      ],
      buttonText: '始める'
    },
    {
      icon: '📝',
      title: '失敗談を構造化して投稿',
      description: 'テンプレートに沿って\n体験を整理しよう',
      details: [
        '状況: どんな状況だったか',
        '行動: どう行動したか',
        '結果: どうなったか',
        '学び: 何を学んだか'
      ],
      buttonText: '次へ'
    },
    {
      icon: '🔍',
      title: 'カテゴリーから学ぼう',
      description: 'あなたに合った失敗談を\n見つけられます',
      details: [
        '恋愛: デート・告白・カップル・片想い・別れ',
        '仕事: 人間関係・キャリア・プレゼン・管理',
        '感情タグで検索（後悔・恥ずかしい・不安など）'
      ],
      buttonText: '次へ'
    },
    {
      icon: '🤝',
      title: 'みんなで支え合う',
      description: '共感と励ましで\n成長し合おう',
      details: [
        '「参考になった」で共感を表現',
        '同じ失敗を経験した人からの励まし',
        '実体験に基づくアドバイス交換'
      ],
      buttonText: '次へ'
    },
    {
      icon: '🚀',
      title: '準備完了！',
      description: 'あなたも今日から\nFailShareの一員です',
      details: [
        '最初は他の人の失敗談を読んでみよう',
        '準備ができたらあなたの体験も共有',
        'あなたの失敗談が誰かの学びになる'
      ],
      buttonText: 'スタート！'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DA1F2" />
      
      {/* モダンヘッダー */}
      <LinearGradient
        colors={['#1DA1F2', '#1991DB']}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          {currentStep > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}
          <Text style={styles.headerTitle}>はじめに</Text>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>スキップ</Text>
          </TouchableOpacity>
        </View>
        
        {/* プログレスバー */}
        <View style={styles.progressContainer}>
          <LinearGradient
            colors={['#FFFFFF30', '#FFFFFF10']}
            style={styles.progressTrack}
          >
            <LinearGradient
              colors={['#FFFFFF', '#FFFFFFCC']}
              style={[styles.progressFill, { width: `${((currentStep + 1) / steps.length) * 100}%` }]}
            />
          </LinearGradient>
          <Text style={styles.progressText}>
            {currentStep + 1}/{steps.length}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* メインコンテンツ */}
        <View style={styles.mainContent}>
          <Surface style={styles.iconContainer} elevation={3}>
            <Text style={styles.icon}>{currentStepData.icon}</Text>
          </Surface>
          
          <Text style={styles.title}>
            {currentStepData.title}
          </Text>
          
          <Text style={styles.description}>
            {currentStepData.description}
          </Text>

          <Surface style={styles.detailsCard} elevation={2}>
            {currentStepData.details.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.detailDot} />
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </Surface>
        </View>

        {/* ナビゲーションボタン */}
        <View style={styles.navigationContainer}>
          <LinearGradient
            colors={['#1DA1F2', '#1991DB']}
            style={styles.nextButton}
          >
            <TouchableOpacity style={styles.nextButtonInner} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStepData.buttonText}
              </Text>
              {currentStep < steps.length - 1 && (
                <IconButton icon="arrow-right" size={20} iconColor="#FFFFFF" style={styles.nextIcon} />
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modernHeader: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  skipButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1E293B',
    lineHeight: 36,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    color: '#64748B',
    lineHeight: 26,
  },
  detailsCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1DA1F2',
    marginTop: 8,
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    flex: 1,
  },
  navigationContainer: {
    paddingVertical: 24,
  },
  nextButton: {
    borderRadius: 16,
    shadowColor: '#1DA1F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextIcon: {
    margin: 0,
    marginLeft: 8,
  },
});

export default OnboardingScreen; 