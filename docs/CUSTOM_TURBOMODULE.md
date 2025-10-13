# Custom TurboModule Development

## Overview

This project includes a custom **DeviceInfo TurboModule** that showcases React Native's New Architecture capabilities. TurboModules provide direct JavaScript-to-Native communication through JSI (JavaScript Interface), offering better performance than legacy native modules.

## What is a TurboModule?

TurboModules are the New Architecture's replacement for legacy Native Modules. They provide:

- **Direct JSI Communication**: No bridge overhead
- **Type Safety**: TypeScript specs are enforced at runtime
- **Lazy Loading**: Modules are loaded only when needed
- **Synchronous Methods**: Support for both sync and async operations
- **Better Performance**: 30-50% faster than legacy modules

## DeviceInfo TurboModule

The DeviceInfo TurboModule provides comprehensive device information through native APIs on both iOS and Android.

### Features

#### Device Information

- **Model**: Device model (e.g., "iPhone 15 Pro", "Pixel 7")
- **System**: OS name and version
- **Manufacturer & Brand**: Device manufacturer and brand
- **Device ID**: Unique device identifier
- **App Version**: Current app version and build number
- **Device Type**: Tablet vs phone detection
- **Emulator Detection**: Identifies simulator/emulator environments

#### Battery Information

- **Battery Level**: Current charge level (0.0 to 1.0)
- **Charging State**: Unknown, unplugged, charging, or full
- **Is Charging**: Boolean flag for charging status

#### Storage Information

- **Total Space**: Total device storage in bytes
- **Free Space**: Available storage in bytes
- **Used Space**: Calculated used storage

#### System Capabilities

- **Biometric Authentication**: Face ID, Touch ID, Fingerprint support detection
- **Device Locale**: Language and region code (e.g., "en-US", "pt-BR")
- **Device Timezone**: Timezone identifier (e.g., "America/New_York")
- **Haptic Feedback**: Haptic/vibration support detection

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     JavaScript Layer                         │
│  src/modules/DeviceInfo.ts - Wrapper with utilities         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ JSI (Direct Communication)
┌──────────────────────┴──────────────────────────────────────┐
│                  TypeScript Spec Layer                       │
│  src/specs/NativeDeviceInfo.ts - Type definitions           │
└───────────────────┬─────────────────────┬───────────────────┘
                    │                     │
         ┌──────────↓──────────┐ ┌───────↓──────────┐
         │   Android (Kotlin)   │ │   iOS (Swift)    │
         │  DeviceInfoModule.kt │ │ DeviceInfoModule │
         │  • System APIs       │ │  • Foundation    │
         │  • BatteryManager    │ │  • UIKit         │
         │  • StatFs            │ │  • LAContext     │
         │  • BiometricManager  │ │                  │
         └──────────────────────┘ └──────────────────┘
```

### File Structure

```
├── src/
│   ├── specs/
│   │   └── NativeDeviceInfo.ts          # TypeScript spec
│   ├── modules/
│   │   └── DeviceInfo.ts                # JavaScript wrapper
│   └── screens/
│       └── DeviceInfoScreen.tsx         # Demo screen
├── android/app/src/main/java/com/rnawtest/
│   ├── DeviceInfoModule.kt              # Android implementation
│   ├── NativeDeviceInfoSpec.kt          # Android spec
│   └── DeviceInfoPackage.kt             # Package registration
└── ios/rnAwTest/
    ├── DeviceInfoModule.swift           # iOS implementation
    └── DeviceInfoModule.m               # Objective-C bridge
```

## Usage

### Import the Module

```typescript
import DeviceInfo from './modules/DeviceInfo';
```

### Get Device Information

```typescript
// Async method
const deviceInfo = await DeviceInfo.getDeviceInfo();
console.log(deviceInfo.model); // "iPhone 15 Pro"
console.log(deviceInfo.systemVersion); // "17.0"
console.log(deviceInfo.isTablet); // false
console.log(deviceInfo.isEmulator); // true (if in simulator)

// Synchronous method (demonstrates sync TurboModule capabilities)
const model = DeviceInfo.getDeviceModelSync();
console.log(model); // "iPhone 15 Pro"
```

### Get Battery Information

```typescript
const battery = await DeviceInfo.getBatteryInfo();
console.log(battery.level); // 0.85 (85%)
console.log(battery.state); // "charging"
console.log(battery.isCharging); // true

// Format battery level
const formatted = DeviceInfo.formatBatteryLevel(battery.level);
console.log(formatted); // "85%"

// Get battery status (icon and color)
const status = DeviceInfo.getBatteryStatus(battery);
console.log(status.icon); // "battery-charging"
console.log(status.color); // "#4caf50"
```

### Get Storage Information

```typescript
const storage = await DeviceInfo.getStorageInfo();
console.log(storage.totalSpace); // 128000000000 (bytes)
console.log(storage.freeSpace); // 50000000000
console.log(storage.usedSpace); // 78000000000

// Format storage size
const totalGB = DeviceInfo.formatStorageSize(storage.totalSpace);
console.log(totalGB); // "119.21 GB"

// Check if low on storage
const isLow = DeviceInfo.isLowStorage(storage, 1); // 1GB threshold
console.log(isLow); // false

// Get usage percentage
const usagePercent = DeviceInfo.getStorageUsagePercentage(storage);
console.log(usagePercent); // 60.9
```

### Check System Capabilities

```typescript
// Biometric authentication
const hasBiometric = await DeviceInfo.hasBiometricAuthentication();
if (hasBiometric) {
  // Show Face ID / Touch ID / Fingerprint login option
}

