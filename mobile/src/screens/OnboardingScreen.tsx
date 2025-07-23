import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Card, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: '💫',
      title: 'FailShareへようこそ！',
      description: '恋愛の失敗を成長の糧に変える安全なコミュニティです。\n\n完全匿名で恋愛失敗体験を共有し、同じ経験をした人同士で学び合えます。\n\nデート・告白・カップル関係・片想い・別れなど、恋愛のあらゆる失敗から学べます。',
      buttonText: '始める'
    },
    {
      icon: '📝',
      title: '失敗談を構造化して投稿しよう',
      description: 'テンプレートに沿って体験を整理：\n\n• 状況: どんな状況だったか\n• 行動: どう行動したか\n• 結果: どうなったか\n• 学び: 何を学んだか\n\nこの流れで振り返ることで、失敗が貴重な経験談に変わります。',
      buttonText: '次へ'
    },
    {
      icon: '🔍',
      title: '二大コンテンツから学ぼう',
      description: 'カテゴリーや感情で恋愛失敗談を検索できます：\n\n• デート：初デート・プランニングの失敗\n• 告白：告白・プロポーズの失敗\n• カップル：交際中の関係性の失敗\n• 片想い：片思い・アプローチの失敗\n• 別れ：別れ・復縁の失敗\n• 感情タグで検索（後悔、恥ずかしい、不安など）\n\n同じような恋愛経験をした人の知恵を活用できます。',
      buttonText: '次へ'
    },
    {
      icon: '🤝',
      title: 'みんなで支え合う',
      description: '共感と励ましで成長し合い：\n\n• 「役に立った」で共感を表現\n• 同じ失敗を経験した人からの励まし\n• 実体験に基づくアドバイス\n\n失敗の痛みを分かち合い、一緒に成長していきましょう。',
      buttonText: '次へ'
    },
    {
      icon: '🚀',
      title: '準備完了！',
      description: 'あなたも今日からFailShareの一員です！\n\n最初は他の人の失敗談を読んでみて、どんな体験があるか感じてください。\n\n準備ができたら、あなたの体験も共有してみましょう。\n\nあなたの失敗談が、誰かの貴重な学びになります。',
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* プログレスインジケーター */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep ? styles.progressDotActive : styles.progressDotInactive
              ]}
            />
          ))}
        </View>

        {/* メインコンテンツ */}
        <View style={styles.mainContent}>
          <Text style={styles.icon}>{currentStepData.icon}</Text>
          
          <Text variant="headlineMedium" style={styles.title}>
            {currentStepData.title}
          </Text>
          
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.description}>
                {currentStepData.description}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* ボタンエリア */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            contentStyle={styles.buttonContent}
          >
            {currentStepData.buttonText}
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button
              mode="text"
              onPress={handleSkip}
              style={styles.skipButton}
            >
              スキップ
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: '#6200EE',
  },
  progressDotInactive: {
    backgroundColor: '#E0E0E0',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    color: '#666',
  },
  buttonContainer: {
    paddingTop: 32,
  },
  nextButton: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  skipButton: {
    alignSelf: 'center',
  },
});

export default OnboardingScreen; 