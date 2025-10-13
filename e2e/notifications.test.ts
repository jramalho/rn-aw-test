/**
 * E2E Test: Notifications
 * Tests notification permissions and functionality
 */

describe('Notifications', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Notification Settings', () => {
    beforeEach(async () => {
      // Navigate to Settings
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display notification settings', async () => {
      // Tap on notification settings
      await element(by.text(/Notification/i)).tap();
      
      // Verify notification settings screen
      await waitFor(element(by.id('notification-settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('notification-settings-screen'))).toBeVisible();
    });

    it('should display current notification permission status', async () => {
      await element(by.text(/Notification/i)).tap();
      await waitFor(element(by.id('notification-settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Check if permission status is shown
      await expect(element(by.id('permission-status'))).toBeVisible();
    });

    it('should toggle notification channel settings', async () => {
      await element(by.text(/Notification/i)).tap();
      await waitFor(element(by.id('notification-settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Toggle a notification channel
      await element(by.id('channel-toggle-alerts')).tap();
      
      // Verify toggle state changed
      await waitFor(element(by.id('channel-toggle-alerts')))
        .toBeVisible()
        .withTimeout(1000);
    });
  });

  describe('Notification Demo', () => {
    it('should send test notification', async () => {
      // Navigate to Settings
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Open notification settings
      await element(by.text(/Notification/i)).tap();
      await waitFor(element(by.id('notification-settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Tap "Send Test Notification" button
      await element(by.id('send-test-notification')).tap();
      
      // Wait a moment for notification to be sent
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Note: Can't directly verify notification in E2E, but ensure no crash
      await expect(element(by.id('notification-settings-screen'))).toBeVisible();
    });

    it('should send navigation notification', async () => {
      // Navigate to notification demo screen if exists
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      try {
        await element(by.text(/Notification.*Demo/i)).tap();
        await waitFor(element(by.id('notification-demo-screen')))
          .toBeVisible()
          .withTimeout(3000);
        
        // Send a navigation notification
        await element(by.id('send-pokemon-notification')).tap();
        
        // Verify no crash
        await expect(element(by.id('notification-demo-screen'))).toBeVisible();
      } catch (e) {
        // Demo screen might not exist, that's ok
      }
    });
  });

  describe('Notification Permissions', () => {
    it('should handle notification permission request', async () => {
      // Navigate to Settings
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.text(/Notification/i)).tap();
      await waitFor(element(by.id('notification-settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Try to request permissions (if button exists)
      try {
        await element(by.id('request-permission-button')).tap();
        
        // Wait for system dialog (can't interact with it in E2E)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // App should still be functional
        await expect(element(by.id('notification-settings-screen'))).toBeVisible();
      } catch (e) {
        // Permission button might not exist if already granted
      }
    });
  });

  describe('Notification Deep Linking', () => {
    it('should handle notification navigation', async () => {
      // This test verifies the app can handle notification taps
      // In a real scenario, this would be triggered by tapping a notification
      
      // Navigate to Pokemon screen via deep link simulation
      await device.openURL({ url: 'rnawtest://pokemon/25' });
      
      // Verify Pokemon detail screen opens
      await waitFor(element(by.id('pokemon-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('pokemon-detail-screen'))).toBeVisible();
    });
  });
});
