import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDarkMode: boolean;
  systemTheme: boolean;
  toggleTheme: () => void;
  setSystemTheme: (isDark: boolean) => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      systemTheme: true,
      toggleTheme: () => set((state) => ({ 
        isDarkMode: !state.isDarkMode,
        systemTheme: false 
      })),
      setSystemTheme: (isDark: boolean) => {
        const { systemTheme } = get();
        if (systemTheme) {
          set({ isDarkMode: isDark });
        }
      },
      setTheme: (isDark: boolean) => set({ 
        isDarkMode: isDark, 
        systemTheme: false 
      }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
