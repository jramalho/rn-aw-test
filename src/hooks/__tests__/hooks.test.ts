import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  useKeyboard,
  useAppState,
  useDebounce,
  usePrevious,
  useAsyncOperation,
  useCountdown,
  useAsyncStorage,
} from '../index';
import { Keyboard, AppState } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

// Mock Keyboard and AppState
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Keyboard: {
      addListener: jest.fn((event, callback) => ({
        remove: jest.fn(),
      })),
    },
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn((event, callback) => ({
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

  describe('useAppState', () => {
    it('initializes with current app state', () => {
      const { result } = renderHook(() => useAppState());
      
      expect(result.current).toBe('active');
    });

    it('updates when app state changes', () => {
      let stateChangeCallback: ((state: string) => void) | null = null;
      
      (AppState.addEventListener as jest.Mock).mockImplementation((event, callback) => {
        stateChangeCallback = callback;
        return { remove: jest.fn() };
      });
      
      const { result } = renderHook(() => useAppState());
      
      expect(result.current).toBe('active');
      
      // Simulate app going to background
      act(() => {
        if (stateChangeCallback) {
          stateChangeCallback('background');
        }
      });
      
      expect(result.current).toBe('background');
      
      // Simulate app going inactive
      act(() => {
        if (stateChangeCallback) {
          stateChangeCallback('inactive');
        }
      });
      
      expect(result.current).toBe('inactive');
    });

    it('cleans up listener on unmount', () => {
      const mockRemove = jest.fn();
      (AppState.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });
      
      const { unmount } = renderHook(() => useAppState());
      
      unmount();
      
      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('useAsyncStorage', () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    beforeEach(() => {
      AsyncStorage.setItem.mockClear();
      AsyncStorage.getItem.mockClear();
      AsyncStorage.removeItem.mockClear();
    });

    it('initializes with initial value when storage is empty', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const { result } = renderHook(() => useAsyncStorage('test-key', 'initial'));
      
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.value).toBe('initial');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('loads stored value from AsyncStorage', async () => {
      const storedValue = { data: 'stored' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedValue));
      
      const { result } = renderHook(() => useAsyncStorage('test-key', { data: 'initial' }));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.value).toEqual(storedValue);
    });

    it('sets value and persists to AsyncStorage', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const { result } = renderHook(() => useAsyncStorage('test-key', 'initial'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.setValue('updated');
      });
      
      expect(result.current.value).toBe('updated');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('updated'));
    });

    it('sets value using function updater', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const { result } = renderHook(() => useAsyncStorage('test-key', 10));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.setValue((prev) => prev + 5);
      });
      
      expect(result.current.value).toBe(15);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(15));
    });

    it('removes value from AsyncStorage', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify('stored'));
      
      const { result } = renderHook(() => useAsyncStorage('test-key', 'initial'));
      
      await waitFor(() => {
        expect(result.current.value).toBe('stored');
      });
      
      await act(async () => {
        await result.current.removeValue();
      });
      
      expect(result.current.value).toBe('initial');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('handles AsyncStorage errors gracefully when getting', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const { result } = renderHook(() => useAsyncStorage('test-key', 'initial'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.value).toBe('initial');
      expect(consoleError).toHaveBeenCalled();
      
      consoleError.mockRestore();
    });

    it('handles AsyncStorage errors gracefully when setting', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
      
      const { result } = renderHook(() => useAsyncStorage('test-key', 'initial'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.setValue('updated');
      });
      
      expect(consoleError).toHaveBeenCalled();
      
      consoleError.mockRestore();
    });

    it('handles AsyncStorage errors gracefully when removing', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));
      
      const { result } = renderHook(() => useAsyncStorage('test-key', 'initial'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.removeValue();
      });
      
      expect(consoleError).toHaveBeenCalled();
      
      consoleError.mockRestore();
    });

    it('works with complex object types', async () => {
      type ComplexType = { id: number; name: string; tags: string[] };
      const initialValue: ComplexType = { id: 1, name: 'Test', tags: ['a', 'b'] };
      const updatedValue: ComplexType = { id: 2, name: 'Updated', tags: ['c', 'd', 'e'] };
      
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const { result } = renderHook(() => useAsyncStorage<ComplexType>('complex-key', initialValue));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.setValue(updatedValue);
      });
      
      expect(result.current.value).toEqual(updatedValue);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('complex-key', JSON.stringify(updatedValue));
    });
  });
});
