import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { useUserStore } from "@/store/user.store";
import { localStorage } from "@/utils/localStorage";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "./global.css";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { getTheme } = useThemeStore();
  const { loadUserData } = useUserStore();
  const { isAuthenticated, setIsAuthenticated, checkAuthStatus } =
    useAuthStore();

  // Import fonts
  const [fontsLoaded, error] = useFonts({
    "metropolis-extra-bold": require("../assets/fonts/metropolis-extra-bold.otf"),
    "metropolis-bold": require("../assets/fonts/metropolis-bold.otf"),
    "metropolis-semi-bold": require("../assets/fonts/metropolis-semi-bold.otf"),
    "metropolis-medium": require("../assets/fonts/metropolis-medium.otf"),
  });

  // Fetch token from AsyncStorage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check auth status from store first
        await checkAuthStatus();

        // Then verify with localStorage (clerkUserId)
        const clerkUserId = await localStorage.getAuthToken();

        // Set auth based on clerkUserId existence
        setIsAuthenticated(!!clerkUserId);

        // Load user data if clerkUserId exists
        if (clerkUserId) {
          await loadUserData();
        }
      } catch (error) {
        console.error("Error checking auth token:", error);
        setIsAuthenticated(false);
      }
    };

    initializeAuth();
  }, [checkAuthStatus, loadUserData, setIsAuthenticated]);

  // Show app only when fonts is loaded
  useEffect(() => {
    if (error) throw error;

    // Fetch Theme
    getTheme();

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error, getTheme]);

  if (!fontsLoaded) return null;

  return (
    <DatabaseProvider>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        <StatusBar
          style={colorScheme === "dark" ? "light" : "dark"}
          backgroundColor={colorScheme === "dark" ? "#0E0F0C" : "#FFFFFF"}
        />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      </ClerkProvider>
    </DatabaseProvider>
  );
}
