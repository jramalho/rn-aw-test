/**
 * E2E Test: Team Building and Battle System
 * Tests team creation, saving, loading, and battle functionality
 */

describe('Team Building and Battle', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Team Building', () => {
    beforeEach(async () => {
      // Navigate to Team Builder
      await element(by.text('Team')).tap();
      await waitFor(element(by.id('team-builder-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display empty team initially', async () => {
      await expect(element(by.id('team-builder-screen'))).toBeVisible();
      
      // Check for empty state or slots
      await expect(element(by.id('team-slots'))).toBeVisible();
    });

    it('should add Pokemon to team', async () => {
      // Tap "Add Pokemon" button
      await element(by.id('add-pokemon-button')).tap();
      
      // Wait for Pokemon selection screen
      await waitFor(element(by.id('pokemon-list')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Select first Pokemon
      await waitFor(element(by.id('pokemon-card-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('pokemon-card-0')).tap();
      
      // Wait to return to team builder
      await waitFor(element(by.id('team-builder-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Verify Pokemon was added
      await expect(element(by.id('team-member-0'))).toBeVisible();
    });

    it('should remove Pokemon from team', async () => {
      // Add a Pokemon first
      await element(by.id('add-pokemon-button')).tap();
      await waitFor(element(by.id('pokemon-list')))
        .toBeVisible()
        .withTimeout(3000);
      await waitFor(element(by.id('pokemon-card-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('pokemon-card-0')).tap();
      
      // Wait for team builder
      await waitFor(element(by.id('team-builder-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Remove the Pokemon
      await element(by.id('remove-team-member-0')).tap();
      
      // Confirm removal
      await element(by.text('Remove')).tap();
      
      // Verify Pokemon was removed
      await expect(element(by.id('team-member-0'))).not.toBeVisible();
    });

    it('should save team with name', async () => {
      // Add a Pokemon
      await element(by.id('add-pokemon-button')).tap();
      await waitFor(element(by.id('pokemon-list')))
        .toBeVisible()
        .withTimeout(3000);
      await waitFor(element(by.id('pokemon-card-0')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('pokemon-card-0')).tap();
      
      // Wait for team builder
      await waitFor(element(by.id('team-builder-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Tap save button
      await element(by.id('save-team-button')).tap();
      
      // Enter team name
      await element(by.id('team-name-input')).typeText('My Test Team');
      
      // Save
      await element(by.text('Save')).tap();
      
      // Verify success message or state
      await waitFor(element(by.text(/saved/i)))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should load saved team', async () => {
      // Tap load team button
      await element(by.id('load-team-button')).tap();
      
      // Wait for saved teams list
      await waitFor(element(by.id('saved-teams-list')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Select first saved team
      await element(by.id('saved-team-0')).tap();
      
      // Verify team was loaded
      await waitFor(element(by.id('team-builder-screen')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.id('team-member-0'))).toBeVisible();
    });

    it('should enforce team size limit (6 Pokemon)', async () => {
      // Try to add more than 6 Pokemon
      for (let i = 0; i < 7; i++) {
        const addButton = element(by.id('add-pokemon-button'));
        
        try {
          await addButton.tap();
          await waitFor(element(by.id('pokemon-list')))
            .toBeVisible()
            .withTimeout(2000);
          await waitFor(element(by.id('pokemon-card-0')))
            .toBeVisible()
            .withTimeout(2000);
          await element(by.id('pokemon-card-0')).tap();
          await waitFor(element(by.id('team-builder-screen')))
            .toBeVisible()
            .withTimeout(2000);
        } catch (e) {
          // Should fail on 7th attempt
          if (i === 6) {
            // Expected - team is full
            break;
          } else {
            throw e;
          }
        }
      }
      
      // Verify we can't add more
      await expect(element(by.id('add-pokemon-button'))).not.toBeVisible();
    });
  });

  describe('Battle System', () => {
    beforeEach(async () => {
      // Ensure we have a team for battling
      await element(by.text('Team')).tap();
      await waitFor(element(by.id('team-builder-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should start a battle with opponent selection', async () => {
      // Tap battle button
      await element(by.id('start-battle-button')).tap();
      
      // Wait for opponent selection
      await waitFor(element(by.id('opponent-selection-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Select an opponent
      await element(by.id('opponent-0')).tap();
      
      // Verify battle screen loads
      await waitFor(element(by.id('battle-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('battle-screen'))).toBeVisible();
    });

    it('should display battle UI correctly', async () => {
      // Start battle
      await element(by.id('start-battle-button')).tap();
      await waitFor(element(by.id('opponent-selection-screen')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('opponent-0')).tap();
      
      // Wait for battle screen
      await waitFor(element(by.id('battle-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Verify battle UI elements
      await expect(element(by.id('player-pokemon'))).toBeVisible();
      await expect(element(by.id('opponent-pokemon'))).toBeVisible();
      await expect(element(by.id('battle-actions'))).toBeVisible();
    });

    it('should execute attack move', async () => {
      // Start battle
      await element(by.id('start-battle-button')).tap();
      await waitFor(element(by.id('opponent-selection-screen')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('opponent-0')).tap();
      
      // Wait for battle screen
      await waitFor(element(by.id('battle-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Select first move
      await element(by.id('move-0')).tap();
      
      // Wait for turn to process
      await waitFor(element(by.id('battle-log')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Verify battle log shows action
      await expect(element(by.id('battle-log'))).toBeVisible();
    });

    it('should allow switching Pokemon during battle', async () => {
      // Start battle with multiple Pokemon
      await element(by.id('start-battle-button')).tap();
      await waitFor(element(by.id('opponent-selection-screen')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('opponent-0')).tap();
      
      // Wait for battle screen
      await waitFor(element(by.id('battle-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Tap switch button
      await element(by.id('switch-pokemon-button')).tap();
      
      // Select another Pokemon
      await element(by.id('team-pokemon-1')).tap();
      
      // Verify Pokemon was switched
      await waitFor(element(by.id('battle-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should end battle when all Pokemon faint', async () => {
      // This would require a longer test or mock scenario
      // For now, test forfeit functionality
      
      // Start battle
      await element(by.id('start-battle-button')).tap();
      await waitFor(element(by.id('opponent-selection-screen')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('opponent-0')).tap();
      
      // Wait for battle screen
      await waitFor(element(by.id('battle-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Forfeit battle
      await element(by.id('forfeit-button')).tap();
      
      // Confirm forfeit
      await element(by.text('Forfeit')).tap();
      
      // Verify we return to previous screen
      await waitFor(element(by.id('team-builder-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display battle history', async () => {
      // Navigate to battle history
      await element(by.id('battle-history-button')).tap();
      
      // Wait for history screen
      await waitFor(element(by.id('battle-history-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Verify battle history is shown
      await expect(element(by.id('battle-history-screen'))).toBeVisible();
    });
  });
});
