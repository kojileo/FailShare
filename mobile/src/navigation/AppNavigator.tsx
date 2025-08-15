import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateStoryScreen from '../screens/CreateStoryScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import MyStoriesScreen from '../screens/MyStoriesScreen';
import FriendsScreen from '../screens/FriendsScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import FriendSearchScreen from '../screens/FriendSearchScreen';
import BlockedUsersScreen from '../screens/BlockedUsersScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
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
        />
        <Stack.Screen
          name="StoryDetail"
          component={StoryDetailScreen}
        />
        <Stack.Screen
          name="MyStories"
          component={MyStoriesScreen}
        />
        <Stack.Screen
          name="Friends"
          component={FriendsScreen}
        />
        <Stack.Screen
          name="FriendRequests"
          component={FriendRequestsScreen}
        />
        <Stack.Screen
          name="FriendSearch"
          component={FriendSearchScreen}
        />
        <Stack.Screen
          name="BlockedUsers"
          component={BlockedUsersScreen}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 