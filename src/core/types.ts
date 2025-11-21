/**
 * TypeScript type definitions for Ascendraa React SDK
 */

export interface ClientConfig {
  apiUrl: string;
  publicKey: string;
  customerToken: string;
}

export interface ReverbConfig {
  key: string;
  wsHost?: string;
  wsPort?: number;
  wssPort?: number;
  forceTLS?: boolean;
}

export interface CheckResponse {
  allowed: boolean;
  balance: number;
  usage: number;
  included_usage: number;
  unlimited: boolean;
  interval: string;
  next_reset_at: string | null;
  code: string;
}

export interface TrackResponse {
  message: string;
  event_id: string;
  customer_id: string;
  feature_id: string | null;
}

export interface UsageResponse {
  message: string;
  customer_id: string;
  feature_id: string | null;
}

export interface CustomerResponse {
  features: Array<{
    id: string;
    name: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface CheckoutOptions {
  email?: string;
  name?: string;
  phone?: string;
  currency?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutResponse {
  authorization_url: string;
  reference: string;
  customer_id: string;
}

export interface RevokeResponse {
  message: string;
  subscription?: {
    id: string;
    [key: string]: unknown;
  };
  revoked_count?: number;
}

export interface CheckRequest {
  feature_id?: string;
  event_name?: string;
}

export interface TrackRequest {
  feature_id?: string;
  event_name?: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface UsageRequest {
  feature_id?: string;
  event_name?: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface CheckoutRequest {
  plan_id: string;
  amount: number;
  email?: string;
  name?: string;
  phone?: string;
  currency?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

export interface RevokeSubscriptionRequest {
  subscription_id?: string;
}

export interface AscendraaContextValue {
  apiUrl: string;
  publicKey: string;
  customerToken: string;
}

export interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
}

