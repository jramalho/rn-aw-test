/**
 * Notification Service
 * Handles all notification-related functionality using Notifee
 */

import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  Notification,
} from '@notifee/react-native';
import { Platform, Linking } from 'react-native';
import {
  NotificationChannel,
  NotificationData,
  NotificationPermissionStatus,
  NotificationPriority,
} from '../types/notifications';

// Type for notification action handlers
type NotificationActionHandler = (
  actionId: string,
  notification?: Notification,
) => void | Promise<void>;

class NotificationService {
  private initialized = false;
  private actionHandlers: Map<string, NotificationActionHandler> = new Map();

  /**
   * Initialize notification channels and event listeners
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create notification channels for Android
      if (Platform.OS === 'android') {
        await this.createChannels();
      }

      // Set up foreground event listener
      notifee.onForegroundEvent(({ type, detail }) => {
        console.log('Foreground notification event:', type, detail);
        
        switch (type) {
          case EventType.DISMISSED:
            console.log('Notification dismissed');
            break;
          case EventType.PRESS:
            console.log('Notification pressed', detail.notification);
            this.handleNotificationPress(detail.notification);
            break;
          case EventType.ACTION_PRESS:
            console.log('Action pressed', detail.pressAction);
            this.handleActionPress(detail.pressAction?.id, detail.notification);
            break;
        }
      });

      // Set up background event listener
      notifee.onBackgroundEvent(async ({ type, detail }) => {
        console.log('Background notification event:', type, detail);

        switch (type) {
          case EventType.PRESS:
            console.log('Background notification pressed');
            break;
          case EventType.ACTION_PRESS:
            console.log('Background action pressed', detail.pressAction);
            break;
        }
      });

      this.initialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  /**
   * Create notification channels for Android
   */
  private async createChannels(): Promise<void> {
    const channels = [
      {
        id: NotificationChannel.DEFAULT,
        name: 'Default Notifications',
        description: 'General app notifications',
        importance: AndroidImportance.DEFAULT,
      },
      {
        id: NotificationChannel.ALERTS,
        name: 'Important Alerts',
        description: 'Critical alerts and warnings',
        importance: AndroidImportance.HIGH,
      },
      {
        id: NotificationChannel.UPDATES,
        name: 'Updates',
        description: 'App and content updates',
        importance: AndroidImportance.DEFAULT,
      },
      {
        id: NotificationChannel.PROMOTIONS,
        name: 'Promotions',
        description: 'Promotional content and offers',
        importance: AndroidImportance.LOW,
      },
    ];

    for (const channel of channels) {
      await notifee.createChannel(channel);
    }

    console.log('Notification channels created');
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      const settings = await notifee.requestPermission();

      const status: NotificationPermissionStatus = {
        granted: settings.authorizationStatus === AuthorizationStatus.AUTHORIZED,
        deniedForever: settings.authorizationStatus === AuthorizationStatus.DENIED,
        canAskAgain: settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED,
      };

      console.log('Notification permission status:', status);
      return status;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return {
        granted: false,
        deniedForever: false,
        canAskAgain: true,
      };
    }
  }

  /**
   * Check current notification permission status
   */
  async checkPermissions(): Promise<NotificationPermissionStatus> {
    try {
      const settings = await notifee.getNotificationSettings();

      return {
        granted: settings.authorizationStatus === AuthorizationStatus.AUTHORIZED,
        deniedForever: settings.authorizationStatus === AuthorizationStatus.DENIED,
        canAskAgain: settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED,
      };
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
      return {
        granted: false,
        deniedForever: false,
        canAskAgain: true,
      };
    }
  }

  /**
   * Display a local notification
   */
  async displayNotification(data: NotificationData): Promise<string> {
    try {
      // Request permissions if not already granted
      const permissions = await this.checkPermissions();
      if (!permissions.granted) {
        const requested = await this.requestPermissions();
        if (!requested.granted) {
          throw new Error('Notification permissions not granted');
        }
      }

      const notification: Notification = {
        id: data.id,
        title: data.title,
        body: data.body,
        data: data.data,
        android: {
          channelId: data.channelId || NotificationChannel.DEFAULT,
          importance: this.mapPriorityToImportance(data.priority),
          pressAction: {
            id: 'default',
          },
          largeIcon: data.image,
          actions: data.actions?.map(action => ({
            pressAction: { id: action.id },
            title: action.title,
          })),
        },
        ios: {
          sound: data.sound || 'default',
          badgeCount: data.badge,
          attachments: data.image ? [{ url: data.image }] : undefined,
        },
      };

      const notificationId = await notifee.displayNotification(notification);
      console.log('Notification displayed:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to display notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Get all displayed notifications
   */
  async getDisplayedNotifications(): Promise<Notification[]> {
    try {
      const notifications = await notifee.getDisplayedNotifications();
      return notifications;
    } catch (error) {
      console.error('Failed to get displayed notifications:', error);
      return [];
    }
  }

  /**
   * Set application badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await notifee.setBadgeCount(count);
        console.log('Badge count set:', count);
      } catch (error) {
        console.error('Failed to set badge count:', error);
      }
    }
  }

  /**
   * Increment application badge count (iOS only)
   */
  async incrementBadgeCount(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await notifee.incrementBadgeCount();
        console.log('Badge count incremented');
      } catch (error) {
        console.error('Failed to increment badge count:', error);
      }
    }
  }

  /**
   * Decrement application badge count (iOS only)
   */
  async decrementBadgeCount(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await notifee.decrementBadgeCount();
        console.log('Badge count decremented');
      } catch (error) {
        console.error('Failed to decrement badge count:', error);
      }
    }
  }

  /**
   * Open notification settings
   */
  async openSettings(): Promise<void> {
    try {
      await notifee.openNotificationSettings();
    } catch (error) {
      console.error('Failed to open notification settings:', error);
    }
  }

  /**
   * Handle notification press
   */
  private handleNotificationPress(notification?: Notification): void {
    console.log('Handling notification press:', notification);
    
    // If notification has a deep link in its data, open it
    if (notification?.data?.deepLink) {
      const deepLink = notification.data.deepLink as string;
      console.log('Opening deep link from notification:', deepLink);
      
      Linking.openURL(deepLink).catch(error => {
        console.error('Failed to open deep link:', error);
      });
    }
    
    // If notification has a screen to navigate to
    if (notification?.data?.screen) {
      const screen = notification.data.screen as string;
      console.log('Navigation to screen:', screen, notification.data.params);
      // Note: Direct navigation would require a navigation ref
      // For now, we'll use deep linking which is already set up
      const params = notification.data.params as Record<string, any>;
      const deepLink = this.buildDeepLink(screen, params);
      
      if (deepLink) {
        Linking.openURL(deepLink).catch(error => {
          console.error('Failed to navigate:', error);
        });
      }
    }
  }

  /**
   * Handle notification action press
   */
  private handleActionPress(actionId?: string, notification?: Notification): void {
    console.log('Handling action press:', actionId, notification);
    
    // Check if there's a registered handler for this action
    if (actionId && this.actionHandlers.has(actionId)) {
      const handler = this.actionHandlers.get(actionId);
      handler?.(actionId, notification);
      return;
    }
    
    // Default action handling
    if (actionId === 'accept' || actionId === 'confirm') {
      console.log('User accepted the notification');
    } else if (actionId === 'decline' || actionId === 'dismiss') {
      console.log('User declined the notification');
    }
  }

  /**
   * Register an action handler
   */
  registerActionHandler(actionId: string, handler: NotificationActionHandler): void {
    this.actionHandlers.set(actionId, handler);
  }

  /**
   * Unregister an action handler
   */
  unregisterActionHandler(actionId: string): void {
    this.actionHandlers.delete(actionId);
  }

  /**
   * Build a deep link URL from screen name and parameters
   */
  private buildDeepLink(screen: string, params?: Record<string, any>): string | null {
    const URL_SCHEME = 'rnawtest';
    
    const screenMap: Record<string, string> = {
      PokemonList: 'pokemon',
      PokemonDetail: 'pokemon',
      TeamBuilder: 'team',
      Profile: 'profile',
      Settings: 'settings',
      NotificationSettings: 'notifications',
      PerformanceDashboard: 'performance',
      Login: 'login',
      SignUp: 'signup',
    };
    
    const path = screenMap[screen];
    if (!path) {
      console.warn('Unknown screen for deep link:', screen);
      return null;
    }
    
    // Handle special cases with parameters
    if (screen === 'PokemonDetail' && params?.id) {
      return `${URL_SCHEME}://${path}/${params.id}`;
    }
    
    return `${URL_SCHEME}://${path}`;
  }

  /**
   * Map priority to Android importance
   */
  private mapPriorityToImportance(
    priority?: NotificationPriority,
  ): AndroidImportance {
    switch (priority) {
      case NotificationPriority.LOW:
        return AndroidImportance.LOW;
      case NotificationPriority.HIGH:
        return AndroidImportance.HIGH;
      case NotificationPriority.DEFAULT:
      default:
        return AndroidImportance.DEFAULT;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
