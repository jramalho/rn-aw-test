/**
 * useBiometric Hook
 * Manages biometric authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  enableBiometricAuth,
  disableBiometricAuth,
  getBiometricTypeName,
  type BiometricCapabilities,
  type BiometricAuthResult,
} from '../utils/biometricService';
import { isBiometricEnabled } from '../utils/authUtils';

export interface UseBiometricReturn {
  // State
  isAvailable: boolean;
  isEnabled: boolean;
  biometryType: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  authenticate: (promptMessage?: string) => Promise<BiometricAuthResult>;
  enable: () => Promise<BiometricAuthResult>;
  disable: () => Promise<void>;
  checkAvailability: () => Promise<void>;
}

export const useBiometric = (): UseBiometricReturn => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [biometryType, setBiometryType] = useState<string>('Biometric');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check biometric availability and user preference
   */
  const checkAvailability = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check device capabilities
      const capabilities: BiometricCapabilities = await checkBiometricAvailability();
      setIsAvailable(capabilities.isAvailable);
      
      if (capabilities.isAvailable && capabilities.biometryType) {
        setBiometryType(getBiometricTypeName(capabilities.biometryType));
      }

      // Check user preference
      if (capabilities.isAvailable) {
        const enabled = await isBiometricEnabled();
        setIsEnabled(enabled);
      } else {
        setIsEnabled(false);
        if (capabilities.error) {
          setError(capabilities.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check biometric availability');
      setIsAvailable(false);
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Authenticate user with biometrics
   */
  const authenticate = useCallback(
    async (promptMessage?: string): Promise<BiometricAuthResult> => {
      setError(null);
      const result = await authenticateWithBiometrics(promptMessage);

      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    },
    []
  );

  /**
   * Enable biometric authentication
   */
  const enable = useCallback(async (): Promise<BiometricAuthResult> => {
    setError(null);
    const result = await enableBiometricAuth();

    if (result.success) {
      setIsEnabled(true);
    } else if (result.error) {
      setError(result.error);
    }

    return result;
  }, []);

  /**
   * Disable biometric authentication
   */
  const disable = useCallback(async (): Promise<void> => {
    setError(null);
    await disableBiometricAuth();
    setIsEnabled(false);
  }, []);

  // Check availability on mount
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    // State
    isAvailable,
    isEnabled,
    biometryType,
    isLoading,
    error,

    // Actions
    authenticate,
    enable,
    disable,
    checkAvailability,
  };
};
