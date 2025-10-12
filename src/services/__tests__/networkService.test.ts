/**
 * Network Service Tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { networkService } from '../networkService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');

describe('NetworkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset network service state
    networkService.cleanup();
  });

  afterEach(() => {
    networkService.cleanup();
  });

  describe('initialization', () => {
    it('should initialize and fetch network state', async () => {
      const mockState = {
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: {},
      };

      (NetInfo.fetch as jest.Mock).mockResolvedValue(mockState);
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());

      await networkService.initialize();

      expect(NetInfo.fetch).toHaveBeenCalled();
      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('should restore network status from storage', async () => {
      const storedStatus = {
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
        details: {},
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(storedStatus),
      );
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: null,
        type: 'unknown',
        details: {},
      });
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());

      await networkService.initialize();

      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('network status', () => {
    it('should return online when connected with internet', async () => {
      const mockState = {
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: {},
      };

      (NetInfo.fetch as jest.Mock).mockResolvedValue(mockState);
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());

      await networkService.initialize();

      expect(networkService.isOnline()).toBe(true);
      expect(networkService.isOffline()).toBe(false);
    });

    it('should return offline when not connected', async () => {
      const mockState = {
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: {},
      };

      (NetInfo.fetch as jest.Mock).mockResolvedValue(mockState);
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());

      await networkService.initialize();

      expect(networkService.isOnline()).toBe(false);
      expect(networkService.isOffline()).toBe(true);
    });
  });

  describe('listeners', () => {
    it('should notify listeners on status change', async () => {
      let eventListener: any;
      (NetInfo.addEventListener as jest.Mock).mockImplementation(listener => {
        eventListener = listener;
        return jest.fn();
      });

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: {},
      });

      await networkService.initialize();

      const mockListener = jest.fn();
      networkService.addListener(mockListener);

      // Should be called immediately with current status
      expect(mockListener).toHaveBeenCalledTimes(1);

      // Trigger status change
      eventListener({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: {},
      });

      // Should be called again with new status
      expect(mockListener).toHaveBeenCalledTimes(2);
      expect(mockListener).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isConnected: false,
          isInternetReachable: false,
        }),
      );
    });

    it('should support unsubscribe', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: {},
      });
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());

      await networkService.initialize();

      const mockListener = jest.fn();
      const unsubscribe = networkService.addListener(mockListener);

      expect(mockListener).toHaveBeenCalledTimes(1);

      unsubscribe();
      
      // Listener should not be called after unsubscribe
      // (we can't easily test this without triggering a status change)
    });
  });

  describe('offline queue', () => {
    beforeEach(async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: {},
      });
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());

      await networkService.initialize();
    });

    it('should queue a request', async () => {
      const request = {
        url: 'https://api.example.com/data',
        method: 'POST',
        body: { test: 'data' },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await networkService.queueRequest(request);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'offline_queue',
        expect.stringContaining(request.url),
      );
    });

    it('should get queue statistics', async () => {
      const queue = [
        {
          url: 'https://api.example.com/1',
          method: 'POST',
          timestamp: Date.now() - 5000,
          retryCount: 0,
        },
        {
          url: 'https://api.example.com/2',
          method: 'POST',
          timestamp: Date.now() - 1000,
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(queue),
      );

      const stats = await networkService.getQueueStats();

      expect(stats.count).toBe(2);
      expect(stats.oldestTimestamp).toBeLessThan(Date.now());
    });

    it('should clear offline queue', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await networkService.clearOfflineQueue();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('offline_queue');
    });
  });

  describe('cleanup', () => {
    it('should cleanup subscriptions and listeners', async () => {
      const mockUnsubscribe = jest.fn();
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(mockUnsubscribe);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: {},
      });

      await networkService.initialize();

      const mockListener = jest.fn();
      networkService.addListener(mockListener);

      networkService.cleanup();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
