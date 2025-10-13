/**
 * NativeDeviceInfo TurboModule Specification
 * 
 * This is a TypeScript specification file that defines the interface
 * for our native TurboModule. The New Architecture uses this spec
 * to generate the necessary boilerplate code.
 */

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Device information returned by the native module
 */
export interface DeviceInfo {
  /** Unique device identifier */
  deviceId: string;
  /** Device model (e.g., "iPhone 15 Pro", "Pixel 7") */
  model: string;
  /** Operating system name (e.g., "iOS", "Android") */
  systemName: string;
  /** Operating system version (e.g., "17.0", "14") */
  systemVersion: string;
  /** App version from Info.plist/build.gradle */
  appVersion: string;
  /** App build number */
  buildNumber: string;
  /** Device manufacturer (e.g., "Apple", "Google") */
  manufacturer: string;
  /** Device brand (e.g., "iPhone", "Pixel") */
  brand: string;
  /** Whether the device is a tablet */
  isTablet: boolean;
  /** Whether the app is running in an emulator/simulator */
  isEmulator: boolean;
}

/**
 * Battery information
 */
export interface BatteryInfo {
  /** Battery level (0.0 to 1.0) */
  level: number;
  /** Battery state: "unknown", "unplugged", "charging", "full" */
  state: string;
  /** Is battery currently charging */
  isCharging: boolean;
}

/**
 * Storage information in bytes
 */
export interface StorageInfo {
  /** Total storage space */
  totalSpace: number;
  /** Available free storage space */
  freeSpace: number;
  /** Used storage space */
  usedSpace: number;
}

/**
 * NativeDeviceInfo TurboModule Interface
 * 
 * This interface defines all methods that will be available
 * from JavaScript. These methods are implemented natively
 * in Kotlin (Android) and Swift (iOS).
 */
export interface Spec extends TurboModule {
  /**
   * Get comprehensive device information
   * 
   * @returns Promise with device information
   */
  getDeviceInfo(): Promise<DeviceInfo>;

  /**
   * Get current battery information
   * 
   * @returns Promise with battery information
   */
  getBatteryInfo(): Promise<BatteryInfo>;

  /**
   * Get device storage information
   * 
   * @returns Promise with storage information
   */
  getStorageInfo(): Promise<StorageInfo>;

  /**
   * Check if device has biometric authentication available
   * (Face ID, Touch ID, Fingerprint, etc.)
   * 
   * @returns Promise with boolean indicating availability
   */
  hasBiometricAuthentication(): Promise<boolean>;

  /**
   * Get device locale/language code (e.g., "en-US", "pt-BR")
   * 
   * @returns Promise with locale string
   */
  getDeviceLocale(): Promise<string>;

  /**
   * Get device timezone (e.g., "America/New_York", "Europe/London")
   * 
   * @returns Promise with timezone string
   */
  getDeviceTimezone(): Promise<string>;

  /**
   * Check if device supports haptic feedback
   * 
   * @returns Promise with boolean indicating support
   */
  supportsHaptics(): Promise<boolean>;

  /**
   * Synchronous method to get device model
   * (Demonstrates synchronous TurboModule methods)
   * 
   * @returns Device model string
   */
  getDeviceModelSync(): string;
}

/**
 * Export the TurboModule instance
 * This uses TurboModuleRegistry to get the native module
 */
export default TurboModuleRegistry.getEnforcing<Spec>('DeviceInfo');
