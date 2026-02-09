import { View, Text, FlatList } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ChevronLeft from "@/components/ChevronLeft";
import { useUserStore } from "@/store/user.store";
import { useMemo } from "react";

const transactionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions } = useUserStore();

  const transaction = useMemo(() => {
    return transactions.find((tx) => tx.id === id);
  }, [transactions, id]);

  const getCreativeLabel = (key: string) => {
    const labels: Record<string, string> = {
      transactionType: "💱 Operation Type",
      currency: "💰 Currency",
      amount: "💵 Amount",
      status: "📊 Status",
      reference: "🔗 Reference ID",
      from: "👤 Sender",
      to: "👤 Recipient",
      date: "📅 Date & Time",
      createdAt: "⏰ Created At",
      updatedAt: "🔄 Last Updated",
    };
    return labels[key] || key;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "completed":
        return "text-success";
      case "error":
      case "failed":
        return "text-error";
      case "pending":
        return "text-warning";
      default:
        return "default-text-color";
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const transactionData = useMemo(() => {
    if (!transaction) return [];

    const data = [
      { label: getCreativeLabel("transactionType"), value: transaction.transactionType, valueClass: "default-text-color" },
      { label: getCreativeLabel("amount"), value: formatAmount(transaction.amount, transaction.currency), valueClass: "default-text-color font-bold text-2xl" },
      { label: getCreativeLabel("status"), value: transaction.status, valueClass: getStatusColor(transaction.status) },
      { label: getCreativeLabel("reference"), value: transaction.reference, valueClass: "default-text-color" },
    ];

    if (transaction.from) {
      data.push({ label: getCreativeLabel("from"), value: transaction.from, valueClass: "default-text-color" });
    }

    if (transaction.to) {
      data.push({ label: getCreativeLabel("to"), value: transaction.to, valueClass: "default-text-color" });
    }

    data.push(
      { label: getCreativeLabel("date"), value: formatDate(transaction.date), valueClass: "default-text-color" },
      { label: getCreativeLabel("createdAt"), value: formatDate(transaction.createdAt), valueClass: "default-text-color" },
      { label: getCreativeLabel("updatedAt"), value: formatDate(transaction.updatedAt), valueClass: "default-text-color" }
    );

    return data;
  }, [transaction]);

  const renderItem = ({ item }: { item: (typeof transactionData)[0] }) => (
    <View className="flex-row items-center justify-between py-3">
      <Text className="font-metropolis-semibold text-lg text-content-300 flex-1">
        {item.label}
      </Text>
      <Text className={`font-metropolis-semibold text-lg ${item.valueClass} text-right flex-1`}>
        {item.value}
      </Text>
    </View>
  );

  if (!transaction) {
    return (
      <SafeAreaView className="container">
        <View className="flex-row gap-5 mt-2 items-center">
          <Link href={"/(app)/(tabs)"}>
            <ChevronLeft />
          </Link>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-content-300 font-metropolis-semibold text-xl text-center">
            Transaction not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="container">
      <View className="flex-row gap-5 mt-2 items-center">
        <Link href={"/(app)/(tabs)"}>
          <ChevronLeft />
        </Link>
      </View>

      <View className="mt-16 mb-8">
        <Text className="text-center font-metropolis-bold default-text-color text-5xl">
          {formatAmount(transaction.amount, transaction.currency)}
        </Text>
        <Text className="text-center font-metropolis-semibold text-content-300 text-lg mt-2 capitalize">
          {transaction.transactionType}
        </Text>
      </View>

      <View className="h-[0.3px] dark:bg-gray-700 bg-gray-300" />

      <Text className="mt-8 font-metropolis-bold default-text-color text-2xl">
        📋 Transaction Information
      </Text>

      <FlatList
        data={transactionData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerClassName="gap-4 mt-6 pb-8"
        className="flex-1"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default transactionDetails;
