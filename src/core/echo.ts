import { configureEcho } from '@laravel/echo-react';
import Pusher from 'pusher-js';
import type { ReverbConfig } from './types';

let echoInstance: ReturnType<typeof configureEcho> | null = null;

/**
 * Initialize Laravel Echo with Reverb configuration
 * @param customerToken - Customer token for authentication
 * @param apiUrl - API base URL
 * @param reverbConfig - Reverb WebSocket configuration
 * @returns Echo instance
 */
export function initEcho(customerToken: string, apiUrl: string, reverbConfig: ReverbConfig): ReturnType<typeof configureEcho> {
  if (echoInstance) {
    return echoInstance;
  }

  const baseUrl = new URL(apiUrl).origin;

  // Set Pusher globally (required by Echo)
  if (typeof window !== 'undefined') {
    (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
  }

  echoInstance = configureEcho({
    broadcaster: 'reverb',
    key: reverbConfig.key,
    wsHost: reverbConfig.wsHost || 'localhost',
    wsPort: reverbConfig.wsPort || 8080,
    wssPort: reverbConfig.wssPort || 8080,
    forceTLS: reverbConfig.forceTLS ?? false,
    enabledTransports: ['ws', 'wss'],
    // Critical: Authenticate private channels using cat_ token
    authEndpoint: `${baseUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${customerToken}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
}

/**
 * Get the current Echo instance
 */
export function getEchoInstance(): ReturnType<typeof configureEcho> | null {
  return echoInstance;
}

/**
 * Disconnect and reset Echo instance
 */
export function disconnectEcho(): void {
  if (echoInstance && typeof window !== 'undefined') {
    // Echo cleanup if needed
    echoInstance = null;
  }
}

