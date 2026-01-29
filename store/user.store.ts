import AsyncStorage from "@react-native-async-storage/async-storage";
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
}

const USER_STORAGE_KEY = "@user_data";
const BANK_ACCOUNTS_STORAGE_KEY = "@bank_accounts_data";
const TRANSACTIONS_STORAGE_KEY = "@transactions_data";

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  bankAccounts: [],
  transactions: [],
  isAuthenticated: false,
  isLoading: false,

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
    // Persist to AsyncStorage
    AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)).catch(
      (error) => {
        console.error("Failed to save user data:", error);
      },
    );
  },

  setBankAccounts: (bankAccounts: BankAccount[]) => {
    set({ bankAccounts });
    // Persist to AsyncStorage
    AsyncStorage.setItem(
      BANK_ACCOUNTS_STORAGE_KEY,
      JSON.stringify(bankAccounts),
    ).catch((error) => {
      console.error("Failed to save bank accounts:", error);
    });
  },

  setTransactions: (transactions: Transaction[]) => {
    set({ transactions });
    // Persist to AsyncStorage
    AsyncStorage.setItem(
      TRANSACTIONS_STORAGE_KEY,
      JSON.stringify(transactions),
    ).catch((error) => {
      console.error("Failed to save transactions:", error);
    });
  },

  loadUserData: async () => {
    set({ isLoading: true });
    try {
      const [userData, bankAccountsData, transactionsData] = await Promise.all([
        AsyncStorage.getItem(USER_STORAGE_KEY),
        AsyncStorage.getItem(BANK_ACCOUNTS_STORAGE_KEY),
        AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY),
      ]);

      if (userData) {
        const user = JSON.parse(userData);
        set({ user, isAuthenticated: true });
      }

      if (bankAccountsData) {
        const bankAccounts = JSON.parse(bankAccountsData);
        set({ bankAccounts });
      }

      if (transactionsData) {
        const transactions = JSON.parse(transactionsData);
        set({ transactions });
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
      await Promise.all([
        AsyncStorage.removeItem(USER_STORAGE_KEY),
        AsyncStorage.removeItem(BANK_ACCOUNTS_STORAGE_KEY),
        AsyncStorage.removeItem(TRANSACTIONS_STORAGE_KEY),
      ]);
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
      await Promise.all([
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData.user)),
        AsyncStorage.setItem(
          BANK_ACCOUNTS_STORAGE_KEY,
          JSON.stringify(userData.bankAccounts),
        ),
        ...(userData.transactions
          ? [
              AsyncStorage.setItem(
                TRANSACTIONS_STORAGE_KEY,
                JSON.stringify(userData.transactions),
              ),
            ]
          : []),
      ]);
    } catch (error) {
      console.error("Failed to save user data from API:", error);
    }
  },
}));
