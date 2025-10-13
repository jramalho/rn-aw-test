/**
 * E2E Test: App Launch and Navigation
 * Tests basic app functionality and navigation between screens
 */

describe('App Launch and Navigation', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch app successfully', async () => {
    await expect(element(by.text('Pokemon'))).toBeVisible();
  });

  it('should navigate to Pokemon list screen', async () => {
    // Tap on Pokemon tab
    await element(by.text('Pokemon')).tap();
    
    // Wait for Pokemon list to load
    await waitFor(element(by.id('pokemon-list')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Verify we can see some Pokemon
    await expect(element(by.id('pokemon-list'))).toBeVisible();
  });

  it('should navigate to Team Builder screen', async () => {
    // Tap on Team tab
    await element(by.text('Team')).tap();
    
    // Verify Team Builder screen is visible
    await waitFor(element(by.id('team-builder-screen')))
      .toBeVisible()
      .withTimeout(3000);
    
    await expect(element(by.text('Team Builder'))).toBeVisible();
  });

  it('should navigate to Profile screen', async () => {
    // Tap on Profile tab
    await element(by.text('Profile')).tap();
    
    // Verify Profile screen is visible
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(3000);
    
    await expect(element(by.text('Profile'))).toBeVisible();
  });

  it('should navigate to Settings screen', async () => {
    // Tap on Settings tab
    await element(by.text('Settings')).tap();
    
    // Verify Settings screen is visible
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000);
    
    await expect(element(by.text('Settings'))).toBeVisible();
  });

  it('should handle app backgrounding and foregrounding', async () => {
    await device.sendToHome();
    await device.launchApp({ newInstance: false });
    
    // App should still be functional
    await expect(element(by.text('Pokemon'))).toBeVisible();
  });
});
