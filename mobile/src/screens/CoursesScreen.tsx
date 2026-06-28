import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import { apiClient } from '../api/client';

const CourseCard = memo(({ course, theme, onPress }: any) => {
  const courseColor = course.progressPercent === 100 ? '#10b981' : course.progressPercent > 0 ? '#0ea5e9' : '#8b5cf6';
  
  return (
    <TouchableOpacity 
      style={[styles.courseCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.thumbnail, { backgroundColor: courseColor + '20' }]}>
        <Ionicons name="play-circle" size={32} color={courseColor} />
      </View>
      <View style={styles.courseInfo}>
        <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={1}>{course.courseTitle}</Text>
        <Text style={[styles.instructor, { color: theme.muted }]}>{course.courseCategory}</Text>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
            <View style={[styles.progressBarFill, { width: `${course.progressPercent}%`, backgroundColor: courseColor }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.muted }]}>{course.progressPercent}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function CoursesScreen() {
  const [courses, setCourses] = useState<any[]>([]);
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
    const fetchCourses = async () => {
      try {
        const response = await apiClient.get('/api/mobile/courses');
        setCourses(response.data);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const renderItem = useCallback(({ item }: any) => (
    <CourseCard course={item} theme={theme} onPress={handlePress} />
  ), [theme, handlePress]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Courses</Text>
        <TouchableOpacity onPress={handlePress} style={[styles.iconButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: '#ef4444', textAlign: 'center', marginTop: 40 }}>{error}</Text>
        ) : courses.length === 0 ? (
          <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 40 }}>You are not enrolled in any courses yet.</Text>
        ) : (
          <FlashList
            data={courses}
            renderItem={renderItem}
            // @ts-ignore
            estimatedItemSize={100}
            contentContainerStyle={styles.flashListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  iconButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { flex: 1 },
  flashListContent: { padding: 20, paddingTop: 10, paddingBottom: 100 },
  courseCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
  thumbnail: { width: 64, height: 64, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  instructor: { fontSize: 12, marginBottom: 12 },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, marginRight: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', width: 36, textAlign: 'right' },
});
