/**
 * Tests for useNotificationNavigation hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useNotificationNavigation } from '../useNotificationNavigation';
import { useNotifications } from '../useNotifications';

// Mock useNotifications
jest.mock('../useNotifications');

describe('useNotificationNavigation', () => {
  const mockDisplayNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNotifications as jest.Mock).mockReturnValue({
      displayNotification: mockDisplayNotification,
      isInitialized: true,
      permissionStatus: { granted: true, deniedForever: false, canAskAgain: false },
    });
  });

  describe('sendNavigationNotification', () => {
    it('should send a notification with screen navigation data', async () => {
      mockDisplayNotification.mockResolvedValue('notification-id');

      const { result } = renderHook(() => useNotificationNavigation());

      await act(async () => {
        const notificationId = await result.current.sendNavigationNotification({
          title: 'Check this out!',
          body: 'New Pokemon available',
          screen: 'PokemonDetail',
          params: { id: '25' },
        });

        expect(notificationId).toBe('notification-id');
      });

      expect(mockDisplayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Check this out!',
          body: 'New Pokemon available',
          data: {
            screen: 'PokemonDetail',
            params: { id: '25' },
          },
        }),
      );
    });

    it('should use custom channel and priority', async () => {
      mockDisplayNotification.mockResolvedValue('notification-id');

      const { result } = renderHook(() => useNotificationNavigation());

      await act(async () => {
        await result.current.sendNavigationNotification({
          title: 'Alert!',
          body: 'Important message',
          screen: 'Settings',
          channelId: 'alerts' as any,
          priority: 'high' as any,
        });
      });

      expect(mockDisplayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: 'alerts',
          priority: 'high',
        }),
      );
    });

    it('should include action buttons when provided', async () => {
      mockDisplayNotification.mockResolvedValue('notification-id');

      const { result } = renderHook(() => useNotificationNavigation());

      const actions = [
        { id: 'view', title: 'View' },
        { id: 'dismiss', title: 'Dismiss', destructive: true },
      ];

      await act(async () => {
        await result.current.sendNavigationNotification({
          title: 'New Message',
          body: 'You have a new message',
          screen: 'Profile',
          actions,
        });
      });

      expect(mockDisplayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          actions,
        }),
      );
    });
  });

  describe('sendDeepLinkNotification', () => {
    it('should send a notification with deep link', async () => {
      mockDisplayNotification.mockResolvedValue('notification-id');

      const { result } = renderHook(() => useNotificationNavigation());

      await act(async () => {
        const notificationId = await result.current.sendDeepLinkNotification(
          'Open Pokemon',
          'Check out Pikachu!',
          'rnawtest://pokemon/25',
        );

        expect(notificationId).toBe('notification-id');
      });

      expect(mockDisplayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Open Pokemon',
          body: 'Check out Pikachu!',
          data: {
            deepLink: 'rnawtest://pokemon/25',
          },
        }),
      );
    });

    it('should use custom channel and priority for deep link', async () => {
      mockDisplayNotification.mockResolvedValue('notification-id');

      const { result } = renderHook(() => useNotificationNavigation());

      await act(async () => {
        await result.current.sendDeepLinkNotification(
          'Alert',
          'Check this',
          'rnawtest://settings',
          {
            channelId: 'alerts' as any,
            priority: 'high' as any,
          },
        );
      });

      expect(mockDisplayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: 'alerts',
          priority: 'high',
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should handle notification display errors', async () => {
      mockDisplayNotification.mockRejectedValue(new Error('Display failed'));

      const { result } = renderHook(() => useNotificationNavigation());

      await act(async () => {
        const notificationId = await result.current.sendNavigationNotification({
          title: 'Test',
          body: 'Test body',
          screen: 'Home',
        });

        // Should return null on error (handled by useNotifications)
        expect(notificationId).toBeNull();
      });
    });
  });
});