// Device locale
const locale = await DeviceInfo.getDeviceLocale();
console.log(locale); // "en-US" or "pt-BR"

// Device timezone
const timezone = await DeviceInfo.getDeviceTimezone();
console.log(timezone); // "America/Sao_Paulo"

// Haptic feedback support
const hasHaptics = await DeviceInfo.supportsHaptics();
if (hasHaptics) {
  // Enable haptic feedback features
}
```

## Demo Screen

The project includes a comprehensive demo screen at `src/screens/DeviceInfoScreen.tsx` that showcases all TurboModule capabilities with:

- Device details card
- Real-time battery status with visual indicators
- Storage information with progress bars
- System settings (locale, timezone)
- Capability detection (biometric, haptics)
- Pull-to-refresh functionality

**Access the demo**: Navigate to "Performance" → "Device Information" in the app.

## Performance Benefits

### Direct JSI Communication

Unlike legacy Native Modules that use the async bridge:

```
Legacy: JS → Bridge (serialize) → Native → Bridge (deserialize) → JS
TurboModule: JS → JSI (direct) → Native → JSI (direct) → JS
```

**Result**: ~50-70% faster for synchronous operations, ~30% faster for async operations.

### Lazy Loading

TurboModules are loaded only when first accessed, reducing app startup time.

### Type Safety

The TypeScript spec is enforced at runtime, catching type errors early:

```typescript
// Type error caught at compile time
const info: DeviceInfo = await DeviceInfo.getDeviceInfo();
console.log(info.invalidField); // TypeScript error
```

## Implementation Guide

### 1. Define TypeScript Spec

Create `src/specs/NativeModuleName.ts`:

```typescript
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  myMethod(): Promise<string>;
  mySyncMethod(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ModuleName');
```

### 2. Implement Android (Kotlin)

```kotlin
// Abstract spec class
abstract class NativeModuleNameSpec(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    abstract fun myMethod(promise: Promise)
    abstract fun mySyncMethod(): String
}

// Implementation
class ModuleNameModule(reactContext: ReactApplicationContext) :
    NativeModuleNameSpec(reactContext) {

    override fun getName() = NAME

    override fun myMethod(promise: Promise) {
        promise.resolve("Result")
    }

    override fun mySyncMethod(): String {
        return "Sync result"
    }

    companion object {
        const val NAME = "ModuleName"
    }
}

// Package
class ModuleNamePackage : TurboReactPackage() {
    // Implementation...
}
```

### 3. Implement iOS (Swift)

```swift
@objc(ModuleNameModule)
class ModuleNameModule: NSObject, RCTBridgeModule {
    static func moduleName() -> String! {
        return "ModuleName"
    }

    @objc
    func myMethod(_ resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {
        resolve("Result")
    }

    @objc
    func mySyncMethod() -> String {
        return "Sync result"
    }
}
```

```objective-c
// Bridge file (.m)
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ModuleNameModule, NSObject)

RCT_EXTERN_METHOD(myMethod:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(mySyncMethod)

@end
```

### 4. Register Module

**Android**: Add to `MainApplication.kt`:

```kotlin
PackageList(this).packages.apply {
    add(ModuleNamePackage())
}
```

**iOS**: No registration needed - auto-discovered through Objective-C bridge.

## Testing

Run the app and navigate to the DeviceInfo screen to see the TurboModule in action:

```bash
# iOS
npm run ios

# Android
npm run android
```

All device information should load and display correctly.

## Debugging

### Enable TurboModule Logging

**iOS**: In Xcode, add breakpoints in `DeviceInfoModule.swift`

**Android**: Add logging in `DeviceInfoModule.kt`:

```kotlin
Log.d("DeviceInfo", "Getting device info...")
```

### Common Issues

1. **Module not found**: Ensure package is registered in MainApplication
2. **Type errors**: Verify TypeScript spec matches native implementation
3. **Build errors**: Clean and rebuild native projects

```bash
# Clean Android
cd android && ./gradlew clean && cd ..

# Clean iOS
cd ios && rm -rf build && pod install && cd ..
```

## Best Practices

1. **Type Safety**: Always define complete TypeScript specs
2. **Error Handling**: Catch and reject promises on errors
3. **Threading**: Run expensive operations on background threads
4. **Lazy Loading**: Design modules to load only when needed
5. **Documentation**: Document all methods and return types
6. **Testing**: Test on both iOS and Android
7. **Performance**: Profile TurboModule calls vs alternatives

## Comparison: Legacy vs TurboModule

| Feature       | Legacy Native Module | TurboModule       |
| ------------- | -------------------- | ----------------- |
| Communication | Async bridge         | Direct JSI        |
| Type Safety   | Runtime only         | Compile + Runtime |
| Loading       | Eager                | Lazy              |
| Sync Methods  | Not supported        | Supported         |
| Performance   | Baseline             | 30-70% faster     |
| Bundle Size   | All modules loaded   | Only used modules |

## Resources

- [Official TurboModule Guide](https://reactnative.dev/docs/turbo-modules)
- [JSI Documentation](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [CodeGen Reference](https://reactnative.dev/docs/new-architecture-library-intro)
- [Android BiometricManager](https://developer.android.com/reference/androidx/biometric/BiometricManager)
- [iOS LocalAuthentication](https://developer.apple.com/documentation/localauthentication)

## Future Enhancements

Potential additions to the DeviceInfo TurboModule:

- Network information (WiFi, cellular, VPN)
- Screen metrics (resolution, DPI, safe areas)
- Camera capabilities
- Sensor information (accelerometer, gyroscope)
- Audio capabilities
- Carrier information
- Power management settings
- Display brightness

---

**Built with ❤️ for React Native 0.82 New Architecture**
