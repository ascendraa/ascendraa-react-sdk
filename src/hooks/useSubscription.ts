import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useAscendraaContext } from '../context/AscendraaContext';
import { AscendraaClient } from '../core/client';
import type { RevokeResponse } from '../core/types';

export interface UseRevokeSubscriptionOptions {
  subscriptionId?: string;
}

/**
 * Hook to revoke/cancel subscription
 * @returns Mutation function to revoke subscription
 */
export function useRevokeSubscription(): UseMutationResult<RevokeResponse, Error, UseRevokeSubscriptionOptions> {
  const context = useAscendraaContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: UseRevokeSubscriptionOptions) => {
      const client = new AscendraaClient(context);
      return client.revokeSubscription(options.subscriptionId);
    },
    onSuccess: () => {
      // Invalidate customer queries to refetch subscription status
      queryClient.invalidateQueries({ queryKey: ['ascendraa', 'customer'] });
    },
  });
}

