# Deep Linking

This document describes the deep linking implementation in the RN AW Test app.

## Overview

The app supports comprehensive deep linking through both custom URL schemes and universal/app links, enabling seamless navigation from external sources directly into specific app screens.

## Features

- ✅ **Custom URL Scheme** - `rnawtest://` for direct app linking
- ✅ **Universal Links (iOS)** - `https://rnawtest.app/` for web-to-app transitions
- ✅ **App Links (Android)** - `https://rnawtest.app/` with automatic verification
- ✅ **Type-Safe Navigation** - Full TypeScript support for all routes
- ✅ **Parameter Parsing** - Automatic extraction of route parameters
- ✅ **Error Handling** - Robust handling of invalid or malformed links
- ✅ **Testing Support** - Comprehensive test suite for all link patterns

## Supported Deep Link Patterns

### Pokemon Features
```
# List all Pokemon
rnawtest://pokemon
https://rnawtest.app/pokemon

# View specific Pokemon (by ID or name)
rnawtest://pokemon/25
rnawtest://pokemon/pikachu
https://rnawtest.app/pokemon/25
https://rnawtest.app/pokemon/pikachu
```

### Team Building
```
# Team builder screen
rnawtest://team
https://rnawtest.app/team
```

### User Profile & Authentication
```
# User profile
rnawtest://profile
https://rnawtest.app/profile

# Login screen
rnawtest://login
https://rnawtest.app/login

# Sign up screen
rnawtest://signup
https://rnawtest.app/signup
```

### Settings & Preferences
```
# Main settings
rnawtest://settings
https://rnawtest.app/settings

# Notification settings
rnawtest://notifications
https://rnawtest.app/notifications
```

### Performance Monitoring
```
# Performance dashboard
rnawtest://performance
https://rnawtest.app/performance
```

## Implementation

### Configuration

The deep linking configuration is centralized in `src/config/linkingConfig.ts`:

```typescript
import { linkingConfig } from './src/config/linkingConfig';

// In App.tsx
<NavigationContainer linking={linkingConfig}>
  {/* ... */}
</NavigationContainer>
```

### Using Deep Links in Code

#### With the useDeepLink Hook

```typescript
import { useDeepLink } from '../hooks/useDeepLink';

function MyComponent() {
  const { openUrl, isHandling } = useDeepLink();

  const handleOpenPokemon = async () => {
    await openUrl('rnawtest://pokemon/25');
  };

  return (
    <Button 
      onPress={handleOpenPokemon}
      disabled={isHandling}
    >
      Open Pikachu
    </Button>
  );
}
```

#### Using Link Patterns

```typescript
import { DeepLinkPatterns, WebLinkPatterns } from '../config/linkingConfig';

// Custom URL scheme
const pokemonUrl = DeepLinkPatterns.POKEMON_DETAIL(25);
// Result: "rnawtest://pokemon/25"

// Web link (Universal/App Link)
const webUrl = WebLinkPatterns.POKEMON_DETAIL('pikachu');
// Result: "https://rnawtest.app/pokemon/pikachu"
```

#### Manual Parsing

```typescript
import { parseDeepLink, isValidDeepLink } from '../config/linkingConfig';

const url = 'rnawtest://pokemon/25';

if (isValidDeepLink(url)) {
  const linkData = parseDeepLink(url);
  // Result: { screen: 'PokemonDetail', params: { id: '25' } }
  
  navigation.navigate(linkData.screen, linkData.params);
}
```

## Platform Configuration

### Android Setup

The Android configuration is in `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Custom URL Scheme -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="rnawtest" />
</intent-filter>

<!-- App Links (https) -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="https"
        android:host="rnawtest.app" />
</intent-filter>
```

**App Links Verification:**
To enable automatic App Links verification, you need to host an `assetlinks.json` file at:
```
https://rnawtest.app/.well-known/assetlinks.json
```

Example content:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.rnawtest",
    "sha256_cert_fingerprints": ["YOUR_APP_SHA256_FINGERPRINT"]
  }
}]
```

### iOS Setup

The iOS configuration is in `ios/rnAwTest/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.rnawtest</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>rnawtest</string>
        </array>
    </dict>
