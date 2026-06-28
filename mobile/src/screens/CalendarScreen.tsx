import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { apiClient } from '../api/client';

export default function CalendarScreen() {
  const [events, setEvents] = useState<any[]>([]);
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
    const fetchCalendar = async () => {
      try {
        const response = await apiClient.get('/api/mobile/calendar');
        setEvents(response.data.events);
      } catch (err: any) {
        console.error('Error fetching calendar:', err);
        setError(err.message || 'Failed to fetch calendar');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCalendar();
  }, []);

  const handlePress = () => {
    Haptics.selectionAsync();
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case 'assignment': return '#8b5cf6';
      case 'quiz': return '#ef4444';
      case 'course_start': return '#10b981';
      default: return '#0ea5e9';
    }
  };

  // Generate some dummy dates for the top selector based on today
  const today = new Date();
  const DATES = Array.from({length: 7}).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + (i - 3));
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate().toString(),
      active: i === 3
    };
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Schedule</Text>
      </View>

      <View style={styles.dateSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {DATES.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={handlePress}
              style={[
                styles.dateCard, 
                { backgroundColor: item.active ? '#0ea5e9' : theme.card, borderColor: item.active ? '#0ea5e9' : theme.border }
              ]}
            >
              <Text style={[styles.dateDay, { color: item.active ? '#fff' : theme.muted }]}>{item.day}</Text>
              <Text style={[styles.dateNum, { color: item.active ? '#fff' : theme.text }]}>{item.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.timelineHeader, { color: theme.text }]}>Upcoming</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: '#ef4444', textAlign: 'center', marginTop: 40 }}>{error}</Text>
        ) : events.length === 0 ? (
          <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 40 }}>No upcoming events.</Text>
        ) : (
          events.map((event, index) => {
            const eventDate = new Date(event.date);
            const color = getEventColor(event.type);
            return (
              <TouchableOpacity key={event.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} activeOpacity={0.7} style={styles.eventRow}>
                <Text style={[styles.eventTime, { color: theme.muted }]}>
                  {eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
                <View style={styles.eventLine}>
                  <View style={[styles.eventDot, { backgroundColor: color }]} />
                  {index < events.length - 1 && <View style={[styles.eventTail, { backgroundColor: theme.border }]} />}
                </View>
                <View style={[styles.eventCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={2}>{event.title}</Text>
                  <Text style={[styles.eventType, { color: color }]}>{event.courseName}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  dateSelector: { marginBottom: 16 },
  dateScroll: { paddingHorizontal: 20, gap: 12 },
  dateCard: { width: 56, height: 72, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  dateDay: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  dateNum: { fontSize: 20, fontWeight: '800' },
  container: { padding: 20 },
  timelineHeader: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  eventRow: { flexDirection: 'row', marginBottom: 24 },
  eventTime: { width: 64, fontSize: 12, fontWeight: '600', marginTop: 14 },
  eventLine: { width: 24, alignItems: 'center' },
  eventDot: { width: 12, height: 12, borderRadius: 6, marginTop: 14, zIndex: 2 },
  eventTail: { width: 2, flex: 1, position: 'absolute', top: 20, bottom: -24 },
  eventCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  eventTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  eventType: { fontSize: 12, fontWeight: '600', marginTop: 4 },
});
