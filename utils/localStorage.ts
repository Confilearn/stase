import AsyncStorage from "@react-native-async-storage/async-storage";

// Local storage utility for data persistence

const STORAGE_KEYS = {
  USER_DATA: "@user_data",
  AUTH_TOKEN: "@auth_token",
  IS_AUTHENTICATED: "@is_authenticated",
  BANK_ACCOUNTS: "@bank_accounts",
  TRANSACTIONS: "@transactions",
};

export interface UserData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    clerkUserId: string;
    hasTransactionPin?: boolean;
    createdAt: string;
  };
  bankAccounts: any[];
  transactions: any[];
}

class LocalStorage {
  // User data
  async getUserData(): Promise<UserData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  async setUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData),
      );
    } catch (error) {
      console.error("Error setting user data:", error);
    }
  }

  // Authentication
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const authStatus = await AsyncStorage.getItem(
        STORAGE_KEYS.IS_AUTHENTICATED,
      );
      return authStatus === "true";
    } catch (error) {
      console.error("Error checking auth status:", error);
      return false;
    }
  }

  async setAuthenticated(authenticated: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.IS_AUTHENTICATED,
        JSON.stringify(authenticated),
      );
    } catch (error) {
      console.error("Error setting auth status:", error);
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error("Error clearing all data:", error);
    }
  }
}

export const localStorage = new LocalStorage();
