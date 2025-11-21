import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { AscendraaContext } from '../context/AscendraaContext';
import { createQueryClient } from '../core/query-client';
import { initEcho } from '../core/echo';
import type { ReverbConfig, CacheConfig } from '../core/types';

export interface AscendraaProviderProps {
  apiUrl: string;
  publicKey: string;
  customerToken: string;
  enableRealtime?: boolean;
  reverbConfig?: ReverbConfig;
  cacheConfig?: CacheConfig;
  children: ReactNode;
}

/**
 * Main provider component for Ascendraa SDK
 * Wraps the app with QueryClientProvider and AscendraaContext
 */
export function AscendraaProvider({
  apiUrl,
  publicKey,
  customerToken,
  enableRealtime = false,
  reverbConfig,
  cacheConfig,
  children,
}: AscendraaProviderProps): React.JSX.Element {
  // Validate that both publicKey and customerToken are provided
  if (!publicKey || !customerToken) {
    throw new Error('AscendraaProvider requires both publicKey and customerToken');
  }

  // Validate token format (cat_ prefix)
  if (!customerToken.startsWith('cat_')) {
    throw new Error('Invalid customer token format. Token must start with "cat_"');
  }

  // Validate public key format (pk_ prefix)
  if (!publicKey.startsWith('pk_')) {
    throw new Error('Invalid public key format. Public key must start with "pk_"');
  }

  // Create QueryClient with memoization to prevent recreation on every render
  const queryClient = useMemo(() => createQueryClient(cacheConfig), [cacheConfig]);

  // Initialize Echo if realtime is enabled
  useMemo(() => {
    if (enableRealtime && reverbConfig) {
      initEcho(customerToken, apiUrl, reverbConfig);
    }
  }, [enableRealtime, reverbConfig, customerToken, apiUrl]);

  const contextValue = useMemo(
    () => ({
      apiUrl,
      publicKey,
      customerToken,
    }),
    [apiUrl, publicKey, customerToken],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AscendraaContext.Provider value={contextValue}>{children}</AscendraaContext.Provider>
    </QueryClientProvider>
  );
}

