import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';

export default function MyProfileScreen() {
  const { logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Profile</Text>
      
      <Button 
        title="Log Out" 
        onPress={logout} 
        variant="outline"
        style={{ marginTop: 24, width: '80%' }}
      />
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
