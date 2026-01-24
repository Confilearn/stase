import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "./global.css";

export default function RootLayout() {
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

    if (fontsLoaded) SplashScreen.hideAsync;
  }, [fontsLoaded, error]);


  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
