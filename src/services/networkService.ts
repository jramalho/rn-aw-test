/**
 * Network Service
 * Monitors network connectivity and manages offline behavior
 */

import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  details: any;
}

export interface NetworkListener {
  (status: NetworkStatus): void;
}

const NETWORK_STATUS_KEY = 'network_status';
const OFFLINE_QUEUE_KEY = 'offline_queue';

class NetworkService {
  private listeners: Set<NetworkListener> = new Set();
  private subscription: NetInfoSubscription | null = null;
  private currentStatus: NetworkStatus = {
    isConnected: false,
    isInternetReachable: null,
    type: null,
    details: null,
  };

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Get initial state
      const state = await NetInfo.fetch();
      this.updateStatus(state);

      // Subscribe to network state updates
      this.subscription = NetInfo.addEventListener(state => {
        this.updateStatus(state);
      });

      // Restore previous status from storage
      await this.restoreNetworkStatus();
    } catch (error) {
      console.error('Error initializing network service:', error);
    }
  }

  /**
   * Clean up subscriptions
   */
  cleanup(): void {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
    this.listeners.clear();
  }

  /**
   * Update network status and notify listeners
   */
  private updateStatus(state: NetInfoState): void {
    const newStatus: NetworkStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      details: state.details,
    };

    const statusChanged =
      this.currentStatus.isConnected !== newStatus.isConnected ||
      this.currentStatus.isInternetReachable !== newStatus.isInternetReachable;

    this.currentStatus = newStatus;

    // Persist status
    this.persistNetworkStatus();

    // Notify listeners if status changed
    if (statusChanged) {
      this.notifyListeners();

      // If we're back online, process offline queue
      if (newStatus.isConnected) {
        this.processOfflineQueue().catch(error => {
          console.error('Error processing offline queue:', error);
        });
      }
    }
  }

  /**
   * Persist network status to storage
   */
  private async persistNetworkStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        NETWORK_STATUS_KEY,
        JSON.stringify(this.currentStatus),
      );
    } catch (error) {
      console.error('Error persisting network status:', error);
    }
  }

  /**
   * Restore network status from storage
   */
  private async restoreNetworkStatus(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NETWORK_STATUS_KEY);
      if (stored) {
        const status = JSON.parse(stored);
        // Use stored status only if current status is not yet determined
        if (
          this.currentStatus.isInternetReachable === null &&
          status.isInternetReachable !== null
        ) {
          this.currentStatus = status;
          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error('Error restoring network status:', error);
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentStatus);
      } catch (error) {
        console.error('Error notifying network listener:', error);
      }
    });
  }

  /**
   * Add a network status listener
   */
  addListener(listener: NetworkListener): () => void {
    this.listeners.add(listener);

    // Immediately notify with current status
    listener(this.currentStatus);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return this.currentStatus.isConnected && this.currentStatus.isInternetReachable !== false;
  }

  /**
   * Check if device is offline
   */
  isOffline(): boolean {
    return !this.isOnline();
  }

  /**
   * Queue a request for later execution when online
   */
  async queueRequest(request: QueuedRequest): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      queue.push({
        ...request,
        timestamp: Date.now(),
        retryCount: 0,
      });
      await this.saveOfflineQueue(queue);
    } catch (error) {
      console.error('Error queuing request:', error);
    }
  }

  /**
   * Get the offline request queue
   */
  async getOfflineQueue(): Promise<QueuedRequest[]> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  /**
   * Save the offline request queue
   */
  private async saveOfflineQueue(queue: QueuedRequest[]): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  /**
   * Process queued requests when back online
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.isOnline()) return;

    try {
      const queue = await this.getOfflineQueue();
      if (queue.length === 0) return;

      console.log(`Processing ${queue.length} queued requests...`);

      const failedRequests: QueuedRequest[] = [];
      const MAX_RETRIES = 3;

      for (const request of queue) {
        try {
          // Execute the queued request
          const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body ? JSON.stringify(request.body) : undefined,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          console.log(`Successfully processed queued request: ${request.url}`);
        } catch (error) {
          console.error(`Failed to process queued request: ${request.url}`, error);

          // Retry logic
          if ((request.retryCount || 0) < MAX_RETRIES) {
            failedRequests.push({
              ...request,
              retryCount: (request.retryCount || 0) + 1,
            });
          } else {
            console.log(`Dropping request after ${MAX_RETRIES} retries: ${request.url}`);
          }
        }
      }

      // Update queue with failed requests
      await this.saveOfflineQueue(failedRequests);

      if (failedRequests.length > 0) {
        console.log(`${failedRequests.length} requests remain in queue`);
      } else {
        console.log('All queued requests processed successfully');
      }
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  }

  /**
   * Clear the offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing offline queue:', error);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{ count: number; oldestTimestamp: number | null }> {
    try {
      const queue = await this.getOfflineQueue();
      return {
        count: queue.length,
        oldestTimestamp: queue.length > 0
          ? Math.min(...queue.map(r => r.timestamp || Date.now()))
          : null,
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return { count: 0, oldestTimestamp: null };
    }
  }
}

export interface QueuedRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp?: number;
  retryCount?: number;
}

// Singleton instance
export const networkService = new NetworkService();

export default networkService;
