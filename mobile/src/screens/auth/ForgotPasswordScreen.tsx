import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#09090b" />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
      </View>

      <View style={styles.content}>
        {sent ? (
          <View style={styles.successState}>
            <Ionicons name="mail-unread-outline" size={64} color="#09090b" style={styles.icon} />
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successDesc}>We sent a password reset link to {email}</Text>
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} style={{ marginTop: 24 }} />
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.desc}>Enter your email address and we'll send you a link to reset your password.</Text>
            <View style={styles.inputGroup}>
              <Label>Email</Label>
              <Input 
                placeholder="you@darion.in" 
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <Button title="Send Reset Link" onPress={handleReset} loading={loading} style={{ marginTop: 8 }} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 4, marginRight: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#09090b' },
  content: { padding: 24, flex: 1 },
  desc: { fontSize: 16, color: '#71717a', marginBottom: 24, lineHeight: 24 },
  form: { gap: 16 },
  inputGroup: { gap: 4 },
  successState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  successDesc: { fontSize: 16, color: '#71717a', textAlign: 'center', paddingHorizontal: 32 },
});
