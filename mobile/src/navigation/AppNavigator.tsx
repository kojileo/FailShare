import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateStoryScreen from '../screens/CreateStoryScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import MyStoriesScreen from '../screens/MyStoriesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />
        <Stack.Screen
          name="CreateStory"
          component={CreateStoryScreen}
          options={{
            title: '失敗談を投稿',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1DA1F2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="StoryDetail"
          component={StoryDetailScreen}
          options={{
            title: '失敗談',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1DA1F2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="MyStories"
          component={MyStoriesScreen}
          options={{
            title: 'マイ投稿',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1DA1F2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 