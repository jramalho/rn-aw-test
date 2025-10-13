/**
 * Offline-Aware API Client
 * Provides network-aware API calls with automatic queuing and retry
 */

import { networkService, QueuedRequest } from '../services/networkService';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  queueIfOffline?: boolean;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
  fromCache: boolean;
  queued: boolean;
}

/**
 * Make an API request with offline support
 */
export async function apiRequest<T = any>(
  url: string,
  config: ApiRequestConfig = {},
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    queueIfOffline = false,
    timeout = 30000,
  } = config;

  // Check if online
  if (networkService.isOffline()) {
    if (queueIfOffline && method !== 'GET') {
      // Queue non-GET requests for later
      const queuedRequest: QueuedRequest = {
        url,
        method,
        headers,
        body,
      };

      await networkService.queueRequest(queuedRequest);

      return {
        data: null,
        error: new Error('Request queued - device is offline'),
        fromCache: false,
        queued: true,
      };
    }

    return {
      data: null,
      error: new Error('No internet connection'),
      fromCache: false,
      queued: false,
    };
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      data,
      error: null,
      fromCache: false,
      queued: false,
    };
  } catch {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error.name === 'AbortError') {
      return {
        data: null,
        error: new Error('Request timeout'),
        fromCache: false,
        queued: false,
      };
    }

    // Queue request if offline and configured to do so
    if (
      queueIfOffline &&
      method !== 'GET' &&
      error.message.includes('network')
    ) {
      const queuedRequest: QueuedRequest = {
        url,
        method,
        headers,
        body,
      };

      await networkService.queueRequest(queuedRequest);

      return {
        data: null,
        error: new Error('Request queued - network error'),
        fromCache: false,
        queued: true,
      };
    }

    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
      fromCache: false,
      queued: false,
    };
  }
}

/**
 * Retry a failed request with exponential backoff
 */
export async function retryRequest<T = any>(
  url: string,
  config: ApiRequestConfig = {},
  maxRetries = 3,
): Promise<ApiResponse<T>> {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await apiRequest<T>(url, config);

      if (result.error === null) {
        return result;
      }

      lastError = result.error;
    } catch {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    attempt++;

    if (attempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    data: null,
    error: lastError || new Error('Max retries exceeded'),
    fromCache: false,
    queued: false,
  };
}

export default {
  apiRequest,
  retryRequest,
};
