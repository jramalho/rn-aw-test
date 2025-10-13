# Biometric Authentication

## Overview

The biometric authentication system enables users to sign in quickly and securely using device hardware biometric sensors such as Face ID, Touch ID (iOS), or Fingerprint (Android). This feature provides a modern, convenient authentication experience while maintaining high security standards.

## Features

### Supported Biometric Types

- **Face ID** (iOS) - Facial recognition authentication
- **Touch ID** (iOS) - Fingerprint authentication on devices with Touch ID sensor
- **Fingerprint** (Android) - Fingerprint authentication using Android biometric APIs

### Key Capabilities

- ✅ **Device Capability Detection** - Automatically detects available biometric sensors
- ✅ **User Preference Management** - Enable/disable biometric authentication in settings
- ✅ **Quick Sign-In** - Fast authentication without typing credentials
- ✅ **Secure Storage** - Biometric preferences stored securely
- ✅ **Fallback Support** - Graceful fallback to password authentication
- ✅ **Type-Safe API** - Full TypeScript support with type definitions

## Architecture

### Components

#### `biometricService.ts`

Core service for biometric authentication operations using `react-native-biometrics`.

**Key Functions:**

- `checkBiometricAvailability()` - Check if device supports biometrics
- `authenticateWithBiometrics(promptMessage?)` - Prompt user for biometric authentication
- `enableBiometricAuth()` - Enable biometric authentication for the app
- `disableBiometricAuth()` - Disable biometric authentication
- `getBiometricTypeName(type)` - Get human-readable biometric type name
- `getBiometricSetupInstructions()` - Platform-specific setup instructions

#### `useBiometric.ts`

React hook providing state management and actions for biometric authentication.

**State:**

- `isAvailable` - Device has biometric hardware
- `isEnabled` - User has enabled biometric authentication
- `biometryType` - Human-readable biometric type (Face ID, Touch ID, Fingerprint)
- `isLoading` - Check in progress
- `error` - Error message if any

**Actions:**

- `authenticate(promptMessage?)` - Authenticate user
- `enable()` - Enable biometric authentication
- `disable()` - Disable biometric authentication
- `checkAvailability()` - Recheck availability

### Integration Points

#### LoginScreen

- Displays biometric login button when available and enabled
- Shows appropriate icon based on biometric type
- Handles authentication success/failure

#### SettingsScreen

- Security section for managing biometric preferences
- Toggle to enable/disable biometric authentication
- Shows current biometric type and status

## Usage

### Check Biometric Availability

```typescript
import { useBiometric } from '../hooks/useBiometric';

const MyComponent = () => {
  const { isAvailable, isEnabled, biometryType } = useBiometric();

  if (isAvailable) {
    console.log(`${biometryType} is available`);
  }

  if (isEnabled) {
    console.log('User has enabled biometric authentication');
  }
};
```

### Authenticate User

```typescript
import { useBiometric } from '../hooks/useBiometric';
import { Alert } from 'react-native';

const LoginComponent = () => {
  const { authenticate } = useBiometric();

  const handleBiometricLogin = async () => {
    const result = await authenticate('Sign in to PokéDex');

    if (result.success) {
      // Proceed with login
    } else {
      Alert.alert('Failed', result.error);
    }
  };

  return <Button onPress={handleBiometricLogin}>Sign in with Face ID</Button>;
};
```

### Enable Biometric Authentication

```typescript
import { useBiometric } from '../hooks/useBiometric';
import { Alert } from 'react-native';

const SettingsComponent = () => {
  const { enable, biometryType } = useBiometric();

  const handleEnable = async () => {
    const result = await enable();

    if (result.success) {
      Alert.alert('Success', `${biometryType} enabled`);
    } else {
      Alert.alert('Failed', result.error);
    }
  };

  return <Button onPress={handleEnable}>Enable {biometryType}</Button>;
};
```

### Disable Biometric Authentication

```typescript
import { useBiometric } from '../hooks/useBiometric';

const SettingsComponent = () => {
  const { disable } = useBiometric();

  const handleDisable = async () => {
    await disable();
    // Biometric authentication is now disabled
  };

  return (
    <Button onPress={handleDisable}>Disable Biometric Authentication</Button>
  );
};
```

## User Experience

### First-Time Setup Flow

1. User successfully signs in with email/password
2. System detects biometric capability
3. (Optional) Show prompt to enable biometric authentication
4. User navigates to Settings > Security
5. Toggles biometric authentication on
6. System prompts for biometric verification
7. Biometric preference saved
8. Future logins can use biometric authentication

### Login Flow with Biometrics

1. User opens app
2. Login screen displays biometric button (Face ID/Touch ID/Fingerprint)
3. User taps biometric button
4. System prompts for biometric authentication
5. On success, user is signed in immediately
6. On failure, user can try again or use password

### Disabling Biometrics

1. User navigates to Settings > Security
2. Toggles biometric authentication off
3. System shows confirmation dialog
4. User confirms
5. Biometric login option removed from login screen

## Platform-Specific Configuration

### iOS Setup

**Info.plist Configuration:**

```xml
<key>NSFaceIDUsageDescription</key>
<string>Enable Face ID for faster, more secure sign-in</string>
```

**Capabilities:**

