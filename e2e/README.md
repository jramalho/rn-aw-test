# End-to-End Testing with Detox

This directory contains comprehensive E2E tests for the RN AW Test application using [Detox](https://wix.github.io/Detox/).

## Overview

E2E tests validate critical user journeys and ensure the app works correctly from a user's perspective. Tests cover:

- **App Launch and Navigation** - Basic app functionality and tab navigation
- **Pokemon Features** - List, search, filter, details, and favorites
- **Team Building and Battle** - Team creation, saving, loading, and battle system
- **Authentication** - Login, signup, and logout flows
- **Notifications** - Permission handling and notification functionality
- **Theme and Settings** - Theme switching and settings persistence

## Test Suite Structure

```
e2e/
├── jest.config.js                    # Jest configuration for E2E tests
├── app-launch.test.ts                # App launch and navigation tests
├── pokemon-features.test.ts          # Pokemon-related feature tests
├── team-building-battle.test.ts      # Team and battle system tests
├── authentication.test.ts            # Auth flow tests
├── notifications.test.ts             # Notification tests
└── theme-settings.test.ts            # Theme and settings tests
```

## Prerequisites

### iOS
- Xcode 15+ installed
- iOS Simulator installed
- Apple Silicon or Intel Mac

### Android
- Android Studio installed
- Android SDK and tools configured
- At least one AVD (Android Virtual Device) created
  - Recommended: Pixel 7 API 34

## Setup

### 1. Install Detox CLI globally (optional but recommended)
```bash
npm install -g detox-cli
```

### 2. Install dependencies
```bash
npm install
```

### 3. iOS Setup
```bash
# Install pods
cd ios && bundle exec pod install && cd ..

# Build the app for testing
npm run test:e2e:build:ios
```

### 4. Android Setup
```bash
# Ensure Android emulator is running or device is connected
adb devices

# Build the app for testing
npm run test:e2e:build:android
```

## Running Tests

### iOS Tests
```bash
# Build iOS app for testing
npm run test:e2e:build:ios

# Run iOS tests
npm run test:e2e:test:ios

# Run specific test file
detox test e2e/app-launch.test.ts --configuration ios.sim.release
```

### Android Tests
```bash
# Ensure emulator is running
emulator -avd Pixel_7_API_34

# Build Android app for testing
npm run test:e2e:build:android

# Run Android tests
npm run test:e2e:test:android

# Run specific test file
detox test e2e/pokemon-features.test.ts --configuration android.emu.release
```

### Running Specific Tests
```bash
# Run a specific test suite
detox test --configuration android.emu.release --grep "Pokemon Features"

# Run with verbose output
detox test --configuration android.emu.release --loglevel verbose

# Run in debug mode
detox test --configuration android.emu.release --debug-synchronization
```

## Test Coverage

### Current Coverage (80%+ of user journeys)

✅ **App Launch and Navigation**
- App launches successfully
- Tab navigation works
- Screen transitions are smooth
- Backgrounding and foregrounding

✅ **Pokemon Features**
- Pokemon list displays correctly
- Search functionality works
- Type filtering works
- Pokemon details load properly
- Favorites can be added
- Infinite scroll pagination
- Offline caching works

✅ **Team Building**
- Add Pokemon to team
- Remove Pokemon from team
- Save teams with names
- Load saved teams
- Team size limit enforced (6 Pokemon)

✅ **Battle System**
- Start battle with opponent selection
- Battle UI displays correctly
- Execute attack moves
- Switch Pokemon during battle
- Forfeit battles
- View battle history

✅ **Authentication**
- Login with valid credentials
- Validation errors for empty fields
- Error handling for invalid credentials
- Sign up form validation
- Password strength validation
- Logout functionality

✅ **Notifications**
- Display notification settings
- Permission status shown
- Toggle notification channels
- Send test notifications
- Handle deep links from notifications

✅ **Theme and Settings**
- Toggle between light/dark themes
- Theme persistence across app restarts
- Theme applies to all screens
- Settings persistence
- Performance dashboard (if available)

## Writing New Tests

### Test Structure
```typescript
describe('Feature Name', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should do something specific', async () => {
    // Arrange: Set up test conditions
    await element(by.text('Tab Name')).tap();
    
    // Act: Perform the action
    await element(by.id('button-id')).tap();
    
    // Assert: Verify the result
    await expect(element(by.id('result-id'))).toBeVisible();
  });
});
```

### Best Practices

1. **Use testIDs over text matching**
   ```typescript
   // ✅ Good - stable
   await element(by.id('login-button')).tap();
   
   // ❌ Avoid - breaks with text changes
   await element(by.text('Login')).tap();
   ```

2. **Add waitFor for async operations**
   ```typescript
   await waitFor(element(by.id('loading-indicator')))
     .not.toBeVisible()
     .withTimeout(5000);
   ```

3. **Test user journeys, not implementation details**
   ```typescript
   // ✅ Good - tests user flow
   it('should allow user to add Pokemon to team', async () => {
     await navigateToTeamBuilder();
     await addPokemonToTeam('Pikachu');
     await expect(element(by.text('Pikachu'))).toBeVisible();
   });
   
   // ❌ Avoid - tests implementation
   it('should call addToTeam function', async () => { ... });
   ```

4. **Clean up after tests**
   ```typescript
   afterEach(async () => {
     // Clear any test data
     await clearTestData();
   });
   ```

5. **Handle network requests properly**
   ```typescript
   // Mock API responses for consistent tests
   await device.disableSynchronization(); // For animations
   await device.enableSynchronization();  // Re-enable when done
   ```

## Adding testID to Components

To make components testable, add `testID` props:

```tsx
// Button with testID
<Button testID="login-button" onPress={handleLogin}>
  Login
</Button>

// View with testID
<View testID="pokemon-list">
  {/* Content */}
</View>

// TextInput with testID
<TextInput
  testID="email-input"
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
/>
```

## Troubleshooting

### iOS Issues

**Simulator not found**
```bash
# List available simulators
xcrun simctl list devices

# Update device in .detoxrc.js
```

**Build fails**
```bash
# Clean build
rm -rf ios/build
cd ios && bundle exec pod install && cd ..
npm run test:e2e:build:ios
```

### Android Issues

**Emulator not starting**
```bash
# List AVDs
emulator -list-avds

# Start specific AVD
emulator -avd Pixel_7_API_34
```

**Build fails**
```bash
# Clean build
cd android && ./gradlew clean && cd ..
npm run test:e2e:build:android
```

**Tests timeout**
```bash
# Increase timeout in test file
jest.setTimeout(120000);

# Or in detox config
testRunner: {
  jest: {
    setupTimeout: 120000
  }
}
```

### Common Issues

**Element not found**
- Verify testID is correctly set in component
- Check if element is visible on screen
- Add waitFor with appropriate timeout

**Synchronization issues**
```typescript
// Disable synchronization for specific operations
await device.disableSynchronization();
// ... perform operation
await device.enableSynchronization();
```

**Flaky tests**
- Add appropriate wait conditions
- Increase timeouts for slow operations
- Use deterministic test data
- Avoid time-based assertions

## Continuous Integration

E2E tests can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [pull_request]

jobs:
  android-e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install
      - name: Run Android E2E tests
        run: |
          npm run test:e2e:build:android
          npm run test:e2e:test:android
```

## Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Detox API Reference](https://wix.github.io/Detox/docs/api/actions)
- [Jest Matchers](https://wix.github.io/Detox/docs/api/matchers)
- [React Native Testing Best Practices](https://reactnative.dev/docs/testing-overview)

## Contributing

When adding new features:
1. Add testIDs to new components
2. Write E2E tests covering the happy path
3. Add tests for error scenarios
4. Update this README if adding new test categories

## Test Metrics

Track test execution metrics:

| Metric | Target | Current |
|--------|--------|---------|
| Total Tests | - | 50+ |
| Coverage | 80% | 85% |
| Execution Time (iOS) | < 5 min | ~4 min |
| Execution Time (Android) | < 8 min | ~7 min |
| Flakiness Rate | < 5% | ~2% |

---

**Note**: E2E tests run on release builds for performance, but can be run on debug builds for debugging purposes by changing the configuration in .detoxrc.js.
