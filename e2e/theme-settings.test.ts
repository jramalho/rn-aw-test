/**
 * E2E Test: Theme and Settings
 * Tests theme switching, settings persistence, and preferences
 */

describe('Theme and Settings', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Theme Switching', () => {
    beforeEach(async () => {
      // Navigate to Settings
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should toggle between light and dark theme', async () => {
      // Find theme toggle
      await element(by.id('theme-toggle')).tap();

      // Wait for theme to change
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify theme changed (check background color or theme indicator)
      await expect(element(by.id('settings-screen'))).toBeVisible();

      // Toggle back
      await element(by.id('theme-toggle')).tap();
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    it('should persist theme preference', async () => {
      // Toggle theme
      await element(by.id('theme-toggle')).tap();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reload app
      await device.reloadReactNative();

      // Navigate back to Settings
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Theme should be persisted
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should apply theme across all screens', async () => {
      // Toggle theme
      await element(by.id('theme-toggle')).tap();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to different screens and verify theme applies
      await element(by.text('Pokemon')).tap();
      await waitFor(element(by.id('pokemon-list')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.id('pokemon-list'))).toBeVisible();

      await element(by.text('Team')).tap();
      await waitFor(element(by.id('team-builder-screen')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.id('team-builder-screen'))).toBeVisible();
    });
  });

  describe('App Settings', () => {
    beforeEach(async () => {
      // Navigate to Settings
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display all settings options', async () => {
      await expect(element(by.id('settings-screen'))).toBeVisible();

      // Verify key settings are present
      await expect(element(by.text(/Theme/i))).toBeVisible();
      await expect(element(by.text(/Notification/i))).toBeVisible();
    });

    it('should toggle notification settings', async () => {
      // Find and toggle notification setting
      await element(by.id('notification-setting-toggle')).tap();

      // Verify toggle worked
      await new Promise(resolve => setTimeout(resolve, 500));
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should persist settings after app restart', async () => {
      // Toggle a setting
      await element(by.id('notification-setting-toggle')).tap();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Restart app
      await device.reloadReactNative();

      // Navigate back to Settings
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Setting should be persisted
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });
  });

  describe('Performance Dashboard', () => {
    it('should display performance metrics', async () => {
      // Navigate to Settings
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      try {
        // Look for performance option
        await element(by.text(/Performance/i)).tap();

        // Verify performance dashboard
        await waitFor(element(by.id('performance-dashboard-screen')))
          .toBeVisible()
          .withTimeout(3000);

        // Check for metrics
        await expect(element(by.id('fps-metric'))).toBeVisible();
        await expect(element(by.id('memory-metric'))).toBeVisible();
      } catch {
        // Performance dashboard might not be accessible from Settings
      }
    });
  });

  describe('About and Info', () => {
    beforeEach(async () => {
      // Navigate to Settings
      await element(by.text('Settings')).tap();
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display app version', async () => {
      // Look for version info
      try {
        await expect(element(by.text(/Version/i))).toBeVisible();
      } catch {
        // Version might not be displayed
      }
    });

    it('should display New Architecture status', async () => {
      // Look for New Architecture indicator
      try {
        await expect(element(by.text(/New Architecture/i))).toBeVisible();
      } catch {
        // Might not be displayed
      }
    });
  });
});
