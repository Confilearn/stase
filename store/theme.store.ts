import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";
import { create } from "zustand";

type ThemeType = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemeType;
  getTheme: () => void;
  setTheme: (newTheme: ThemeType) => void;
}

const THEME_STORAGE_KEY = '@app_theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme:
    (typeof colorScheme === "string" && (colorScheme === "light" || colorScheme === "dark"))
      ? (colorScheme as ThemeType)
      : "system",

  getTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (savedTheme) {
        set({ theme: savedTheme as ThemeType })
        colorScheme.set(savedTheme as ThemeType);
      } else {
        set({ theme: "system" })
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  },

  setTheme: async (newTheme: ThemeType) => {
    set({ theme: newTheme })
    colorScheme.set(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },
}));