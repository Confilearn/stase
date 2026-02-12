import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { ArrowSwapVertical } from "iconsax-react-native";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmPinModal from "@/components/ConfirmPinModal";
import SuccessModal from "@/components/SuccessModal";
import CurrencyModal from "@/components/CurrencyModal";
import { useUserStore } from "@/store/user.store";
import {
  convertCurrency,
  getExchangeRate,
  SupportedCurrency,
} from "@/utils/currencyRates";
import { formatBalance } from "@/utils/currencyUtils";
import ScreenHeader from "@/components/ScreenHeader";
import CurrencySelector from "@/components/CurrencySelector";
import AmountInput from "@/components/AmountInput";
import ErrorMessage from "@/components/ErrorMessage";
import { useTransactionValidation } from "@/hooks/useTransactionValidation";
import { usePinTransaction } from "@/hooks/usePinTransaction";

const Convert = () => {
  const colorMode = useColorScheme();
  const router = useRouter();
  const { bankAccounts } = useUserStore();

  const [amount, setAmount] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { error, setError, clearError, validateConvert } =
    useTransactionValidation();
  const { isConfirmingPin, handlePinSuccess } = usePinTransaction();

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
      } catch {
        setError("Invalid currency pair");
        setConvertedAmount("");
        setExchangeRate(1);
      }
    }
  }, [amount, fromCurrencyAccount, toCurrencyAccount, setError]);

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
    clearError();
  };

  const handleFromCurrencySelect = (account: any) => {
    if (account.accountCurrency === toCurrencyAccount?.accountCurrency) {
      setError("Cannot select the same currency for conversion");
      return;
    }
    setFromCurrencyAccount(account);
    clearError();
  };

  const handleToCurrencySelect = (account: any) => {
    if (account.accountCurrency === fromCurrencyAccount?.accountCurrency) {
      setError("Cannot select the same currency for conversion");
      return;
    }
    setToCurrencyAccount(account);
    clearError();
  };

  const swapCurrencies = () => {
    if (fromCurrencyAccount && toCurrencyAccount) {
      setFromCurrencyAccount(toCurrencyAccount);
      setToCurrencyAccount(fromCurrencyAccount);
      setAmount(convertedAmount);
      clearError();
    }
  };

  const validateAmount = () => {
    const validation = validateConvert({
      amount,
      fromCurrencyAccount,
      toCurrencyAccount,
      transactionType: "convert",
    });

    if (!validation.isValid) {
      setError(validation.message);
      return false;
    }

    // Check sufficient funds
    const numAmount = parseFloat(amount);
    if (numAmount > fromCurrencyAccount.balance) {
      setError(
        `Insufficient funds. Available: ${formatBalance(fromCurrencyAccount.balance, fromCurrencyAccount.accountCurrency)}`,
      );
      return false;
    }

    return true;
  };

  const handlePinConfirm = async (pin: string) => {
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

    await handlePinSuccess(pin, {
      transactionType: "convert",
      transactionData: conversionData,
      onSuccess: (message) => {
        setSuccessMessage(message);
        setShowPinModal(false);
        setShowSuccessModal(true);
        setAmount("");
        setConvertedAmount("");
        clearError();
      },
      onError: (message) => {
        setError(message);
        setShowPinModal(false);
      },
    });
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

  const formatExchangeRate = () => {
    if (fromCurrencyAccount && toCurrencyAccount) {
      return `1 ${fromCurrencyAccount.accountCurrency} = ${exchangeRate.toFixed(4)} ${toCurrencyAccount.accountCurrency}`;
    }
    return "";
  };

  return (
    <>
      <SafeAreaView className="container">
        {/* Header */}
        <ScreenHeader title="Convert Money" />

        {/* From currency selector and amount */}
        <View className="mt-16">
          <View className="flex-row items-center justify-between gap-2">
            <CurrencySelector
              selectedCurrency={fromCurrencyAccount?.accountCurrency}
              onPress={() => setShowFromCurrencyModal(true)}
            />
            <AmountInput
              value={amount}
              onChangeText={onChangeText}
              error={!!error}
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

        <ErrorMessage message={error} />

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
              Today&apos;s Rate
            </Text>
          </View>
        </View>

        <View className="h-[0.5px] dark:bg-gray-700 bg-gray-300 mt-12" />

        {/* To currency selector and amount */}
        <View className="mt-12">
          <View className="flex-row items-center gap-2 justify-between">
            <CurrencySelector
              selectedCurrency={toCurrencyAccount?.accountCurrency}
              onPress={() => setShowToCurrencyModal(true)}
            />
            <AmountInput
              value={convertedAmount}
              onChangeText={() => {}}
              error={!!error}
              editable={false}
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
        onSuccess={handlePinConfirm}
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

export default Convert;
