/**
 * useBiometric Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useBiometric } from '../useBiometric';
import * as biometricService from '../../utils/biometricService';
import * as authUtils from '../../utils/authUtils';
import { BiometryTypes } from 'react-native-biometrics';

// Mock dependencies
jest.mock('../../utils/biometricService');
jest.mock('../../utils/authUtils');

const mockBiometricService = biometricService as jest.Mocked<typeof biometricService>;
const mockAuthUtils = authUtils as jest.Mocked<typeof authUtils>;

describe('useBiometric', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: true,
      biometryType: BiometryTypes.FaceID,
    });
    mockAuthUtils.isBiometricEnabled.mockResolvedValue(true);
    mockBiometricService.getBiometricTypeName.mockReturnValue('Face ID');

    const { result } = renderHook(() => useBiometric());

    expect(result.current.isLoading).toBe(true);
  });

  it('should check availability on mount', async () => {
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: true,
      biometryType: BiometryTypes.FaceID,
    });
    mockAuthUtils.isBiometricEnabled.mockResolvedValue(true);
    mockBiometricService.getBiometricTypeName.mockReturnValue('Face ID');

    const { result } = renderHook(() => useBiometric());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.biometryType).toBe('Face ID');
    expect(result.current.error).toBe(null);
  });

  it('should handle unavailable biometrics', async () => {
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: false,
      biometryType: null,
      error: 'Not available',
    });
    mockAuthUtils.isBiometricEnabled.mockResolvedValue(false);

    const { result } = renderHook(() => useBiometric());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.error).toBe('Not available');
  });

  it('should authenticate successfully', async () => {
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: true,
      biometryType: BiometryTypes.FaceID,
    });
    mockAuthUtils.isBiometricEnabled.mockResolvedValue(true);
    mockBiometricService.getBiometricTypeName.mockReturnValue('Face ID');
    mockBiometricService.authenticateWithBiometrics.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useBiometric());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let authResult;
    await act(async () => {
      authResult = await result.current.authenticate('Test prompt');
    });

    expect(authResult).toEqual({ success: true });
    expect(mockBiometricService.authenticateWithBiometrics).toHaveBeenCalledWith('Test prompt');
  });

  it('should handle authentication failure', async () => {
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: true,
      biometryType: BiometryTypes.FaceID,
    });
    mockAuthUtils.isBiometricEnabled.mockResolvedValue(true);
    mockBiometricService.getBiometricTypeName.mockReturnValue('Face ID');
    mockBiometricService.authenticateWithBiometrics.mockResolvedValue({
      success: false,
      error: 'Authentication failed',
    });

    const { result } = renderHook(() => useBiometric());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let authResult;
    await act(async () => {
      authResult = await result.current.authenticate();
    });

    expect(authResult).toEqual({ success: false, error: 'Authentication failed' });
    expect(result.current.error).toBe('Authentication failed');
  });

  it('should enable biometric authentication', async () => {
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: true,
      biometryType: BiometryTypes.TouchID,
    });
    mockAuthUtils.isBiometricEnabled.mockResolvedValue(false);
    mockBiometricService.getBiometricTypeName.mockReturnValue('Touch ID');
    mockBiometricService.enableBiometricAuth.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useBiometric());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isEnabled).toBe(false);

    let enableResult;
    await act(async () => {
      enableResult = await result.current.enable();
    });

    expect(enableResult).toEqual({ success: true });
    expect(result.current.isEnabled).toBe(true);
  });

  it('should handle enable failure', async () => {
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: true,
      biometryType: BiometryTypes.TouchID,
    });
    mockAuthUtils.isBiometricEnabled.mockResolvedValue(false);
    mockBiometricService.getBiometricTypeName.mockReturnValue('Touch ID');
    mockBiometricService.enableBiometricAuth.mockResolvedValue({
      success: false,
      error: 'Setup cancelled',
    });

    const { result } = renderHook(() => useBiometric());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let enableResult;
    await act(async () => {
      enableResult = await result.current.enable();
    });

    expect(enableResult).toEqual({ success: false, error: 'Setup cancelled' });
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.error).toBe('Setup cancelled');
  });

  it('should disable biometric authentication', async () => {
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: true,
      biometryType: BiometryTypes.Biometrics,
    });
    mockAuthUtils.isBiometricEnabled.mockResolvedValue(true);
    mockBiometricService.getBiometricTypeName.mockReturnValue('Fingerprint');
    mockBiometricService.disableBiometricAuth.mockResolvedValue();

    const { result } = renderHook(() => useBiometric());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isEnabled).toBe(true);

    await act(async () => {
      await result.current.disable();
    });

    expect(result.current.isEnabled).toBe(false);
    expect(mockBiometricService.disableBiometricAuth).toHaveBeenCalled();
  });

  it('should allow manual availability check', async () => {
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: true,
      biometryType: BiometryTypes.FaceID,
    });
    mockAuthUtils.isBiometricEnabled.mockResolvedValue(true);
    mockBiometricService.getBiometricTypeName.mockReturnValue('Face ID');

    const { result } = renderHook(() => useBiometric());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Change mock to simulate new availability check
    mockBiometricService.checkBiometricAvailability.mockResolvedValue({
      isAvailable: false,
      biometryType: null,
      error: 'Sensor disabled',
    });

    await act(async () => {
      await result.current.checkAvailability();
    });

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.error).toBe('Sensor disabled');
  });

  it('should handle errors during availability check', async () => {
    mockBiometricService.checkBiometricAvailability.mockRejectedValue(
      new Error('Check failed')
    );

    const { result } = renderHook(() => useBiometric());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.error).toBe('Check failed');
  });
});
