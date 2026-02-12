import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { ArrowDown2 } from "iconsax-react-native";
import { useState, useCallback, useMemo } from "react";
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
import ErrorMessage from "@/components/ErrorMessage";
import ScreenHeader from "@/components/ScreenHeader";
import BalanceInfo from "@/components/BalanceInfo";
import { currencySymbols } from "@/utils/currencyUtils";
import AmountInput from "@/components/AmountInput";

const Deposit = () => {
  const colorMode = useColorScheme();
  const router = useRouter();
  const { user, bankAccounts, updateUserFromAPI } = useUserStore();

  const onChangeText = useCallback((text: string) => {
    setAmount(text);
    setError(""); // Clear error when user types
  }, []);

  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [isConfirmingPin, setisConfirmingPin] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(
    bankAccounts[0] || null,
  );

  const formatBalance = (balance: number, currency: string) => {
    const symbol = currencySymbols[currency] || "";
    return `${symbol}${balance.toLocaleString()}`;
  };

  const handleCurrencySelect = useCallback((account: any) => {
    setSelectedAccount(account);
  }, []);

  const validateAmount = useCallback(() => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    if (numAmount > 100000) {
      setError("Maximum deposit limit is 100,000 per transaction");
      return false;
    }
    return true;
  }, [amount]);

  const handlePinSuccess = useCallback(
    async (pin: string) => {
      setisConfirmingPin(true);

      try {
        // Check network connectivity before making API calls
        const isOfflineMode = await checkAndNavigateToOffline(router);
        if (isOfflineMode) {
          setisConfirmingPin(false);
          return;
        }

        if (!user || !selectedAccount) {
          throw new Error("User or account information missing");
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

        // PIN is valid, proceed with deposit
        const depositData = {
          amount: parseFloat(amount),
          accountCurrency: selectedAccount.accountCurrency,
          accountNumber: selectedAccount.accountNumber,
          transactionPin: pin,
        };

        const response = await api.depositMoney(depositData, user.clerkUserId);

        if (response.success) {
          const symbol = currencySymbols[selectedAccount.accountCurrency] || "";
          const successMessage = `${symbol}${parseFloat(amount).toLocaleString()} added to your ${selectedAccount.accountCurrency} account`;

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
          setAmount("");
          setError("");
        } else {
          throw new Error(response.error || "Deposit failed");
        }
      } catch (err: any) {
        console.error("Deposit error:", err);
        setError(err.message || "Transaction failed. Please try again.");
        setShowPinModal(false);
      } finally {
        setisConfirmingPin(false);
      }
    },
    [user, selectedAccount, amount, updateUserFromAPI, currencySymbols, router],
  );

  const [successMessage, setSuccessMessage] = useState("");

  const handleClose = useCallback(() => {
    setShowSuccessModal(false);
    setSuccessMessage("");
    // Navigate back to home screen
    router.push("/(app)/(tabs)");
  }, [router]);

  const handleContinue = useCallback(() => {
    if (!validateAmount()) return;
    setShowPinModal(true);
  }, [validateAmount]);

  return (
    <>
      <SafeAreaView className="container">
        {/* Header */}
        <ScreenHeader title="Add Money" />

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
          <AmountInput
            value={amount}
            onChangeText={onChangeText}
            error={!!error}
          />
        </View>

        {/* Error message */}
        <ErrorMessage message={error} />

        <View className="h-[0.5px] dark:bg-gray-700 bg-gray-300 mt-12" />

        {/* Balance info */}
        <BalanceInfo
          balance={selectedAccount.balance}
          currency={selectedAccount.accountCurrency}
        />

        {/* Continue button */}
        <View className="flex-1 justify-end">
          <CustomButton
            title="Continue"
            textStyle="text-secondary"
            onPress={handleContinue}
          />
        </View>
      </SafeAreaView>

      {/* PIN Confirmation Modal */}
      <ConfirmPinModal
        visible={showPinModal}
        isLoading={isConfirmingPin}
        onClose={() => setShowPinModal(false)}
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

export default Deposit;
