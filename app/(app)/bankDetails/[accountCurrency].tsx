import { ActionButton } from "@/components/ActionButton";
import ChevronLeft from "@/components/ChevronLeft";
import { useUserStore } from "@/store/user.store";
import { Link, useLocalSearchParams, router } from "expo-router";
import {
  Add,
  ArrowSwapHorizontal,
  ClipboardText,
  ClipboardTick,
  MoneyTick,
  Send2,
} from "iconsax-react-native";
import { Text, TouchableOpacity, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import * as Clipboard from "expo-clipboard";

const BankDetailsPage = () => {
  const { accountCurrency } = useLocalSearchParams<{
    accountCurrency: string;
  }>();
  const { bankAccounts } = useUserStore();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [accountDetails, setAccountDetails] = useState<any>(null);

  useEffect(() => {
    // Find the account details based on the selected currency
    const selectedAccount = bankAccounts.find(
      (account) => account.accountCurrency === accountCurrency,
    );

    if (selectedAccount) {
      setAccountDetails(selectedAccount);
    } else {
      // If no account found for the currency, navigate back
      router.back();
    }
  }, [accountCurrency, bankAccounts]);

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "CAD":
        return "C$";
      default:
        return "$";
    }
  };

  const bankDetailsData = accountDetails
    ? [
        {
          label: "Account Name",
          value: accountDetails.accountName
            .split(" ")
            .map(
              (word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(" "),
        },
        { label: "Account Number", value: accountDetails.accountNumber },
        ...(accountDetails.sortCode
          ? [{ label: "Sort Code", value: accountDetails.sortCode }]
          : []),
        ...(accountDetails.iban
          ? [{ label: "IBAN", value: accountDetails.iban }]
          : []),
        { label: "Bank Name", value: accountDetails.bankName },
        { label: "Branch Address", value: accountDetails.bankAddress },
        { label: "Swift Code", value: accountDetails.swiftCode },
      ]
    : [];

  const handleCopy = async (value: string, index: string) => {
    await Clipboard.setStringAsync(value);
    setCopiedItem(index);
  };

  const renderBankDetailItem = ({
    item,
    index,
  }: {
    item: (typeof bankDetailsData)[0];
    index: number;
  }) => (
    <View className="flex-row items-center justify-between mb-6">
      <View className="gap-1">
        <Text className="text-content-300 font-metropolis-semibold text-[14px]">
          {item.label}
        </Text>
        <Text className="text-content-200 dark:text-content-400 font-metropolis-semibold text-[16px]">
          {item.value}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleCopy(item.value, index.toString())}
      >
        {copiedItem === index.toString() ? (
          <ClipboardTick size="25" color="#6A6C6A" />
        ) : (
          <ClipboardText size="25" color="#6A6C6A" />
        )}
      </TouchableOpacity>
    </View>
  );

  const actions = [
    {
      icon: <Add size="24" color="#0A385D" variant="Outline" />,
      label: "Add",
      onPress: () => router.push("/(app)/deposit"),
    },
    {
      icon: <ArrowSwapHorizontal size="24" color="#0A385D" variant="Outline" />,
      label: "Convert",
      onPress: () => router.push("/(app)/(tabs)/convert"),
    },
    {
      icon: <Send2 size="24" color="#0A385D" variant="Outline" />,
      label: "Send",
      onPress: () => router.push("/(app)/transfer"),
    },
    {
      icon: <MoneyTick size="24" color="#0A385D" variant="Outline" />,
      label: "Withdraw",
      onPress: () => router.push("/(app)/withdraw"),
    },
  ];

  useEffect(() => {
    if (copiedItem) {
      const timer = setTimeout(() => {
        setCopiedItem(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [copiedItem]);

  if (!accountDetails) {
    return (
      <SafeAreaView className="container">
        <View className="flex-1 items-center justify-center">
          <Text className="text-content-300 font-metropolis-semibold text-lg">
            Loading account details...
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

      {/* Balance Section */}
      <View className="mt-8 gap-1.5">
        <View className="size-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Text className="text-5xl">
            {accountCurrency === "USD" && "🇺🇸"}
            {accountCurrency === "EUR" && "🇪🇺"}
            {accountCurrency === "GBP" && "🇬🇧"}
            {accountCurrency === "CAD" && "🇨🇦"}
          </Text>
        </View>

        <Text className="font-metropolis-semibold text-xl text-content-200 dark:text-content-400 mt-4">
          {accountCurrency} Balance
        </Text>
        <Text className="font-metropolis-semibold text-5xl default-text-color">
          {getCurrencySymbol(accountCurrency)}
          {accountDetails.balance.toLocaleString()}
          <Text className="text-3xl">.00</Text>
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="mt-8 mb-10 flex-row justify-between">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
          />
        ))}
      </View>

      {/* Details List Group */}
      <View className="mt-2 mb-7">
        <Text className="font-metropolis-bold text-2xl default-text-color">
          Account Details
        </Text>
      </View>

      <FlatList
        data={bankDetailsData}
        renderItem={({ item, index }) => renderBankDetailItem({ item, index })}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default BankDetailsPage;