</array>
```

**Universal Links Configuration:**
To enable Universal Links, you need to:

1. **Enable Associated Domains** in Xcode:
   - Select your target → Signing & Capabilities
   - Add "Associated Domains" capability
   - Add domain: `applinks:rnawtest.app`

2. **Host `apple-app-site-association` file** at:
   ```
   https://rnawtest.app/.well-known/apple-app-site-association
   ```

   Example content:
   ```json
   {
     "applinks": {
       "apps": [],
       "details": [{
         "appID": "TEAM_ID.com.rnawtest",
         "paths": ["*"]
       }]
     }
   }
   ```

## Testing Deep Links

### Unit Tests

Run the deep linking tests:
```bash
npm test -- --testPathPattern=linkingConfig
```

### Manual Testing

#### iOS Simulator
```bash
# Test custom URL scheme
xcrun simctl openurl booted "rnawtest://pokemon/25"

# Test Universal Link
xcrun simctl openurl booted "https://rnawtest.app/pokemon/25"
```

#### Android Emulator
```bash
# Test custom URL scheme
adb shell am start -W -a android.intent.action.VIEW -d "rnawtest://pokemon/25"

# Test App Link
adb shell am start -W -a android.intent.action.VIEW -d "https://rnawtest.app/pokemon/25"
```

#### Real Devices

1. **Send link via messaging app** (iMessage, WhatsApp, etc.)
2. **Create test webpage** with clickable links
3. **Send via email** and tap links
4. **Use QR code generator** for quick testing

### Debug Logging

The deep linking system logs all link handling:

```typescript
// Enable debug logging in development
if (__DEV__) {
  console.log('Deep link received:', url);
  console.log('Parsed link data:', linkData);
}
```

## Best Practices

### 1. Always Validate Links

```typescript
if (!isValidDeepLink(url)) {
  console.warn('Invalid deep link received:', url);
  return;
}
```

### 2. Handle Authentication State

```typescript
const { isAuthenticated } = useAuth();

// Redirect to login if needed
if (!isAuthenticated && requiresAuth(screen)) {
  navigation.navigate('Login', { returnUrl: url });
}
```

### 3. Handle Missing Resources

```typescript
// If Pokemon doesn't exist, show error
const pokemon = await fetchPokemon(id);
if (!pokemon) {
  navigation.navigate('PokemonList');
  showError('Pokemon not found');
}
```

### 4. Track Deep Link Usage

```typescript
// Analytics tracking
analytics.track('deep_link_opened', {
  url,
  screen: linkData.screen,
  params: linkData.params,
});
```

## Troubleshooting

### Links Not Working on iOS

1. **Check Associated Domains**: Ensure capability is added in Xcode
2. **Verify apple-app-site-association**: File must be served over HTTPS
3. **Clear Safari cache**: Settings → Safari → Clear History and Website Data
4. **Reinstall app**: Sometimes iOS caches domain associations

### Links Not Working on Android

1. **Check autoVerify**: Ensure `android:autoVerify="true"` is set
2. **Verify assetlinks.json**: File must be accessible and valid
3. **Check SHA256 fingerprint**: Must match your app's signing certificate
4. **Clear defaults**: Settings → Apps → Default apps → Opening links

### General Issues

1. **URL not recognized**: Check URL format and scheme spelling
2. **Wrong screen opens**: Verify routing configuration in `linkingConfig.ts`
3. **Parameters missing**: Check parameter parsing logic
4. **App doesn't open**: Ensure intent filters/URL schemes are properly configured

## Future Enhancements

Potential improvements for deep linking:

- [ ] **Deferred Deep Linking** - Store link and redirect after app install
- [ ] **Dynamic Links** - Generate short links with Firebase Dynamic Links
- [ ] **QR Code Generator** - Built-in tool to create QR codes for screens
- [ ] **Deep Link Analytics** - Track link performance and conversion
- [ ] **Branch.io Integration** - Advanced attribution and deep linking
- [ ] **Smart Banners** - Promote app on mobile web with deep links
- [ ] **Clipboard Detection** - Auto-detect and prompt for clipboard links

## Resources

### Official Documentation
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)

### Testing Tools
- [Universal Links Validator](https://branch.io/resources/universal-links/)
- [Android App Links Assistant](https://developer.android.com/studio/write/app-link-indexing)
- [Deep Link Tester](https://www.deeplinktest.com/)

### Related Documentation
- [Navigation Setup](../README.md#navigation)
- [Testing Guide](../CONTRIBUTING.md#testing-guidelines)
- [App Configuration](../INSTALLATION.md)

---

**Last Updated**: October 12, 2025  
**React Native Version**: 0.82.0  
**Feature Status**: Production Ready ✅
