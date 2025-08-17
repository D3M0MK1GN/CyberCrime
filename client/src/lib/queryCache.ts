// Query cache optimization utilities
import { QueryKey, useQueryClient } from "@tanstack/react-query";

export const CACHE_TIMES = {
  CYBER_CASES: 5 * 60 * 1000, // 5 minutes
  DASHBOARD_STATS: 10 * 60 * 1000, // 10 minutes
  USER_DATA: 30 * 60 * 1000, // 30 minutes
};

export const QUERY_KEYS = {
  CYBER_CASES: "/api/cyber-cases",
  DASHBOARD_STATS: "/api/dashboard/stats",
  USER_DATA: "/api/auth/user",
} as const;

// Pre-fetch next page for better UX
export const usePrefetchNextPage = () => {
  const queryClient = useQueryClient();
  
  return (currentPage: number, filters: any) => {
    const nextPage = currentPage + 1;
    const queryKey = [QUERY_KEYS.CYBER_CASES, nextPage, 20, ...Object.values(filters)];
    
    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const params = new URLSearchParams({
          page: nextPage.toString(),
          limit: "20",
          ...filters
        });
        
        const response = await fetch(`/api/cyber-cases?${params}`);
        if (!response.ok) throw new Error('Failed to fetch cases');
        return response.json();
      },
      staleTime: CACHE_TIMES.CYBER_CASES,
    });
  };
};

// Optimistic updates for better UX
export const useOptimisticCaseUpdate = () => {
  const queryClient = useQueryClient();
  
  return {
    onCreate: (newCase: any) => {
      queryClient.setQueryData([QUERY_KEYS.CYBER_CASES], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          cases: [newCase, ...old.cases],
          total: old.total + 1,
        };
      });
    },
    
    onUpdate: (updatedCase: any) => {
      queryClient.setQueryData([QUERY_KEYS.CYBER_CASES], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          cases: old.cases.map((c: any) => c.id === updatedCase.id ? updatedCase : c),
        };
      });
    },
    
    onDelete: (deletedId: string) => {
      queryClient.setQueryData([QUERY_KEYS.CYBER_CASES], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          cases: old.cases.filter((c: any) => c.id !== deletedId),
          total: old.total - 1,
        };
      });
    },
  };
};