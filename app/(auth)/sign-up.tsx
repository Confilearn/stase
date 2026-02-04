import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import PinModal from "@/components/PinModal";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";
import { localStorage } from "@/utils/localStorage";
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
  const { updateUserFromAPI } = useUserStore();
  const { setIsAuthenticated } = useAuthStore();
  const router = useRouter();

  // Clerk hooks for authentication
  const { isLoaded, signUp } = useSignUp();
  const { getToken, userId } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<any>(null);
  const [pinSetupIncomplete, setPinSetupIncomplete] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });
  const [error, setError] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });

  // Handle PIN creation success
  const handlePinSuccess = async (pin: string) => {
    setIsCreatingPin(true);
    try {
      if (!createdUserData || !createdUserData.user.clerkUserId) {
        Alert.alert(
          "Error",
          "User data not found. Please try signing up again.",
        );
        setShowPinModal(false);
        return;
      }

      console.log(
        "Setting transaction PIN for user:",
        createdUserData.user.clerkUserId,
      );

      // Call API to set transaction PIN
      const response = await api.createUserTransactionPin(
        pin,
        createdUserData.user.clerkUserId,
      );

      if (response.success) {
        console.log("PIN set successfully:", response);

        // Update user data after successful PIN creation
        const updatedUserData = {
          ...createdUserData,
          user: {
            ...createdUserData.user,
          },
        };

        await updateUserFromAPI(updatedUserData);
        await localStorage.setUserData(updatedUserData);
        setIsAuthenticated(true);
        await localStorage.setAuthenticated(true);

        setShowPinModal(false);
        Alert.alert("Success", "Account created successfully!");
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
      Alert.alert(
        "Connection Error",
        "Unable to connect to server. Please check your connection and try again.",
      );
    } finally {
      setIsCreatingPin(false);
    }
  };

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
          const responseData = await api.createAccount(
            {
              firstName: form.firstName.toLowerCase().trim(),
              lastName: form.lastName.toLowerCase().trim(),
              username: form.username.toLowerCase().trim(),
              email: form.email.toLowerCase().trim(),
            },
            existingUserId,
          );

          if (responseData && responseData.user) {
            await updateUserFromAPI(responseData as any);
            setCreatedUserData(responseData);
            setShowPinModal(true);
            return;
          }
        } else {
          // User already exists locally, redirect to app
          Alert.alert("Info", "You're already signed in!");
          router.replace("/(app)");
          return;
        }
      }

      // If user is not signed in, create new user
      // Step 1: Create Clerk account
      const result = await signUp.create({
        emailAddress: form?.email,
        password: form?.password,
      });
      console.log("Clerk sign-up result:", result);

      // Step 2: Get and store the clerkUserId from the sign-up result
      const clerkUserId = result.createdUserId;
      if (clerkUserId) {
        await localStorage.setAuthToken(clerkUserId);
        console.log("ClerkUserId saved successfully:", clerkUserId);
      } else {
        console.warn("No clerkUserId received after account creation");
      }

      // Step 3: Create User in DB
      console.log("Creating user in database...");
      try {
        if (!clerkUserId) {
          throw new Error("No clerkUserId available for account creation");
        }

        const response = await api.createAccount(
          {
            firstName: form.firstName.toLowerCase().trim(),
            lastName: form.lastName.toLowerCase().trim(),
            username: form.username.toLowerCase().trim(),
            email: form.email.toLowerCase().trim(),
          },
          clerkUserId,
        );
        console.log("Database response:", response);

        // Step 4: Store user data in local store and storage
        if (response.user) {
          await updateUserFromAPI({
            user: response.user,
            bankAccounts: response.bankAccounts || [],
            transactions: response.transactions || [],
          });
          await localStorage.setUserData({
            user: response.user,
            bankAccounts: response.bankAccounts || [],
            transactions: response.transactions || [],
          });
          console.log("User data stored locally");

          // Step 5: Store user data and show PIN modal
          setCreatedUserData(response);
          console.log("About to show PIN modal...");
          setShowPinModal(true);
          console.log("PIN modal state set to true");
          // Note: setIsAuthenticated will be called only after PIN is successfully created
        } else {
          throw new Error("Failed to create account in database");
        }
      } catch (apiError: any) {
        console.error("API Error creating account:", apiError);
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
        className="flex-1"
      >
        <View className="flex-row gap-5 my-2 items-center">
          <Link href={"/welcome"}>
            <ChevronLeft />
          </Link>
          <Text className="text-2xl font-metropolis-bold text-content-100 dark:text-content-500">
            Create Account
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full flex gap-10 mt-7">
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
            style="mt-8 mb-2"
            onPress={submit}
            textStyle="text-secondary"
            isLoading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* PIN Creation Modal */}
      <PinModal
        visible={showPinModal}
        isLoading={isCreatingPin}
        onClose={() => {
          console.log("PIN modal onClose called");
          if (createdUserData) {
            Alert.alert(
              "PIN Required",
              "A transaction PIN is required to use the app. Do you want to complete PIN setup now?",
              [
                {
                  text: "Complete PIN Setup",
                  style: "cancel",
                  onPress: () => {
                    // Keep modal open
                    setShowPinModal(true);
                  },
                },
                {
                  text: "Skip for Now",
                  onPress: async () => {
                    // Store user data without PIN
                    await localStorage.setUserData({
                      ...createdUserData,
                      user: {
                        ...createdUserData.user,
                      },
                    });

                    setIsAuthenticated(true);
                    await localStorage.setAuthenticated(true);

                    setShowPinModal(false);
                    router.replace("/(app)");
                  },
                },
              ],
            );
          } else {
            setShowPinModal(false);
          }
        }}
        onSuccess={handlePinSuccess}
        title="Create your Stase PIN"
      />
    </SafeAreaView>
  );
};

export default SignUp;
