import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useAscendraaContext } from '../context/AscendraaContext';
import { AscendraaClient } from '../core/client';
import type { UsageResponse } from '../core/types';

export interface UseUsageOptions {
  featureId?: string;
  eventName?: string;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * Hook to set usage directly (mutation)
 * @returns Mutation function to set usage
 */
export function useSetUsage(): UseMutationResult<UsageResponse, Error, UseUsageOptions> {
  const context = useAscendraaContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: UseUsageOptions) => {
      const client = new AscendraaClient(context);
      const featureIdOrEventName = options.featureId || options.eventName;
      if (!featureIdOrEventName) {
        throw new Error('Either featureId or eventName must be provided');
      }
      return client.setUsage(featureIdOrEventName, options.value, options.metadata);
    },
    onSuccess: (_, variables) => {
      // Invalidate check queries to refetch balance/usage
      const featureIdOrEventName = variables.featureId || variables.eventName;
      if (featureIdOrEventName) {
        queryClient.invalidateQueries({ queryKey: ['ascendraa', 'check', featureIdOrEventName] });
        queryClient.invalidateQueries({ queryKey: ['ascendraa', 'usage', featureIdOrEventName] });
      }
    },
  });
}

/**
 * Hook to get current usage (query)
 * Uses the check endpoint to get usage information
 * @param featureIdOrEventName - Feature ID or event name
 * @param options - Query options
 * @returns Query result with usage information
 */
export function useGetUsage(
  featureIdOrEventName: string,
  options?: {
    staleTime?: number;
    enabled?: boolean;
  },
): UseQueryResult<{ usage: number; balance: number; included_usage: number }, Error> {
  const context = useAscendraaContext();
  const client = new AscendraaClient(context);

  return useQuery({
    queryKey: ['ascendraa', 'usage', featureIdOrEventName],
    queryFn: async () => {
      const checkResponse = await client.check(featureIdOrEventName);
      return {
        usage: checkResponse.usage,
        balance: checkResponse.balance,
        included_usage: checkResponse.included_usage,
      };
    },
    staleTime: options?.staleTime ?? 5000,
    enabled: options?.enabled !== false && !!featureIdOrEventName,
  });
}

