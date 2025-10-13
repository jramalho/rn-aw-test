/**
 * Biometric Service Tests
 */

import {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  enableBiometricAuth,
  disableBiometricAuth,
  getBiometricTypeName,
  getBiometricSetupInstructions,
} from '../biometricService';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Platform } from 'react-native';
import * as authUtils from '../authUtils';

// Mock dependencies
jest.mock('react-native-biometrics');
jest.mock('../authUtils');
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(obj => obj.ios),
}));

const mockRNBiometrics = ReactNativeBiometrics as jest.Mocked<
  typeof ReactNativeBiometrics
>;

describe('biometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkBiometricAvailability', () => {
    it('should return available when biometric sensor is available', async () => {
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: BiometryTypes.FaceID,
        }),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);

      const result = await checkBiometricAvailability();

      expect(result.isAvailable).toBe(true);
      expect(result.biometryType).toBe(BiometryTypes.FaceID);
      expect(result.error).toBeUndefined();
    });

    it('should return not available when biometric sensor is not available', async () => {
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: false,
          biometryType: null,
        }),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);

      const result = await checkBiometricAvailability();

      expect(result.isAvailable).toBe(false);
      expect(result.biometryType).toBe(null);
      expect(result.error).toBe(
        'Biometric authentication is not available on this device',
      );
    });

    it('should handle errors gracefully', async () => {
      const mockInstance = {
        isSensorAvailable: jest
          .fn()
          .mockRejectedValue(new Error('Sensor check failed')),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);

      const result = await checkBiometricAvailability();

      expect(result.isAvailable).toBe(false);
      expect(result.biometryType).toBe(null);
      expect(result.error).toBe('Sensor check failed');
    });
  });

  describe('getBiometricTypeName', () => {
    it('should return "Face ID" for FaceID type', () => {
      expect(getBiometricTypeName(BiometryTypes.FaceID)).toBe('Face ID');
    });

    it('should return "Touch ID" for TouchID type', () => {
      expect(getBiometricTypeName(BiometryTypes.TouchID)).toBe('Touch ID');
    });

    it('should return "Fingerprint" for Biometrics type', () => {
      expect(getBiometricTypeName(BiometryTypes.Biometrics)).toBe(
        'Fingerprint',
      );
    });

    it('should return "Biometric" for null type', () => {
      expect(getBiometricTypeName(null)).toBe('Biometric');
    });
  });

  describe('authenticateWithBiometrics', () => {
    it('should successfully authenticate when biometric is available and enabled', async () => {
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: BiometryTypes.FaceID,
        }),
        simplePrompt: jest.fn().mockResolvedValue({ success: true }),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);
      (authUtils.isBiometricEnabled as jest.Mock).mockResolvedValue(true);

      const result = await authenticateWithBiometrics('Test prompt');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockInstance.simplePrompt).toHaveBeenCalledWith({
        promptMessage: 'Test prompt',
        cancelButtonText: 'Cancel',
      });
    });

    it('should fail when biometric is not available', async () => {
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: false,
          biometryType: null,
        }),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);

      const result = await authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Biometric authentication is not available on this device',
      );
    });

    it('should fail when biometric is not enabled by user', async () => {
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: BiometryTypes.FaceID,
        }),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);
      (authUtils.isBiometricEnabled as jest.Mock).mockResolvedValue(false);

      const result = await authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toContain('not enabled');
    });

    it('should fail when authentication is cancelled', async () => {
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: BiometryTypes.FaceID,
        }),
        simplePrompt: jest.fn().mockResolvedValue({ success: false }),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);
      (authUtils.isBiometricEnabled as jest.Mock).mockResolvedValue(true);

      const result = await authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toContain('cancelled or failed');
    });
  });

  describe('enableBiometricAuth', () => {
    it('should successfully enable biometric auth', async () => {
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: BiometryTypes.TouchID,
        }),
        simplePrompt: jest.fn().mockResolvedValue({ success: true }),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);
      (authUtils.setBiometricEnabled as jest.Mock).mockResolvedValue(undefined);

      const result = await enableBiometricAuth();

      expect(result.success).toBe(true);
      expect(authUtils.setBiometricEnabled).toHaveBeenCalledWith(true);
    });

    it('should fail when biometric is not available', async () => {
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: false,
          biometryType: null,
        }),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);

      const result = await enableBiometricAuth();

      expect(result.success).toBe(false);
      expect(authUtils.setBiometricEnabled).not.toHaveBeenCalled();
    });

    it('should fail when authentication is cancelled', async () => {
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: BiometryTypes.TouchID,
        }),
        simplePrompt: jest.fn().mockResolvedValue({ success: false }),
      };
      (mockRNBiometrics as any).mockImplementation(() => mockInstance);

      const result = await enableBiometricAuth();

      expect(result.success).toBe(false);
      expect(result.error).toContain('cancelled');
      expect(authUtils.setBiometricEnabled).not.toHaveBeenCalled();
    });
  });

  describe('disableBiometricAuth', () => {
    it('should disable biometric auth', async () => {
      (authUtils.setBiometricEnabled as jest.Mock).mockResolvedValue(undefined);

      await disableBiometricAuth();

      expect(authUtils.setBiometricEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe('getBiometricSetupInstructions', () => {
    it('should return iOS instructions when platform is iOS', () => {
      (Platform as any).OS = 'ios';

      const instructions = getBiometricSetupInstructions();

      expect(instructions).toContain('Face ID');
      expect(instructions).toContain('Touch ID');
    });

    it('should return Android instructions when platform is Android', () => {
      (Platform as any).OS = 'android';

      const instructions = getBiometricSetupInstructions();

      expect(instructions).toContain('fingerprint');
      expect(instructions).toContain('Security');
    });
  });
});
