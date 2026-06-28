import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { apiClient } from '../../api/client';

function formatDuration(minutes: number) {
  if (!minutes) return '0h';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

const CourseCatalogCard = memo(({ course, theme, onPress }: any) => {
  const statusColor = 
    course.status === 'COMPLETED' ? theme.success :
    course.status === 'IN_PROGRESS' ? theme.info :
    course.status === 'AWAITING_APPROVAL' ? theme.warning : theme.muted;
  
  const displayStatus = course.status ? course.status.replace(/_/g, ' ') : 'PENDING';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      activeOpacity={0.9}
      onPress={() => onPress(course.courseId)}
    >
      <View style={styles.imageContainer}>
        {course.courseThumbnail ? (
          <Image 
            source={course.courseThumbnail} 
            style={styles.image} 
            contentFit="cover" 
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.border }]} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <Text style={styles.courseTitleOverlay}>{course.courseTitle}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { color: theme.muted }]} numberOfLines={1} adjustsFontSizeToFit>DIFFICULTY</Text>
            <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{course.courseDifficulty}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { color: theme.muted }]} numberOfLines={1} adjustsFontSizeToFit>DURATION</Text>
            <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{formatDuration(course.courseEstimatedMinutes)}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.statLabel, { color: theme.muted, marginBottom: 0 }]} numberOfLines={1} adjustsFontSizeToFit>PROGRESS</Text>
              <Text style={[styles.statValue, { color: theme.text, fontSize: 13 }]} numberOfLines={1} adjustsFontSizeToFit>{course.progressPercent}%</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.border, marginBottom: 0 }]}>
              <View style={[styles.progressBarFill, { width: `${course.progressPercent}%`, backgroundColor: theme.primary }]} />
            </View>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{displayStatus}</Text>
          </View>
        </View>

        <View style={[styles.actionBtn, { backgroundColor: theme.text }]}>
          <Text style={[styles.actionBtnText, { color: theme.bg }]}>
            {course.progressPercent === 100 ? 'Review Course' : 'Open Course'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={theme.bg} style={{ marginLeft: 4 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function CourseCatalogScreen({ navigation }: any) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All Courses');

  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const isDark = useColorScheme() === 'dark';

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
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loading]);

  const fetchCourses = async (isRefresh = false) => {
    try {
      const response = await apiClient.get('/api/mobile/courses');
      setCourses(response.data || []);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchCourses(true);
  }, []);

  const handlePressCourse = useCallback((courseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('CourseDetail', { id: courseId });
  }, [navigation]);

  // Categories extraction
  const categories = ['All Courses', ...Array.from(new Set(courses.map(c => c.courseCategory || 'Uncategorized')))];
  
  const filteredCourses = activeCategory === 'All Courses' 
    ? courses 
    : courses.filter(c => (c.courseCategory || 'Uncategorized') === activeCategory);

  const renderSkeleton = () => (
    <View style={styles.content}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.imageContainer, { aspectRatio: 16 / 9, height: undefined }]}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.border, opacity: pulseAnim }]} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient} />
            <Animated.View style={{ position: 'absolute', bottom: 16, left: 16, height: 24, backgroundColor: 'rgba(255,255,255,0.3)', width: 220, borderRadius: 4, opacity: pulseAnim }} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.border }]} numberOfLines={1} adjustsFontSizeToFit>DIFFICULTY</Text>
                <Animated.View style={{ height: 14, backgroundColor: theme.border, width: 50, borderRadius: 4, opacity: pulseAnim }} />
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.border }]} numberOfLines={1} adjustsFontSizeToFit>DURATION</Text>
                <Animated.View style={{ height: 14, backgroundColor: theme.border, width: 50, borderRadius: 4, opacity: pulseAnim }} />
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.statLabel, { color: theme.border, marginBottom: 0 }]} numberOfLines={1} adjustsFontSizeToFit>PROGRESS</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: theme.border, marginBottom: 0 }]} />
              </View>
            </View>
            <View style={styles.footerRow}>
              <Animated.View style={[styles.statusBadge, { width: 100, height: 24, backgroundColor: theme.border, opacity: pulseAnim }]} />
            </View>
            <Animated.View style={[styles.actionBtn, { height: 48, backgroundColor: theme.border, opacity: pulseAnim }]} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderItem = useCallback(({ item }: any) => (
    <CourseCatalogCard course={item} theme={theme} onPress={handlePressCourse} />
  ), [theme, handlePressCourse]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Courses</Text>
        <Text style={[styles.headerSubtitle, { color: theme.muted }]}>Your assigned learning catalog.</Text>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveCategory(cat);
              }}
              style={[
                styles.tab,
                activeCategory === cat ? { backgroundColor: theme.text } : { backgroundColor: 'transparent' }
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeCategory === cat ? { color: theme.bg, fontWeight: '600' } : { color: theme.muted }
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.listWrapper}>
        {loading ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>{renderSkeleton()}</ScrollView>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={48} color={theme.muted} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No courses found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.muted }]}>Assigned courses will appear here.</Text>
          </View>
        ) : (
          <FlashList
            data={filteredCourses}
            renderItem={renderItem}
            // @ts-ignore
            estimatedItemSize={400}
            contentContainerStyle={styles.flashListContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  tabsWrapper: {
    marginBottom: 8,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
  },
  listWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  flashListContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  content: {
    padding: 20,
    paddingTop: 8,
    gap: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  courseTitleOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardBody: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  skeletonImage: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
