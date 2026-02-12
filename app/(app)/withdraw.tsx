import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmPinModal from "@/components/ConfirmPinModal";
import SuccessModal from "@/components/SuccessModal";
import CurrencyModal from "@/components/CurrencyModal";
import { useUserStore } from "@/store/user.store";
import ScreenHeader from "@/components/ScreenHeader";
import CurrencySelector from "@/components/CurrencySelector";
import AmountInput from "@/components/AmountInput";
import ErrorMessage from "@/components/ErrorMessage";
import BalanceInfo from "@/components/BalanceInfo";
import { useTransactionValidation } from "@/hooks/useTransactionValidation";
import { usePinTransaction } from "@/hooks/usePinTransaction";

const Withdraw = () => {
  const router = useRouter();
  const { bankAccounts } = useUserStore();

  const onChangeText = (text: string) => {
    setAmount(text);
    clearError(); // Clear error when user types
  };

  const [amount, setAmount] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(
    bankAccounts[0] || null,
  );
  const [successMessage, setSuccessMessage] = useState("");

  const { error, setError, clearError, validateWithdraw } =
    useTransactionValidation();
  const { isConfirmingPin, handlePinSuccess } = usePinTransaction();

  const handleCurrencySelect = (account: any) => {
    setSelectedAccount(account);
  };

  const validateAmount = () => {
    const validation = validateWithdraw({
      amount,
      selectedAccount,
      transactionType: "withdraw",
    });

    if (!validation.isValid) {
      setError(validation.message);
      return false;
    }

    return true;
  };

  const handlePinConfirm = async (pin: string) => {
    const withdrawData = {
      amount: parseFloat(amount),
      accountCurrency: selectedAccount.accountCurrency,
      accountNumber: selectedAccount.accountNumber,
      transactionPin: pin,
    };

    await handlePinSuccess(pin, {
      transactionType: "withdraw",
      transactionData: withdrawData,
      onSuccess: (message) => {
        setSuccessMessage(message);
        setShowPinModal(false);
        setShowSuccessModal(true);
        setAmount("");
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
    // Navigate back to home screen
    router.push("/(app)/(tabs)");
  };

  const handleContinue = () => {
    if (!validateAmount()) return;
    setShowPinModal(true);
  };

  return (
    <>
      <SafeAreaView className="container">
        <ScreenHeader title="Withdraw Money" />

        {/* Currency selector and amount */}
        <View className="mt-16 relative flex-row items-center gap-2 justify-between">
          <CurrencySelector
            selectedCurrency={selectedAccount?.accountCurrency}
            onPress={() => setShowCurrencyModal(true)}
          />

          {/* Amount */}
          <AmountInput
            value={amount}
            onChangeText={onChangeText}
            error={!!error}
          />
        </View>

        <ErrorMessage message={error} />

        <View className="h-[0.5px] dark:bg-gray-700 bg-gray-300 mt-12" />

        {/* Balance info */}
        <BalanceInfo
          balance={selectedAccount?.balance || 0}
          currency={selectedAccount?.accountCurrency || "GBP"}
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
        onSuccess={handlePinConfirm}
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

export default Withdraw;
