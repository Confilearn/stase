import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { useThemeStore } from "@/store/theme.store";
import { tokenStorage } from "@/utils/tokenStorage";
import { useAuth, useSignUp } from "@clerk/clerk-expo";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useColorScheme,
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
  const colorScheme = useColorScheme();
  const { setTheme } = useThemeStore();
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
  const { getToken } = useAuth();

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
      const result = await signUp.create({
        emailAddress: form?.email,
        password: form?.password,
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
      console.log(result);
    } catch (error: any) {
      console.log(error);
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
              <Fontisto
                name="angle-left"
                size={20}
                color={colorScheme === "dark" ? "white" : "black"}
              />
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
