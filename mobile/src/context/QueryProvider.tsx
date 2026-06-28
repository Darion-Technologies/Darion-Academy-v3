import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Centralized Query Client
// Provides caching, request deduplication, and refetch on reconnect functionality.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 15, // Cache is kept for 15 minutes
      retry: 2, // Retry failed queries twice
      refetchOnWindowFocus: false, // Mobile specific: we manage refresh manually or via specific app state listeners
    },
  },
});

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
