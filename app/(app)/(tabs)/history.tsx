import ChevronLeft from "@/components/ChevronLeft";
import { Link, router } from "expo-router";
import { Clock } from "iconsax-react-native";
import { Check as LucideCheck, X } from "lucide-react-native";
import { useState, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "convert" | "send" | "receive";
  amount: string;
  currency: string;
  date: string;
  status: "success" | "error" | "pending";
}

const TransactionItem = ({ item }: { item: Transaction }) => {
  const getIcon = () => {
    if (item.status === "error") {
      return <X size="20" color="#FFFFFF" />;
    }
    return <LucideCheck size="20" color="#FFFFFF" />;
  };

  const getIconBgColor = () => {
    switch (item.status) {
      case "success":
        return "bg-success";
      case "error":
        return "bg-error";
      case "pending":
        return "bg-warning";
      default:
        return "bg-content-300";
    }
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/transactionDetails`)}
      className="flex-row items-center justify-between w-full"
    >
      <View className="flex-row gap-3 items-center">
        <View
          className={`flex items-center justify-center size-11 rounded-full ${getIconBgColor()}`}
        >
          {getIcon()}
        </View>
        <View className="flex gap-1">
          <Text className="font-metropolis-semibold text-[18px] default-text-color capitalize">
            {item.type}
          </Text>
          <Text className="font-metropolis-semibold text-[14px] text-content-300">
            {item.date}
          </Text>
        </View>
      </View>
      <View>
        <Text className="font-metropolis-semibold text-[20px] default-text-color">
          {item.currency}
          {item.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const history = () => {
  const transactions = useMemo<Transaction[]>(
    () => [
      {
        id: "1",
        type: "deposit",
        amount: "25",
        currency: "£",
        date: "Feb 12, 2026",
        status: "success",
      },
      {
        id: "2",
        type: "withdraw",
        amount: "0.5",
        currency: "£",
        date: "Feb 11, 2026",
        status: "error",
      },
      {
        id: "3",
        type: "convert",
        amount: "100.1",
        currency: "$",
        date: "Feb 11, 2026",
        status: "pending",
      },
      {
        id: "4",
        type: "send",
        amount: "25",
        currency: "£",
        date: "Feb 10, 2026",
        status: "success",
      },
      {
        id: "5",
        type: "receive",
        amount: "25",
        currency: "£",
        date: "Feb 09, 2026",
        status: "error",
      },
    ],
    [],
  );

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

      {transactions.length === 0 ? (
        // No transactions
        <View className="flex-1 items-center justify-center gap-4">
          <Clock size="100" color="#6A6C6A" variant="Outline" />
          <Text className="text-content-300 font-metropolis-semibold text-xl">
            No transactions yet
          </Text>
        </View>
      ) : (
        // Transactions list
        <FlatList
          data={transactions}
          renderItem={({ item }) => <TransactionItem item={item} />}
          keyExtractor={(item) => item.id}
          className="mt-8"
          contentContainerStyle={{ gap: 32 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
        />
      )}
    </SafeAreaView>
  );
};

export default history;
