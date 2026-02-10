import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import { Link, useRouter } from "expo-router";
import { ArrowDown2 } from "iconsax-react-native";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import cn from "clsx";
import ConfirmPinModal from "@/components/ConfirmPinModal";
import SuccessModal from "@/components/SuccessModal";
import CurrencyModal from "@/components/CurrencyModal";
import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";
import { checkAndNavigateToOffline } from "@/utils/offlineDetection";

const convert = () => {
  const colorMode = useColorScheme();
  const router = useRouter();
  const { user, bankAccounts, updateUserFromAPI } = useUserStore();

  const onChangeText = (text: string) => {
    setText(text);
    setError(""); // Clear error when user types
    setReceiverInfo(""); // Clear receiver info when user types
    setVerifiedUser(null); // Clear verified user when user types

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer to check user after 500ms of inactivity
    if (text.trim()) {
      const timer = setTimeout(() => {
        checkUser(text.trim(), user?.clerkUserId);
      }, 500);
      setDebounceTimer(timer);
    }
  };

  const onChangeNum = (text: string) => {
    setAmount(text);
    setError(""); // Clear error when user types
  };

  const [text, setText] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [receiverInfo, setReceiverInfo] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [isConfirmingPin, setisConfirmingPin] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(
    bankAccounts[0] || null,
  );
  const [debounceTimer, setDebounceTimer] = useState<
    number | NodeJS.Timeout | null
  >(null);

  const handleCurrencySelect = (account: any) => {
    setSelectedAccount(account);
  };

  const formatBalance = (balance: number, currency: string) => {
    const symbol = currencySymbols[currency] || "";
    return `${symbol}${balance.toLocaleString()}`;
  };

  // Currency symbols mapping
  const currencySymbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    CAD: "$",
  };

  const checkUser = async (emailOrUsername: string, clerkUserId?: string) => {
    if (!emailOrUsername.trim() || !clerkUserId) return;

    // Check network connectivity before making API calls
    const isOfflineMode = await checkAndNavigateToOffline(router);
    if (isOfflineMode) {
      setIsCheckingUser(false);
      return;
    }

    setIsCheckingUser(true);
    try {
      const response = await api.checkUser(emailOrUsername, clerkUserId);

      if (response.success && response.data) {
        const userData = response.data;

        // Check if user is trying to send money to themselves
        if (
          userData.email === user?.email ||
          userData.username === user?.username
        ) {
          setReceiverInfo("");
          setVerifiedUser(null);
          setError("You cannot send money to yourself");
          return;
        }

        const fullName = `${userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase()} ${userData.lastName.charAt(0).toUpperCase() + userData.lastName.slice(1).toLowerCase()}`;
        setReceiverInfo(fullName);
        setVerifiedUser(userData);
        setError("");
      } else {
        setReceiverInfo("");
        setVerifiedUser(null);
        setError(response.message || response.error || "User not found");
      }
    } catch (err: any) {
      console.error("Check user error:", err);
      setReceiverInfo("");
      setVerifiedUser(null);
      setError(err.message || "Failed to verify user");
    } finally {
      setIsCheckingUser(false);
    }
  };

  const validateTransfer = () => {
    const numAmount = parseFloat(amount);

    if (!text.trim()) {
      setError("Please enter recipient's email or username");
      return false;
    }

    if (!verifiedUser) {
      setError("Please verify the recipient before continuing");
      return false;
    }

    if (!selectedAccount) {
      setError("Please select an account");
      return false;
    }

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    if (numAmount > selectedAccount.balance) {
      setError("Insufficient funds");
      return false;
    }

    if (numAmount > 100000) {
      setError("Maximum transfer limit is 100,000 per transaction");
      return false;
    }

    return true;
  };

  const handlePinSuccess = async (pin: string) => {
    setisConfirmingPin(true);

    try {
      // Check network connectivity before making API calls
      const isOfflineMode = await checkAndNavigateToOffline(router);
      if (isOfflineMode) {
        setisConfirmingPin(false);
        return;
      }

      if (!user || !verifiedUser) {
        throw new Error("User information missing");
      }

      // Validate PIN with backend first
      const pinValidation = await api.validateTransactionPin(
        pin,
        user.clerkUserId,
      );

      if (!pinValidation.success) {
        setError(pinValidation.error || "Invalid PIN. Please try again.");
        setShowPinModal(false);
        return;
      }

      // PIN is valid, proceed with transfer
      const transferData = {
        amount: parseFloat(amount),
        accountCurrency: selectedAccount.accountCurrency,
        accountNumber: selectedAccount.accountNumber,
        email: verifiedUser.email,
        username: verifiedUser.username,
        transactionPin: pin,
      };

      const response = await api.transferMoney(transferData, user.clerkUserId);

      if (response.success) {
        const symbol = currencySymbols[selectedAccount.accountCurrency] || "";
        const fullName = `${verifiedUser.firstName} ${verifiedUser.lastName}`;
        const capitalizedFullName = fullName
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ");
        const successMessage = `${symbol}${parseFloat(amount).toLocaleString()} sent to ${capitalizedFullName}`;

        // Update user store with data from backend response
        if (response.user && response.bankAccounts && response.transactions) {
          await updateUserFromAPI({
            user: response.user,
            bankAccounts: response.bankAccounts,
            transactions: response.transactions,
          });
        }

        setSuccessMessage(successMessage);
        setShowPinModal(false);
        setShowSuccessModal(true);
        // Reset form
        setText("");
        setAmount("");
        setReceiverInfo("");
        setVerifiedUser(null);
        setError("");
      } else {
        throw new Error(response.error || "Transfer failed");
      }
    } catch (err: any) {
      console.error("Transfer error:", err);
      setError(err.message || "Transaction failed. Please try again.");
      setShowPinModal(false);
    } finally {
      setisConfirmingPin(false);
    }
  };

  const handleClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
    // Navigate back to home screen
    router.push("/(app)/(tabs)");
  };

  const handleContinue = () => {
    if (!validateTransfer()) return;
    setShowPinModal(true);
  };

  return (
    <>
      <SafeAreaView className="container">
        <View className="flex-row gap-5 mt-2 items-center">
          <Link href={"/(app)/(tabs)"}>
            <ChevronLeft />
          </Link>
          <Text className="text-2xl font-metropolis-bold text-content-100 dark:text-content-500">
            Send Money
          </Text>
        </View>

        {/* Receiver Input */}
        <View className="mt-16">
          <TextInput
            className={cn(
              "px-4 py-6 rounded-xl text-[18px] text-content-200 dark:text-content-400 font-metropolis-semibold",
              isFocused
                ? "border-primary dark:border-primary border-[1.5px]"
                : "border-gray-300 dark:border-gray-600 border-[0.5px]",
            )}
            value={text}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChangeText}
            keyboardType="default"
            editable={!isCheckingUser}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter email or username"
            placeholderTextColor="#6A6C6A"
          />
        </View>

        {/* Loading indicator */}
        {isCheckingUser && (
          <Text className="text-[14px] text-primary font-metropolis-semibold mt-5">
            Verifying user...
          </Text>
        )}

        {/* Receiver Info */}
        {receiverInfo && (
          <Text className="text-[16px] text-primary font-metropolis-semibold mt-5">
            {receiverInfo}
          </Text>
        )}

        {/* Error message */}
        {error && (
          <Text className="text-[14px] text-error font-metropolis-semibold mt-5">
            {error}
          </Text>
        )}

        {/* Currency selector*/}
        <View className="mt-16 relative flex-row items-center gap-2 justify-between">
          <TouchableOpacity
            className="border-gray-300 dark:border-gray-600 border-[0.5px] px-3 py-2 rounded-full max-w-[75px] w-full flex-row items-center justify-between"
            onPress={() => setShowCurrencyModal(true)}
          >
            <Text className="text-[12px] font-metropolis-semibold default-text-color">
              {selectedAccount?.accountCurrency || "GBP"}
            </Text>
            <ArrowDown2
              size={20}
              color={colorMode === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>

          {/* Amount */}
          <TextInput
            className={cn(
              "text-5xl font-metropolis-bold",
              error ? "text-error" : "text-primary",
            )}
            value={amount}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChangeNum}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#6A6C6A"
          />
        </View>

        <View className="h-[0.5px] dark:bg-gray-700 bg-gray-300 mt-12" />

        {/* Balance info */}
        <View className="flex-row items-center justify-between mt-12">
          <Text className="text-lg font-metropolis-semibold text-content-300">
            {selectedAccount?.accountCurrency || "GBP"} Balance
          </Text>
          <Text className="text-lg font-metropolis-semibold default-text-color">
            {selectedAccount
              ? formatBalance(
                  selectedAccount.balance,
                  selectedAccount.accountCurrency,
                )
              : "£0.00"}
          </Text>
        </View>

        {/* Continue button */}
        <View className="flex-1 justify-end">
          <CustomButton
            title="Continue"
            textStyle="text-secondary"
            onPress={handleContinue}
            disabled={!verifiedUser || !amount.trim() || !selectedAccount}
          />
        </View>
      </SafeAreaView>

      {/* PIN Confirmation Modal */}
      <ConfirmPinModal
        visible={showPinModal}
        isLoading={isConfirmingPin}
        onClose={() => {}}
        onSuccess={handlePinSuccess}
        title="Confirm your Stase PIN"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleClose}
        message={successMessage}
      />

      {/* Currency Modal */}
      <CurrencyModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        onCurrencySelect={handleCurrencySelect}
        selectedCurrency={selectedAccount?.accountCurrency}
        bankAccounts={bankAccounts}
      />
    </>
  );
};

export default convert;
