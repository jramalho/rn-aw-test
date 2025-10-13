/**
 * DeviceInfo Module
 * 
 * JavaScript wrapper for the native DeviceInfo TurboModule
 * Provides a clean, type-safe API for accessing device information
 */

import NativeDeviceInfo from '../specs/NativeDeviceInfo';
import type {
  DeviceInfo as IDeviceInfo,
  BatteryInfo as IBatteryInfo,
  StorageInfo as IStorageInfo,
} from '../specs/NativeDeviceInfo';

export type DeviceInfo = IDeviceInfo;
export type BatteryInfo = IBatteryInfo;
export type StorageInfo = IStorageInfo;

/**
 * Device Information Module
 * 
 * Provides access to device-specific information through a native TurboModule.
 * Uses the New Architecture for optimal performance.
 * 
 * @example
 * ```typescript
 * import DeviceInfo from './modules/DeviceInfo';
 * 
 * // Get device info
 * const info = await DeviceInfo.getDeviceInfo();
 * console.log(info.model); // "iPhone 15 Pro"
 * 
 * // Get battery info
 * const battery = await DeviceInfo.getBatteryInfo();
 * console.log(`Battery: ${battery.level * 100}%`);
 * ```
 */
class DeviceInfoModule {
  /**
   * Get comprehensive device information
   * 
   * @returns Promise resolving to device information object
   * @throws Error if native module is not available
   * 
   * @example
   * ```typescript
   * const info = await DeviceInfo.getDeviceInfo();
   * console.log(info.model); // "Pixel 7"
   * console.log(info.systemVersion); // "14"
   * ```
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    return NativeDeviceInfo.getDeviceInfo();
  }

  /**
   * Get current battery information
   * 
   * @returns Promise resolving to battery information
   * @throws Error if battery information is not available
   * 
   * @example
   * ```typescript
   * const battery = await DeviceInfo.getBatteryInfo();
   * if (battery.isCharging) {
   *   console.log('Device is charging');
   * }
   * ```
   */
  async getBatteryInfo(): Promise<BatteryInfo> {
    return NativeDeviceInfo.getBatteryInfo();
  }

  /**
   * Get device storage information in bytes
   * 
   * @returns Promise resolving to storage information
   * 
   * @example
   * ```typescript
   * const storage = await DeviceInfo.getStorageInfo();
   * const freeGB = storage.freeSpace / (1024 * 1024 * 1024);
   * console.log(`Free space: ${freeGB.toFixed(2)} GB`);
   * ```
   */
  async getStorageInfo(): Promise<StorageInfo> {
    return NativeDeviceInfo.getStorageInfo();
  }

  /**
   * Check if device has biometric authentication available
   * 
   * @returns Promise resolving to boolean indicating availability
   * 
   * @example
   * ```typescript
   * const hasBiometric = await DeviceInfo.hasBiometricAuthentication();
   * if (hasBiometric) {
   *   // Show biometric login option
   * }
   * ```
   */
  async hasBiometricAuthentication(): Promise<boolean> {
    return NativeDeviceInfo.hasBiometricAuthentication();
  }

  /**
   * Get device locale/language code
   * 
   * @returns Promise resolving to locale string (e.g., "en-US", "pt-BR")
   * 
   * @example
   * ```typescript
   * const locale = await DeviceInfo.getDeviceLocale();
   * console.log(locale); // "en-US"
   * ```
   */
  async getDeviceLocale(): Promise<string> {
    return NativeDeviceInfo.getDeviceLocale();
  }

  /**
   * Get device timezone
   * 
   * @returns Promise resolving to timezone string (e.g., "America/New_York")
   * 
   * @example
   * ```typescript
   * const timezone = await DeviceInfo.getDeviceTimezone();
   * console.log(timezone); // "America/Sao_Paulo"
   * ```
   */
  async getDeviceTimezone(): Promise<string> {
    return NativeDeviceInfo.getDeviceTimezone();
  }

  /**
   * Check if device supports haptic feedback
   * 
   * @returns Promise resolving to boolean indicating support
   * 
   * @example
   * ```typescript
   * const hasHaptics = await DeviceInfo.supportsHaptics();
   * if (hasHaptics) {
   *   // Enable haptic feedback options
   * }
   * ```
   */
  async supportsHaptics(): Promise<boolean> {
    return NativeDeviceInfo.supportsHaptics();
  }

  /**
   * Get device model synchronously
   * 
   * This demonstrates synchronous TurboModule methods which
   * are faster than async methods for simple operations.
   * 
   * @returns Device model string
   * 
   * @example
   * ```typescript
   * const model = DeviceInfo.getDeviceModelSync();
   * console.log(model); // "iPhone 15 Pro"
   * ```
   */
  getDeviceModelSync(): string {
    return NativeDeviceInfo.getDeviceModelSync();
  }

  /**
   * Utility: Format storage size to human-readable string
   * 
   * @param bytes Storage size in bytes
   * @returns Formatted string (e.g., "128.5 GB")
   */
  formatStorageSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Utility: Format battery level as percentage
   * 
   * @param level Battery level (0.0 to 1.0)
   * @returns Formatted percentage string (e.g., "85%")
   */
  formatBatteryLevel(level: number): string {
    return `${Math.round(level * 100)}%`;
  }

  /**
   * Utility: Get battery status icon/color
   * 
   * @param battery Battery information
   * @returns Object with icon name and color
   */
  getBatteryStatus(battery: BatteryInfo): {
    icon: string;
    color: string;
  } {
    if (battery.isCharging) {
      return { icon: 'battery-charging', color: '#4caf50' };
    }

    if (battery.level >= 0.8) {
      return { icon: 'battery-full', color: '#4caf50' };
    } else if (battery.level >= 0.5) {
      return { icon: 'battery-medium', color: '#ff9800' };
    } else if (battery.level >= 0.2) {
      return { icon: 'battery-low', color: '#ff5722' };
    } else {
      return { icon: 'battery-alert', color: '#f44336' };
    }
  }

  /**
   * Utility: Check if device is low on storage
   * 
   * @param storage Storage information
   * @param thresholdGB Threshold in GB (default: 1GB)
   * @returns True if free space is below threshold
   */
  isLowStorage(storage: StorageInfo, thresholdGB: number = 1): boolean {
    const thresholdBytes = thresholdGB * 1024 * 1024 * 1024;
    return storage.freeSpace < thresholdBytes;
  }

  /**
   * Utility: Get storage usage percentage
   * 
   * @param storage Storage information
   * @returns Percentage of storage used (0-100)
   */
  getStorageUsagePercentage(storage: StorageInfo): number {
    return (storage.usedSpace / storage.totalSpace) * 100;
  }
}

// Export singleton instance
export default new DeviceInfoModule();
