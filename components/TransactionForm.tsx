import { View } from "react-native";
import CurrencySelector from "./CurrencySelector";
import AmountInput from "./AmountInput";
import ErrorMessage from "./ErrorMessage";
import BalanceInfo from "./BalanceInfo";

interface TransactionFormProps {
  amount: string;
  onAmountChange: (text: string) => void;
  error: string;
  selectedAccount?: any;
  onCurrencySelect: () => void;
  showBalance?: boolean;
  balanceLabel?: string;
  editable?: boolean;
}

const TransactionForm = ({
  amount,
  onAmountChange,
  error,
  selectedAccount,
  onCurrencySelect,
  showBalance = true,
  balanceLabel = "Balance",
  editable = true,
}: TransactionFormProps) => {
  return (
    <>
      {/* Currency selector and amount */}
      <View className="mt-16 relative flex-row items-center gap-2 justify-between">
        <CurrencySelector
          selectedCurrency={selectedAccount?.accountCurrency}
          onPress={onCurrencySelect}
        />

        {/* Amount */}
        <AmountInput
          value={amount}
          onChangeText={onAmountChange}
          error={!!error}
          editable={editable}
        />
      </View>

      {/* Error message */}
      <ErrorMessage message={error} visible={!!error} />

      <View className="h-[0.5px] dark:bg-gray-700 bg-gray-300 mt-12" />

      {/* Balance info */}
      {showBalance && selectedAccount && (
        <BalanceInfo
          balance={selectedAccount.balance}
          currency={selectedAccount.accountCurrency}
          label={balanceLabel}
        />
      )}
    </>
  );
};

export default TransactionForm;
