import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import PinModal from "@/components/PinModal";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { useUserStore } from "@/store/user.store";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const googleOauthSchema = z.object({
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
});

const GoogleOauth = () => {
  const { setTheme } = useThemeStore();
  const { updateUserFromAPI } = useUserStore();
  const { setIsAuthenticated } = useAuthStore();
  const router = useRouter();

  // Clerk hooks for authentication and user data
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { getToken, userId } = useAuth();

  // Form state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [error, setError] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });

  /**
   * Initialize form with Clerk user data when component mounts or user data changes
   * This pre-fills the email and makes it read-only, and pre-fills name if available
   */
  useEffect(() => {
    console.log("GoogleOauth: useEffect triggered", {
      isLoaded,
      isSignedIn,
      user: !!user,
    });

    if (isLoaded) {
      setIsLoading(false);

      if (isSignedIn && user) {
        // Extract user data from Clerk
        const clerkEmail = user.emailAddresses[0]?.emailAddress || "";
        const clerkFirstName = user.firstName || "";
        const clerkLastName = user.lastName || "";

        console.log("GoogleOauth: Setting form with Clerk data", {
          clerkEmail,
          clerkFirstName,
          clerkLastName,
        });

        // Update form with Clerk data
        setForm((prev) => ({
          ...prev,
          email: clerkEmail,
          firstName: clerkFirstName,
          lastName: clerkLastName,
        }));
      } else if (!isSignedIn) {
        console.log("GoogleOauth: User not signed in, redirecting to sign-up");
        // If user is not signed in, redirect to sign-up page
        router.replace("/(auth)/sign-up");
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  /**
   * Handle PIN creation success after user completes PIN setup
   * This follows the same flow as regular sign-up
   */
  const handlePinSuccess = async (pin: string) => {
    setIsCreatingPin(true);
    try {
      if (!createdUserData || !createdUserData.user.clerkUserId) {
        Alert.alert("Error", "User data not found. Please try again.");
        setShowPinModal(false);
        return;
      }

      console.log(
        "Setting transaction PIN for Google OAuth user:",
        createdUserData.user.clerkUserId,
      );

      // Call API to set transaction PIN
      const response = await fetch("/api/createUserTransactionPin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${createdUserData.user.clerkUserId}`,
        },
        body: JSON.stringify({ pin }),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log(
          "PIN set successfully for Google OAuth user:",
          responseData,
        );

        // Update user data with PIN status
        const updatedUserData = {
          ...createdUserData,
          user: {
            ...createdUserData.user,
            hasTransactionPin: true,
          },
        };

        await updateUserFromAPI(updatedUserData);
        setIsAuthenticated(true);

        setShowPinModal(false);
        Alert.alert("Success", "Account created successfully!");
        router.replace("/(app)");
      } else {
        console.error("PIN API error:", responseData);
        Alert.alert(
          "Error",
          responseData.error || "Failed to set PIN. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error setting PIN for Google OAuth user:", error);
      Alert.alert(
        "Connection Error",
        "Unable to connect to server. Please check your connection and try again.",
      );
    } finally {
      setIsCreatingPin(false);
    }
  };

  /**
   * Handle form submission for Google OAuth completion
   * Creates user account in database and initiates PIN setup flow
   */
  const submit = async () => {
    // Reset error states
    setError({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
    });

    // Validate form data
    const validation = googleOauthSchema.safeParse(form);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;

      const nextError = {
        firstName: fieldErrors.firstName?.[0] ?? "",
        lastName: fieldErrors.lastName?.[0] ?? "",
        username: fieldErrors.username?.[0] ?? "",
        email: fieldErrors.email?.[0] ?? "",
      };

      setError(nextError);
      return;
    }

    // Ensure user is authenticated with Clerk
    if (!isLoaded || !isSignedIn || !user) {
      Alert.alert("Error", "Please sign in with Google first.");
      router.replace("/(auth)/sign-in");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get Clerk user ID for database creation
      const clerkUserId = userId || user.id;

      if (!clerkUserId) {
        throw new Error("No Clerk user ID found");
      }

      console.log("Creating Google OAuth user in database...");

      // Create user account in database
      const response = await fetch("/api/createAccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkUserId}`,
        },
        body: JSON.stringify({
          firstName: form.firstName.toLowerCase().trim(),
          lastName: form.lastName.toLowerCase().trim(),
          username: form.username.toLowerCase().trim(),
          email: form.email.toLowerCase().trim(),
          clerkUserId: clerkUserId,
        }),
      });

      const responseData = await response.json();
      console.log("Database response:", response.status, responseData);

      if (response.status === 201) {
        // Store user data in local store
        await updateUserFromAPI(responseData);
        console.log("Google OAuth user data stored locally");

        // Store user data and show PIN modal
        setCreatedUserData(responseData);
        console.log("About to show PIN modal for Google OAuth user...");
        setShowPinModal(true);
        // Note: setIsAuthenticated will be called only after PIN is successfully created
      } else if (response.status === 409) {
        // User already exists, redirect to sign-in
        Alert.alert(
          "Account Exists",
          "An account with this email already exists. Please sign in.",
        );
        router.replace("/(auth)/sign-in");
      } else {
        throw new Error("Failed to create account in database");
      }
    } catch (error: any) {
      console.error("Google OAuth completion error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark p-4 relative">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-content-100 dark:text-content-500">
            Loading...
          </Text>
        </View>
      ) : (
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
                Complete Your Profile
              </Text>
            </View>

            <View className="w-full flex gap-12 mt-12">
              <CustomInput
                label={"First Name"}
                value={form.firstName}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, firstName: text }))
                }
                error={error.firstName}
              />
              <CustomInput
                label={"Last Name"}
                value={form.lastName}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, lastName: text }))
                }
                error={error.lastName}
              />
              <CustomInput
                label={"Username"}
                value={form.username}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, username: text }))
                }
                error={error.username}
              />
              <CustomInput
                label={"Email"}
                value={form.email}
                editable={false}
                error={error.email}
              />
            </View>

            <View style={{ flex: 1 }} />

            <CustomButton
              title="Complete Setup"
              style="mt-8"
              onPress={submit}
              isLoading={isSubmitting}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* PIN Creation Modal - Same as regular sign-up */}
      <PinModal
        visible={showPinModal}
        isLoading={isCreatingPin}
        onClose={() => {
          console.log("PIN modal onClose called for Google OAuth");
          setShowPinModal(false);
          // Optional: You might want to handle what happens when user closes the modal
        }}
        onSuccess={handlePinSuccess}
        title="Create your Stase PIN"
      />
    </SafeAreaView>
  );
};

export default GoogleOauth;
