import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';

export default function SignUpScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const isDark = useColorScheme() === 'dark';
  const theme = {
    bg: isDark ? '#09090b' : '#ffffff',
    text: isDark ? '#ffffff' : '#09090b',
    muted: isDark ? '#a1a1aa' : '#71717a',
    border: isDark ? '#27272a' : '#e4e4e7',
    primary: isDark ? '#ffffff' : '#18181b',
    primaryText: isDark ? '#09090b' : '#ffffff',
    errorLight: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
    errorText: '#ef4444',
  };

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError(`Please fill in all fields.`);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/mobile/auth/signup', {
        name,
        email,
        password,
      });

      if (response.data.access_token) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await login(response.data.access_token);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Signup failed: Invalid response');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Network error.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.bg }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <Text style={styles.brandSubtitle}>Darion Technologies</Text>
            <Text style={styles.brandTitle}>Join our workspace.</Text>
          </View>
        </View>

        <View style={[styles.formSection, { backgroundColor: theme.bg }]}>
          <Text style={[styles.title, { color: theme.text }]}>Create an account</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Sign up with your work email.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="John Doe"
              placeholderTextColor={theme.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Work email</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="you@darion.in"
              placeholderTextColor={theme.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, { borderColor: theme.border, color: theme.text }]}
                placeholder="••••••••"
                placeholderTextColor={theme.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.errorLight }]}>
              <Text style={[styles.errorText, { color: theme.errorText }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]} 
            onPress={handleSignUp} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.primaryText} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.primaryText }]}>Create Account</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    height: 280,
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
    padding: 24,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 20,
  },
  heroContent: {
    zIndex: 10,
  },
  brandSubtitle: {
    color: '#8fd9ee',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 8,
  },
  formSection: {
    flex: 1,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
