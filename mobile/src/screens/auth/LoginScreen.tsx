import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';

export default function LoginScreen({ navigation }: any) {
  const [method, setMethod] = useState<'email' | 'employeeId'>('email');
  const [identifier, setIdentifier] = useState('');
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
    mutedBg: isDark ? '#27272a' : '#f4f4f5',
    border: isDark ? '#27272a' : '#e4e4e7',
    primary: isDark ? '#ffffff' : '#18181b',
    primaryText: isDark ? '#09090b' : '#ffffff',
    errorLight: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
    errorText: '#ef4444',
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError(`Please enter your ${method === 'email' ? 'email' : 'Employee ID'} and password.`);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/mobile/auth/login', {
        emailOrId: identifier,
        password: password,
      });

      if (response.data.access_token) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await login(response.data.access_token);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Login failed: Invalid response');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid credentials or network error.');
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
        
        {/* Top Branding Section (Solid Black) */}
        <View style={styles.heroSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <Text style={styles.brandSubtitle}>Darion Technologies</Text>
            <Text style={styles.brandTitle}>Build skills that move our work forward.</Text>
          </View>
        </View>

        {/* Login Form Section */}
        <View style={[styles.formSection, { backgroundColor: theme.bg }]}>
          <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Sign in with your email or Employee ID.
          </Text>

          <View style={[styles.tabContainer, { backgroundColor: theme.mutedBg }]}>
            <TouchableOpacity 
              style={[styles.tabButton, method === 'email' && [styles.activeTab, { backgroundColor: theme.bg }]]}
              onPress={() => { setMethod('email'); setIdentifier(''); setError(null); Haptics.selectionAsync(); }}
            >
              <Ionicons name="mail" size={16} color={method === 'email' ? theme.text : theme.muted} />
              <Text style={[styles.tabText, { color: method === 'email' ? theme.text : theme.muted }]}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, method === 'employeeId' && [styles.activeTab, { backgroundColor: theme.bg }]]}
              onPress={() => { setMethod('employeeId'); setIdentifier(''); setError(null); Haptics.selectionAsync(); }}
            >
              <Ionicons name="id-card" size={16} color={method === 'employeeId' ? theme.text : theme.muted} />
              <Text style={[styles.tabText, { color: method === 'employeeId' ? theme.text : theme.muted }]}>Employee ID</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              {method === 'email' ? 'Work email' : 'Employee ID'}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder={method === 'email' ? 'you@darion.in' : 'DT-00142'}
              placeholderTextColor={theme.muted}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType={method === 'email' ? 'email-address' : 'default'}
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
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.primaryText} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.primaryText }]}>Sign in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: theme.text }]}>Forgot password?</Text>
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: theme.muted }]}>
            Access is limited to invited Darion Technologies team members.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    height: 280,
    backgroundColor: '#000000', // Solid Black
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
    marginTop: -20, // Overlap the hero section slightly
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
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
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
  forgotPassword: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footerText: {
    marginTop: 32,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
