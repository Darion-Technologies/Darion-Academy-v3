import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function VerifyEmailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email = route.params?.email || 'your email';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#09090b" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Ionicons name="shield-checkmark-outline" size={64} color="#0ea5e9" style={styles.icon} />
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.desc}>We've sent a verification link to {email}. Please check your inbox to activate your account.</Text>
        
        <View style={styles.btnGroup}>
          <Button title="Open Email App" onPress={() => {}} style={styles.mb} />
          <Button title="Resend Link" variant="outline" onPress={() => {}} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'flex-end',
  },
  backBtn: { padding: 4 },
  content: { padding: 24, flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 16, color: '#71717a', textAlign: 'center', marginBottom: 32, lineHeight: 24, paddingHorizontal: 16 },
  btnGroup: { width: '100%' },
  mb: { marginBottom: 12 },
});
