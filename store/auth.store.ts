import { localStorage } from "@/utils/localStorage";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AUTH_STORAGE_KEY = "@is_authenticated";

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,

  setIsAuthenticated: async (authenticated: boolean) => {
    set({ isAuthenticated: authenticated });
    // Persist to localStorage
    await localStorage.setAuthenticated(authenticated);
  },

  checkAuthStatus: async () => {
    try {
      const isAuthenticated = await localStorage.isAuthenticated();
      set({ isAuthenticated });
    } catch (error) {
      console.error("Failed to check auth status:", error);
      set({ isAuthenticated: false });
    }
  },
}));
