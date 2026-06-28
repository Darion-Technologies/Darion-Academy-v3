import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface ActionItem {
  id: string;
  type: 'quiz' | 'assignment' | 'lesson';
  title: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  courseName: string;
  courseThumbnail: string | null;
}

export interface DashboardData {
  user: {
    name: string;
    avatarUrl: string | null;
  };
  stats: {
    currentStreak: number;
    completedModules: number;
    totalCourses: number;
    certificatesEarned: number;
  };
  pendingActions: ActionItem[];
}

export const useDashboardQuery = () => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/mobile/dashboard');
      return data;
    },
  });
};
