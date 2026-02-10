import { useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";

export const checkAndNavigateToOffline = async (
  router: ReturnType<typeof useRouter>,
) => {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      router.push("/(app)/offline");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking network status:", error);
    return false;
  }
};

export const isOffline = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch();
    return !netInfo.isConnected;
  } catch (error) {
    console.error("Error checking network status:", error);
    return false;
  }
};
