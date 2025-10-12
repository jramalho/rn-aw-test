/**
 * useNotificationNavigation Hook
 * Simplifies sending notifications that navigate to specific screens
 */

import { useCallback } from 'react';
import { useNotifications } from './useNotifications';
import {
  NotificationChannel,
  NotificationPriority,
} from '../types/notifications';

export interface NavigationNotificationOptions {
  title: string;
  body: string;
  screen: string;
  params?: Record<string, any>;
  channelId?: NotificationChannel;
  priority?: NotificationPriority;
  actions?: Array<{ id: string; title: string; destructive?: boolean }>;
}

export const useNotificationNavigation = () => {
  const { displayNotification } = useNotifications();

  /**
   * Send a notification that navigates to a screen when pressed
   */
  const sendNavigationNotification = useCallback(
    async (options: NavigationNotificationOptions): Promise<string | null> => {
      const {
        title,
        body,
        screen,
        params,
        channelId = NotificationChannel.DEFAULT,
        priority = NotificationPriority.DEFAULT,
        actions,
      } = options;

      return await displayNotification({
        id: `nav-${Date.now()}`,
        title,
        body,
        channelId,
        priority,
        actions,
        data: {
          screen,
          params,
        },
      });
    },
    [displayNotification],
  );

  /**
   * Send a notification with a deep link
   */
  const sendDeepLinkNotification = useCallback(
    async (
      title: string,
      body: string,
      deepLink: string,
      options?: {
        channelId?: NotificationChannel;
        priority?: NotificationPriority;
      },
    ): Promise<string | null> => {
      return await displayNotification({
        id: `deeplink-${Date.now()}`,
        title,
        body,
        channelId: options?.channelId || NotificationChannel.DEFAULT,
        priority: options?.priority || NotificationPriority.DEFAULT,
        data: {
          deepLink,
        },
      });
    },
    [displayNotification],
  );

  return {
    sendNavigationNotification,
    sendDeepLinkNotification,
  };
};
