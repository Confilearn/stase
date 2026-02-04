import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { useAuthStore } from "@/store/auth.store";
import { localStorage } from "@/utils/localStorage";
import { useSignIn } from "@clerk/clerk-expo";
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
  const { setIsAuthenticated } = useAuthStore();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState({ email: "", password: "" });

  const submit = async () => {
    console.log("Submit function called");
    console.log("Form data:", form);
    console.log("isLoaded:", isLoaded);

    // reset any previous errors
    setError({ email: "", password: "" });

    const validation = signInSchema.safeParse(form);
    console.log("Validation result:", validation);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;

      const nextError = {
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
      };

      setError(nextError);
      return;
    }

    if (!isLoaded) {
      console.log("SignIn not loaded yet");
      return;
    }

    console.log("Starting sign-in process...");
    setIsSubmitting(true);

    try {
      console.log("Calling signIn.create...");
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      console.log("Sign-in result:", result.status);

      if (result.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId });

        // Set authentication state
        setIsAuthenticated(true);
        await localStorage.setAuthenticated(true);

        console.log(
          "Authentication successful, waiting for state update before redirect",
        );

        // Small delay to ensure authentication state is updated
        setTimeout(() => {
          console.log("Redirecting to home");
          router.replace("/(app)/(tabs)");
        }, 500);
      }
    } catch (error: any) {
      console.log("Sign-in error:", error);
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
            <Text className="text-2xl font-metropolis-bold text-content-100 dark:text-content-500">
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
            textStyle="text-secondary"
            onPress={submit}
            isLoading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
