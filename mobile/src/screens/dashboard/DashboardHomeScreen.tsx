import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  Animated,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '../../store/useAuthStore';
import { HapticEvent } from '../../utils/haptics';
import { Image, ImageBackground } from 'expo-image';
import { AccordionItem } from '../../components/ui/Accordion';
import { useDashboardQuery } from '../../api/queries/useDashboardQuery';

export default function DashboardHomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuthStore();
  
  const { data, isLoading: loading, error } = useDashboardQuery();

  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  const theme = {
    bg: '#f3f6f8',
    card: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    primary: '#1e88e5',
    primaryLight: '#ebf5ff',
    border: '#e5e7eb',
    iconBg: '#f9fafb',
    skeleton: '#e5e7eb',
  };

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
        ])
      ).start();
    }
  }, [loading]);

  const firstPending = data?.pendingActions?.[0];
  const remainingPending: any[] = data?.pendingActions?.slice(1) || [];

  const courseGroups = remainingPending.reduce((acc: Record<string, any[]>, action: any) => {
    const key = action.courseName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(action);
    return acc;
  }, {});

  const listData = Object.entries(courseGroups).map(([courseName, actions]) => ({ courseName, actions }));

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = useCallback((courseName: string) => {
    HapticEvent.accordionToggle();
    setOpenGroups(prev => ({ ...prev, [courseName]: !prev[courseName] }));
  }, []);

  const renderSkeleton = () => (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Animated.View style={[{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.skeleton, opacity: pulseAnim }]} />
        <Animated.View style={[{ width: 140, height: 40, borderRadius: 20, backgroundColor: theme.card, opacity: pulseAnim }]} />
        <Animated.View style={[{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.card, opacity: pulseAnim }]} />
      </View>
      <View style={styles.headerContainer}>
        <Animated.View style={[{ width: '70%', height: 38, borderRadius: 8, backgroundColor: theme.skeleton, marginBottom: 8, opacity: pulseAnim }]} />
        <Animated.View style={[{ width: '50%', height: 38, borderRadius: 8, backgroundColor: theme.skeleton, opacity: pulseAnim }]} />
      </View>
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Animated.View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: theme.skeleton, opacity: pulseAnim, marginRight: 12 }]} />
        <Animated.View style={[{ flex: 1, height: 20, borderRadius: 4, backgroundColor: theme.skeleton, opacity: pulseAnim }]} />
        <Animated.View style={[{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#f3f4f6', opacity: pulseAnim, marginLeft: 8 }]} />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Up Next</Text>
      
      <View style={[styles.highlightCard, { backgroundColor: theme.skeleton }]}>
        <Animated.View style={[styles.playBtn, { opacity: pulseAnim, backgroundColor: 'rgba(255,255,255,0.8)' }]} />
        <View style={styles.highlightContent}>
          <Animated.View style={[{ width: '80%', height: 26, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)', marginBottom: 6, opacity: pulseAnim }]} />
          <Animated.View style={[{ width: '60%', height: 16, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)', marginBottom: 16, opacity: pulseAnim }]} />
          <View style={styles.highlightFooter}>
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.4)" />
              <Animated.View style={[{ width: 80, height: 12, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', opacity: pulseAnim }]} />
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.4)" />
              <Animated.View style={[{ width: 80, height: 12, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', opacity: pulseAnim }]} />
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Your Progress</Text>
        <Animated.View style={[{ width: 40, height: 14, borderRadius: 4, backgroundColor: theme.skeleton, opacity: pulseAnim }]} />
      </View>
      <View style={[styles.categoriesContainer, { backgroundColor: theme.card }]}>
        {[
          { color: '#fee2e2' },
          { color: '#e0f2fe' },
          { color: '#f3e8ff' },
          { color: '#dcfce7' },
        ].map((item, i) => (
          <View key={i} style={styles.categoryItem}>
            <Animated.View style={[{ width: 48, height: 48, borderRadius: 24, backgroundColor: item.color, marginBottom: 8, opacity: pulseAnim }]} />
            <Animated.View style={[{ width: 24, height: 16, borderRadius: 4, backgroundColor: theme.skeleton, marginBottom: 4, opacity: pulseAnim }]} />
            <Animated.View style={[{ width: 36, height: 12, borderRadius: 4, backgroundColor: theme.skeleton, opacity: pulseAnim }]} />
          </View>
        ))}
      </View>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { backgroundColor: theme.primary, opacity: pulseAnim }]} />
        <Animated.View style={[styles.dot, { backgroundColor: '#d1d5db', opacity: pulseAnim }]} />
        <Animated.View style={[styles.dot, { backgroundColor: '#d1d5db', opacity: pulseAnim }]} />
      </View>
      
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.accordionCard, { backgroundColor: theme.card }]}>
          <View style={styles.accordionHeader}>
            <Animated.View style={[styles.listThumbnail, { backgroundColor: theme.skeleton, opacity: pulseAnim }]} />
            <View style={styles.listInfo}>
              <Animated.View style={[{ width: '70%', height: 16, borderRadius: 4, backgroundColor: theme.skeleton, marginBottom: 8, opacity: pulseAnim }]} />
              <Animated.View style={[{ width: '40%', height: 20, borderRadius: 8, backgroundColor: theme.primaryLight, opacity: pulseAnim }]} />
            </View>
            <Ionicons name="chevron-down" size={18} color={theme.skeleton} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
          <View style={styles.avatarContainer}>
            {data?.user?.avatarUrl ? (
              <Image source={{ uri: data.user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {data?.user?.name ? data.user.name.charAt(0).toUpperCase() : 'L'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.locationPill, { backgroundColor: theme.card }]}>
          <Text style={[styles.locationText, { color: theme.text }]}>Darion Academy</Text>
          <Ionicons name="chevron-down" size={14} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bellBtn, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerContainer}>
        <Text style={[styles.greeting, { color: theme.text }]}>Learning solution</Text>
        <Text style={[styles.greeting, { color: theme.text }]}>made simple 🎓</Text>
      </View>
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={20} color={theme.muted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search courses..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Up Next</Text>
      {firstPending ? (
        <ImageBackground
          source={firstPending.courseThumbnail ? { uri: firstPending.courseThumbnail } : undefined}
          style={[styles.highlightCard, !firstPending.courseThumbnail && { backgroundColor: theme.primary }]}
          imageStyle={{ borderRadius: 24 }}
          contentFit="cover"
        >
          {firstPending.courseThumbnail && <View style={styles.highlightOverlay} />}
          <TouchableOpacity style={styles.playBtn} onPress={() => HapticEvent.buttonPrimary()}>
            <Ionicons name="play" size={20} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightTitle}>{firstPending.title}</Text>
            <Text style={styles.highlightSubtitle}>{firstPending.courseName}</Text>
            <View style={styles.highlightFooter}>
              <View style={styles.footerItem}>
                <Ionicons name="calendar-outline" size={14} color="#ffffff" />
                <Text style={styles.footerText}>Priority: {firstPending.priority.toUpperCase()}</Text>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="time-outline" size={14} color="#ffffff" />
                <Text style={styles.footerText}>Action required</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.highlightCard, { backgroundColor: theme.primary }]}>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightTitle}>You're all caught up!</Text>
            <Text style={styles.highlightSubtitle}>Great job completing your tasks.</Text>
          </View>
        </View>
      )}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Your Progress</Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: theme.muted }]}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.categoriesContainer, { backgroundColor: theme.card }]}>
        <View style={styles.categoryItem}>
          <View style={[styles.categoryIcon, { backgroundColor: '#fee2e2' }]}><Ionicons name="flame-outline" size={24} color="#ef4444" /></View>
          <Text style={[styles.categoryValue, { color: theme.text }]}>{data.stats?.currentStreak}</Text>
          <Text style={[styles.categoryLabel, { color: theme.muted }]}>Streak</Text>
        </View>
        <View style={styles.categoryItem}>
          <View style={[styles.categoryIcon, { backgroundColor: '#e0f2fe' }]}><Ionicons name="checkmark-done-outline" size={24} color="#0ea5e9" /></View>
          <Text style={[styles.categoryValue, { color: theme.text }]}>{data.stats?.completedModules}</Text>
          <Text style={[styles.categoryLabel, { color: theme.muted }]}>Modules</Text>
        </View>
        <View style={styles.categoryItem}>
          <View style={[styles.categoryIcon, { backgroundColor: '#f3e8ff' }]}><Ionicons name="book-outline" size={24} color="#a855f7" /></View>
          <Text style={[styles.categoryValue, { color: theme.text }]}>{data.stats?.totalCourses}</Text>
          <Text style={[styles.categoryLabel, { color: theme.muted }]}>Enrolled</Text>
        </View>
        <View style={styles.categoryItem}>
          <View style={[styles.categoryIcon, { backgroundColor: '#dcfce7' }]}><Ionicons name="ribbon-outline" size={24} color="#22c55e" /></View>
          <Text style={[styles.categoryValue, { color: theme.text }]}>{data.stats?.certificatesEarned || 0}</Text>
          <Text style={[styles.categoryLabel, { color: theme.muted }]}>Certifs</Text>
        </View>
      </View>
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
        <View style={[styles.dot, { backgroundColor: '#d1d5db' }]} />
        <View style={[styles.dot, { backgroundColor: '#d1d5db' }]} />
      </View>
    </View>
  ), [data, searchQuery, firstPending, navigation, theme]);

  const renderItem = useCallback(({ item }: any) => {
    return (
      <AccordionItem
        courseName={item.courseName}
        actions={item.actions}
        isOpen={openGroups[item.courseName]}
        onToggle={toggleGroup}
        theme={theme}
      />
    );
  }, [openGroups, toggleGroup, theme]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top']}>
      {loading ? (
        <View style={styles.container}>{renderSkeleton()}</View>
      ) : error ? (
        <View style={styles.loader}>
          <Text style={{ color: '#ef4444' }}>{error}</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.listWrapper} 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {listData.map((item: any) => (
             <AccordionItem
                key={item.courseName}
                courseName={item.courseName}
                actions={item.actions}
                isOpen={openGroups[item.courseName]}
                onToggle={toggleGroup}
                theme={theme}
              />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f6f8' },
  listWrapper: { flex: 1 },
  container: { padding: 24, paddingTop: 16, paddingBottom: 100 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  filterBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  highlightCard: {
    height: 240,
    borderRadius: 24,
    marginBottom: 32,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 24,
  },
  highlightContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 10,
  },
  playBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  highlightTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  highlightSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  highlightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  listThumbnail: {
    width: 64,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accordionCard: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  accordionBody: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginHorizontal: 16,
    paddingBottom: 8,
  },
  accordionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionTypeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accordionItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  accordionItemStatus: {
    fontSize: 12,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  taskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  taskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
