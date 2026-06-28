import React, { memo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import AnimatedReanimated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export const AccordionItem = memo(({ courseName, actions, isOpen, onToggle, theme }: any) => {
  const firstAction = actions[0];
  const progress = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, { duration: 250 });
  }, [isOpen]);

  const animatedArrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${progress.value * 180}deg` }]
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => onToggle(courseName)}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          {firstAction.courseThumbnail ? (
            <Image
              source={firstAction.courseThumbnail}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <Ionicons name="book-outline" size={20} color={theme.primary} />
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {courseName}
          </Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {actions.length} task{actions.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
        <AnimatedReanimated.View style={animatedArrowStyle}>
          <Ionicons name="chevron-down" size={18} color={theme.muted} />
        </AnimatedReanimated.View>
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.body, { borderTopColor: theme.border }]}>
          {actions.map((action: any, i: number) => (
            <View
              key={action.id}
              style={[
                styles.actionItem,
                i < actions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}
            >
              <View style={[styles.iconContainer, 
                action.type === 'quiz' ? styles.iconQuiz :
                action.type === 'assignment' ? styles.iconAssignment : styles.iconVideo
              ]}>
                <Ionicons
                  name={
                    action.type === 'quiz' ? 'help-circle-outline' :
                    action.type === 'assignment' ? 'document-text-outline' : 'play-circle-outline'
                  }
                  size={16}
                  color={
                    action.type === 'quiz' ? '#ef4444' :
                    action.type === 'assignment' ? '#f59e0b' : '#0ea5e9'
                  }
                />
              </View>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: theme.text }]} numberOfLines={2}>
                  {action.title}
                </Text>
                <Text style={[styles.actionStatus, { color: theme.muted }]}>
                  {action.status}
                </Text>
              </View>
              <View style={[styles.priorityBadge, 
                action.priority === 'high' ? styles.priorityHigh : 
                action.priority === 'medium' ? styles.priorityMedium : styles.priorityLow
              ]}>
                <Text style={[styles.priorityText, 
                  action.priority === 'high' ? styles.priorityTextHigh : 
                  action.priority === 'medium' ? styles.priorityTextMedium : styles.priorityTextLow
                ]}>
                  {action.priority}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  thumbnailContainer: {
    width: 64,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#ebf5ff',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
  },
  body: {
    borderTopWidth: 1,
    marginHorizontal: 16,
    paddingBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconQuiz: { backgroundColor: '#fee2e2' },
  iconAssignment: { backgroundColor: '#fef3c7' },
  iconVideo: { backgroundColor: '#e0f2fe' },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionStatus: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityHigh: { backgroundColor: '#fee2e2' },
  priorityMedium: { backgroundColor: '#fef3c7' },
  priorityLow: { backgroundColor: '#dcfce7' },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  priorityTextHigh: { color: '#ef4444' },
  priorityTextMedium: { color: '#f59e0b' },
  priorityTextLow: { color: '#22c55e' },
});
