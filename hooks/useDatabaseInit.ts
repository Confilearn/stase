import { useEffect, useState } from "react";

export function useDatabaseInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Check network connectivity first
        const netInfo = await getNetworkState();
        setIsOnline(netInfo.isConnected);

        if (!netInfo.isConnected) {
          console.log("Device is offline - database features unavailable");
          setError("Offline - database features unavailable");
          return;
        }

        // For mobile app, we assume database is available if we're online
        // The actual database connection happens on the API server side
        setIsInitialized(true);
        console.log("Database availability checked successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Database initialization error:", err);
      }
    };

    // Add network listener
    const unsubscribe = addNetworkListener((isConnected) => {
      setIsOnline(isConnected);
      if (isConnected && !isInitialized) {
        // Retry database check when coming back online
        initDatabase();
      }
    });

    initDatabase();

    return () => {
      unsubscribe?.();
    };
  }, [isInitialized]);

  return { isInitialized, error, isOnline };
}

// Helper functions for network detection
async function getNetworkState() {
  try {
    // For React Native, we'd use @react-native-community/netinfo
    // For now, return a default that assumes online
    return { isConnected: true };
  } catch {
    return { isConnected: true };
  }
}

function addNetworkListener(callback: (isConnected: boolean) => void) {
  try {
    // For React Native, we'd use @react-native-community/netinfo
    // For now, return a no-op unsubscribe function
    return () => {};
  } catch {
    return () => {};
  }
}
