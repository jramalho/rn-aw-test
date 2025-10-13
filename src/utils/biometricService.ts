/**
 * Biometric Authentication Service
 * Provides biometric authentication capabilities using device hardware
 * Supports Face ID (iOS), Touch ID (iOS), and Fingerprint (Android)
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Platform } from 'react-native';
import { isBiometricEnabled, setBiometricEnabled } from './authUtils';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometryType: BiometryTypes | null;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

/**
 * Check if biometric authentication is available on the device
 */
export const checkBiometricAvailability =
  async (): Promise<BiometricCapabilities> => {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();

      if (!available) {
        return {
          isAvailable: false,
          biometryType: null,
          error: 'Biometric authentication is not available on this device',
        };
      }

      return {
        isAvailable: true,
        biometryType: biometryType ?? null,
      };
    } catch (error) {
      return {
        isAvailable: false,
        biometryType: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check biometric availability',
      };
    }
  };

/**
 * Get human-readable name for biometric type
 */
export const getBiometricTypeName = (
  biometryType: BiometryTypes | null,
): string => {
  switch (biometryType) {
    case BiometryTypes.FaceID:
      return 'Face ID';
    case BiometryTypes.TouchID:
      return 'Touch ID';
    case BiometryTypes.Biometrics:
      return 'Fingerprint';
    default:
      return 'Biometric';
  }
};

/**
 * Prompt user for biometric authentication
 */
export const authenticateWithBiometrics = async (
  promptMessage?: string,
): Promise<BiometricAuthResult> => {
  try {
    // Check if biometric is available
    const capabilities = await checkBiometricAvailability();
    if (!capabilities.isAvailable) {
      return {
        success: false,
        error: capabilities.error || 'Biometric authentication not available',
      };
    }

    // Check if biometric is enabled by user
    const isEnabled = await isBiometricEnabled();
    if (!isEnabled) {
      return {
        success: false,
        error:
          'Biometric authentication is not enabled. Please enable it in settings.',
      };
    }

    // Prompt for biometric authentication
    const biometricTypeName = getBiometricTypeName(capabilities.biometryType);
    const message = promptMessage || `Authenticate with ${biometricTypeName}`;

    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: message,
      cancelButtonText: 'Cancel',
    });

    if (!success) {
      return {
        success: false,
        error: 'Authentication was cancelled or failed',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Biometric authentication failed',
    };
  }
};

/**
 * Enable biometric authentication for the app
 * This should be called after user successfully authenticates once
 */
export const enableBiometricAuth = async (): Promise<BiometricAuthResult> => {
  try {
    // Check if biometric is available
    const capabilities = await checkBiometricAvailability();
    if (!capabilities.isAvailable) {
      return {
        success: false,
        error: capabilities.error || 'Biometric authentication not available',
      };
    }

    // Test biometric authentication
    const biometricTypeName = getBiometricTypeName(capabilities.biometryType);
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: `Enable ${biometricTypeName} authentication`,
      cancelButtonText: 'Cancel',
    });

    if (!success) {
      return {
        success: false,
        error: 'Biometric setup was cancelled',
      };
    }

    // Store biometric preference
    await setBiometricEnabled(true);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to enable biometric authentication',
    };
  }
};

/**
 * Disable biometric authentication for the app
 */
export const disableBiometricAuth = async (): Promise<void> => {
  await setBiometricEnabled(false);
};

/**
 * Get platform-specific biometric setting instructions
 */
export const getBiometricSetupInstructions = (): string => {
  if (Platform.OS === 'ios') {
    return 'To use Face ID or Touch ID, ensure it is set up in Settings > Face ID & Passcode or Settings > Touch ID & Passcode';
  } else {
    return 'To use fingerprint authentication, ensure it is set up in Settings > Security > Fingerprint';
  }
};
