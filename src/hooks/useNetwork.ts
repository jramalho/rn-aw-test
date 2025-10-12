/**
 * useNetwork Hook
 * React hook for accessing network status and offline capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import { networkService, NetworkStatus, QueuedRequest } from '../services/networkService';

export interface UseNetworkResult {
  isOnline: boolean;
  isOffline: boolean;
  status: NetworkStatus;
  queueRequest: (request: QueuedRequest) => Promise<void>;
  getQueueStats: () => Promise<{ count: number; oldestTimestamp: number | null }>;
  clearQueue: () => Promise<void>;
}

export const useNetwork = (): UseNetworkResult => {
  const [status, setStatus] = useState<NetworkStatus>(networkService.getStatus());

  useEffect(() => {
    // Initialize network service
    networkService.initialize();

    // Subscribe to network status changes
    const unsubscribe = networkService.addListener(newStatus => {
      setStatus(newStatus);
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  const queueRequest = useCallback(async (request: QueuedRequest) => {
    await networkService.queueRequest(request);
  }, []);

  const getQueueStats = useCallback(async () => {
    return await networkService.getQueueStats();
  }, []);

  const clearQueue = useCallback(async () => {
    await networkService.clearOfflineQueue();
  }, []);

  return {
    isOnline: networkService.isOnline(),
    isOffline: networkService.isOffline(),
    status,
    queueRequest,
    getQueueStats,
    clearQueue,
  };
};

export default useNetwork;
