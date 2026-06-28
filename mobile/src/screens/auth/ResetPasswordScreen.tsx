import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Login');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create new password</Text>
        <Text style={styles.desc}>Your new password must be different from previous used passwords.</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Label>Password</Label>
            <Input 
              placeholder="••••••••" 
              isPassword 
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View style={styles.inputGroup}>
            <Label>Confirm Password</Label>
            <Input 
              placeholder="••••••••" 
              isPassword 
            />
          </View>
          
          <Button title="Reset Password" onPress={handleReset} loading={loading} style={{ marginTop: 16 }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, marginTop: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#09090b', marginBottom: 12 },
  desc: { fontSize: 16, color: '#71717a', marginBottom: 32, lineHeight: 24 },
  form: { gap: 16 },
  inputGroup: { gap: 4 },
});
