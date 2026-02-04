import { localStorage } from "@/utils/localStorage";
import { create } from "zustand";

interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankAddress: string;
  accountCurrency: string;
  swiftCode: string;
  iban?: string;
  sortCode?: string;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  clerkUserId: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  date: string;
  status: string;
  reference: string;
  from: string;
  to: string;
  transactionType: string;
  currency: string;
  amount: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  user: User | null;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setBankAccounts: (accounts: BankAccount[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  loadUserData: () => Promise<void>;
  clearUserData: () => Promise<void>;
  updateUserFromAPI: (userData: {
    user: User;
    bankAccounts: BankAccount[];
    transactions?: Transaction[];
  }) => Promise<void>;
  checkTransactionPinStatus: () => Promise<boolean>;
  setTransactionPinStatus: (hasPin: boolean) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  bankAccounts: [],
  transactions: [],
  isAuthenticated: false,
  isLoading: false,

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
    // Persist to localStorage
    localStorage
      .getUserData()
      .then((currentData) => {
        if (currentData) {
          localStorage.setUserData({
            ...currentData,
            user,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to get user data for storage:", error);
      });
  },

  setBankAccounts: (bankAccounts: BankAccount[]) => {
    set({ bankAccounts });
    // Persist to localStorage
    localStorage
      .getUserData()
      .then((currentData) => {
        if (currentData) {
          localStorage.setUserData({
            ...currentData,
            bankAccounts,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to get user data for storage:", error);
      });
  },

  setTransactions: (transactions: Transaction[]) => {
    set({ transactions });
    // Persist to localStorage
    localStorage
      .getUserData()
      .then((currentData) => {
        if (currentData) {
          localStorage.setUserData({
            ...currentData,
            transactions,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to get user data for storage:", error);
      });
  },

  loadUserData: async () => {
    set({ isLoading: true });
    try {
      const userData = await localStorage.getUserData();

      if (userData) {
        set({
          user: userData.user,
          bankAccounts: userData.bankAccounts || [],
          transactions: userData.transactions || [],
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearUserData: async () => {
    set({
      user: null,
      bankAccounts: [],
      transactions: [],
      isAuthenticated: false,
    });
    try {
      await localStorage.clearAll();
    } catch (error) {
      console.error("Failed to clear user data:", error);
    }
  },

  updateUserFromAPI: async (userData: {
    user: User;
    bankAccounts: BankAccount[];
    transactions?: Transaction[];
  }) => {
    set({
      user: userData.user,
      bankAccounts: userData.bankAccounts,
      transactions: userData.transactions || [],
      isAuthenticated: true,
    });

    try {
      await localStorage.setUserData({
        user: userData.user,
        bankAccounts: userData.bankAccounts,
        transactions: userData.transactions || [],
      });
    } catch (error) {
      console.error("Failed to save user data from API:", error);
    }
  },

  checkTransactionPinStatus: async () => {
    try {
      const { user } = get();
      if (!user) return false;

      // Check local data first
      const localData = await localStorage.getUserData();
      if (localData?.user.hasTransactionPin !== undefined) {
        return localData.user.hasTransactionPin;
      }

      // PIN functionality has been removed - always return false
      return false;
    } catch (error) {
      // PIN functionality has been removed - suppress error logging
      // console.error("Error checking transaction PIN status:", error);
      return false;
    }
  },

  setTransactionPinStatus: (hasPin: boolean) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, hasTransactionPin: hasPin };
      set({ user: updatedUser });

      // Update localStorage
      localStorage
        .getUserData()
        .then((currentData) => {
          if (currentData) {
            localStorage.setUserData({
              ...currentData,
              user: updatedUser,
            });
          }
        })
        .catch((error) => {
          console.error("Failed to update user PIN status:", error);
        });
    }
  },
}));
