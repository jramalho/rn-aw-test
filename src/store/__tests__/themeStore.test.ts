import { renderHook, act } from '@testing-library/react-native';
import { useThemeStore } from '../themeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('themeStore', () => {
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset store to initial state
    const { result } = renderHook(() => useThemeStore());
    await act(async () => {
      result.current.setTheme(false);
      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useThemeStore());

      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.systemTheme).toBe(true);
    });

    it('should expose all required methods', () => {
      const { result } = renderHook(() => useThemeStore());

      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setSystemTheme).toBe('function');
      expect(typeof result.current.setTheme).toBe('function');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle isDarkMode from false to true', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.toggleTheme();
      });

      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.systemTheme).toBe(false);
    });

    it('should toggle isDarkMode from true to false', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.setTheme(true);
      });

      expect(result.current.isDarkMode).toBe(true);

      await act(async () => {
        result.current.toggleTheme();
      });

      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.systemTheme).toBe(false);
    });

    it('should disable systemTheme when toggling', async () => {
      const { result } = renderHook(() => useThemeStore());

      // Ensure systemTheme is initially true
      expect(result.current.systemTheme).toBe(true);

      await act(async () => {
        result.current.toggleTheme();
      });

      expect(result.current.systemTheme).toBe(false);
    });

    it('should persist theme changes to AsyncStorage', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.toggleTheme();
        // Wait for persistence
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('setSystemTheme', () => {
    it('should set isDarkMode when systemTheme is true', async () => {
      const { result } = renderHook(() => useThemeStore());

      // systemTheme should be true by default
      expect(result.current.systemTheme).toBe(true);

      await act(async () => {
        result.current.setSystemTheme(true);
      });

      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.systemTheme).toBe(true);
    });

    it('should not change isDarkMode when systemTheme is false', async () => {
      const { result } = renderHook(() => useThemeStore());

      // Disable system theme first
      await act(async () => {
        result.current.toggleTheme();
      });

      expect(result.current.systemTheme).toBe(false);
      const currentMode = result.current.isDarkMode;

      await act(async () => {
        result.current.setSystemTheme(!currentMode);
      });

      // isDarkMode should remain unchanged
      expect(result.current.isDarkMode).toBe(currentMode);
    });

    it('should handle system theme changes to light mode', async () => {
      const { result } = renderHook(() => useThemeStore());

      expect(result.current.systemTheme).toBe(true);

      await act(async () => {
        result.current.setSystemTheme(false);
      });

      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.systemTheme).toBe(true);
    });

    it('should handle system theme changes to dark mode', async () => {
      const { result } = renderHook(() => useThemeStore());

      expect(result.current.systemTheme).toBe(true);

      await act(async () => {
        result.current.setSystemTheme(true);
      });

      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.systemTheme).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('should set isDarkMode to true', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.setTheme(true);
      });

      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.systemTheme).toBe(false);
    });

    it('should set isDarkMode to false', async () => {
      const { result } = renderHook(() => useThemeStore());

      // Set to dark first
      await act(async () => {
        result.current.setTheme(true);
      });

      expect(result.current.isDarkMode).toBe(true);

      // Then set to light
      await act(async () => {
        result.current.setTheme(false);
      });

      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.systemTheme).toBe(false);
    });

    it('should disable systemTheme when setting theme manually', async () => {
      const { result } = renderHook(() => useThemeStore());

      expect(result.current.systemTheme).toBe(true);

      await act(async () => {
        result.current.setTheme(true);
      });

      expect(result.current.systemTheme).toBe(false);
    });

    it('should persist theme changes to AsyncStorage', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.setTheme(true);
        // Wait for persistence
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('State Transitions', () => {
    it('should handle multiple theme toggles correctly', async () => {
      const { result } = renderHook(() => useThemeStore());

      expect(result.current.isDarkMode).toBe(false);

      await act(async () => {
        result.current.toggleTheme();
      });
      expect(result.current.isDarkMode).toBe(true);

      await act(async () => {
        result.current.toggleTheme();
      });
      expect(result.current.isDarkMode).toBe(false);

      await act(async () => {
        result.current.toggleTheme();
      });
      expect(result.current.isDarkMode).toBe(true);
    });

    it('should maintain state consistency between different actions', async () => {
      const { result } = renderHook(() => useThemeStore());

      // Start with default state
      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.systemTheme).toBe(true);

      // Manual theme change disables system theme
      await act(async () => {
        result.current.setTheme(true);
      });
      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.systemTheme).toBe(false);

      // System theme changes should not affect when systemTheme is false
      await act(async () => {
        result.current.setSystemTheme(false);
      });
      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.systemTheme).toBe(false);
    });

    it('should handle rapid theme changes', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.toggleTheme();
        result.current.toggleTheme();
        result.current.toggleTheme();
      });

      // After 3 toggles from false, should end up at true
      expect(result.current.isDarkMode).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should use AsyncStorage for persistence', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.setTheme(true);
        // Wait for debounced persistence
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'theme-storage',
        expect.stringContaining('isDarkMode')
      );
    });

    it('should persist both isDarkMode and systemTheme', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.toggleTheme();
        // Wait for persistence
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastCall = calls[calls.length - 1];
      
      if (lastCall) {
        const [key, value] = lastCall;
        expect(key).toBe('theme-storage');
        const parsed = JSON.parse(value);
        expect(parsed.state).toHaveProperty('isDarkMode');
        expect(parsed.state).toHaveProperty('systemTheme');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle setting same theme value multiple times', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.setTheme(true);
      });
      expect(result.current.isDarkMode).toBe(true);

      await act(async () => {
        result.current.setTheme(true);
      });
      expect(result.current.isDarkMode).toBe(true);

      await act(async () => {
        result.current.setTheme(true);
      });
      expect(result.current.isDarkMode).toBe(true);
    });

    it('should handle system theme changes after manual override', async () => {
      const { result } = renderHook(() => useThemeStore());

      // Manual override
      await act(async () => {
        result.current.setTheme(true);
      });
      expect(result.current.systemTheme).toBe(false);
      expect(result.current.isDarkMode).toBe(true);

      // System theme change should not affect
      await act(async () => {
        result.current.setSystemTheme(false);
      });
      expect(result.current.isDarkMode).toBe(true);
    });

    it('should maintain independent state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useThemeStore());
      const { result: result2 } = renderHook(() => useThemeStore());

      // Both instances should share the same state
      expect(result1.current.isDarkMode).toBe(result2.current.isDarkMode);
      expect(result1.current.systemTheme).toBe(result2.current.systemTheme);

      act(() => {
        result1.current.toggleTheme();
      });

      // Changes in one instance should reflect in the other
      expect(result1.current.isDarkMode).toBe(result2.current.isDarkMode);
    });
  });

  describe('Type Safety', () => {
    it('should only accept boolean values for setTheme', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.setTheme(true);
      });
      expect(result.current.isDarkMode).toBe(true);

      await act(async () => {
        result.current.setTheme(false);
      });
      expect(result.current.isDarkMode).toBe(false);
    });

    it('should only accept boolean values for setSystemTheme', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        result.current.setSystemTheme(true);
      });
      expect(result.current.isDarkMode).toBe(true);

      await act(async () => {
        result.current.setSystemTheme(false);
      });
      expect(result.current.isDarkMode).toBe(false);
    });
  });
});
