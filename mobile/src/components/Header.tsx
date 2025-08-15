import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

interface HeaderProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({
  navigation,
  showBackButton = true,
  onBackPress,
  rightComponent,
  title
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={['#1DA1F2', '#1991DB']}
      style={styles.modernHeader}
    >
      <View style={styles.headerContent}>
        {showBackButton ? (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        
        <Text style={styles.headerTitle}>{title || 'FailShare'}</Text>
        
        {rightComponent ? (
          rightComponent
        ) : navigation ? (
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerNavButton} 
              onPress={() => navigation.navigate('Home')}
            >
              <IconButton icon="home" size={20} iconColor="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerNavButton} 
              onPress={() => navigation.navigate('Friends')}
            >
              <IconButton icon="message-text" size={20} iconColor="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerNavButton} 
              onPress={() => navigation.navigate('Profile')}
            >
              <IconButton icon="account" size={20} iconColor="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  modernHeader: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerNavButton: {
    marginHorizontal: 2,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default Header;
