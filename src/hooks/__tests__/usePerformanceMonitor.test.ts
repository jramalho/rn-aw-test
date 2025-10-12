import { renderHook, act } from '@testing-library/react-native';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

// Mock InteractionManager
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
  runAfterInteractions: (callback: () => void) => {
    callback();
    return { cancel: jest.fn() };
  },
}));

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.isMonitoring).toBe(false);
    expect(result.current.stats.measurements).toBe(0);
    expect(result.current.stats.current.fps).toBe(60);
  });

  it('should start monitoring when startMonitoring is called', () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    act(() => {
      result.current.startMonitoring();
    });

    expect(result.current.isMonitoring).toBe(true);
  });

  it('should stop monitoring when stopMonitoring is called', () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    act(() => {
      result.current.startMonitoring();
    });

    expect(result.current.isMonitoring).toBe(true);

    act(() => {
      result.current.stopMonitoring();
    });

    expect(result.current.isMonitoring).toBe(false);
  });

  it('should reset stats when resetStats is called', () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    act(() => {
      result.current.startMonitoring();
    });

    // Advance timers to get some measurements
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.resetStats();
    });

    expect(result.current.stats.measurements).toBe(0);
  });

  it('should collect performance samples over time', () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    act(() => {
      result.current.startMonitoring();
    });

    // Advance timers to collect samples
    act(() => {
      jest.advanceTimersByTime(3000); // 3 seconds should give 3 samples
    });

    // Should have measurements
    expect(result.current.stats.measurements).toBeGreaterThan(0);
  });

  it('should not start monitoring twice', () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    act(() => {
      result.current.startMonitoring();
      result.current.startMonitoring(); // Call twice
    });

    expect(result.current.isMonitoring).toBe(true);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => usePerformanceMonitor());

    // Should not throw
    expect(() => unmount()).not.toThrow();
  });
});
