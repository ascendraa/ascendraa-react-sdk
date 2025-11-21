import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useAscendraaContext } from '../context/AscendraaContext';
import { AscendraaClient } from '../core/client';
import type { TrackResponse } from '../core/types';

export interface UseTrackOptions {
  featureId?: string;
  eventName?: string;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * Hook to track usage events
 * @returns Mutation function to track usage
 */
export function useTrack(): UseMutationResult<TrackResponse, Error, UseTrackOptions> {
  const context = useAscendraaContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: UseTrackOptions) => {
      const client = new AscendraaClient(context);
      const featureIdOrEventName = options.featureId || options.eventName;
      if (!featureIdOrEventName) {
        throw new Error('Either featureId or eventName must be provided');
      }
      return client.track(featureIdOrEventName, options.value, options.metadata);
    },
    onSuccess: () => {
      // Invalidate check queries to refetch balance/usage
      queryClient.invalidateQueries({ queryKey: ['ascendraa', 'check'] });
      queryClient.invalidateQueries({ queryKey: ['ascendraa', 'usage'] });
    },
  });
}

