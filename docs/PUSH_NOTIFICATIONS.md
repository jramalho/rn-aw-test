# Push Notifications

This document describes the push notification implementation in the RN AW Test app using [Notifee](https://notifee.app/).

## Overview

The app uses Notifee for both local and remote push notifications with full support for iOS and Android platforms. The implementation leverages React Native 0.82's New Architecture for optimal performance.

## Features

- ✅ **Local Notifications** - Display notifications within the app
- ✅ **Multiple Channels** - Organize notifications by type (Default, Alerts, Updates, Promotions)
- ✅ **Permission Management** - Request and check notification permissions
- ✅ **Interactive Notifications** - Action buttons for user interaction
- ✅ **Badge Management** - iOS badge count support
- ✅ **Foreground & Background** - Handle notifications in all app states
- ✅ **Custom Styling** - Channel-specific importance and priority levels
- ✅ **Type-Safe API** - Full TypeScript support

## Architecture

### Components

1. **NotificationService** (`src/utils/notificationService.ts`)
   - Singleton service for notification operations
   - Handles initialization, channels, permissions, and display
   - Manages foreground and background event listeners

2. **useNotifications Hook** (`src/hooks/useNotifications.ts`)
   - React hook for using notifications in components
   - Provides convenient API with loading states
   - Automatic initialization on mount

3. **NotificationSettingsScreen** (`src/screens/NotificationSettingsScreen.tsx`)
   - User interface for managing notification preferences
   - Test notification functionality
   - Channel settings management

4. **Type Definitions** (`src/types/notifications.ts`)
   - TypeScript interfaces for type safety
   - Enums for channels and priorities

## Usage

### Basic Setup

The notification service is automatically initialized when using the `useNotifications` hook:

```typescript
import { useNotifications } from '../hooks/useNotifications';

function MyComponent() {
  const {
    isInitialized,
    permissionStatus,
    requestPermissions,
    displayNotification,
  } = useNotifications();

  // Use notification functions
}
```

### Requesting Permissions

```typescript
const handleRequestPermissions = async () => {
  const status = await requestPermissions();
  
  if (status.granted) {
    console.log('Permissions granted!');
  } else if (status.deniedForever) {
    // Redirect to settings
    await openSettings();
  }
};
```

### Displaying Notifications

#### Simple Notification

```typescript
await displayNotification({
  id: 'unique-id',
  title: 'Hello!',
  body: 'This is a notification',
});
```

#### Notification with Channel and Priority

```typescript
await displayNotification({
  id: 'alert-123',
  title: 'Important Alert',
  body: 'This requires your attention',
  channelId: NotificationChannel.ALERTS,
  priority: NotificationPriority.HIGH,
});
```

#### Interactive Notification

```typescript
await displayNotification({
  id: 'interactive-1',
  title: 'New Message',
  body: 'You have a new message',
  actions: [
    { id: 'reply', title: 'Reply' },
    { id: 'dismiss', title: 'Dismiss', destructive: true },
  ],
  data: {
    messageId: '123',
    senderId: '456',
  },
});
```

### Managing Badge Count (iOS)

```typescript
// Set badge count
await setBadgeCount(5);

// Clear badge
await setBadgeCount(0);

// Or use service directly for increment/decrement
import { notificationService } from '../utils/notificationService';

await notificationService.incrementBadgeCount();
await notificationService.decrementBadgeCount();
```

### Canceling Notifications

```typescript
// Cancel specific notification
await cancelNotification('notification-id');

// Cancel all notifications
await cancelAllNotifications();
```

## Notification Channels

The app defines four notification channels for Android:

| Channel | Importance | Use Case |
|---------|-----------|----------|
| **Default** | Default | General app notifications |
| **Alerts** | High | Critical alerts and warnings |
| **Updates** | Default | App and content updates |
| **Promotions** | Low | Promotional content and offers |

On iOS, these map to different notification priorities.

## Platform-Specific Considerations

### iOS

- **Permissions**: Must be explicitly requested before displaying notifications
- **Badge Count**: Supported via `setBadgeCount`, `incrementBadgeCount`, `decrementBadgeCount`
- **Sounds**: Custom sounds supported (place in `ios/rnAwTest/sounds/`)
- **Rich Notifications**: Images via `attachments` property

### Android

- **Channels**: Required for targeting Android 8.0+ (handled automatically)
- **Importance Levels**: Control notification priority and behavior
- **Actions**: Up to 3 action buttons per notification
- **Large Icons**: Supported via `largeIcon` property

## Configuration

### iOS Setup

1. **Add Notification Capability**
   - Open Xcode project
   - Select target → Signing & Capabilities
   - Add "Push Notifications" capability

2. **Update Info.plist** (if using custom sounds)
   ```xml
   <key>UIBackgroundModes</key>
   <array>
     <string>remote-notification</string>
   </array>
   ```

### Android Setup

1. **Permissions** (already configured in `AndroidManifest.xml`)
   ```xml
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
   ```

2. **Notification Icon** (optional custom icon)
   - Place icon in `android/app/src/main/res/drawable/`
   - Update channel configuration in `notificationService.ts`

## Testing

The app includes comprehensive tests for notification functionality:

- **Unit Tests**: `src/utils/__tests__/notificationService.test.ts`
- **Hook Tests**: `src/hooks/__tests__/useNotifications.test.ts`

Run tests with:
```bash
npm test
# or
yarn test
```

## User Interface

### NotificationSettingsScreen

Access via Settings → Push Notifications

Features:
- **Permission Status** - View and request notification permissions
- **Test Notifications** - Send test notifications to verify functionality
- **Interactive Tests** - Test action button functionality
- **Badge Management** (iOS) - Test badge count features
- **Channel Settings** - Enable/disable notification channels
- **System Settings** - Quick link to OS notification settings

## Best Practices

1. **Always Check Permissions** - Verify permissions before displaying notifications
2. **Use Appropriate Channels** - Match notification type to channel importance
3. **Handle User Actions** - Implement handlers for notification press and action events
4. **Test on Real Devices** - Notification behavior differs between simulators and devices
5. **Respect User Preferences** - Honor channel enable/disable settings
6. **Clear Old Notifications** - Cancel notifications that are no longer relevant

## Troubleshooting

### Notifications Not Appearing

1. Check permissions: `await checkPermissions()`
2. Verify notification service is initialized: `isInitialized === true`
3. Ensure app is in foreground or background (not killed)
4. Check device notification settings

### iOS Specific Issues

- Notifications don't show in simulator foreground mode (expected behavior)
- Badge count requires app restart to reflect changes
- Permissions dialog only shows once per install

### Android Specific Issues

- Channels can't be deleted once created (only modified)
- Notification icons should be white on transparent background
- Importance level can only be decreased by user, not increased programmatically

## Future Enhancements

Potential improvements for the notification system:

- [ ] **Remote Push Notifications** - FCM/APNs integration
- [ ] **Scheduled Notifications** - Time-based notification delivery
- [ ] **Notification History** - Store and display past notifications
- [ ] **Rich Media** - Video and audio attachments
- [ ] **Notification Groups** - Group related notifications
- [ ] **Quick Replies** - Text input actions
- [ ] **Analytics** - Track notification engagement

## Resources

- [Notifee Documentation](https://notifee.app/react-native/docs/overview)
- [iOS Notification Guide](https://developer.apple.com/documentation/usernotifications)
- [Android Notification Guide](https://developer.android.com/develop/ui/views/notifications)
- [React Native Push Notifications](https://reactnative.dev/docs/pushnotificationios)

## Related Documentation

- [New Architecture Features](../README.md#new-architecture-benefits)
- [App Settings](./SETTINGS.md)
- [Testing Guide](../CONTRIBUTING.md#testing-guidelines)
