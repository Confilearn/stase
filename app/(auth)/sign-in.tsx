import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { useThemeStore } from "@/store/theme.store";
import { tokenStorage } from "@/utils/tokenStorage";
import { useAuth, useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
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
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { getToken } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState({ email: "", password: "" });

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

    setIsSubmitting(true);

    if (!isLoaded) return;

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

        router.replace("/(app)");
      }
    } catch (error: any) {
      console.log(error);
      // Clerk errors have an errors array with messages
      const clerkError = error?.errors?.[0]?.message || "Sign in failed. Please try again.";
      setError((prev) => ({ ...prev, password: clerkError }));
    } finally {
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
    </SafeAreaView>
  );
};

export default SignIn;
