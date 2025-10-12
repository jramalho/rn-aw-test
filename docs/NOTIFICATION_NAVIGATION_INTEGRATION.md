# Notification and Deep Link Integration

This document describes the complete integration of push notifications with deep link navigation in the RN AW Test app.

## Overview

The app now features **complete integration** between notifications and navigation, allowing notifications to directly navigate users to specific screens when tapped. This creates a seamless user experience where notifications can deep link into any part of the app.

## What's New

### 1. App-Level Integration

The notification service and deep linking are now initialized at the app level in `App.tsx`:

```typescript
import { useNotifications } from './src/hooks/useNotifications';
import { useDeepLink } from './src/hooks/useDeepLink';

const App: React.FC = () => {
  // Initialize notifications
  const { isInitialized: notificationsReady } = useNotifications();
  
  // Initialize deep linking
  const { url: deepLinkUrl } = useDeepLink();
  
  // ... rest of app setup
};
```

### 2. Enhanced Notification Service

The `notificationService` now supports:

- **Automatic Navigation**: Notifications can include `screen` and `params` in their data payload
- **Deep Link Support**: Notifications can include a `deepLink` URL that opens when tapped
- **Action Handlers**: Register custom handlers for notification action buttons
- **Smart Link Building**: Automatically builds deep links from screen names

### 3. New Hook: useNotificationNavigation

A convenient hook for sending notifications that navigate:

```typescript
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';

const { sendNavigationNotification, sendDeepLinkNotification } = useNotificationNavigation();

// Send a notification that navigates to a screen
await sendNavigationNotification({
  title: 'New Pokemon!',
  body: 'Check out Pikachu',
  screen: 'PokemonDetail',
  params: { id: '25' },
  priority: NotificationPriority.HIGH,
});

// Send a notification with a deep link
await sendDeepLinkNotification(
  'Open App',
  'Tap to view details',
  'rnawtest://pokemon/150'
);
```

### 4. Notification Demo Screen

A new demo screen (`NotificationDemoScreen`) showcases all notification navigation features:

- Navigate to Pokemon details
- Navigate to Team Builder
- Navigate to Settings
- Interactive notifications with action buttons
- Deep link navigation examples

Access it via: **Settings → Notifications → Open Navigation Demo**

## Architecture

### Flow Diagram

```
User Receives Notification
         ↓
User Taps Notification
         ↓
NotificationService.handleNotificationPress()
         ↓
Checks notification.data for:
  - screen & params → Build deep link → Open URL
  - deepLink → Open URL directly
         ↓
React Navigation Linking Config
         ↓
Navigate to Target Screen
```

### Key Components

1. **NotificationService** (`src/utils/notificationService.ts`)
   - Enhanced with navigation handling
   - Builds deep links from screen names
   - Manages action button handlers
   - Opens URLs via React Native Linking

2. **useNotificationNavigation** (`src/hooks/useNotificationNavigation.ts`)
   - Simplified API for navigation notifications
   - Type-safe screen and parameter handling
   - Support for both screen navigation and deep links

3. **NotificationDemoScreen** (`src/screens/NotificationDemoScreen.tsx`)
   - Interactive demo of all features
   - Example implementations
   - Permission management UI

4. **App.tsx**
   - Initializes notification service
   - Initializes deep link handling
   - Provides app-wide notification support

## Usage Examples

### Basic Screen Navigation

```typescript
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';

const MyComponent = () => {
  const { sendNavigationNotification } = useNotificationNavigation();
  
  const notifyUser = async () => {
    await sendNavigationNotification({
      title: 'New Feature!',
      body: 'Check out the team builder',
      screen: 'TeamBuilder',
    });
  };
};
```

### Navigation with Parameters

```typescript
await sendNavigationNotification({
  title: 'Rare Pokemon Spotted!',
  body: 'A wild Charizard appeared',
  screen: 'PokemonDetail',
  params: { id: '6' },
  channelId: NotificationChannel.ALERTS,
  priority: NotificationPriority.HIGH,
});
```

### Interactive Notifications

```typescript
await sendNavigationNotification({
  title: 'Battle Request',
  body: 'John wants to battle!',
  screen: 'TeamBuilder',
  actions: [
    { id: 'accept', title: 'Accept' },
    { id: 'decline', title: 'Decline', destructive: true },
  ],
});
```

### Deep Link Notifications

```typescript
const { sendDeepLinkNotification } = useNotificationNavigation();

await sendDeepLinkNotification(
  'Open Pokemon',
  'Tap to view Mewtwo',
  'rnawtest://pokemon/150',
  {
    priority: NotificationPriority.HIGH,
  }
);
```

