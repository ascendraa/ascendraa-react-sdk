import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useAscendraaContext } from '../context/AscendraaContext';
import { AscendraaClient } from '../core/client';
import type { CheckoutResponse } from '../core/types';

export interface UseCheckoutOptions {
  planId: string;
  amount: number;
  email?: string;
  name?: string;
  phone?: string;
  currency?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hook to create checkout session
 * @returns Mutation function to create checkout
 */
export function useCheckout(): UseMutationResult<CheckoutResponse, Error, UseCheckoutOptions> {
  const context = useAscendraaContext();

  return useMutation({
    mutationFn: async (options: UseCheckoutOptions) => {
      const client = new AscendraaClient(context);
      return client.createCheckout(options.planId, options.amount, {
        email: options.email,
        name: options.name,
        phone: options.phone,
        currency: options.currency,
        callback_url: options.callbackUrl,
        metadata: options.metadata,
      });
    },
  });
}

