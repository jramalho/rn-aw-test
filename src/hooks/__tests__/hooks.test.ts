import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  useKeyboard,
  useDebounce,
  usePrevious,
  useAsyncOperation,
  useCountdown,
} from '../index';
import { Keyboard } from 'react-native';

// Mock Keyboard
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Keyboard: {
      addListener: jest.fn((event, callback) => ({
        remove: jest.fn(),
      })),
    },
  };
});

describe('Custom Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('useKeyboard', () => {
    it('initializes with keyboard hidden', () => {
      const { result } = renderHook(() => useKeyboard());
      
      expect(result.current.isKeyboardVisible).toBe(false);
      expect(result.current.keyboardHeight).toBe(0);
    });

    it('cleans up listeners on unmount', () => {
      const mockRemove = jest.fn();
      (Keyboard.addListener as jest.Mock).mockReturnValue({ remove: mockRemove });
      
      const { unmount } = renderHook(() => useKeyboard());
      
      unmount();
      
      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('useDebounce', () => {
    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      
      expect(result.current).toBe('initial');
    });

    it('debounces value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );
      
      expect(result.current).toBe('initial');
      
      // Update value
      rerender({ value: 'updated', delay: 500 });
      
      // Value should not change immediately
      expect(result.current).toBe('initial');
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Value should now be updated
      expect(result.current).toBe('updated');
    });

    it('cancels previous debounce on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );
      
      rerender({ value: 'update1', delay: 500 });
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      rerender({ value: 'update2', delay: 500 });
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      // Should still be initial after 500ms total
      expect(result.current).toBe('initial');
      
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      // Should now be update2
      expect(result.current).toBe('update2');
    });
  });

  describe('usePrevious', () => {
    it('returns undefined initially', () => {
      const { result } = renderHook(() => usePrevious(10));
      
      expect(result.current).toBeUndefined();
    });

    it('returns previous value after update', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 10 } }
      );
      
      expect(result.current).toBeUndefined();
      
      rerender({ value: 20 });
      
      expect(result.current).toBe(10);
      
      rerender({ value: 30 });
      
      expect(result.current).toBe(20);
    });

    it('works with different types', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 'hello' } }
      );
      
      expect(result.current).toBeUndefined();
      
      rerender({ value: 'world' });
      
      expect(result.current).toBe('hello');
    });
  });

  describe('useAsyncOperation', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useAsyncOperation<string>());
      
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('executes async function successfully', async () => {
      const { result } = renderHook(() => useAsyncOperation<string>());
      
      const asyncFn = jest.fn().mockResolvedValue('success');
      
      act(() => {
        result.current.execute(asyncFn);
      });
      
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toBe('success');
      expect(result.current.error).toBeNull();
      expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it('handles async function errors', async () => {
      const { result } = renderHook(() => useAsyncOperation<string, Error>());
      
      const error = new Error('Test error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      
      await act(async () => {
        try {
          await result.current.execute(asyncFn);
        } catch (e) {
          // Expected error
        }
      });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(error);
    });

    it('resets state correctly', async () => {
      const { result } = renderHook(() => useAsyncOperation<string>());
      
      const asyncFn = jest.fn().mockResolvedValue('success');
      
      await act(async () => {
        await result.current.execute(asyncFn);
      });
      
      await waitFor(() => {
        expect(result.current.data).toBe('success');
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('useCountdown', () => {
    it('initializes with correct time', () => {
      const { result } = renderHook(() => useCountdown(60));
      
      expect(result.current.time).toBe(60);
      expect(result.current.isActive).toBe(false);
    });

    it('starts countdown when start is called', () => {
      const { result } = renderHook(() => useCountdown(10));
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isActive).toBe(true);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(result.current.time).toBe(9);
    });

    it('pauses countdown when pause is called', () => {
      const { result } = renderHook(() => useCountdown(10));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      expect(result.current.time).toBe(8);
      
      act(() => {
        result.current.pause();
      });
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Time should not change after pause
      expect(result.current.time).toBe(8);
      expect(result.current.isActive).toBe(false);
    });

    it('resets countdown to initial value', () => {
      const { result } = renderHook(() => useCountdown(10));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(result.current.time).toBe(5);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.time).toBe(10);
      expect(result.current.isActive).toBe(false);
    });

    it('stops when countdown reaches zero', () => {
      const { result } = renderHook(() => useCountdown(3));
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isActive).toBe(true);
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      expect(result.current.time).toBe(0);
      expect(result.current.isActive).toBe(false);
    });
  });
});
