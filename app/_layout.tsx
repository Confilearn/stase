import { useThemeStore } from "@/store/theme.store";
import { tokenStorage } from "@/utils/tokenStorage";
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import "./global.css";

export default function RootLayout() {
  const { getTheme } = useThemeStore()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Import fonts
  const [fontsLoaded, error] = useFonts({
    "metropolis-extra-bold": require("../assets/fonts/metropolis-extra-bold.otf"),
    "metropolis-bold": require("../assets/fonts/metropolis-bold.otf"),
    "metropolis-semi-bold": require("../assets/fonts/metropolis-semi-bold.otf"),
    "metropolis-medium": require("../assets/fonts/metropolis-medium.otf"),
  });

  // Fetch token from AsyncStorage on app start
  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await tokenStorage.getToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking auth token:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthToken();
  }, []);

  // Show app only when fonts is loaded
  useEffect(() => {
    if (error) throw error;

    // Fetch Theme
    getTheme()

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);


  if (!fontsLoaded || isAuthenticated === null) return null;

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </ClerkProvider>
  );
}
