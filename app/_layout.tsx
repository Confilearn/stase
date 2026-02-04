import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";
import { localStorage } from "@/utils/localStorage";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "./global.css";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

// Wrapper component to handle Clerk auth and user data fetching
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const { updateUserFromAPI } = useUserStore();
  const { setIsAuthenticated } = useAuthStore();

  // Fetch user data when user is signed in
  useEffect(() => {
    const handleAuth = async () => {
      if (userId && isSignedIn && isLoaded) {
        try {
          const userData = await api.fetchUserDetails(userId);

          if (userData.user) {
            await updateUserFromAPI({
              user: userData.user,
              bankAccounts: userData.bankAccounts || [],
              transactions: userData.transactions || [],
            });
            await localStorage.setUserData({
              user: userData.user,
              bankAccounts: userData.bankAccounts || [],
              transactions: userData.transactions || [],
            });
            await localStorage.setAuthToken(userId);
            setIsAuthenticated(true);
            await localStorage.setAuthenticated(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else if (isLoaded && !isSignedIn) {
        // User is not signed in, ensure authentication state is false
        setIsAuthenticated(false);
        await localStorage.setAuthenticated(false);
      }
    };
    handleAuth();
  }, [userId, isSignedIn, isLoaded, updateUserFromAPI, setIsAuthenticated]);

  return <>{children}</>;
}

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
        <AuthWrapper>
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
        </AuthWrapper>
      </ClerkProvider>
    </DatabaseProvider>
  );
}
