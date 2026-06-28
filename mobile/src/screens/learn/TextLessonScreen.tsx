import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, useColorScheme, Alert, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import Markdown from 'react-native-marked';
import { apiClient } from '../../api/client';

export default function TextLessonScreen({ route, navigation }: any) {
  const { id } = route.params || {};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const isDark = useColorScheme() === 'dark';
  const theme = {
    bg: isDark ? '#000000' : '#f3f6f8',
    card: isDark ? '#111111' : '#ffffff',
    text: isDark ? '#ffffff' : '#111827',
    muted: isDark ? '#a1a1aa' : '#6b7280',
    primary: '#1e88e5',
    border: isDark ? '#27272a' : '#e5e7eb',
    success: '#10b981',
  };

  useEffect(() => {
    if (!id) return;
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/mobile/lessons/${id}`);
        setData(response.data);
      } catch (err: any) {
        console.error('Error fetching lesson:', err);
        Alert.alert('Error', err.response?.data?.error || 'Failed to load lesson');
        if (err.response?.status === 403) navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  const handleComplete = async () => {
    if (completing || data?.existingProgress?.completed) return;
    setCompleting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await apiClient.post('/api/learning/complete', { lessonId: id });
      setData((prev: any) => ({
        ...prev,
        existingProgress: { ...prev.existingProgress, completed: true }
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Error', 'Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!data || !data.lesson) return null;

  const { lesson, existingProgress, canComplete, nextLessonId, prevLessonId, lessonFileUrl, submission } = data;
  const isCompleted = existingProgress?.completed;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.moduleTitle, { color: theme.primary }]}>{lesson.module.title}</Text>
          <Text style={[styles.lessonTitle, { color: theme.text }]} numberOfLines={1}>{lesson.title}</Text>
        </View>
      </View>

      <View style={styles.scrollContent}>
        <Markdown 
          value={lesson.content || ' '}
          flatListProps={{
            contentContainerStyle: { padding: 20 },
            ListHeaderComponent: (
              <View style={{ paddingBottom: lesson.content ? 20 : 0 }}>
                {lesson.type === 'LINK' && lesson.externalUrl && (
                  <TouchableOpacity 
                    style={[styles.resourceBtn, { backgroundColor: theme.card, borderColor: theme.border }]} 
                    onPress={() => Linking.openURL(lesson.externalUrl)}
                  >
                    <Ionicons name="link-outline" size={24} color={theme.primary} />
                    <Text style={[styles.resourceText, { color: theme.text }]}>Open External Resource</Text>
                    <Ionicons name="open-outline" size={20} color={theme.muted} />
                  </TouchableOpacity>
                )}

                {lessonFileUrl && (
                  <TouchableOpacity 
                    style={[styles.resourceBtn, { backgroundColor: theme.card, borderColor: theme.border }]} 
                    onPress={() => Linking.openURL(lessonFileUrl)}
                  >
                    <Ionicons name="document-text-outline" size={24} color={theme.primary} />
                    <Text style={[styles.resourceText, { color: theme.text }]}>Download Lesson File</Text>
                    <Ionicons name="download-outline" size={20} color={theme.muted} />
                  </TouchableOpacity>
                )}

                {!lesson.content && !lessonFileUrl && !lesson.externalUrl && !lesson.assignment && (
                  <Text style={{ color: theme.muted }}>No content provided for this lesson.</Text>
                )}
              </View>
            ),
            ListFooterComponent: lesson.assignment ? (
              <View style={[styles.assignmentBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.assignmentLabel, { color: theme.text }]}>Assignment Instructions</Text>
                <Text style={[styles.assignmentText, { color: theme.muted }]}>{lesson.assignment.instructions}</Text>
                
                {submission ? (
                  <View style={[styles.submissionStatus, { backgroundColor: theme.border }]}>
                    <Text style={{ color: theme.text, fontWeight: '700' }}>Status: {submission.status}</Text>
                  </View>
                ) : (
                  <View style={[styles.submissionStatus, { backgroundColor: theme.border }]}>
                    <Text style={{ color: theme.text, fontWeight: '600' }}>Pending Submission</Text>
                    <Text style={{ color: theme.muted, marginTop: 4, fontSize: 13 }}>Please submit your assignment on the web platform.</Text>
                  </View>
                )}
              </View>
            ) : null
          }}
          theme={{ colors: { text: theme.text, background: theme.bg, code: theme.muted, link: theme.primary, border: theme.border } }}
        />
      </View>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {prevLessonId ? (
          <TouchableOpacity style={[styles.navBtn, { borderColor: theme.border }]} onPress={() => navigation.replace('TextLesson', { id: prevLessonId })}>
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
        ) : <View style={styles.navBtnEmpty} />}

        {!lesson.assignment && !lesson.quiz && canComplete && !isCompleted ? (
          <TouchableOpacity 
            style={[styles.mainBtn, { backgroundColor: theme.primary }]}
            onPress={handleComplete}
            disabled={completing}
          >
            {completing ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Mark Complete</Text>}
          </TouchableOpacity>
        ) : isCompleted ? (
          <View style={[styles.mainBtn, { backgroundColor: theme.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={18} color={theme.success} style={{ marginRight: 6 }} />
            <Text style={[styles.mainBtnText, { color: theme.success }]}>Completed</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {nextLessonId ? (
          <TouchableOpacity style={[styles.navBtn, { borderColor: theme.border }]} onPress={() => navigation.replace('TextLesson', { id: nextLessonId })}>
            <Ionicons name="arrow-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        ) : <View style={styles.navBtnEmpty} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitleWrap: { flex: 1, marginLeft: 8 },
  moduleTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  lessonTitle: { fontSize: 16, fontWeight: '800' },
  scrollContent: { flex: 1 },
  resourceBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  resourceText: { flex: 1, fontSize: 15, fontWeight: '600', marginLeft: 12 },
  assignmentBox: { marginTop: 30, padding: 20, borderRadius: 16, borderWidth: 1 },
  assignmentLabel: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  assignmentText: { fontSize: 15, lineHeight: 24, marginBottom: 20 },
  submissionStatus: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderTopWidth: 1 },
  navBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  navBtnEmpty: { width: 48, height: 48 },
  mainBtn: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginHorizontal: 16 },
  mainBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
