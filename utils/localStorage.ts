import AsyncStorage from '@react-native-async-storage/async-storage';

// Local storage utility for offline-first functionality

const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  AUTH_TOKEN: '@auth_token',
  IS_AUTHENTICATED: '@is_authenticated',
  BANK_ACCOUNTS: '@bank_accounts',
  TRANSACTIONS: '@transactions',
  PENDING_ACTIONS: '@pending_actions',
  LAST_SYNC: '@last_sync',
};

export interface PendingAction {
  id: string;
  type: 'create_account' | 'set_pin' | 'transfer' | 'deposit' | 'withdraw';
  data: any;
  timestamp: number;
  retryCount: number;
}

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
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async setUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  }

  // Authentication
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const authStatus = await AsyncStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      return authStatus === 'true';
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  async setAuthenticated(authenticated: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(authenticated));
    } catch (error) {
      console.error('Error setting auth status:', error);
    }
  }

  // Pending actions for offline sync
  async getPendingActions(): Promise<PendingAction[]> {
    try {
      const actions = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  }

  async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const actions = await this.getPendingActions();
      const newAction: PendingAction = {
        ...action,
        id: Date.now().toString(),
        timestamp: Date.now(),
        retryCount: 0,
      };
      actions.push(newAction);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(actions));
    } catch (error) {
      console.error('Error adding pending action:', error);
    }
  }

  async removePendingAction(actionId: string): Promise<void> {
    try {
      const actions = await this.getPendingActions();
      const filtered = actions.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing pending action:', error);
    }
  }

  async updatePendingActionRetryCount(actionId: string, retryCount: number): Promise<void> {
    try {
      const actions = await this.getPendingActions();
      const action = actions.find(a => a.id === actionId);
      if (action) {
        action.retryCount = retryCount;
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(actions));
      }
    } catch (error) {
      console.error('Error updating pending action:', error);
    }
  }

  // Sync status
  async getLastSync(): Promise<number | null> {
    try {
      const sync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return sync ? parseInt(sync, 10) : null;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  async setLastSync(timestamp: number = Date.now()): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Error setting last sync:', error);
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export const localStorage = new LocalStorage();
