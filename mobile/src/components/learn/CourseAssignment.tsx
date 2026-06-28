import React, { memo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface CourseAssignmentProps {
  assignment: any;
  submission: any;
}

export const CourseAssignment = memo(({ assignment, submission }: CourseAssignmentProps) => {
  if (!assignment) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Instructions</Text>
      <Text style={styles.instructions}>
        {assignment.instructions}
      </Text>
      
      {submission ? (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Status: {submission.status}</Text>
          {submission.feedback?.length > 0 && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Mentor Feedback:</Text>
              {submission.feedback.map((f: any) => (
                <Text key={f.id} style={styles.feedbackText}>
                  "{f.message}" - {f.author?.name}
                </Text>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Pending Submission</Text>
          <Text style={styles.pendingText}>
            Please submit your assignment on the web platform.
          </Text>
        </View>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  statusTitle: {
    color: '#111827',
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 12,
  },
  feedbackTitle: {
    color: '#111827',
    fontWeight: '600',
  },
  feedbackText: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 14,
  },
  pendingText: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 13,
  }
});
