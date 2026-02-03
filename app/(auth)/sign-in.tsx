import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import PinModal from "@/components/PinModal";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";
import { localStorage } from "@/utils/localStorage";
import { useAuth, useOAuth, useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters."),
});

const SignIn = () => {
  const { updateUserFromAPI } = useUserStore();
  const { setIsAuthenticated } = useAuthStore();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { getToken, userId } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [signedInUserData, setSignedInUserData] = useState<any>(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState({ email: "", password: "" });

  // Handle PIN creation success
  const handlePinSuccess = async (pin: string) => {
    setIsCreatingPin(true);
    try {
      if (!signedInUserData || !signedInUserData.user.clerkUserId) {
        Alert.alert(
          "Error",
          "User data not found. Please try signing in again.",
        );
        setShowPinModal(false);
        return;
      }

      console.log(
        "Setting transaction PIN for user:",
        signedInUserData.user.clerkUserId,
      );

      // Call API to set transaction PIN
      const response = await api.createUserTransactionPin(
        pin,
        signedInUserData.user.clerkUserId,
      );

      if (response.success) {
        console.log("PIN set successfully for sign-in user:", response);

        // Update user data with PIN status
        const updatedUserData = {
          ...signedInUserData,
          user: {
            ...signedInUserData.user,
            hasTransactionPin: true,
          },
        };

        await updateUserFromAPI(updatedUserData);
        await localStorage.setUserData(updatedUserData);
        setIsAuthenticated(true);
        await localStorage.setAuthenticated(true);

        setShowPinModal(false);
        Alert.alert("Success", "PIN created successfully!");
        router.replace("/(app)");
      } else {
        console.error("PIN API error:", response);
        Alert.alert(
          "Error",
          response.error || "Failed to set PIN. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error setting PIN:", error);
    } finally {
      setIsCreatingPin(false);
    }
  };

  const submit = async () => {
    // reset any previous errors
    setError({ email: "", password: "" });

    const validation = signInSchema.safeParse(form);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;

      const nextError = {
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
      };

      setError(nextError);
      return;
    }

    if (!isLoaded) return;

    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        // Get and store the token
        const token = await getToken();
        if (token) {
          await localStorage.setAuthToken(token);
        }

        // Get the clerkUserId for API calls
        const clerkUserId = userId;
        if (!clerkUserId) {
          throw new Error("Failed to get user ID from authentication");
        }

        // Check if user has transaction PIN
        try {
          const response = await api.checkTransactionPin(clerkUserId);

          if (response.success !== undefined) {
            // Get user data from getUserData endpoint
            try {
              const userData = await api.getUserData(clerkUserId);

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
                setSignedInUserData(userData);

                if (response.success) {
                  // User has PIN, set authentication and redirect to app
                  setIsAuthenticated(true);
                  await localStorage.setAuthenticated(true);

                  router.replace("/(app)");
                } else {
                  // User doesn't have PIN, show PIN modal
                  setShowPinModal(true);
                }
              } else {
                // Handle case where user data doesn't exist
                Alert.alert(
                  "Error",
                  "User account not found. Please sign up first.",
                );
              }
            } catch (userError) {
              console.error("Error getting user data:", userError);
              // If check fails, redirect to app anyway (fallback)
              await setIsAuthenticated(true);
              await localStorage.setAuthenticated(true);
              router.replace("/(app)");
            }
          } else {
            // If check fails, redirect to app anyway (fallback)
            await setIsAuthenticated(true);
            await localStorage.setAuthenticated(true);
            router.replace("/(app)");
          }
        } catch (error) {
          console.error("Error checking PIN status:", error);
          // If there's an error, try to get user data anyway
          try {
            const userData = await api.getUserData(clerkUserId);
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
              setSignedInUserData(userData);

              // Check if user has PIN based on local data
              if (userData.user.hasTransactionPin) {
                await setIsAuthenticated(true);
                await localStorage.setAuthenticated(true);
                router.replace("/(app)");
              } else {
                setShowPinModal(true);
              }
            } else {
              // Fallback: redirect to app
              await setIsAuthenticated(true);
              await localStorage.setAuthenticated(true);
              router.replace("/(app)");
            }
          } catch (fallbackError) {
            console.error("Fallback error:", fallbackError);
            // If all fails, redirect to app anyway
            await setIsAuthenticated(true);
            await localStorage.setAuthenticated(true);
            router.replace("/(app)");
          }
        }
      }
    } catch (error: any) {
      console.log(error);
      // Clerk errors have an errors array with messages
      const clerkError =
        error?.errors?.[0]?.message || "Sign in failed. Please try again.";
      setError((prev) => ({ ...prev, password: clerkError }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark p-4 relative">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="h-full"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row gap-5 mt-2 items-center">
            <Link href={"/welcome"}>
              <ChevronLeft />
            </Link>
            <Text className="text-2xl font-metropolis-semibold text-content-100 dark:text-content-500">
              Sign In
            </Text>
          </View>

          <View className="w-full flex gap-12 mt-10">
            <CustomInput
              label={"Email"}
              value={form.email}
              keyboardType={"email-address"}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, email: text }))
              }
              error={error.email}
            />
            <CustomInput
              label={"Password"}
              value={form.password}
              secureTextEntry={true}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, password: text }))
              }
              error={error.password}
            />
          </View>

          <View style={{ flex: 1 }} />

          <CustomButton
            title="Log in"
            style="mt-8 mb-2"
            onPress={submit}
            isLoading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* PIN Creation Modal */}
      <PinModal
        visible={showPinModal}
        isLoading={isCreatingPin}
        onClose={() => {
          setShowPinModal(false);
          // Optional: You might want to handle what happens when user closes the modal
          // For now, we'll just close it without redirecting
        }}
        onSuccess={handlePinSuccess}
        title="Create your Stase PIN"
      />
    </SafeAreaView>
  );
};

export default SignIn;
