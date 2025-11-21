/**
 * @ascendraa/react
 * Official React SDK for Ascendraa - usage-based billing with real-time updates
 */

// Core exports
export { AscendraaClient } from './core/client';
export { createQueryClient } from './core/query-client';
export { initEcho, getEchoInstance, disconnectEcho } from './core/echo';

// Type exports
export type {
  ClientConfig,
  ReverbConfig,
  CacheConfig,
  CheckResponse,
  TrackResponse,
  UsageResponse,
  CustomerResponse,
  CheckoutOptions,
  CheckoutResponse,
  RevokeResponse,
  CheckRequest,
  TrackRequest,
  UsageRequest,
  CheckoutRequest,
  RevokeSubscriptionRequest,
  AscendraaContextValue,
} from './core/types';

// Context exports
export { AscendraaContext, useAscendraaContext } from './context/AscendraaContext';

// Hook exports
export { useCheck } from './hooks/useCheck';
export { useTrack } from './hooks/useTrack';
export { useSetUsage, useGetUsage } from './hooks/useUsage';
export { useCustomer } from './hooks/useCustomer';
export { useCheckout } from './hooks/useCheckout';
export { useRevokeSubscription } from './hooks/useSubscription';
export { useRealtime } from './hooks/useRealtime';

export type { UseTrackOptions } from './hooks/useTrack';
export type { UseUsageOptions } from './hooks/useUsage';
export type { UseCheckoutOptions } from './hooks/useCheckout';
export type { UseRevokeSubscriptionOptions } from './hooks/useSubscription';
export type { UseRealtimeOptions, RealtimeEvent } from './hooks/useRealtime';

// Component exports
export { AscendraaProvider } from './components/AscendraaProvider';
export { UsageMeter } from './components/UsageMeter';
export { CheckoutButton } from './components/CheckoutButton';

export type { AscendraaProviderProps } from './components/AscendraaProvider';
export type { UsageMeterProps } from './components/UsageMeter';
export type { CheckoutButtonProps } from './components/CheckoutButton';

