import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import PinModal from "@/components/PinModal";
import { useThemeStore } from "@/store/theme.store";
import { useUserStore } from "@/store/user.store";
import { tokenStorage } from "@/utils/tokenStorage";
import { useAuth, useSignIn } from "@clerk/clerk-expo";
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
  const { setTheme } = useThemeStore();
  const { updateUserFromAPI } = useUserStore();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { getToken } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [signedInUserData, setSignedInUserData] = useState<any>(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState({ email: "", password: "" });

  // Handle PIN creation success
  const handlePinSuccess = async (pin: string) => {
    try {
      if (!signedInUserData || !signedInUserData.user.clerkUserId) {
        Alert.alert(
          "Error",
          "User data not found. Please try signing in again.",
        );
        return;
      }

      // Call API to set transaction PIN
      const response = await fetch("/api/createUserTransactionPin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${signedInUserData.user.clerkUserId}`,
        },
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        const pinData = await response.json();

        // Update user data with PIN status
        const updatedUserData = {
          ...signedInUserData,
          user: {
            ...signedInUserData.user,
            hasTransactionPin: true,
          },
        };

        await updateUserFromAPI(updatedUserData);

        setShowPinModal(false);
        Alert.alert("Success", "PIN created successfully!");
        router.replace("/(app)");
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.error || "Failed to set PIN. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error setting PIN:", error);
      Alert.alert("Error", "Failed to set PIN. Please try again.");
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
          await tokenStorage.saveToken(token);
        }

        // Check if user has transaction PIN
        try {
          const response = await fetch("/api/checkTransactionPin", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();

            // Get user data from getUserData endpoint
            const userResponse = await fetch("/api/getUserData", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                clerkUserId: token,
              }),
            });

            if (userResponse.status === 200) {
              const userData = await userResponse.json();
              await updateUserFromAPI(userData);
              setSignedInUserData(userData);

              if (data.hasTransactionPin) {
                // User has PIN, redirect to app
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
          } else {
            // If check fails, redirect to app anyway (fallback)
            router.replace("/(app)");
          }
        } catch (error) {
          console.error("Error checking PIN status:", error);
          // If there's an error, redirect to app anyway (fallback)
          router.replace("/(app)");
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
        >
          <View className="flex-row gap-5 mt-4 items-center">
            <Link href={"/welcome"}>
              <ChevronLeft />
            </Link>
            <Text
              onPress={() => setTheme("system")}
              className="text-2xl font-metropolis-semibold text-content-100 dark:text-content-500"
            >
              Sign In
            </Text>
          </View>

          <View className="w-full flex gap-12 mt-12">
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
            style="mt-8"
            onPress={submit}
            isLoading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* PIN Creation Modal */}
      <PinModal
        visible={showPinModal}
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
