import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

export const useLessonQuery = (lessonId: string) => {
  // TODO (Phase 2): Swap this network fetch with WatermelonDB query
  /*
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lesson = await database.get('lessons').find(lessonId);
      const notes = await lesson.notes.fetch();
      return { lesson, notes };
    }
  });
  */
  
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/mobile/lessons/${lessonId}`);
      return data;
    },
    enabled: !!lessonId,
  });
};

export const useAddNoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, text, timestamp, isDoubt }: { lessonId: string, text: string, timestamp: number, isDoubt: boolean }) => {
      const { data } = await apiClient.post(`/api/mobile/lessons/${lessonId}/notes`, {
        text,
        timestamp,
        isDoubt,
      });
      return { lessonId, note: data.note };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['lesson', result.lessonId], (oldData: any) => {
        if (!oldData || !oldData.lesson) return oldData;
        return {
          ...oldData,
          lesson: {
            ...oldData.lesson,
            videoNotes: [...(oldData.lesson.videoNotes || []), result.note].sort((a, b) => a.timestamp - b.timestamp)
          }
        };
      });
    }
  });
};

export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, noteId }: { lessonId: string, noteId: string }) => {
      await apiClient.delete(`/api/mobile/lessons/${lessonId}/notes?noteId=${noteId}`);
      return { lessonId, noteId };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['lesson', result.lessonId], (oldData: any) => {
        if (!oldData || !oldData.lesson) return oldData;
        return {
          ...oldData,
          lesson: {
            ...oldData.lesson,
            videoNotes: (oldData.lesson.videoNotes || []).filter((n: any) => n.id !== result.noteId)
          }
        };
      });
    }
  });
};

export const useCompleteLessonMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      await apiClient.post('/api/mobile/learning/complete', { lessonId });
      return lessonId;
    },
    onSuccess: (lessonId) => {
      queryClient.setQueryData(['lesson', lessonId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          existingProgress: {
            ...oldData.existingProgress,
            completed: true
          }
        };
      });
    }
  });
};
