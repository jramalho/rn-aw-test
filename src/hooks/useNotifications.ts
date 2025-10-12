/**
 * useNotifications Hook
 * React hook for managing notifications in components
 */

import { useEffect, useState, useCallback } from 'react';
import { notificationService } from '../utils/notificationService';
import {
  NotificationData,
  NotificationPermissionStatus,
} from '../types/notifications';

export const useNotifications = () => {
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>({
      granted: false,
      deniedForever: false,
      canAskAgain: true,
    });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize notification service on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        setIsInitialized(true);

        // Check initial permission status
        const status = await notificationService.checkPermissions();
        setPermissionStatus(status);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await notificationService.requestPermissions();
      setPermissionStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return permissionStatus;
    } finally {
      setIsLoading(false);
    }
  }, [permissionStatus]);

  /**
   * Check current permission status
   */
  const checkPermissions = useCallback(async () => {
    try {
      const status = await notificationService.checkPermissions();
      setPermissionStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return permissionStatus;
    }
  }, [permissionStatus]);

  /**
   * Display a notification
   */
  const displayNotification = useCallback(
    async (data: NotificationData): Promise<string | null> => {
      if (!isInitialized) {
        console.warn('Notification service not initialized');
        return null;
      }

      try {
        const notificationId = await notificationService.displayNotification(data);
        return notificationId;
      } catch (error) {
        console.error('Failed to display notification:', error);
        return null;
      }
    },
    [isInitialized],
  );

  /**
   * Cancel a specific notification
   */
  const cancelNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.cancelNotification(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }, []);

  /**
   * Cancel all notifications
   */
  const cancelAllNotifications = useCallback(async () => {
    try {
      await notificationService.cancelAllNotifications();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }, []);

  /**
   * Set badge count (iOS only)
   */
  const setBadgeCount = useCallback(async (count: number) => {
    try {
      await notificationService.setBadgeCount(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }, []);

  /**
   * Open notification settings
   */
  const openSettings = useCallback(async () => {
    try {
      await notificationService.openSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  }, []);

  return {
    isInitialized,
    isLoading,
    permissionStatus,
    requestPermissions,
    checkPermissions,
    displayNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,
    openSettings,
  };
};
