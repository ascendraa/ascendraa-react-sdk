import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAscendraaContext } from '../context/AscendraaContext';
import { AscendraaClient } from '../core/client';
import type { CustomerResponse } from '../core/types';

/**
 * Hook to get customer information
 * Note: This endpoint requires business authentication (not customer token)
 * This is primarily for server-side use
 * @param customerId - Customer ID
 * @param options - Query options
 * @returns Query result with customer data
 */
export function useCustomer(
  customerId: string,
  options?: {
    staleTime?: number;
    enabled?: boolean;
  },
): UseQueryResult<CustomerResponse, Error> {
  const context = useAscendraaContext();
  const client = new AscendraaClient(context);

  return useQuery({
    queryKey: ['ascendraa', 'customer', customerId],
    queryFn: () => client.getCustomer(customerId),
    staleTime: options?.staleTime ?? 30000, // Longer TTL for customer data
    enabled: options?.enabled !== false && !!customerId,
  });
}

