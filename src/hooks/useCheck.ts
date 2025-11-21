import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAscendraaContext } from '../context/AscendraaContext';
import { AscendraaClient } from '../core/client';
import type { CheckResponse } from '../core/types';

/**
 * Hook to check feature access or event balance
 * @param featureIdOrEventName - Feature ID or event name
 * @param options - Query options (staleTime, enabled, etc.)
 * @returns Query result with check response
 */
export function useCheck(
  featureIdOrEventName: string,
  options?: {
    staleTime?: number;
    enabled?: boolean;
  },
): UseQueryResult<CheckResponse, Error> {
  const context = useAscendraaContext();
  const client = new AscendraaClient(context);

  return useQuery({
    queryKey: ['ascendraa', 'check', featureIdOrEventName],
    queryFn: () => client.check(featureIdOrEventName),
    staleTime: options?.staleTime ?? 5000,
    enabled: options?.enabled !== false && !!featureIdOrEventName,
  });
}

