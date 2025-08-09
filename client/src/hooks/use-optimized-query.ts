// Optimized React Query hooks with intelligent caching and performance enhancements
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

interface OptimizedQueryOptions {
  staleTime?: number;
  cacheTime?: number; 
  refetchOnWindowFocus?: boolean;
  retry?: number;
  enabled?: boolean;
}

// Predefined optimization configs
export const queryConfigs = {
  // Ultra fast for real-time data (user balance, call status)
  realtime: {
    staleTime: 10000, // 10 seconds
    cacheTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 3
  },
  
  // Medium speed for dashboard data
  dashboard: {
    staleTime: 30000, // 30 seconds  
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2
  },
  
  // Slow for static data (user profile, settings)
  static: {
    staleTime: 300000, // 5 minutes
    cacheTime: 1800000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1
  },
  
  // Call history with pagination awareness
  history: {
    staleTime: 60000, // 1 minute
    cacheTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  }
};

// Optimized query hook with intelligent defaults
export function useOptimizedQuery<T>(
  queryKey: string[],
  config: keyof typeof queryConfigs = 'dashboard',
  customOptions?: OptimizedQueryOptions
) {
  const mergedOptions = useMemo(() => ({
    ...queryConfigs[config],
    ...customOptions
  }), [config, customOptions]);

  return useQuery<T>({
    queryKey,
    ...mergedOptions,
  });
}

// Smart cache invalidation
export function useSmartInvalidation() {
  const queryClient = useQueryClient();
  
  const invalidateUserData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
  }, [queryClient]);
  
  const invalidateCallData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/calls/history'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
  }, [queryClient]);
  
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);
  
  return {
    invalidateUserData,
    invalidateCallData,
    invalidateAll
  };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const queryClient = useQueryClient();
  
  const getQueryStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      freshQueries: queries.filter(q => q.isStale() === false).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length
    };
  }, [queryClient]);
  
  return { getQueryStats };
}