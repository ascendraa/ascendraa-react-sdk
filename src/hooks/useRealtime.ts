import { useEcho } from '@laravel/echo-react';
import { useEffect, useState, useCallback } from 'react';
import { initEcho, getEchoInstance } from '../core/echo';
import { useAscendraaContext } from '../context/AscendraaContext';
import type { ReverbConfig } from '../core/types';

export interface RealtimeEvent {
  type: 'usage.updated' | 'balance.updated' | 'subscription.updated' | 'transaction.completed';
  data: Record<string, unknown>;
}

export interface UseRealtimeOptions {
  enableRealtime?: boolean;
  reverbConfig?: ReverbConfig;
  events?: string | string[];
  onEvent?: (event: RealtimeEvent) => void;
}

/**
 * Hook for real-time updates via Laravel Echo
 * Subscribes to customer-specific private channels for real-time updates
 * 
 * @param customerId - Customer ID for channel subscription
 * @param options - Realtime options
 * @returns Realtime connection state and methods
 */
export function useRealtime(
  customerId: string,
  options?: UseRealtimeOptions,
): {
  isConnected: boolean;
  listen: (eventName: string, callback: (data: unknown) => void) => void;
  leaveChannel: () => void;
} {
  const context = useAscendraaContext();
  const [isConnected, setIsConnected] = useState(false);
  
  const channelName = options?.enableRealtime && customerId 
    ? `private-customer.${customerId}` 
    : 'placeholder';
  
  // Create callback for useEcho if onEvent is provided
  const echoCallback = options?.onEvent && options?.events
    ? (data: unknown) => {
        const eventName = Array.isArray(options.events) ? options.events[0] : options.events;
        options.onEvent?.({
          type: eventName as RealtimeEvent['type'],
          data: data as Record<string, unknown>,
        });
      }
    : undefined;
  
  // useEcho handles event listeners directly
  const { leaveChannel: echoLeaveChannel, channel: getChannel } = useEcho(
    channelName,
    options?.events,
    echoCallback,
    [customerId, options?.enableRealtime, options?.events],
    'private',
  );

  useEffect(() => {
    if (!options?.enableRealtime || !options?.reverbConfig || !customerId) {
      setIsConnected(false);
      return;
    }

    // Initialize Echo if not already initialized
    if (!getEchoInstance()) {
      initEcho(context.customerToken, context.apiUrl, options.reverbConfig);
    }

    // Check if channel is connected
    const channel = getChannel();
    if (channel) {
      setIsConnected(true);
    }

    return () => {
      setIsConnected(false);
    };
  }, [context, customerId, options?.enableRealtime, options?.reverbConfig, getChannel]);

  const listen = useCallback((eventName: string, callback: (data: unknown) => void): void => {
    if (!options?.enableRealtime || !customerId) {
      return;
    }

    // Get the channel and listen to the event directly
    const channel = getChannel();
    if (channel && typeof (channel as { listen?: unknown }).listen === 'function') {
      const wrappedCallback = options?.onEvent
        ? (data: unknown) => {
            callback(data);
            options.onEvent?.({
              type: eventName as RealtimeEvent['type'],
              data: data as Record<string, unknown>,
            });
          }
        : callback;
      
      (channel as { listen: (event: string, callback: (data: unknown) => void) => void }).listen(eventName, wrappedCallback);
    }
  }, [options, customerId, getChannel]);

  const leaveChannel = useCallback((): void => {
    if (!options?.enableRealtime || !customerId) {
      return;
    }

    // Leave the channel (useEcho handles cleanup)
    echoLeaveChannel();
    setIsConnected(false);
  }, [options, customerId, echoLeaveChannel]);

  return {
    isConnected,
    listen,
    leaveChannel,
  };
}

