import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatListScreen from '../screens/social/ChatListScreen';
import ChatRoomScreen from '../screens/social/ChatRoomScreen';
import NewMessageScreen from '../screens/social/NewMessageScreen';
import GroupInfoScreen from '../screens/social/GroupInfoScreen';
import LeaderboardScreen from '../screens/social/LeaderboardScreen';
import PeerProfileScreen from '../screens/social/PeerProfileScreen';
import CommunityFeedScreen from '../screens/social/CommunityFeedScreen';

const Stack = createNativeStackNavigator();

export default function SocialNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="NewMessage" component={NewMessageScreen} />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="PeerProfile" component={PeerProfileScreen} />
      <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
    </Stack.Navigator>
  );
}
