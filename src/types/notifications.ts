/**
 * Notification Types and Interfaces
 * Defines the structure for push notifications in the application
 */

export enum NotificationChannel {
  DEFAULT = 'default',
  ALERTS = 'alerts',
  UPDATES = 'updates',
  PROMOTIONS = 'promotions',
}

export enum NotificationPriority {
  LOW = 'low',
  DEFAULT = 'default',
  HIGH = 'high',
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: NotificationChannel;
  priority?: NotificationPriority;
  sound?: string;
  badge?: number;
  image?: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  title: string;
  destructive?: boolean;
  input?: boolean;
}

export interface NotificationPermissionStatus {
  granted: boolean;
  deniedForever: boolean;
  canAskAgain: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  channels: {
    [key in NotificationChannel]: boolean;
  };
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}