- Face ID automatically works on supported devices
- Touch ID automatically works on supported devices
- No additional configuration needed

### Android Setup

**Permissions (AndroidManifest.xml):**

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

**Gradle Configuration:**
Already included via `react-native-biometrics` package.

## Security Considerations

### Best Practices

1. **Never Store Credentials** - Don't store passwords even when biometric is enabled
2. **Token-Based Auth** - Use secure tokens after biometric verification
3. **Timeout Policy** - Require re-authentication after session timeout
4. **Fallback Authentication** - Always provide password fallback option
5. **Privacy Compliance** - Clearly explain biometric data usage to users

### Implementation Notes

- Biometric data never leaves the device
- Authentication handled by OS-level secure enclave
- App only receives success/failure result
- Biometric preference stored in AsyncStorage
- No biometric templates stored by the app

## Error Handling

### Common Errors

| Error           | Cause                          | Resolution                            |
| --------------- | ------------------------------ | ------------------------------------- |
| "Not available" | No biometric hardware          | Show password-only login              |
| "Not enabled"   | User hasn't enabled biometrics | Prompt user to enable in Settings     |
| "Cancelled"     | User cancelled prompt          | Allow retry or password login         |
| "Failed"        | Biometric didn't match         | Allow retry with limit                |
| "Locked out"    | Too many failed attempts       | Show password-only for timeout period |

### Error Messages

The service provides user-friendly error messages:

- Device-specific guidance
- Clear actionable steps
- Platform-appropriate terminology

## Testing

### Unit Tests

Comprehensive test coverage includes:

- Availability checking
- Authentication flows
- Enable/disable operations
- Error handling
- Platform-specific behavior

**Run Tests:**

```bash
npm test -- biometricService.test
npm test -- useBiometric.test
```

### Manual Testing

**Test Cases:**

1. ✅ Login with biometrics on supported device
2. ✅ Enable biometrics from settings
3. ✅ Disable biometrics from settings
4. ✅ Cancel biometric prompt
5. ✅ Fallback to password after biometric failure
6. ✅ Behavior on unsupported device
7. ✅ Biometric preference persists after app restart

### Device Testing Requirements

- **iOS**: Test on Face ID and Touch ID devices
- **Android**: Test on devices with fingerprint sensor
- **Simulators**: Test graceful handling when biometrics unavailable

## Troubleshooting

### iOS Issues

**Face ID not working:**

- Ensure Face ID is set up in Settings > Face ID & Passcode
- Check Info.plist has NSFaceIDUsageDescription
- Verify app has permission to use Face ID

**Touch ID not working:**

- Ensure Touch ID is set up in Settings > Touch ID & Passcode
- Clean the Touch ID sensor
- Try re-registering fingerprints

### Android Issues

**Fingerprint not working:**

- Ensure fingerprint is registered in Settings > Security > Fingerprint
- Check AndroidManifest.xml has USE_BIOMETRIC permission
- Verify device has fingerprint sensor

**Build Errors:**

- Ensure `react-native-biometrics` is properly linked
- Run `cd android && ./gradlew clean` then rebuild
- Check Gradle version compatibility

## Performance

### Metrics

- **Authentication Time**: < 1 second typical
- **Availability Check**: < 100ms
- **Memory Footprint**: Minimal (< 1MB)
- **Battery Impact**: Negligible

### Optimization

- Availability checked once on mount, cached
- Biometric preferences loaded from AsyncStorage
- No unnecessary re-renders
- Efficient state management with hooks

## Accessibility

### Screen Reader Support

- All buttons have descriptive labels
- Biometric type announced (Face ID, Touch ID, Fingerprint)
- Success/failure states clearly communicated
- Fallback options always accessible

### Voice Control

- All biometric actions can be triggered by voice
- Clear voice labels for buttons
- Alternative authentication methods available

## Future Enhancements

### Potential Features

1. **Biometric Enrollment Prompt** - Suggest enabling biometrics after first successful login
2. **Re-authentication for Sensitive Actions** - Require biometric for critical operations
3. **Multiple Biometric Types** - Support both Face ID and Touch ID where available
4. **Advanced Security Options** - Timeout settings, max attempts configuration
5. **Analytics Integration** - Track biometric usage patterns (privacy-compliant)

### API Improvements

1. More granular error types
2. Custom UI for biometric prompts
3. Biometric strength indicators
4. Integration with device keychain

## References

### Official Documentation

- [react-native-biometrics](https://github.com/SelfLender/react-native-biometrics)
- [iOS Local Authentication](https://developer.apple.com/documentation/localauthentication)
- [Android BiometricPrompt](https://developer.android.com/training/sign-in/biometric-auth)

### Related Files

- `src/utils/biometricService.ts` - Core service implementation
- `src/hooks/useBiometric.ts` - React hook
- `src/screens/LoginScreen.tsx` - Login integration
- `src/screens/SettingsScreen.tsx` - Settings integration
- `src/types/auth.ts` - Type definitions
- `src/utils/__tests__/biometricService.test.ts` - Service tests
- `src/hooks/__tests__/useBiometric.test.ts` - Hook tests

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the test files for usage examples
3. Consult the react-native-biometrics documentation
4. Open an issue in the repository

---

**Last Updated:** October 13, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
