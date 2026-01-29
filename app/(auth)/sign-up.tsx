import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { useUserStore } from "@/store/user.store";
import { tokenStorage } from "@/utils/tokenStorage";
import { useAuth, useSignUp } from "@clerk/clerk-expo";
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

const signUpSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, "First name must be at least 3 characters.")
    .max(30, "First name must be 30 characters or less."),
  lastName: z
    .string()
    .trim()
    .min(3, "Last name must be at least 3 characters.")
    .max(30, "Last name must be 30 characters or less."),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or less.")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_.]*$/,
      "Username can only contain letters, numbers, '_' or '.', and must start with a letter.",
    ),
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

const SignUp = () => {
  const { setTheme } = useThemeStore();
  const { updateUserFromAPI } = useUserStore();
  const { setIsAuthenticated } = useAuthStore();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken, userId } = useAuth();

  const submit = async () => {
    setError({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    });

    const validation = signUpSchema.safeParse(form);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;

      const nextError = {
        firstName: fieldErrors.firstName?.[0] ?? "",
        lastName: fieldErrors.lastName?.[0] ?? "",
        username: fieldErrors.username?.[0] ?? "",
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
      };

      setError(nextError);
      return;
    }

    setIsSubmitting(true);

    if (!isLoaded) return;

    try {
      // Check if user is already signed in but missing local data
      const existingToken = await getToken();
      const existingUserId = userId;
      if (existingToken && existingUserId) {
        console.log("User already has token, checking if user data exists...");
        const { user } = useUserStore.getState();

        if (!user) {
          console.log(
            "Token exists but no local user data, creating user in DB...",
          );
          const response = await fetch("/api/createAccount", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${existingUserId}`,
            },
            body: JSON.stringify({
              firstName: form.firstName.toLowerCase().trim(),
              lastName: form.lastName.toLowerCase().trim(),
              username: form.username.toLowerCase().trim(),
              email: form.email.toLowerCase().trim(),
              clerkUserId: existingUserId,
            }),
          });

          const responseData = await response.json();

          if (response.status === 201) {
            await updateUserFromAPI(responseData);
            setIsAuthenticated(true);
            Alert.alert("Success", "Account setup completed!");
            router.replace("/(app)");
            return;
          }
        } else {
          // User already exists locally, redirect to app
          Alert.alert("Info", "You're already signed in!");
          router.replace("/(app)");
          return;
        }
      }

      // Step 1: Create Clerk account
      const result = await signUp.create({
        emailAddress: form?.email,
        password: form?.password,
      });

      console.log("Clerk account created:", result);

      // Step 2: Skip session activation for now, rely on token
      // if (result.createdSessionId) {
      //   await setActive({ session: result.createdSessionId });
      //   console.log("Session activated successfully");
      // }

      // Step 3: Get and store the clerkUserId (not the Clerk token)
      const clerkUserId = userId || result.createdUserId;
      if (clerkUserId) {
        await tokenStorage.saveToken(clerkUserId);
        console.log("ClerkUserId saved successfully");
      } else {
        console.warn("No clerkUserId received after account creation");
      }

      // Step 4: Create User in DB
      console.log("Creating user in database...");
      const response = await fetch("/api/createAccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clerkUserId && { Authorization: `Bearer ${clerkUserId}` }),
        },
        body: JSON.stringify({
          firstName: form.firstName.toLowerCase().trim(),
          lastName: form.lastName.toLowerCase().trim(),
          username: form.username.toLowerCase().trim(),
          email: form.email.toLowerCase().trim(),
          clerkUserId: result.createdUserId,
        }),
      });

      const responseData = await response.json();
      console.log("Database response:", response.status, responseData);

      if (response.status === 201) {
        // Step 5: Store user data in local store
        await updateUserFromAPI(responseData);
        console.log("User data stored locally");

        // Step 6: Set authentication status to allow navigation to protected routes
        setIsAuthenticated(true);
        console.log("Authentication status set to true");

        Alert.alert("Success", "Account created successfully!");
        router.replace("/(app)");
      } else {
        throw new Error("Failed to create account in database");
      }
    } catch (error: any) {
      console.error("Sign-up error:", error);

      // Handle different error types
      if (error.response?.data?.error) {
        Alert.alert("Error", error.response.data.error);
      } else if (error.errors?.[0]?.message) {
        Alert.alert("Error", error.errors[0].message);
      } else {
        Alert.alert("Error", "An unexpected error occurred during sign up.");
      }
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
              Create Account
            </Text>
          </View>

          <View className="w-full flex gap-12 mt-12">
            <CustomInput
              label={"First Name"}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, firstName: text }))
              }
              error={error.firstName}
            />
            <CustomInput
              label={"Last Name"}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, lastName: text }))
              }
              error={error.lastName}
            />
            <CustomInput
              label={"Username"}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, username: text }))
              }
              error={error.username}
            />
            <CustomInput
              label={"Email"}
              keyboardType={"email-address"}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, email: text }))
              }
              error={error.email}
            />
            <CustomInput
              label={"Password"}
              secureTextEntry={true}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, password: text }))
              }
              error={error.password}
            />
          </View>

          <View style={{ flex: 1 }} />

          <CustomButton
            title="Get Started"
            style="mt-8"
            onPress={submit}
            isLoading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
