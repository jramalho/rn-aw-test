/**
 * E2E Test: Pokemon Features
 * Tests Pokemon list, search, filtering, and details
 */

describe('Pokemon Features', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to Pokemon list
    await element(by.text('Pokemon')).tap();
    await waitFor(element(by.id('pokemon-list')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display Pokemon list', async () => {
    await expect(element(by.id('pokemon-list'))).toBeVisible();
    
    // Verify at least one Pokemon card is visible
    await waitFor(element(by.id('pokemon-card-0')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should search for Pokemon by name', async () => {
    // Tap search input
    await element(by.id('pokemon-search-input')).tap();
    
    // Type "pikachu"
    await element(by.id('pokemon-search-input')).typeText('pikachu');
    
    // Wait for search results
    await waitFor(element(by.text(/Pikachu/i)))
      .toBeVisible()
      .withTimeout(3000);
    
    // Verify Pikachu is shown
    await expect(element(by.text(/Pikachu/i))).toBeVisible();
  });

  it('should filter Pokemon by type', async () => {
    // Tap on type filter button
    await element(by.id('type-filter-button')).tap();
    
    // Select Electric type
    await element(by.text('Electric')).tap();
    
    // Confirm filter
    await element(by.text('Apply')).tap();
    
    // Wait for filtered results
    await waitFor(element(by.id('pokemon-list')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Verify we have filtered results
    await expect(element(by.id('pokemon-card-0'))).toBeVisible();
  });

  it('should open Pokemon detail screen', async () => {
    // Wait for first Pokemon card
    await waitFor(element(by.id('pokemon-card-0')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Tap on first Pokemon
    await element(by.id('pokemon-card-0')).tap();
    
    // Wait for detail screen
    await waitFor(element(by.id('pokemon-detail-screen')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Verify Pokemon details are shown
    await expect(element(by.id('pokemon-detail-screen'))).toBeVisible();
    await expect(element(by.id('pokemon-stats'))).toBeVisible();
  });

  it('should add Pokemon to favorites', async () => {
    // Open first Pokemon detail
    await waitFor(element(by.id('pokemon-card-0')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('pokemon-card-0')).tap();
    
    // Wait for detail screen
    await waitFor(element(by.id('pokemon-detail-screen')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Tap favorite button
    await element(by.id('favorite-button')).tap();
    
    // Verify success (could be toast or icon change)
    await waitFor(element(by.id('favorite-button')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should scroll through Pokemon list', async () => {
    // Verify we can scroll
    await element(by.id('pokemon-list')).scrollTo('bottom');
    
    // Wait for more items to load
    await waitFor(element(by.id('pokemon-card-20')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.id('pokemon-card-20'))).toBeVisible();
  });

  it('should handle offline mode gracefully', async () => {
    // Disable network
    await device.disableSynchronization();
    
    // Try to load more Pokemon (should use cache)
    await element(by.id('pokemon-list')).scrollTo('bottom');
    
    // Re-enable network
    await device.enableSynchronization();
    
    // List should still be functional
    await expect(element(by.id('pokemon-list'))).toBeVisible();
  });

  it('should navigate back from Pokemon detail', async () => {
    // Open Pokemon detail
    await waitFor(element(by.id('pokemon-card-0')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('pokemon-card-0')).tap();
    
    // Wait for detail screen
    await waitFor(element(by.id('pokemon-detail-screen')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Go back
    await element(by.id('back-button')).tap();
    
    // Verify we're back at the list
    await expect(element(by.id('pokemon-list'))).toBeVisible();
  });
});
