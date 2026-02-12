import { memo, useCallback } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Check as LucideCheck, X } from "lucide-react-native";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "convert" | "send" | "receive";
  amount: string;
  currency: string;
  date: string;
  status: "completed" | "failed" | "pending";
}

interface TransactionItemProps {
  item: Transaction;
  onPress: (id: string) => void;
}

const TransactionItem = memo(
  ({ item, onPress }: TransactionItemProps) => {
    const getIcon = useCallback(() => {
      if (item.status === "failed") {
        return <X size="20" color="#FFFFFF" />;
      }
      return <LucideCheck size="20" color="#FFFFFF" />;
    }, [item.status]);

    const getIconBgColor = useCallback(() => {
      switch (item.status) {
        case "completed":
          return "bg-success";
        case "failed":
          return "bg-error";
        case "pending":
          return "bg-warning";
        default:
          return "bg-gray-300";
      }
    }, [item.status]);

    const getCurrencySymbol = useCallback((currency: string) => {
      switch (currency.toUpperCase()) {
        case "USD":
          return "$";
        case "EUR":
          return "€";
        case "GBP":
          return "£";
        case "CAD":
          return "c$";
        default:
          return currency;
      }
    }, []);

    return (
      <TouchableOpacity
        onPress={() => onPress(item.id)}
        className="flex-row items-center justify-between w-full mb-6"
      >
        <View className="flex-row gap-3 items-center">
          <View
            className={`flex items-center justify-center size-11 rounded-full ${getIconBgColor()}`}
          >
            {getIcon()}
          </View>
          <View className="flex gap-1">
            <Text className="font-metropolis-semibold text-[17px] default-text-color capitalize">
              {item.type}
            </Text>
            <Text className="font-metropolis-semibold text-[14px] text-content-300">
              {item.date}
            </Text>
          </View>
        </View>
        <View>
          <Text className="font-metropolis-semibold text-[18px] default-text-color">
            {getCurrencySymbol(item.currency)}
            {Number(item.amount).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

TransactionItem.displayName = "TransactionItem";

export default TransactionItem;
export type { Transaction };
