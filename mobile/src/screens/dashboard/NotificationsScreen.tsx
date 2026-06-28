import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiClient } from '../../api/client';
import * as Haptics from 'expo-haptics';

type NotificationType =
  | 'COURSE_ASSIGNED'
  | 'SUBMISSION_REVIEWED'
  | 'FEEDBACK_ADDED'
  | 'CERTIFICATE_GENERATED'
  | 'GENERAL'
  | 'DEADLINE_REMINDER'
  | 'DAILY_NUDGE';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string; bg: string }> = {
  COURSE_ASSIGNED:       { icon: 'book-outline',                  color: '#1e88e5', bg: '#ebf5ff' },
  SUBMISSION_REVIEWED:   { icon: 'checkmark-circle-outline',      color: '#22c55e', bg: '#f0fdf4' },
  FEEDBACK_ADDED:        { icon: 'chatbubble-outline',            color: '#a855f7', bg: '#faf5ff' },
  CERTIFICATE_GENERATED: { icon: 'ribbon-outline',                color: '#f59e0b', bg: '#fffbeb' },
  GENERAL:               { icon: 'information-circle-outline',    color: '#6b7280', bg: '#f9fafb' },
  DEADLINE_REMINDER:     { icon: 'alarm-outline',                 color: '#ef4444', bg: '#fef2f2' },
  DAILY_NUDGE:           { icon: 'sunny-outline',                 color: '#f97316', bg: '#fff7ed' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const theme = {
  bg: '#f3f6f8',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  primary: '#1e88e5',
  border: '#e5e7eb',
};

function NotificationItem({ item, onRead }: { item: Notification; onRead: (id: string) => void }) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.GENERAL;
  const bgAnim = useRef(new Animated.Value(item.read ? 0 : 1)).current;

  const handlePress = () => {
    if (!item.read) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(bgAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
      onRead(item.id);
    }
  };

  const bg = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.card, '#f0f7ff'] });

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={handlePress}>
      <Animated.View style={[styles.notifCard, { backgroundColor: bg }]}>
        {!item.read && <View style={styles.unreadDot} />}
        <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text
              style={[styles.notifTitle, { fontWeight: item.read ? '500' : '700' }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

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

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      const res = await apiClient.get('/api/mobile/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (e) {
      console.error('Notifications fetch error:', e);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchNotifications(true);
  };

  const handleRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await apiClient.patch('/api/mobile/notifications', { id }); } catch {}
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await apiClient.patch('/api/mobile/notifications', { markAllRead: true }); } catch {}
  };

  const renderSkeleton = () => (
    <View style={styles.listContent}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[styles.notifCard, { backgroundColor: theme.card, marginBottom: 8 }]}>
          <Animated.View style={[styles.iconWrap, { backgroundColor: theme.border, opacity: pulseAnim }]} />
          <View style={styles.notifContent}>
            <View style={styles.notifHeader}>
              <Animated.View style={{ height: 16, borderRadius: 4, backgroundColor: theme.border, width: '60%', opacity: pulseAnim }} />
              <Animated.View style={{ height: 12, borderRadius: 4, backgroundColor: theme.border, width: 40, opacity: pulseAnim }} />
            </View>
            <View style={{ marginTop: 4, gap: 4 }}>
              <Animated.View style={{ height: 14, borderRadius: 4, backgroundColor: theme.border, width: '100%', opacity: pulseAnim }} />
              <Animated.View style={{ height: 14, borderRadius: 4, backgroundColor: theme.border, width: '80%', opacity: pulseAnim }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        renderSkeleton()
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: '#ebf5ff' }]}>
            <Ionicons name="notifications-off-outline" size={36} color={theme.primary} />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyMsg}>
            No notifications yet. We'll let you know when something important happens.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          renderItem={({ item }) => <NotificationItem item={item} onRead={handleRead} />}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  headerSub: { fontSize: 12, color: theme.muted, marginTop: 1 },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ebf5ff',
    borderRadius: 12,
  },
  markAllText: { fontSize: 13, fontWeight: '600', color: theme.primary },
  listContent: { padding: 16, paddingTop: 12 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 18,
    left: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.primary,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  notifTitle: { fontSize: 14, color: theme.text, flex: 1 },
  notifTime: { fontSize: 11, color: theme.muted, flexShrink: 0 },
  notifMessage: { fontSize: 13, color: theme.muted, lineHeight: 18 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 8 },
  emptyMsg: { fontSize: 15, color: theme.muted, textAlign: 'center', lineHeight: 22 },
});
