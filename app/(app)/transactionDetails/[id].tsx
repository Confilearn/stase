import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import type { ListRenderItem } from "@shopify/flash-list";
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
      transactionType: "Operation Type",
      currency: "Currency",
      amount: "Amount",
      status: "Status",
      reference: "Reference ID",
      from: "Sender",
      to: "Recipient",
      date: "Date & Time",
      previousBalance: "Previous Balance",
      newBalance: "New Balance",
      description: "Description",
      conversionPair: "Conversion Pair",
      exchangeRate: "Exchange Rate",
      convertedAmount: "Converted Amount",
      convertedCurrency: "Converted Currency",
      direction: "Direction",
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
    const currencySymbols: Record<string, string> = {
      USD: "$",
      CAD: "C$",
      EUR: "€",
      GBP: "£",
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
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

    const mainData = [
      {
        label: getCreativeLabel("transactionType"),
        value: transaction.transactionType,
        valueClass: "default-text-color",
      },
      {
        label: getCreativeLabel("amount"),
        value: formatAmount(transaction.amount, transaction.currency),
        valueClass: "default-text-color",
      },
    ];

    // Add fields based on transaction type
    if (transaction.transactionType === "deposit") {
      if (transaction.to) {
        mainData.push({
          label: getCreativeLabel("to"),
          value: transaction.to,
          valueClass: "default-text-color",
        });
      }
      mainData.push({
        label: getCreativeLabel("currency"),
        value: transaction.currency,
        valueClass: "default-text-color",
      });
    } else if (transaction.transactionType === "withdraw") {
      if (transaction.from) {
        mainData.push({
          label: getCreativeLabel("from"),
          value: transaction.from,
          valueClass: "default-text-color",
        });
      }
      mainData.push({
        label: getCreativeLabel("currency"),
        value: transaction.currency,
        valueClass: "default-text-color",
      });
    } else if (
      transaction.transactionType === "send" ||
      transaction.transactionType === "receive" ||
      transaction.transactionType === "transfer"
    ) {
      if (transaction.from) {
        mainData.push({
          label: getCreativeLabel("from"),
          value: transaction.from,
          valueClass: "default-text-color",
        });
      }
      if (transaction.to) {
        mainData.push({
          label: getCreativeLabel("to"),
          value: transaction.to,
          valueClass: "default-text-color",
        });
      }
      mainData.push({
        label: getCreativeLabel("currency"),
        value: transaction.currency,
        valueClass: "default-text-color",
      });
    } else if (transaction.transactionType === "convert") {
      mainData.push({
        label: getCreativeLabel("currency"),
        value: transaction.currency,
        valueClass: "default-text-color",
      });
    }

    // Add metadata fields (except description)
    if (transaction.metadata) {
      if (transaction.metadata.previousBalance !== undefined) {
        mainData.push({
          label: getCreativeLabel("previousBalance"),
          value: formatAmount(
            transaction.metadata.previousBalance,
            transaction.currency,
          ),
          valueClass: "default-text-color",
        });
      }
      if (transaction.metadata.newBalance !== undefined) {
        mainData.push({
          label: getCreativeLabel("newBalance"),
          value: formatAmount(
            transaction.metadata.newBalance,
            transaction.currency,
          ),
          valueClass: "default-text-color",
        });
      }
      if (transaction.metadata.conversionPair) {
        mainData.push({
          label: getCreativeLabel("conversionPair"),
          value: transaction.metadata.conversionPair,
          valueClass: "default-text-color",
        });
      }
      if (transaction.metadata.exchangeRate) {
        mainData.push({
          label: getCreativeLabel("exchangeRate"),
          value: transaction.metadata.exchangeRate.toString(),
          valueClass: "default-text-color",
        });
      }
      if (transaction.metadata.convertedAmount !== undefined) {
        const convertedCurrency =
          transaction.metadata.convertedCurrency || transaction.currency;
        mainData.push({
          label: getCreativeLabel("convertedAmount"),
          value: formatAmount(
            transaction.metadata.convertedAmount,
            convertedCurrency,
          ),
          valueClass: "default-text-color",
        });
      }
      if (transaction.metadata.convertedCurrency) {
        mainData.push({
          label: getCreativeLabel("convertedCurrency"),
          value: transaction.metadata.convertedCurrency,
          valueClass: "default-text-color",
        });
      }
      if (transaction.metadata.direction) {
        mainData.push({
          label: getCreativeLabel("direction"),
          value: transaction.metadata.direction,
          valueClass: "default-text-color",
        });
      }
    }

    // Fields that should always be at the end
    const endData = [
      {
        label: getCreativeLabel("status"),
        value: transaction.status,
        valueClass: getStatusColor(transaction.status),
      },
      {
        label: getCreativeLabel("reference"),
        value: transaction.reference,
        valueClass: "default-text-color",
      },
    ];

    // Add description if it exists
    if (transaction.metadata?.description) {
      endData.push({
        label: getCreativeLabel("description"),
        value: transaction.metadata.description,
        valueClass: "default-text-color",
      });
    }

    endData.push({
      label: getCreativeLabel("date"),
      value: formatDate(transaction.date),
      valueClass: "default-text-color",
    });

    // Capitalize first letter of all values
    const capitalizeFirstLetter = (str: string) => {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const allData = [...mainData, ...endData];
    return allData.map((item) => ({
      ...item,
      value: capitalizeFirstLetter(item.value),
    }));
  }, [transaction]);

  const renderItem: ListRenderItem<(typeof transactionData)[0]> = ({
    item,
    target,
  }) => (
    <View className="flex-row items-center justify-between py-3 mb-3">
      <Text className="font-metropolis-semibold text-lg text-content-300 flex-1">
        {item.label}
      </Text>
      <Text
        className={`font-metropolis-semibold text-lg ${item.valueClass} text-right flex-1`}
      >
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
        Transaction Information
      </Text>

      <FlashList
        data={transactionData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 28, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        getItemType={(item, index) => "view"}
      />
    </SafeAreaView>
  );
};

export default transactionDetails;
