import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticEvent } from '../utils/haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api/client';

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDark = useColorScheme() === 'dark';
  const theme = {
    bg: isDark ? '#09090b' : '#f8fafc',
    card: isDark ? '#18181b' : '#ffffff',
    text: isDark ? '#ffffff' : '#0f172a',
    muted: isDark ? '#a1a1aa' : '#64748b',
    border: isDark ? '#27272a' : '#e2e8f0',
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/mobile/profile');
        setProfile(response.data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await HapticEvent.logoutConfirm();
    await SecureStore.deleteItemAsync('userToken');
    navigation.replace('Login');
  };

  const handleMenuPress = () => {
    HapticEvent.buttonPrimary();
  };

  const renderMenuItem = (icon: any, title: string, color: string) => (
    <TouchableOpacity onPress={handleMenuPress} style={[styles.menuItem, { borderBottomColor: theme.border }]}>
      <View style={[styles.menuIconBg, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.menuText, { color: theme.text }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: '#ef4444', textAlign: 'center', marginTop: 40 }}>{error}</Text>
        ) : profile && (
          <>
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                {profile.user.avatarUrl ? (
                  <Image source={{ uri: profile.user.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{profile.user.name?.charAt(0).toUpperCase() || 'U'}</Text>
                )}
              </View>
              <Text style={[styles.name, { color: theme.text }]}>{profile.user.name}</Text>
              <Text style={[styles.role, { color: theme.muted }]}>{profile.user.department || profile.user.role || 'Darion Academy'}</Text>
            </View>

            <View style={[styles.statsRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.text }]}>{profile.stats.totalCourses || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>Courses</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.text }]}>{profile.stats.certificatesEarned || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>Certificates</Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>SETTINGS</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {renderMenuItem('notifications', 'Push Notifications', '#0ea5e9')}
            {renderMenuItem('moon', 'Dark Mode Override', '#8b5cf6')}
            {renderMenuItem('lock-closed', 'Privacy & Security', '#10b981')}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 32, paddingTop: 20 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  role: { fontSize: 14, fontWeight: '500' },
  statsRow: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, paddingVertical: 16, marginBottom: 32 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  statDivider: { width: 1 },
  menuSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8, paddingLeft: 8 },
  menuCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  menuIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600' },
  signOutButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  signOutText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
});
