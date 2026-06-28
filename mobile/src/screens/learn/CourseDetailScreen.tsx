import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, useColorScheme, Animated, Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import Markdown from 'react-native-marked';
import { apiClient } from '../../api/client';

export default function CourseDetailScreen({ route, navigation }: any) {
  const { id } = route.params || {};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');

  const theme = {
    bg: isDark ? '#000000' : '#f3f6f8',
    card: isDark ? '#111111' : '#ffffff',
    text: isDark ? '#ffffff' : '#111827',
    muted: isDark ? '#a1a1aa' : '#6b7280',
    primary: '#1e88e5',
    border: isDark ? '#27272a' : '#e5e7eb',
    success: '#10b981',
    info: '#0ea5e9',
    warning: '#f59e0b',
  };

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const response = await apiClient.get(`/api/mobile/courses/${id}`);
        setData(response.data);
        
        // Expand the first module by default
        if (response.data?.course?.modules?.[0]) {
          setExpandedModules({ [response.data.course.modules[0].id]: true });
        }
      } catch (err) {
        console.error('Error fetching course detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const pulseAnim = React.useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loading]);

  const toggleModule = (moduleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handlePressLesson = (lesson: any, isLocked: boolean) => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.selectionAsync();
    
    if (lesson.type === 'VIDEO' || lesson.type === 'YOUTUBE') {
      navigation.navigate('CoursePlayer', { id: lesson.id });
    } else {
      navigation.navigate('TextLesson', { id: lesson.id });
    }
  };

  function formatDuration(minutes: number) {
    if (!minutes) return '0h';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  }

  const renderSkeleton = () => (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.heroContainer, { height: Math.min(screenHeight * 0.35, 350) }]}>
          <Animated.View style={[styles.heroImage, { backgroundColor: theme.border, opacity: pulseAnim }]} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.heroGradient} />
          <View style={[styles.backButton, { top: Math.max(insets.top + 12, 40) }]}>
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.5)" />
          </View>
          <View style={styles.heroContent}>
             <Animated.View style={{ height: 32, backgroundColor: 'rgba(255,255,255,0.3)', width: 250, borderRadius: 6, opacity: pulseAnim }} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statLabel, { color: theme.border }]}>DIFFICULTY</Text>
              <Animated.View style={{ height: 18, backgroundColor: theme.border, width: 60, borderRadius: 4, opacity: pulseAnim }} />
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statLabel, { color: theme.border }]}>DURATION</Text>
              <Animated.View style={{ height: 18, backgroundColor: theme.border, width: 60, borderRadius: 4, opacity: pulseAnim }} />
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.statLabel, { color: theme.border }]}>PROGRESS</Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: theme.border }]} />
            </View>
          </View>

          <Animated.View style={{ height: 24, backgroundColor: theme.border, width: 150, borderRadius: 6, opacity: pulseAnim, marginBottom: 16, marginTop: 8 }} />
          
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.moduleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.moduleHeader}>
                <Animated.View style={[styles.moduleStatusCircle, { backgroundColor: theme.border, opacity: pulseAnim }]} />
                <View style={styles.moduleTitleWrap}>
                  <Animated.View style={{ height: 18, backgroundColor: theme.border, width: '80%', borderRadius: 4, opacity: pulseAnim, marginBottom: 4 }} />
                  <Animated.View style={[styles.moduleBadge, { width: 50, height: 14, backgroundColor: theme.border, opacity: pulseAnim }]} />
                </View>
                <Ionicons name="chevron-down" size={20} color={theme.border} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (!data || !data.course) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>Course not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { course, enrollment, moduleCompletionMap } = data;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Markdown 
        value={course.description || ' '}
        flatListProps={{
          showsVerticalScrollIndicator: false,
          contentContainerStyle: { paddingBottom: 40 },
          ListHeaderComponent: (
            <>
              <View style={[styles.heroContainer, { height: Math.min(screenHeight * 0.35, 350) }]}>
                {course.thumbnailUrl ? (
                  <Image source={{ uri: course.thumbnailUrl }} style={styles.heroImage} />
                ) : (
                  <View style={[styles.heroImage, { backgroundColor: theme.border }]} />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.heroGradient}
                />
                <TouchableOpacity 
                  style={[styles.backButton, { top: Math.max(insets.top + 12, 40) }]}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>{course.title}</Text>
                </View>
              </View>

              <View style={[styles.content, { paddingBottom: 0 }]}>
                <View style={[styles.statsGrid]}>
                  <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.statLabel, { color: theme.muted }]} numberOfLines={1} adjustsFontSizeToFit>DIFFICULTY</Text>
                    <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{course.difficulty}</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.statLabel, { color: theme.muted }]} numberOfLines={1} adjustsFontSizeToFit>DURATION</Text>
                    <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{formatDuration(course.estimatedMinutes)}</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.statLabel, { color: theme.muted, marginBottom: 0 }]} numberOfLines={1} adjustsFontSizeToFit>PROGRESS</Text>
                      <Text style={[styles.statValue, { color: theme.text, fontSize: 13 }]} numberOfLines={1} adjustsFontSizeToFit>{enrollment?.progressPercent || 0}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                      <View style={[styles.progressBarFill, { width: `${enrollment?.progressPercent || 0}%`, backgroundColor: theme.primary }]} />
                    </View>
                  </View>
                </View>
              </View>
            </>
          ),
          ListFooterComponent: (
            <View style={styles.content}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Course Modules</Text>

              {course.modules.map((module: any, index: number) => {
                const isCompleted = moduleCompletionMap[module.id];
                const prevModuleCompleted = index === 0 || moduleCompletionMap[course.modules[index - 1].id];
                const isLocked = !prevModuleCompleted && index > 0;
                const inProgress = !isCompleted && prevModuleCompleted;
                const expanded = expandedModules[module.id];

                return (
                  <View key={module.id} style={[styles.moduleCard, { backgroundColor: theme.card, borderColor: theme.border, opacity: isLocked ? 0.6 : 1 }]}>
                    <TouchableOpacity 
                      style={styles.moduleHeader}
                      activeOpacity={0.7}
                      onPress={() => toggleModule(module.id)}
                    >
                      <View style={[styles.moduleStatusCircle, { 
                        backgroundColor: isCompleted ? theme.success + '20' : isLocked ? theme.muted + '20' : theme.info + '20' 
                      }]}>
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={16} color={theme.success} />
                        ) : isLocked ? (
                          <Ionicons name="lock-closed" size={14} color={theme.muted} />
                        ) : (
                          <Text style={{ color: theme.info, fontWeight: '700', fontSize: 12 }}>{index + 1}</Text>
                        )}
                      </View>
                      <View style={styles.moduleTitleWrap}>
                        <Text style={[styles.moduleTitle, { color: theme.text }]}>{module.title}</Text>
                        {isCompleted && <Text style={[styles.moduleBadge, { color: theme.success, backgroundColor: theme.success + '15' }]}>Complete</Text>}
                        {inProgress && <Text style={[styles.moduleBadge, { color: theme.info, backgroundColor: theme.info + '15' }]}>In Progress</Text>}
                        {isLocked && <Text style={[styles.moduleBadge, { color: theme.muted, backgroundColor: theme.muted + '15' }]}>Locked</Text>}
                      </View>
                      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={theme.muted} />
                    </TouchableOpacity>

                    {expanded && !isLocked && (
                      <View style={[styles.lessonList, { borderTopColor: theme.border }]}>
                        {module.lessons.map((lesson: any) => {
                          const lDone = lesson.isCompleted;
                          return (
                            <TouchableOpacity
                              key={lesson.id}
                              style={styles.lessonRow}
                              onPress={() => handlePressLesson(lesson, isLocked)}
                            >
                              <Ionicons 
                                name={lDone ? "checkmark-circle" : "ellipse-outline"} 
                                size={20} 
                                color={lDone ? theme.success : theme.muted} 
                                style={{ marginRight: 12, opacity: lDone ? 1 : 0.5 }}
                              />
                              <View style={styles.lessonInfo}>
                                <Text style={[styles.lessonTitle, { color: theme.text }]}>{lesson.order}. {lesson.title}</Text>
                                <View style={styles.lessonMeta}>
                                  <View style={[styles.lessonTypeBadge, { backgroundColor: theme.border }]}>
                                    <Text style={[styles.lessonTypeText, { color: theme.muted }]}>{lesson.type}</Text>
                                  </View>
                                  <View style={styles.timeWrap}>
                                    <Ionicons name="time-outline" size={12} color={theme.muted} />
                                    <Text style={[styles.timeText, { color: theme.muted }]}>{lesson.estimatedMinutes} min</Text>
                                  </View>
                                  {lesson.hasQuiz && (
                                    <Text style={{ fontSize: 10, color: theme.info, fontWeight: '600', marginLeft: 6 }}>QUIZ</Text>
                                  )}
                                </View>
                              </View>
                              <Ionicons name="chevron-forward" size={16} color={theme.muted} />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )
        }}
        theme={{
          colors: {
            text: theme.text,
            background: theme.bg,
            code: theme.muted,
            link: theme.primary,
            border: theme.border,
          }
        }}
        styles={{
          paragraph: { paddingHorizontal: 20 },
          h1: { paddingHorizontal: 20 },
          h2: { paddingHorizontal: 20 },
          h3: { paddingHorizontal: 20 },
          h4: { paddingHorizontal: 20 },
          h5: { paddingHorizontal: 20 },
          h6: { paddingHorizontal: 20 },
          list: { paddingHorizontal: 20 },
          blockquote: { marginHorizontal: 20 },
          hr: { marginHorizontal: 20 },
          code: { marginHorizontal: 20 },
          table: { marginHorizontal: 20 },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroContainer: { position: 'relative', backgroundColor: '#000' },
  heroImage: { width: '100%', height: '100%', opacity: 0.8 },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '80%' },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  content: { padding: 20 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, justifyContent: 'center' },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  statValue: { fontSize: 14, fontWeight: '700' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressBarBg: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 'auto' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  section: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, marginTop: 8 },
  moduleCard: { borderWidth: 1, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  moduleStatusCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  moduleTitleWrap: { flex: 1, justifyContent: 'center' },
  moduleTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  moduleBadge: { alignSelf: 'flex-start', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  lessonList: { borderTopWidth: 1 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lessonTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  lessonTypeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  timeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 12, fontWeight: '500' },
});
