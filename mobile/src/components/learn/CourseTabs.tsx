import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CourseTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasAssignment: boolean;
}

export const CourseTabs = memo(({ activeTab, setActiveTab, hasAssignment }: CourseTabsProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
          Overview
        </Text>
      </TouchableOpacity>
      
      {hasAssignment && (
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'assignment' && styles.activeTab]} 
          onPress={() => setActiveTab('assignment')}
        >
          <Text style={[styles.tabText, activeTab === 'assignment' && styles.activeTabText]}>
            Assignment
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'notes' && styles.activeTab]} 
        onPress={() => setActiveTab('notes')}
      >
        <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
          Notes
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // gray-200
    backgroundColor: '#ffffff',
  },
  tab: {
    paddingVertical: 14,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6', // blue-500
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280', // gray-500
  },
  activeTabText: {
    color: '#3b82f6', // blue-500
  }
});
