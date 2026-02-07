import CustomButton from "@/components/CustomButton";
import CurrencyModal from "@/components/CurrencyModal";
import PinModal from "@/components/PinModal";
import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";
import { localStorage } from "@/utils/localStorage";
import { Link, router } from "expo-router";
import { ArrowDown2, ArrowRight2, Bank, Clock } from "iconsax-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  const { user, bankAccounts, updateUserFromAPI } = useUserStore();
  const [showPinModal, setShowPinModal] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedSymbol, setSelectedSymbol] = useState("$");
  const [selectedBalance, setSelectedBalance] = useState(0);
  const colorMode = useColorScheme();

  // Check if user needs to set up PIN when component mounts
  useEffect(() => {
    checkPinSetup();

    console.log(bankAccounts);
  }, []);

  const checkPinSetup = async () => {
    try {
      // Get current user data from local storage
      const localUserData = await localStorage.getUserData();
      if (!localUserData || !localUserData.user) return;

      // Check if user has PIN by calling the API
      try {
        const response = await api.checkTransactionPin(
          localUserData.user.clerkUserId,
        );
        if (response.success && !response.hasTransactionPin) {
          // User doesn't have PIN, show modal
          setShowPinModal(true);
        }
      } catch (error) {
        console.error("Error checking PIN status:", error);
        // If API fails, don't show modal
      }

      // User data loaded successfully
      setUserData(localUserData);
    } catch (error) {
      console.error("Error in checkPinSetup:", error);
    }
  };

  const handlePinSuccess = async (pin: string) => {
    setIsCreatingPin(true);
    try {
      if (!userData || !userData.user.clerkUserId) {
        Alert.alert(
          "Error",
          "User data not found. Please try signing in again.",
        );
        setShowPinModal(false);
        return;
      }

      console.log(
        "Setting transaction PIN for user:",
        userData.user.clerkUserId,
      );

      // Call API to set transaction PIN
      const response = await api.createUserTransactionPin(
        pin,
        userData.user.clerkUserId,
      );

      if (response.success) {
        console.log("PIN set successfully:", response);

        // Update user data after PIN creation
        const updatedUserData = {
          ...userData,
          user: {
            ...userData.user,
          },
        };

        await updateUserFromAPI(updatedUserData);
        await localStorage.setUserData(updatedUserData);
        setUserData(updatedUserData);

        setShowPinModal(false);
        Alert.alert("Success", "PIN created successfully!");
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

  return (
    <SafeAreaView className="container">
      {/* Header */}
      <View className="flex-row my-2 items-center justify-between">
        <TouchableOpacity
          className="px-3 py-2.5 flex justify-center items-center bg-secondary rounded-full"
          onPress={() => {
            router.push("/(app)/profile");
          }}
        >
          <Text className="text-center text-lg font-metropolis-semibold text-primary">
            CE
          </Text>
        </TouchableOpacity>
        <Link
          href="/referral"
          className="px-4 py-2 bg-primary rounded-full active:opacity-80"
        >
          <Text className="text-center text-lg font-metropolis-semibold text-secondary">
            Earn £500
          </Text>
        </Link>
      </View>

      {/* Balance Pill */}
      <View className="flex gap-5 mt-14">
        <TouchableOpacity
          className="border-gray-300 dark:border-gray-600 border-[0.5px] px-3 py-2 rounded-full max-w-[86px] w-full mx-auto flex-row items-center justify-between"
          onPress={() => setShowCurrencyModal(true)}
        >
          <Text className="text-[13px] font-metropolis-semibold default-text-color">
            {selectedCurrency}
          </Text>
          <ArrowDown2
            size={20}
            color={colorMode === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
        {/* Balance Display */}
        <View className="mt-6">
          <Text className="text-center text-7xl font-metropolis-bold text-content-100 dark:text-content-500">
            {selectedSymbol}
            {selectedBalance.toLocaleString()}
            <Text className="text-3xl font-metropolis-semibold text-content-100 dark:text-content-500">
              .00
            </Text>
          </Text>
        </View>
        {/* Account Details Button */}
        <TouchableOpacity
          className="bg-primary rounded-full px-4 py-2 max-w-[210px] w-full mx-auto flex-row items-center justify-around gap-2"
          onPress={() => {
            router.push(`/(app)/bankDetails/${selectedCurrency}`);
          }}
        >
          <Bank size="20" color="#0A385D" variant="Outline" />
          <Text className="text-center text-secondary font-metropolis-semibold text-lg">
            Account details
          </Text>
          <ArrowRight2 size="20" color="#0A385D" variant="Outline" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="mt-16 flex-row items-center justify-between">
        <TouchableOpacity
          className="bg-primary rounded-full px-5 py-3"
          onPress={() => {
            router.push("/(app)/transfer");
          }}
        >
          <Text className="text-center text-secondary font-metropolis-semibold text-[15px]">
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-secondary rounded-full px-5 py-3"
          onPress={() => {
            router.push("/(app)/deposit");
          }}
        >
          <Text className="text-center text-primary font-metropolis-semibold text-[15px]">
            Add Money
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-secondary rounded-full px-5 py-3"
          onPress={() => {
            router.push("/(app)/withdraw");
          }}
        >
          <Text className="text-center text-primary font-metropolis-semibold text-[15px]">
            Withdraw
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions Section */}
      <View className="mt-16 flex-row items-center justify-between">
        <Text className="default-text-color font-metropolis-semibold text-2xl">
          Transactions
        </Text>
        <Link
          href="/(app)/(tabs)/history"
          className="default-text-color font-metropolis-semibold text-lg"
        >
          View all
        </Link>
      </View>
      {/* Transactions List */}
      <View className="flex-1 items-center justify-center gap-2">
        <Clock size="75" color="#6A6C6A" variant="Outline" />
        <Text className="text-content-300 font-metropolis-semibold text-lg">
          No transactions yet
        </Text>
      </View>

      {/* Currency Modal */}
      <CurrencyModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        onCurrencySelect={(account) => {
          setSelectedCurrency(account.accountCurrency);
          setSelectedSymbol(
            account.accountCurrency === "EUR"
              ? "€"
              : account.accountCurrency === "GBP"
                ? "£"
                : "$",
          );
          setSelectedBalance(account.balance);
        }}
        selectedCurrency={selectedCurrency}
        bankAccounts={bankAccounts}
      />

      {/* PIN Creation Modal */}
      <PinModal
        visible={showPinModal}
        isLoading={isCreatingPin}
        onClose={() => {
          Alert.alert(
            "PIN Required",
            "A transaction PIN is required for transactions. You can set it up later in Settings.",
            [
              {
                text: "Set PIN Now",
                style: "cancel",
                onPress: () => {
                  // Keep modal open
                  setShowPinModal(true);
                },
              },
              {
                text: "Later",
                onPress: () => {
                  setShowPinModal(false);
                },
              },
            ],
          );
        }}
        onSuccess={handlePinSuccess}
        title="Create your Stase PIN"
      />
    </SafeAreaView>
  );
};

export default index;
