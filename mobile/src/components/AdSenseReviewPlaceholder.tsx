import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ADSENSE_REVIEW_CONFIG } from '../config/adsense-review';

interface AdSenseReviewPlaceholderProps {
  position: string;
  size?: 'banner' | 'rectangle' | 'auto';
  style?: any;
}

const AdSenseReviewPlaceholder: React.FC<AdSenseReviewPlaceholderProps> = ({ 
  position, 
  size = 'auto',
  style 
}) => {
  // 審査モードが無効の場合は何も表示しない
  if (!ADSENSE_REVIEW_CONFIG.REVIEW_MODE) {
    return null;
  }

  const getSizeStyle = () => {
    switch (size) {
      case 'banner':
        return { minHeight: 90, width: '100%' };
      case 'rectangle':
        return { minHeight: 250, width: 300 };
      case 'auto':
      default:
        return { minHeight: 100, width: '100%' };
    }
  };

  return (
    <Surface style={[styles.container, getSizeStyle(), style]} elevation={1}>
      <View style={styles.content}>
        <Text style={styles.icon}>📋</Text>
        <Text style={styles.title}>AdSense審査用プレースホルダー</Text>
        <Text style={styles.position}>位置: {position}</Text>
        <Text style={styles.note}>
          審査通過後に実際の広告が表示されます
        </Text>
        {Platform.OS === 'web' && (
          <Text style={styles.webNote}>
            Web版ではGoogle AdSenseが表示されます
          </Text>
        )}
        {Platform.OS !== 'web' && (
          <Text style={styles.mobileNote}>
            モバイル版ではGoogle AdMobが表示されます
          </Text>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 4,
  },
  position: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  note: {
    fontSize: 11,
    color: '#868e96',
    textAlign: 'center',
    marginBottom: 4,
  },
  webNote: {
    fontSize: 10,
    color: '#adb5bd',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mobileNote: {
    fontSize: 10,
    color: '#adb5bd',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AdSenseReviewPlaceholder; 