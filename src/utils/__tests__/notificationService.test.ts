/**
 * Tests for Notification Service
 */

import { notificationService } from '../notificationService';
import notifee from '@notifee/react-native';
import { NotificationChannel, NotificationPriority } from '../../types/notifications';

// Mock notifee
jest.mock('@notifee/react-native');

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize notification service', async () => {
      (notifee.createChannel as jest.Mock).mockResolvedValue(undefined);
      (notifee.onForegroundEvent as jest.Mock).mockReturnValue(() => {});
      (notifee.onBackgroundEvent as jest.Mock).mockReturnValue(() => {});

      await notificationService.initialize();

      expect(notifee.onForegroundEvent).toHaveBeenCalled();
      expect(notifee.onBackgroundEvent).toHaveBeenCalled();
    });

    it('should not reinitialize if already initialized', async () => {
      await notificationService.initialize();
      await notificationService.initialize();

      // Should only be called once from the first initialization
      expect(notifee.onForegroundEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('requestPermissions', () => {
    it('should request notification permissions', async () => {
      (notifee.requestPermission as jest.Mock).mockResolvedValue({
        authorizationStatus: 1, // AUTHORIZED
      });

      const status = await notificationService.requestPermissions();

      expect(notifee.requestPermission).toHaveBeenCalled();
      expect(status.granted).toBe(true);
    });

    it('should handle denied permissions', async () => {
      (notifee.requestPermission as jest.Mock).mockResolvedValue({
        authorizationStatus: 2, // DENIED
      });

      const status = await notificationService.requestPermissions();

      expect(status.granted).toBe(false);
      expect(status.deniedForever).toBe(true);
    });
  });

  describe('displayNotification', () => {
    it('should display a notification with default settings', async () => {
      (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
        authorizationStatus: 1, // AUTHORIZED
      });
      (notifee.displayNotification as jest.Mock).mockResolvedValue('notification-id');

      const notificationId = await notificationService.displayNotification({
        id: 'test-1',
        title: 'Test Title',
        body: 'Test Body',
      });

      expect(notifee.displayNotification).toHaveBeenCalled();
      expect(notificationId).toBe('notification-id');
    });

    it('should display a notification with custom channel and priority', async () => {
      (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
        authorizationStatus: 1,
      });
      (notifee.displayNotification as jest.Mock).mockResolvedValue('notification-id');

      await notificationService.displayNotification({
        id: 'test-2',
        title: 'Alert',
        body: 'Important message',
        channelId: NotificationChannel.ALERTS,
        priority: NotificationPriority.HIGH,
      });

      expect(notifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-2',
          title: 'Alert',
          body: 'Important message',
        }),
      );
    });

    it('should request permissions if not granted', async () => {
      (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
        authorizationStatus: 0, // NOT_DETERMINED
      });
      (notifee.requestPermission as jest.Mock).mockResolvedValue({
        authorizationStatus: 1, // AUTHORIZED
      });
      (notifee.displayNotification as jest.Mock).mockResolvedValue('notification-id');

      await notificationService.displayNotification({
        id: 'test-3',
        title: 'Test',
        body: 'Test',
      });

      expect(notifee.requestPermission).toHaveBeenCalled();
      expect(notifee.displayNotification).toHaveBeenCalled();
    });

    it('should throw error if permissions not granted after request', async () => {
      (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
        authorizationStatus: 0,
      });
      (notifee.requestPermission as jest.Mock).mockResolvedValue({
        authorizationStatus: 2, // DENIED
      });

      await expect(
        notificationService.displayNotification({
          id: 'test-4',
          title: 'Test',
          body: 'Test',
        }),
      ).rejects.toThrow('Notification permissions not granted');
    });
  });

  describe('cancelNotification', () => {
    it('should cancel a specific notification', async () => {
      (notifee.cancelNotification as jest.Mock).mockResolvedValue(undefined);

      await notificationService.cancelNotification('test-id');

      expect(notifee.cancelNotification).toHaveBeenCalledWith('test-id');
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all notifications', async () => {
      (notifee.cancelAllNotifications as jest.Mock).mockResolvedValue(undefined);

      await notificationService.cancelAllNotifications();

      expect(notifee.cancelAllNotifications).toHaveBeenCalled();
    });
  });

  describe('setBadgeCount', () => {
    it('should set badge count on iOS', async () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'ios',
      }));
      (notifee.setBadgeCount as jest.Mock).mockResolvedValue(undefined);

      await notificationService.setBadgeCount(5);

      expect(notifee.setBadgeCount).toHaveBeenCalledWith(5);
    });
  });

  describe('openSettings', () => {
    it('should open notification settings', async () => {
      (notifee.openNotificationSettings as jest.Mock).mockResolvedValue(undefined);

      await notificationService.openSettings();

      expect(notifee.openNotificationSettings).toHaveBeenCalled();
    });
  });
});
