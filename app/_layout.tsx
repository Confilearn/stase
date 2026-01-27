import { useThemeStore } from "@/store/theme.store";
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "./global.css";

export default function RootLayout() {
  const { getTheme } = useThemeStore()

  // Import fonts
  const [fontsLoaded, error] = useFonts({
    "metropolis-extra-bold": require("../assets/fonts/metropolis-extra-bold.otf"),
    "metropolis-bold": require("../assets/fonts/metropolis-bold.otf"),
    "metropolis-semi-bold": require("../assets/fonts/metropolis-semi-bold.otf"),
    "metropolis-medium": require("../assets/fonts/metropolis-medium.otf"),
  });

  // Show app only when fonts is loaded
  useEffect(() => {
    if (error) throw error;

    // Fetch Theme
    getTheme()

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);


  if (!fontsLoaded) return null;

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Protected guard={false}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={false}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </ClerkProvider>
  );
}
