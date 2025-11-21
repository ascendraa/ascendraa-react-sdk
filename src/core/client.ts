import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ClientConfig,
  CheckResponse,
  TrackResponse,
  UsageResponse,
  CustomerResponse,
  CheckoutResponse,
  RevokeResponse,
  CheckRequest,
  TrackRequest,
  UsageRequest,
  CheckoutRequest,
  RevokeSubscriptionRequest,
} from './types';

export class AscendraaClient {
  private axios: AxiosInstance;

  constructor(config: ClientConfig) {
    this.axios = axios.create({
      baseURL: config.apiUrl,
      headers: {
        Authorization: `Bearer ${config.customerToken}`,
        'X-Public-Key': config.publicKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message?: string }>) => {
        // Sanitize error messages - never expose tokens
        if (error.response) {
          const sanitizedError = new Error(
            error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
              ? String(error.response.data.message)
              : `Request failed with status ${error.response.status}`,
          );
          (sanitizedError as unknown as { status: number }).status = error.response.status;
          return Promise.reject(sanitizedError);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Update the customer token
   */
  setCustomerToken(token: string): void {
    this.axios.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Update the public key
   */
  setPublicKey(publicKey: string): void {
    this.axios.defaults.headers['X-Public-Key'] = publicKey;
  }

  /**
   * Check feature access or event balance
   * @param featureIdOrEventName - Feature ID or event name
   * @returns Check response with balance and usage information
   */
  async check(featureIdOrEventName: string): Promise<CheckResponse> {
    const requestBody: CheckRequest = featureIdOrEventName.includes('-')
      ? { feature_id: featureIdOrEventName }
      : { event_name: featureIdOrEventName };

    const response = await this.axios.post<CheckResponse>('/api/v1/customers/check', requestBody);
    return response.data;
  }

  /**
   * Track usage events
   * @param featureIdOrEventName - Feature ID or event name
   * @param value - Usage value to track
   * @param metadata - Optional metadata
   * @returns Track response with event ID
   */
  async track(
    featureIdOrEventName: string,
    value: number,
    metadata?: Record<string, unknown>,
  ): Promise<TrackResponse> {
    const requestBody: TrackRequest = {
      ...(featureIdOrEventName.includes('-') ? { feature_id: featureIdOrEventName } : { event_name: featureIdOrEventName }),
      value,
      ...(metadata && { metadata }),
    };

    const response = await this.axios.post<TrackResponse>('/api/v1/customers/track', requestBody);
    return response.data;
  }

  /**
   * Set usage directly
   * @param featureIdOrEventName - Feature ID or event name
   * @param value - Usage value to set
   * @param metadata - Optional metadata
   * @returns Usage response
   */
  async setUsage(
    featureIdOrEventName: string,
    value: number,
    metadata?: Record<string, unknown>,
  ): Promise<UsageResponse> {
    const requestBody: UsageRequest = {
      ...(featureIdOrEventName.includes('-') ? { feature_id: featureIdOrEventName } : { event_name: featureIdOrEventName }),
      value,
      ...(metadata && { metadata }),
    };

    const response = await this.axios.post<UsageResponse>('/api/v1/customers/usage', requestBody);
    return response.data;
  }

  /**
   * Get customer information
   * Note: This endpoint requires business authentication (not customer token)
   * This is primarily for server-side use
   * @param customerId - Customer ID
   * @returns Customer response with features
   */
  async getCustomer(customerId: string): Promise<CustomerResponse> {
    const response = await this.axios.get<CustomerResponse>(`/api/v1/customers/${customerId}`);
    return response.data;
  }

  /**
   * Create checkout session
   * @param planId - Plan ID (ULID)
   * @param amount - Amount (numeric, min: 1)
   * @param options - Optional checkout options
   * @returns Checkout response with authorization URL
   */
  async createCheckout(planId: string, amount: number, options?: {
    email?: string;
    name?: string;
    phone?: string;
    currency?: string;
    callback_url?: string;
    metadata?: Record<string, unknown>;
  }): Promise<CheckoutResponse> {
    const requestBody: CheckoutRequest = {
      plan_id: planId,
      amount,
      ...options,
    };

    const response = await this.axios.post<CheckoutResponse>('/api/v1/customers/checkout', requestBody);
    return response.data;
  }

  /**
   * Revoke subscription
   * @param subscriptionId - Optional subscription ID (if omitted, revokes all active subscriptions)
   * @returns Revoke response
   */
  async revokeSubscription(subscriptionId?: string): Promise<RevokeResponse> {
    const requestBody: RevokeSubscriptionRequest = subscriptionId ? { subscription_id: subscriptionId } : {};

    const response = await this.axios.post<RevokeResponse>('/api/v1/customers/revoke_subscription', requestBody);
    return response.data;
  }
}

