import { api, ApiError } from "./api";
import { localStorage, PendingAction } from "./localStorage";

// Sync utility for offline-first data synchronization

export class SyncManager {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Monitor network status
    this.setupNetworkMonitoring();
  }

  private setupNetworkMonitoring() {
    // In React Native, you would use NetInfo here
    // For now, we'll assume online status
    this.isOnline = true;
  }

  // Full sync with server
  async fullSync(clerkUserId: string): Promise<boolean> {
    if (!this.isOnline || this.syncInProgress) {
      return false;
    }

    this.syncInProgress = true;

    try {
      console.log("Starting full sync...");

      // Sync user data
      await this.syncUserData(clerkUserId);

      // Process pending actions
      await this.processPendingActions(clerkUserId);

      // Update last sync timestamp
      await localStorage.setLastSync();

      console.log("Full sync completed successfully");
      return true;
    } catch (error) {
      console.error("Full sync failed:", error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync user data from server
  private async syncUserData(clerkUserId: string): Promise<void> {
    try {
      const userData = await api.getUserData(clerkUserId);

      // Ensure the response has the required structure for UserData
      if (userData.user) {
        const userDataForStorage = {
          user: userData.user,
          bankAccounts: userData.bankAccounts || [],
          transactions: userData.transactions || [],
        };
        await localStorage.setUserData(userDataForStorage);
        console.log("User data synced successfully");
      } else {
        throw new Error("Invalid user data response from server");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Token expired, clear local data
        await localStorage.clearAll();
        throw new Error("Authentication expired");
      }
      console.error("Failed to sync user data:", error);
      throw error;
    }
  }

  // Process pending actions
  private async processPendingActions(clerkUserId: string): Promise<void> {
    const pendingActions = await localStorage.getPendingActions();

    for (const action of pendingActions) {
      try {
        await this.processPendingAction(action, clerkUserId);
        await localStorage.removePendingAction(action.id);
      } catch (error) {
        console.error(`Failed to process pending action ${action.id}:`, error);

        // Update retry count
        await localStorage.updatePendingActionRetryCount(
          action.id,
          action.retryCount + 1,
        );

        // Remove action if it has failed too many times
        if (action.retryCount >= 3) {
          await localStorage.removePendingAction(action.id);
          console.warn(
            `Removed pending action ${action.id} after 3 failed attempts`,
          );
        }
      }
    }
  }

  // Process individual pending action
  private async processPendingAction(
    action: PendingAction,
    clerkUserId: string,
  ): Promise<void> {
    switch (action.type) {
      case "create_account":
        await api.createAccount(action.data, clerkUserId);
        break;

      case "set_pin":
        await api.createUserTransactionPin(action.data.pin, clerkUserId);
        break;

      case "transfer":
        await api.transferMoney(action.data, clerkUserId);
        break;

      case "deposit":
        await api.depositMoney(action.data, clerkUserId);
        break;

      case "withdraw":
        await api.withdrawMoney(action.data, clerkUserId);
        break;

      default:
        throw new Error(`Unknown action type: ${(action as any).type}`);
    }
  }

  // Add action to pending queue
  async queueAction(
    action: Omit<PendingAction, "id" | "timestamp" | "retryCount">,
  ): Promise<void> {
    await localStorage.addPendingAction(action);

    // Try to sync immediately if online
    if (this.isOnline) {
      const userData = await localStorage.getUserData();
      if (userData?.user.clerkUserId) {
        this.processPendingActions(userData.user.clerkUserId).catch(
          console.error,
        );
      }
    }
  }

  // Start automatic sync
  startAutoSync(clerkUserId: string, intervalMs: number = 60000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.fullSync(clerkUserId).catch(console.error);
      }
    }, intervalMs) as unknown as NodeJS.Timeout;
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Get sync status
  getSyncStatus(): { isOnline: boolean; syncInProgress: boolean } {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
    };
  }

  // Force immediate sync
  async forceSync(clerkUserId: string): Promise<boolean> {
    return this.fullSync(clerkUserId);
  }
}

export const syncManager = new SyncManager();
