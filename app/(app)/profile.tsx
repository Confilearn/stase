import ChevronLeft from "@/components/ChevronLeft";
import ThemeModal from "@/components/ThemeModal";
import { Link, useRouter } from "expo-router";
import { Moon, Sun1 } from "iconsax-react-native";
import CustomButton from "@/components/CustomButton";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { localStorage } from "@/utils/localStorage";
import { useAuth } from "@clerk/clerk-expo";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/theme.store";
import { useState } from "react";

const Profile = () => {
  const colorMode = useColorScheme();
  const { user } = useUserStore();
  const { theme, setTheme } = useThemeStore();
  const { signOut } = useAuth();
  const router = useRouter();
  const { clearUserData } = useUserStore();
  const { setIsAuthenticated } = useAuthStore();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeSelect = (selectedTheme: "system" | "light" | "dark") => {
    setTheme(selectedTheme);
  };

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
            setIsLoading(true);
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
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="container justify-between align-center">
      <View className="flex-row gap-5 mt-2 items-center justify-between">
        <Link href={"/(app)/(tabs)"}>
          <ChevronLeft />
        </Link>
        <TouchableOpacity onPress={() => setShowThemeModal(true)}>
          {theme === "light" ||
          (theme === "system" && colorMode === "light") ? (
            <Moon size="26" color="#000000" variant="Bulk" />
          ) : (
            <Sun1 size="26" color="#FFFFFF" variant="Bulk" />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex items-center justify-center gap-7">
        <View className="bg-bg-neutral dark:bg-content-200 size-36 rounded-full flex items-center justify-center">
          <Text className="text-5xl font-metropolis-semibold default-text-color">
            {user?.firstName && user?.lastName
              ? `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`
              : "CE"}
          </Text>
        </View>

        <Text className="font-metropolis-extrabold text-5xl default-text-color text-center">
          {user?.firstName && user?.lastName
            ? `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`
            : ""}
        </Text>

        <TouchableOpacity className="flex items-center justify-center py-1.5 px-4 rounded-full bg-bg-neutral dark:bg-content-200">
          <Text className="font-metropolis-semibold text-lg default-text-color">
            @{user?.username}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="justify-end">
        <CustomButton
          title="Logout"
          textStyle="text-content-500"
          style="bg-red-500"
          isLoading={isLoading}
          onPress={handleLogout}
        />
      </View>

      {/* Theme Selection Modal */}
      <ThemeModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={theme}
        onThemeSelect={handleThemeSelect}
      />
    </SafeAreaView>
  );
};

export default Profile;
