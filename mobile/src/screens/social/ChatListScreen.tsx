import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ChatListScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
