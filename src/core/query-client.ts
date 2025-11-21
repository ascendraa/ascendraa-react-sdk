import { QueryClient } from '@tanstack/react-query';
import type { CacheConfig } from './types';

/**
 * Create a configured QueryClient for Ascendraa SDK
 */
export function createQueryClient(cacheConfig?: CacheConfig): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: cacheConfig?.staleTime ?? 5000,
        gcTime: cacheConfig?.cacheTime ?? 300000, // 5 minutes default
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

