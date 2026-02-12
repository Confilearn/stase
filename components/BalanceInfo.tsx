import { View, Text } from "react-native";
import { formatBalance } from "@/utils/currencyUtils";

interface BalanceInfoProps {
  balance: number;
  currency: string;
  label?: string;
}

const BalanceInfo = ({ balance, currency, label = "Balance" }: BalanceInfoProps) => {
  return (
    <View className="flex-row items-center justify-between mt-12">
      <Text className="text-lg font-metropolis-semibold text-content-300">
        {label}
      </Text>
      <Text className="text-lg font-metropolis-semibold default-text-color">
        {formatBalance(balance, currency)}
      </Text>
    </View>
  );
};

export default BalanceInfo;
