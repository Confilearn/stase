import ChevronLeft from "@/components/ChevronLeft";
import { Link, router } from "expo-router";
import { Clock } from "iconsax-react-native";
import { Check as LucideCheck, X } from "lucide-react-native";
import { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import type { ListRenderItem } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "@/store/user.store";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "convert" | "send" | "receive";
  amount: string;
  currency: string;
  date: string;
  status: "completed" | "failed" | "pending";
}

const TransactionItem = ({ item }: { item: Transaction }) => {
  const getCurrencySymbol = (currency: string) => {
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
  };

  const getIcon = () => {
    if (item.status === "failed") {
      return <X size="20" color="#FFFFFF" />;
    }
    return <LucideCheck size="20" color="#FFFFFF" />;
  };

  const getIconBgColor = () => {
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
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/transactionDetails/${item.id}` as any)}
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
};

const renderTransactionItem: ListRenderItem<Transaction> = ({
  item,
  target,
}) => <TransactionItem item={item} />;

const history = () => {
  const { transactions, isLoading } = useUserStore();

  const formattedTransactions = useMemo(() => {
    return transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.transactionType.toLowerCase() as
        | "deposit"
        | "withdraw"
        | "convert"
        | "send"
        | "receive",
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      date: new Date(transaction.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: transaction.status.toLowerCase() as
        | "completed"
        | "failed"
        | "pending",
    }));
  }, [transactions]);

  return (
    <SafeAreaView className="container">
      <View className="flex-row gap-5 mt-2 items-center">
        <Link href={"/(app)/(tabs)"}>
          <ChevronLeft />
        </Link>
        <Text className="text-2xl font-metropolis-bold text-content-100 dark:text-content-500">
          Transactions
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-content-300 font-metropolis-semibold text-xl">
            Loading transactions...
          </Text>
        </View>
      ) : formattedTransactions.length === 0 ? (
        // No transactions
        <View className="flex-1 items-center justify-center gap-4">
          <Clock size="100" color="#6A6C6A" variant="Outline" />
          <Text className="text-content-300 font-metropolis-semibold text-xl">
            No transactions yet
          </Text>
        </View>
      ) : (
        // Transactions list
        <FlashList
          data={formattedTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 24 }}
          showsVerticalScrollIndicator={false}
          getItemType={(item, index) => "view"}
        />
      )}
    </SafeAreaView>
  );
};

export default history;
