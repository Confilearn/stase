import { useAuthStore } from "@/store/auth.store";
import { Redirect } from "expo-router";

const AuthIndex = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
};

export default AuthIndex;
