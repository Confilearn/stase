import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import { Link, useRouter } from "expo-router";
import { ArrowDown2, ArrowSwapVertical } from "iconsax-react-native";
import { useState, useEffect } from "react";
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
import {
  convertCurrency,
  getExchangeRate,
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
} from "@/utils/currencyRates";
import { checkAndNavigateToOffline } from "@/utils/offlineDetection";

const convert = () => {
  const colorMode = useColorScheme();
  const router = useRouter();
  const { user, bankAccounts, updateUserFromAPI } = useUserStore();

  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [isConfirmingPin, setisConfirmingPin] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Currency selection states
  const [showFromCurrencyModal, setShowFromCurrencyModal] = useState(false);
  const [showToCurrencyModal, setShowToCurrencyModal] = useState(false);
  const [fromCurrencyAccount, setFromCurrencyAccount] = useState(
    bankAccounts[0] || null,
  );
  const [toCurrencyAccount, setToCurrencyAccount] = useState(
    bankAccounts[1] || null,
  );
  const [convertedAmount, setConvertedAmount] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  // Currency symbols mapping
  const currencySymbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    CAD: "$",
  };

  // Calculate converted amount and exchange rate when inputs change
  useEffect(() => {
    if (fromCurrencyAccount && toCurrencyAccount) {
      // Prevent conversion between same currency
      if (
        fromCurrencyAccount.accountCurrency ===
        toCurrencyAccount.accountCurrency
      ) {
        setError("Cannot convert between the same currency");
        setConvertedAmount("");
        setExchangeRate(1);
        return;
      }

      try {
        const rate = getExchangeRate(
          fromCurrencyAccount.accountCurrency as SupportedCurrency,
          toCurrencyAccount.accountCurrency as SupportedCurrency,
        );
        setExchangeRate(rate);
        setError("");

        // Calculate converted amount only if there's a valid amount
        if (amount) {
          const numAmount = parseFloat(amount);
          if (!isNaN(numAmount) && numAmount > 0) {
            const converted = convertCurrency(
              numAmount,
              fromCurrencyAccount.accountCurrency as SupportedCurrency,
              toCurrencyAccount.accountCurrency as SupportedCurrency,
            );
            setConvertedAmount(converted.toFixed(2));
          } else {
            setConvertedAmount("");
          }
        } else {
          setConvertedAmount("");
        }
      } catch (err) {
        setError("Invalid currency pair");
        setConvertedAmount("");
        setExchangeRate(1);
      }
    }
  }, [amount, fromCurrencyAccount, toCurrencyAccount]);

  // Set initial accounts when bankAccounts load
  useEffect(() => {
    if (bankAccounts.length >= 2) {
      setFromCurrencyAccount(bankAccounts[0]);
      setToCurrencyAccount(bankAccounts[1]);
    } else if (bankAccounts.length === 1) {
      setFromCurrencyAccount(bankAccounts[0]);
    }
  }, [bankAccounts]);

  const onChangeText = (text: string) => {
    setAmount(text);
    setError("");
  };

  const handleFromCurrencySelect = (account: any) => {
    if (account.accountCurrency === toCurrencyAccount?.accountCurrency) {
      setError("Cannot select the same currency for conversion");
      return;
    }
    setFromCurrencyAccount(account);
    setError("");
  };

  const handleToCurrencySelect = (account: any) => {
    if (account.accountCurrency === fromCurrencyAccount?.accountCurrency) {
      setError("Cannot select the same currency for conversion");
      return;
    }
    setToCurrencyAccount(account);
    setError("");
  };

  const swapCurrencies = () => {
    if (fromCurrencyAccount && toCurrencyAccount) {
      setFromCurrencyAccount(toCurrencyAccount);
      setToCurrencyAccount(fromCurrencyAccount);
      setAmount(convertedAmount);
      setError("");
    }
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    if (!fromCurrencyAccount || !toCurrencyAccount) {
      setError("Please select both currencies");
      return false;
    }

    if (
      fromCurrencyAccount.accountCurrency === toCurrencyAccount.accountCurrency
    ) {
      setError("Cannot convert between the same currency");
      return false;
    }

    // Check sufficient funds
    if (numAmount > fromCurrencyAccount.balance) {
      setError(
        `Insufficient funds. Available: ${currencySymbols[fromCurrencyAccount.accountCurrency]}${fromCurrencyAccount.balance.toLocaleString()}`,
      );
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

      if (!user || !fromCurrencyAccount || !toCurrencyAccount) {
        throw new Error("Missing account information");
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

      // Prepare conversion data
      const convertFromAmount = parseFloat(amount);
      const convertToAmount = parseFloat(convertedAmount);
      const currencyPairs = `${fromCurrencyAccount.accountCurrency}-${toCurrencyAccount.accountCurrency}`;

      const conversionData = {
        convertFromAmount,
        convertFromAccountCurrency: fromCurrencyAccount.accountCurrency,
        convertToAmount,
        convertToAccountCurrency: toCurrencyAccount.accountCurrency,
        currencyPairs,
      };

      const response = await api.convertMoney(conversionData, user.clerkUserId);

      if (response.success) {
        const fromSymbol =
          currencySymbols[fromCurrencyAccount.accountCurrency] || "";
        const toSymbol =
          currencySymbols[toCurrencyAccount.accountCurrency] || "";
        const message = `${fromSymbol}${convertFromAmount.toLocaleString()} converted to ${toSymbol}${convertToAmount.toLocaleString()}`;

        // Update user store with data from backend response
        if (response.user && response.bankAccounts && response.transactions) {
          await updateUserFromAPI({
            user: response.user,
            bankAccounts: response.bankAccounts,
            transactions: response.transactions,
          });
        }

        setSuccessMessage(message);
        setShowPinModal(false);
        setShowSuccessModal(true);
        setAmount("");
        setConvertedAmount("");
        setError("");
      } else {
        throw new Error(response.error || "Currency conversion failed");
      }
    } catch (err: any) {
      console.error("Conversion error:", err);
      setError(err.message || "Transaction failed. Please try again.");
      setShowPinModal(false);
    } finally {
      setisConfirmingPin(false);
    }
  };

  const handleClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
    router.push("/(app)/(tabs)");
  };

  const handleContinue = () => {
    if (validateAmount()) {
      setShowPinModal(true);
    }
  };

  const formatBalance = (balance: number, currency: string) => {
    const symbol = currencySymbols[currency] || "";
    return `${symbol}${balance.toLocaleString()}`;
  };

  const formatExchangeRate = () => {
    if (fromCurrencyAccount && toCurrencyAccount) {
      const fromSymbol =
        currencySymbols[fromCurrencyAccount.accountCurrency] || "";
      const toSymbol = currencySymbols[toCurrencyAccount.accountCurrency] || "";
      return `1 ${fromCurrencyAccount.accountCurrency} = ${exchangeRate.toFixed(4)} ${toCurrencyAccount.accountCurrency}`;
    }
    return "";
  };

  return (
    <>
      <SafeAreaView className="container">
        <View className="flex-row gap-5 mt-2 items-center">
          <Link href={"/(app)/(tabs)"}>
            <ChevronLeft />
          </Link>
          <Text className="text-2xl font-metropolis-bold text-content-100 dark:text-content-500">
            Convert Money
          </Text>
        </View>

        {/* From currency selector and amount */}
        <View className="mt-16">
          <View className="flex-row items-center justify-between gap-2">
            <TouchableOpacity
              className="border-gray-300 dark:border-gray-600 border-[0.5px] px-3 py-2 rounded-full max-w-[75px] w-full flex-row items-center justify-between"
              onPress={() => setShowFromCurrencyModal(true)}
            >
              <Text className="text-[12px] font-metropolis-semibold default-text-color">
                {fromCurrencyAccount?.accountCurrency || "Select"}
              </Text>
              <ArrowDown2
                size={20}
                color={colorMode === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
            <TextInput
              className={cn(
                "text-5xl font-metropolis-bold",
                error ? "text-error" : "text-primary",
              )}
              value={amount}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChangeText}
              keyboardType="numeric"
              editable={true}
              placeholder="0"
              placeholderTextColor="#6A6C6A"
            />
          </View>
          {fromCurrencyAccount && (
            <Text className="text-sm font-metropolis-medium text-content-300 mt-2">
              Balance:{" "}
              {formatBalance(
                fromCurrencyAccount.balance,
                fromCurrencyAccount.accountCurrency,
              )}
            </Text>
          )}
        </View>

        {/* Error message */}
        {error && (
          <Text className="text-[14px] text-error font-metropolis-semibold mt-5">
            {error}
          </Text>
        )}

        <View className="h-[0.3px] dark:bg-gray-700 bg-gray-300 mt-8" />

        {/* Balance info */}
        <View className="flex-row items-center justify-between mt-12">
          {/* Swap currencies button */}
          <TouchableOpacity
            className="self-center p-3 rounded-full bg-gray-100 dark:bg-content-300"
            onPress={swapCurrencies}
          >
            <ArrowSwapVertical
              size={24}
              color={colorMode === "dark" ? "white" : "black"}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
          <View className="flex items-end">
            <Text className="text-lg font-metropolis-semibold default-text-color">
              {formatExchangeRate()}
            </Text>
            <Text className="text-sm font-metropolis-medium text-content-300">
              Today's Rate
            </Text>
          </View>
        </View>

        <View className="h-[0.5px] dark:bg-gray-700 bg-gray-300 mt-12" />

        {/* To currency selector and amount */}
        <View className="mt-12">
          <View className="flex-row items-center gap-2 justify-between">
            <TouchableOpacity
              className="border-gray-300 dark:border-gray-600 border-[0.5px] px-3 py-2 rounded-full max-w-[75px] w-full flex-row items-center justify-between"
              onPress={() => setShowToCurrencyModal(true)}
            >
              <Text className="text-[12px] font-metropolis-semibold default-text-color">
                {toCurrencyAccount?.accountCurrency || "Select"}
              </Text>
              <ArrowDown2
                size={20}
                color={colorMode === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
            <TextInput
              className={cn(
                "text-5xl font-metropolis-bold",
                error ? "text-error" : "text-primary",
              )}
              value={convertedAmount}
              editable={false}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#6A6C6A"
            />
          </View>
          {toCurrencyAccount && (
            <Text className="text-sm font-metropolis-medium text-content-300 mt-2">
              Balance:{" "}
              {formatBalance(
                toCurrencyAccount.balance,
                toCurrencyAccount.accountCurrency,
              )}
            </Text>
          )}
        </View>

        {/* Continue button */}
        <View className="flex-1 justify-end">
          <CustomButton
            title="Continue"
            textStyle="text-secondary"
            onPress={handleContinue}
            disabled={
              !amount ||
              !fromCurrencyAccount ||
              !toCurrencyAccount ||
              parseFloat(amount) <= 0
            }
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

      {/* From Currency Modal */}
      <CurrencyModal
        visible={showFromCurrencyModal}
        onClose={() => setShowFromCurrencyModal(false)}
        onCurrencySelect={handleFromCurrencySelect}
        selectedCurrency={fromCurrencyAccount?.accountCurrency}
        bankAccounts={bankAccounts}
      />

      {/* To Currency Modal */}
      <CurrencyModal
        visible={showToCurrencyModal}
        onClose={() => setShowToCurrencyModal(false)}
        onCurrencySelect={handleToCurrencySelect}
        selectedCurrency={toCurrencyAccount?.accountCurrency}
        bankAccounts={bankAccounts}
      />
    </>
  );
};

export default convert;
