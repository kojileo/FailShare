import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  Surface, 
  Checkbox, 
  Button, 
  ProgressBar,
  Card,
  Title,
  Paragraph
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ADSENSE_REVIEW_CONFIG, ReviewStatus, ReviewProgress } from '../config/adsense-review';

const AdSenseReviewScreen: React.FC = () => {
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({});
  const [reviewProgress, setReviewProgress] = useState<ReviewProgress>({
    status: ReviewStatus.IN_PROGRESS,
    checklistCompleted: false,
    requirementsMet: false,
  });

  const handleChecklistChange = (item: string, checked: boolean) => {
    const newChecklist = { ...checklist, [item]: checked };
    setChecklist(newChecklist);
    
    const completedCount = Object.values(newChecklist).filter(Boolean).length;
    const totalCount = ADSENSE_REVIEW_CONFIG.CHECKLIST.length;
    
    setReviewProgress(prev => ({
      ...prev,
      checklistCompleted: completedCount === totalCount,
      requirementsMet: completedCount >= totalCount * 0.8, // 80%以上で要件満たす
    }));
  };

  const getProgressPercentage = () => {
    const completedCount = Object.values(checklist).filter(Boolean).length;
    return completedCount / ADSENSE_REVIEW_CONFIG.CHECKLIST.length;
  };

  const getStatusColor = () => {
    switch (reviewProgress.status) {
      case ReviewStatus.APPROVED:
        return '#28a745';
      case ReviewStatus.REJECTED:
        return '#dc3545';
      case ReviewStatus.SUBMITTED:
        return '#ffc107';
      default:
        return '#007bff';
    }
  };

  const getStatusText = () => {
    switch (reviewProgress.status) {
      case ReviewStatus.APPROVED:
        return '✅ 審査通過';
      case ReviewStatus.REJECTED:
        return '❌ 審査不合格';
      case ReviewStatus.SUBMITTED:
        return '⏳ 審査中';
      default:
        return '📋 審査準備中';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1DA1F2', '#1991DB']}
        style={styles.header}
      >
        <Title style={styles.headerTitle}>Google AdSense審査</Title>
        <Paragraph style={styles.headerSubtitle}>
          審査要件の確認と進捗管理
        </Paragraph>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* 進捗状況 */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Title style={styles.progressTitle}>審査進捗</Title>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                チェックリスト完了率: {Math.round(getProgressPercentage() * 100)}%
              </Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
            <ProgressBar 
              progress={getProgressPercentage()} 
              color={getStatusColor()}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        {/* 審査要件チェックリスト */}
        <Card style={styles.checklistCard}>
          <Card.Content>
            <Title style={styles.checklistTitle}>審査要件チェックリスト</Title>
            <Paragraph style={styles.checklistDescription}>
              以下の項目を確認して、AdSense審査の準備を整えましょう
            </Paragraph>
            
            {ADSENSE_REVIEW_CONFIG.CHECKLIST.map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <Checkbox
                  status={checklist[item] ? 'checked' : 'unchecked'}
                  onPress={() => handleChecklistChange(item, !checklist[item])}
                />
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* 技術要件 */}
        <Card style={styles.requirementsCard}>
          <Card.Content>
            <Title style={styles.requirementsTitle}>技術要件</Title>
            
            <View style={styles.requirementSection}>
              <Text style={styles.sectionTitle}>✅ コンテンツ要件</Text>
              {Object.entries(ADSENSE_REVIEW_CONFIG.REQUIREMENTS.CONTENT).map(([key, value]) => (
                <View key={key} style={styles.requirementItem}>
                  <Text style={styles.requirementText}>
                    {key.replace(/_/g, ' ')}: {value ? '✅' : '❌'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.requirementSection}>
              <Text style={styles.sectionTitle}>✅ 技術要件</Text>
              {Object.entries(ADSENSE_REVIEW_CONFIG.REQUIREMENTS.TECHNICAL).map(([key, value]) => (
                <View key={key} style={styles.requirementItem}>
                  <Text style={styles.requirementText}>
                    {key.replace(/_/g, ' ')}: {value ? '✅' : '❌'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.requirementSection}>
              <Text style={styles.sectionTitle}>✅ ユーザー体験要件</Text>
              {Object.entries(ADSENSE_REVIEW_CONFIG.REQUIREMENTS.UX).map(([key, value]) => (
                <View key={key} style={styles.requirementItem}>
                  <Text style={styles.requirementText}>
                    {key.replace(/_/g, ' ')}: {value ? '✅' : '❌'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.requirementSection}>
              <Text style={styles.sectionTitle}>✅ 法的要件</Text>
              {Object.entries(ADSENSE_REVIEW_CONFIG.REQUIREMENTS.LEGAL).map(([key, value]) => (
                <View key={key} style={styles.requirementItem}>
                  <Text style={styles.requirementText}>
                    {key.replace(/_/g, ' ')}: {value ? '✅' : '❌'}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* 次のステップ */}
        <Card style={styles.nextStepsCard}>
          <Card.Content>
            <Title style={styles.nextStepsTitle}>次のステップ</Title>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1.</Text>
              <Text style={styles.stepText}>チェックリストを全て完了する</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2.</Text>
              <Text style={styles.stepText}>Google AdSenseに申請する</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3.</Text>
              <Text style={styles.stepText}>審査結果を待つ（通常1-2週間）</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4.</Text>
              <Text style={styles.stepText}>承認後に実際の広告コードを実装</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#495057',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  checklistCard: {
    marginBottom: 16,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  checklistDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
  requirementsCard: {
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  requirementSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  requirementItem: {
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 14,
    color: '#6c757d',
  },
  nextStepsCard: {
    marginBottom: 16,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1DA1F2',
    marginRight: 8,
    minWidth: 20,
  },
  stepText: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
    lineHeight: 20,
  },
});

export default AdSenseReviewScreen; 