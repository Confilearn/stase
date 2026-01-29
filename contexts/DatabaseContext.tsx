import { useDatabaseInit } from "@/hooks/useDatabaseInit";
import React, { createContext, ReactNode, useContext } from "react";

interface DatabaseContextType {
  isInitialized: boolean;
  isOnline: boolean;
  error: string | null;
  isDatabaseAvailable: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined,
);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { isInitialized, error, isOnline } = useDatabaseInit();

  // Database is available if we're online and initialization succeeded
  const isDatabaseAvailable = isInitialized && isOnline && !error;

  return (
    <DatabaseContext.Provider
      value={{
        isInitialized,
        isOnline,
        error,
        isDatabaseAvailable,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