### Custom Action Handlers

```typescript
import { notificationService } from '../utils/notificationService';

// Register a handler
notificationService.registerActionHandler('accept_battle', (actionId, notification) => {
  console.log('User accepted battle!');
  // Handle the action...
});

// Unregister when done
notificationService.unregisterActionHandler('accept_battle');
```

## Testing

### Unit Tests

Tests are provided for the new functionality:

- `src/hooks/__tests__/useNotificationNavigation.test.ts`
- `src/utils/__tests__/notificationService.test.ts`

Run tests:
```bash
npm test
```

### Manual Testing

1. **Grant Permissions**
   - Open app → Settings → Notifications
   - Tap "Request Permissions"
   - Grant notification permissions

2. **Test Navigation Demo**
   - Settings → Notifications → Open Navigation Demo
   - Try each demo button
   - Tap the notifications to see navigation

3. **Test Deep Links**
   - Send a deep link notification
   - Tap the notification
   - Verify it navigates to the correct screen

### Automated Testing

Run the notification tests:
```bash
npm test -- --testPathPattern=notification
```

## Deep Link Reference

All supported deep link patterns work with notifications:

### Custom URL Scheme (`rnawtest://`)
```
rnawtest://pokemon          → Pokemon List
rnawtest://pokemon/25       → Pokemon Detail (Pikachu)
rnawtest://team             → Team Builder
rnawtest://profile          → Profile
rnawtest://settings         → Settings
rnawtest://notifications    → Notification Settings
rnawtest://notifications/demo → Notification Demo
rnawtest://performance      → Performance Dashboard
```

### Universal Links (`https://rnawtest.app/`)
```
https://rnawtest.app/pokemon
https://rnawtest.app/pokemon/25
https://rnawtest.app/team
https://rnawtest.app/profile
https://rnawtest.app/settings
https://rnawtest.app/notifications
https://rnawtest.app/notifications/demo
https://rnawtest.app/performance
```

## Platform-Specific Notes

### iOS

- Badge count management is supported
- Universal Links require proper entitlements
- Notification permissions are requested per-app
- Background notification handling works automatically

### Android

- Notification channels are created automatically
- App Links require domain verification
- Notification permissions (Android 13+) are requested
- Background handling is managed by Notifee

## Security Considerations

1. **Permission Management**: Always check permissions before sending notifications
2. **Data Validation**: Validate notification data before navigation
3. **Deep Link Validation**: Use `isValidDeepLink()` to validate URLs
4. **User Privacy**: Respect user notification preferences
5. **Action Handlers**: Clean up handlers when components unmount

## Troubleshooting

### Notifications Not Appearing

1. Check permissions: `permissionStatus.granted`
2. Verify service is initialized: `isInitialized`
3. Check notification channel (Android)
4. Verify app is not in Do Not Disturb mode

### Navigation Not Working

1. Verify deep link format is correct
2. Check navigation stack is properly set up
3. Ensure screen name matches RootStackParamList
3. Test deep link with `adb shell am start -a android.intent.action.VIEW -d "rnawtest://..."` (Android)
4. Test deep link with `xcrun simctl openurl booted "rnawtest://..."` (iOS)

### Actions Not Triggering

1. Verify action IDs are unique
2. Check handler is registered before notification
3. Ensure handler is not unregistered prematurely

## Future Enhancements

Potential improvements for future iterations:

1. **Remote Push Notifications**: Firebase Cloud Messaging integration
2. **Scheduled Notifications**: Time-based notification delivery
3. **Rich Media**: Images, videos, and custom UI in notifications
4. **Notification History**: Track and display notification history
5. **A/B Testing**: Test different notification strategies
6. **Analytics**: Track notification open rates and conversions

## References

- [Notifee Documentation](https://notifee.app)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking)
- [React Native Linking](https://reactnative.dev/docs/linking)
- [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md)
- [DEEP_LINKING.md](./DEEP_LINKING.md)

## Related Files

- `App.tsx` - App-level integration
- `src/utils/notificationService.ts` - Enhanced notification service
- `src/hooks/useNotificationNavigation.ts` - Navigation hook
- `src/screens/NotificationDemoScreen.tsx` - Demo screen
- `src/config/linkingConfig.ts` - Deep linking configuration
- `docs/PUSH_NOTIFICATIONS.md` - Notification documentation
- `docs/DEEP_LINKING.md` - Deep linking documentation
