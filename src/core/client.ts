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

interface RequestConfig {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
}

export class AscendraaClient {
  private baseURL: string;
  private headers: {
    Authorization: string;
    'X-Public-Key': string;
    Accept: string;
    'Content-Type': string;
  };

  constructor(config: ClientConfig) {
    this.baseURL = config.apiUrl;
    this.headers = {
      Authorization: `Bearer ${config.customerToken}`,
      'X-Public-Key': config.publicKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Internal method to make HTTP requests
   */
  private async request<T>(config: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${config.path}`;
    const options: RequestInit = {
      method: config.method,
      headers: this.headers,
    };

    if (config.body) {
      options.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Sanitize error messages - never expose tokens
        const sanitizedError = new Error(
          data && typeof data === 'object' && 'message' in data
            ? String(data.message)
            : `Request failed with status ${response.status}`,
        );
        (sanitizedError as unknown as { status: number }).status = response.status;
        throw sanitizedError;
      }

      return data as T;
    } catch (error) {
      // Re-throw if it's already our sanitized error
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      // Handle network errors
      throw new Error(error instanceof Error ? error.message : 'Network request failed');
    }
  }

  /**
   * Update the customer token
   */
  setCustomerToken(token: string): void {
    this.headers.Authorization = `Bearer ${token}`;
  }

  /**
   * Update the public key
   */
  setPublicKey(publicKey: string): void {
    this.headers['X-Public-Key'] = publicKey;
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

    return this.request<CheckResponse>({
      method: 'POST',
      path: '/api/v1/customers/check',
      body: requestBody,
    });
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

    return this.request<TrackResponse>({
      method: 'POST',
      path: '/api/v1/customers/track',
      body: requestBody,
    });
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

    return this.request<UsageResponse>({
      method: 'POST',
      path: '/api/v1/customers/usage',
      body: requestBody,
    });
  }

  /**
   * Get customer information
   * Note: This endpoint requires business authentication (not customer token)
   * This is primarily for server-side use
   * @param customerId - Customer ID
   * @returns Customer response with features
   */
  async getCustomer(customerId: string): Promise<CustomerResponse> {
    return this.request<CustomerResponse>({
      method: 'GET',
      path: `/api/v1/customers/${customerId}`,
    });
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

    return this.request<CheckoutResponse>({
      method: 'POST',
      path: '/api/v1/customers/checkout',
      body: requestBody,
    });
  }

  /**
   * Revoke subscription
   * @param subscriptionId - Optional subscription ID (if omitted, revokes all active subscriptions)
   * @returns Revoke response
   */
  async revokeSubscription(subscriptionId?: string): Promise<RevokeResponse> {
    const requestBody: RevokeSubscriptionRequest = subscriptionId ? { subscription_id: subscriptionId } : {};

    return this.request<RevokeResponse>({
      method: 'POST',
      path: '/api/v1/customers/revoke_subscription',
      body: requestBody,
    });
  }
}

