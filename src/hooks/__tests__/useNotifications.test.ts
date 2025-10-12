/**
 * Tests for useNotifications Hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNotifications } from '../useNotifications';
import { notificationService } from '../../utils/notificationService';
import { NotificationChannel, NotificationPriority } from '../../types/notifications';

// Mock notification service
jest.mock('../../utils/notificationService');

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (notificationService.initialize as jest.Mock).mockResolvedValue(undefined);
    (notificationService.checkPermissions as jest.Mock).mockResolvedValue({
      granted: false,
      deniedForever: false,
      canAskAgain: true,
    });
  });

  it('should initialize on mount', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(notificationService.initialize).toHaveBeenCalled();
    expect(notificationService.checkPermissions).toHaveBeenCalled();
  });

  it('should request permissions', async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue({
      granted: true,
      deniedForever: false,
      canAskAgain: false,
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let status;
    await act(async () => {
      status = await result.current.requestPermissions();
    });

    expect(notificationService.requestPermissions).toHaveBeenCalled();
    expect(status?.granted).toBe(true);
  });

  it('should display notification', async () => {
    (notificationService.displayNotification as jest.Mock).mockResolvedValue('test-id');

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let notificationId;
    await act(async () => {
      notificationId = await result.current.displayNotification({
        id: 'test-1',
        title: 'Test',
        body: 'Test notification',
        channelId: NotificationChannel.DEFAULT,
        priority: NotificationPriority.DEFAULT,
      });
    });

    expect(notificationService.displayNotification).toHaveBeenCalledWith({
      id: 'test-1',
      title: 'Test',
      body: 'Test notification',
      channelId: NotificationChannel.DEFAULT,
      priority: NotificationPriority.DEFAULT,
    });
    expect(notificationId).toBe('test-id');
  });

  it('should not display notification if not initialized', async () => {
    (notificationService.initialize as jest.Mock).mockImplementation(() => {
      // Never resolves to keep uninitialized
      return new Promise(() => {});
    });

    const { result } = renderHook(() => useNotifications());

    let notificationId;
    await act(async () => {
      notificationId = await result.current.displayNotification({
        id: 'test-2',
        title: 'Test',
        body: 'Test',
      });
    });

    expect(notificationId).toBeNull();
  });

  it('should cancel notification', async () => {
    (notificationService.cancelNotification as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.cancelNotification('test-id');
    });

    expect(notificationService.cancelNotification).toHaveBeenCalledWith('test-id');
  });

  it('should cancel all notifications', async () => {
    (notificationService.cancelAllNotifications as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.cancelAllNotifications();
    });

    expect(notificationService.cancelAllNotifications).toHaveBeenCalled();
  });

  it('should set badge count', async () => {
    (notificationService.setBadgeCount as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.setBadgeCount(5);
    });

    expect(notificationService.setBadgeCount).toHaveBeenCalledWith(5);
  });

  it('should open settings', async () => {
    (notificationService.openSettings as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.openSettings();
    });

    expect(notificationService.openSettings).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    (notificationService.displayNotification as jest.Mock).mockRejectedValue(
      new Error('Test error'),
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let notificationId;
    await act(async () => {
      notificationId = await result.current.displayNotification({
        id: 'test-error',
        title: 'Test',
        body: 'Test',
      });
    });

    expect(notificationId).toBeNull();
  });
});
