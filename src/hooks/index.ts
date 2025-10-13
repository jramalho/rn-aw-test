import { useState, useEffect, useCallback, useRef } from 'react';
import { Keyboard, AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';

/**
 * Custom hook to track keyboard visibility
 */
export const useKeyboard = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};

/**
 * Custom hook to track app state changes
 */
export const useAppState = () => {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => subscription?.remove();
  }, []);

  return appState;
};

/**
 * Custom hook for debounced values
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for previous value tracking
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * Custom hook for async operations with loading state
 */
export const useAsyncOperation = <T, E = Error>() => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch {
      setError(err as E);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, execute, reset };
};

/**
 * Custom hook for countdown timer
 */
export const useCountdown = (initialTime: number) => {
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback(() => {
    setTime(initialTime);
    setIsActive(false);
  }, [initialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  return { time, isActive, start, pause, reset };
};

/**
 * Custom hook for local storage with React Native AsyncStorage
 */
export const useAsyncStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        const { default: AsyncStorage } = await import(
          '@react-native-async-storage/async-storage'
        );
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        console.error(`Error setting ${key} in AsyncStorage:`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(async () => {
    try {
      const { default: AsyncStorage } = await import(
        '@react-native-async-storage/async-storage'
      );
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {
      console.error(`Error removing ${key} from AsyncStorage:`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const { default: AsyncStorage } = await import(
          '@react-native-async-storage/async-storage'
        );
        const item = await AsyncStorage.getItem(key);

        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch {
        console.error(`Error loading ${key} from AsyncStorage:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  return { value: storedValue, setValue, removeValue, loading };
};

// Export performance monitoring hook
export { usePerformanceMonitor } from './usePerformanceMonitor';

// Export authentication hook
export { useAuth } from './useAuth';

// Export notifications hook
export { useNotifications } from './useNotifications';

// Export notification navigation hook
export { useNotificationNavigation } from './useNotificationNavigation';

// Export deep link hook
export { useDeepLink } from './useDeepLink';

// Export network hook
export { useNetwork } from './useNetwork';
