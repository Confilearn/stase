import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
  checkAuthStatus: () => Promise<void>;
}

const AUTH_STORAGE_KEY = '@is_authenticated';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,

  setIsAuthenticated: (authenticated: boolean) => {
    set({ isAuthenticated: authenticated });
    // Persist to AsyncStorage
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticated)).catch(error => {
      console.error('Failed to save auth status:', error);
    });
  },

  checkAuthStatus: async () => {
    try {
      const authStatus = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (authStatus !== null) {
        const isAuthenticated = JSON.parse(authStatus);
        set({ isAuthenticated });
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      set({ isAuthenticated: false });
    }
  },
}));
