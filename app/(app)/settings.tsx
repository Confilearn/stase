import CustomButton from "@/components/CustomButton";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { localStorage } from "@/utils/localStorage";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const { clearUserData } = useUserStore();
  const { setIsAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout? This will clear all your local data.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Starting logout process...");

              // 1. Sign out from Clerk first to clear the session
              await signOut();
              console.log("Clerk sign out completed");

              // 2. Clear user data from Zustand store
              await clearUserData();
              console.log("User data cleared from store");

              // 3. Clear authentication state
              setIsAuthenticated(false);
              console.log("Authentication state cleared");

              // 4. Clear stored clerkUserId from AsyncStorage
              await localStorage.removeAuthToken();
              console.log("Token cleared from storage");

              // 5. Navigate to welcome screen
              router.replace("/(auth)/welcome");
              console.log("Navigated to auth screens");

              Alert.alert("Success", "You have been logged out successfully.");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert(
                "Error",
                "Failed to logout completely. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          <Text className="text-3xl font-metropolis-bold text-content-100 dark:text-content-500 mb-4">
            Settings
          </Text>

          <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6">
            <Text className="text-xl font-metropolis-semibold text-content-100 dark:text-content-500 mb-2">
              Account
            </Text>
            <Text className="text-lg font-metropolis-medium text-content-300 dark:text-content-400 mb-6">
              Manage your account settings and preferences
            </Text>

            <CustomButton
              title="Logout"
              style="bg-red-500 hover:bg-red-600"
              onPress={handleLogout}
            />
          </View>

          <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6">
            <Text className="text-lg font-metropolis-semibold text-content-100 dark:text-content-500 mb-2">
              About
            </Text>
            <Text className="text-sm text-content-300 dark:text-content-400">
              Stase Fintech App v1.0.0
            </Text>
            <Text className="text-xs text-content-300 dark:text-content-400 mt-1">
              Secure financial management at your fingertips
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
