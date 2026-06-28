import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const NoteItem = memo(({ note, isActive, formatTime, handleSeek, handleDeleteNote }: any) => {
  return (
    <View style={[styles.container, isActive && styles.containerActive]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => handleSeek(note.timestamp)} 
          style={styles.timeBtn}
        >
          <Text style={styles.timeText}>{formatTime(note.timestamp)}</Text>
        </TouchableOpacity>
        
        {note.isDoubt && (
          <View style={[styles.doubtBadge, note.resolved ? styles.badgeResolved : styles.badgeQuestion]}>
            <Text style={[styles.badgeText, note.resolved ? styles.badgeTextResolved : styles.badgeTextQuestion]}>
              {note.resolved ? "RESOLVED" : "QUESTION"}
            </Text>
          </View>
        )}
        
        <TouchableOpacity onPress={() => handleDeleteNote(note.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.noteText}>{note.text}</Text>
      
      {note.mentorReply && (
        <View style={styles.mentorReplyContainer}>
          <Text style={styles.mentorReplyTitle}>Mentor Reply:</Text>
          <Text style={styles.mentorReplyText}>{note.mentorReply}</Text>
        </View>
      )}
    </View>
  );
}, (prev, next) => prev.note.id === next.note.id && prev.isActive === next.isActive);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  containerActive: {
    borderColor: '#3b82f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#ebf5ff',
  },
  timeText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 12,
  },
  doubtBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeResolved: {
    backgroundColor: '#f0fdf4',
  },
  badgeQuestion: {
    backgroundColor: '#fffbeb',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextResolved: {
    color: '#16a34a',
  },
  badgeTextQuestion: {
    color: '#d97706',
  },
  deleteBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  noteText: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
  mentorReplyContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  mentorReplyTitle: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  mentorReplyText: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 20,
  }
});
