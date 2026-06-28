import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === 'dark';
  
  const theme = {
    bg: isDark ? '#09090b' : '#000000', // Solid dark background for welcome
    text: '#ffffff',
    primary: '#ffffff',
    primaryText: '#000000',
    secondary: 'rgba(255,255,255,0.2)',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        <View style={styles.brandContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Darion Academy.</Text>
          <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.8)' }]}>Build skills that move our work forward.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: theme.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Login');
            }}
          >
            <Text style={[styles.btnText, { color: theme.primaryText }]}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: theme.secondary, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('SignUp');
            }}
          >
            <Text style={[styles.btnText, { color: theme.text }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'space-between', zIndex: 10 },
  brandContainer: { marginTop: 60, paddingHorizontal: 16 },
  title: { fontSize: 40, fontWeight: '800', letterSpacing: -1, marginBottom: 12 },
  subtitle: { fontSize: 18, lineHeight: 26 },
  actions: { marginBottom: 40, paddingHorizontal: 16 },
  btn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700' },
});
