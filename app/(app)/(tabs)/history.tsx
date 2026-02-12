import ChevronLeft from "@/components/ChevronLeft";
import { Link, router } from "expo-router";
import { Clock } from "iconsax-react-native";
import { useMemo, useCallback } from "react";

import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import type { ListRenderItem } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "@/store/user.store";
import TransactionItem from "@/components/TransactionItem";
import type { Transaction } from "@/components/TransactionItem";
import ScreenHeader from "@/components/ScreenHeader";

const History = () => {
  const { transactions } = useUserStore();

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

  const renderTransactionItem: ListRenderItem<Transaction> = useCallback(
    ({ item }) => (
      <TransactionItem
        item={item}
        onPress={(id) => router.push(`/(app)/transactionDetails/${id}` as any)}
      />
    ),
    [],
  );

  return (
    <SafeAreaView className="container">
      {/* Header */}
      <ScreenHeader title="Transactions" />

      {formattedTransactions.length === 0 ? (
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

export default History;
