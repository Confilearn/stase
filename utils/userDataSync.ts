import { useUserStore } from "@/store/user.store";
import { axiosInstance } from "./axios";

export const userDataSync = {
  // Fetch fresh user data from API and update local store
  async refreshUserData(): Promise<boolean> {
    try {
      const response = await axiosInstance.get("/api/fetchUserDetails");

      if (response.data) {
        const { updateUserFromAPI } = useUserStore.getState();
        await updateUserFromAPI(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return false;
    }
  },

  // Check if local data is stale and refresh if needed
  async syncIfNeeded(maxAgeMinutes = 30): Promise<void> {
    const { user } = useUserStore.getState();

    if (!user) return;

    //TODO: Fix to user.updatedAt instead of user.createdAt
    const lastUpdate = new Date(user.createdAt).getTime();
    const now = new Date().getTime();
    const ageMinutes = (now - lastUpdate) / (1000 * 60);

    if (ageMinutes > maxAgeMinutes) {
      console.log("User data is stale, refreshing...");
      await this.refreshUserData();
    }
  },

  // Clear all user data (for logout)
  async clearUserData(): Promise<void> {
    const { clearUserData } = useUserStore.getState();
    await clearUserData();
  },
};
