import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Pressable,
} from "react-native";
import { useColorScheme } from "react-native";
import { ArrowDown2, Bank } from "iconsax-react-native";

interface CurrencyAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankAddress: string;
  accountCurrency: string;
  swiftCode: string;
  iban?: string;
  sortCode?: string;
  balance: number;
  createdAt: string;
}

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
  onCurrencySelect: (account: CurrencyAccount) => void;
  selectedCurrency?: string;
  bankAccounts: CurrencyAccount[];
}

const CurrencyModal: React.FC<CurrencyModalProps> = ({
  visible,
  onClose,
  onCurrencySelect,
  selectedCurrency = "USD",
  bankAccounts,
}) => {
  const colorScheme = useColorScheme();

  // Currency symbols mapping
  const currencySymbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    CAD: "$",
  };

  // Flag emojis mapping
  const currencyFlags: Record<string, string> = {
    EUR: "🇪🇺",
    USD: "🇺🇸",
    GBP: "🇬🇧",
    CAD: "🇨🇦",
  };

  // Get unique currencies from bank accounts
  const uniqueCurrencies = Array.from(
    new Set(bankAccounts.map((account) => account.accountCurrency)),
  );

  // Create currency accounts list using real bank account data
  const currencyAccounts = uniqueCurrencies.map((currency) => {
    const account = bankAccounts.find(
      (acc) => acc.accountCurrency === currency,
    );
    return {
      id: account?.id || `${currency}-${Date.now()}`,
      accountNumber: account?.accountNumber || "",
      accountName: account?.accountName || `${currency} Account`,
      bankName: account?.bankName || "Default Bank",
      bankAddress: account?.bankAddress || "",
      accountCurrency: currency,
      swiftCode: account?.swiftCode || "",
      iban: account?.iban,
      sortCode: account?.sortCode,
      createdAt: account?.createdAt || new Date().toISOString(),
      balance: account?.balance || 0,
    };
  });

  const handleCurrencyPress = (account: CurrencyAccount) => {
    onCurrencySelect(account);
    onClose();
  };

  const formatBalance = (balance: number, currency: string) => {
    const symbol = currencySymbols[currency] || "";
    return `${symbol}${balance.toLocaleString()}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end items-center"
        onPress={onClose}
      >
        <Pressable
          className={`w-full bg-white rounded-t-[20px] px-5 pt-5 pb-5 ${
            colorScheme === "dark" ? "bg-content-200" : ""
          }`}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="h-[3px] bg-gray-300 dark:bg-gray-600 mb-7 max-w-[40px] w-full mx-auto rounded-xl" />

          {/* Currency List */}
          <View className="">
            {currencyAccounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                onPress={() => handleCurrencyPress(account)}
                className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 ${
                  selectedCurrency === account.accountCurrency
                    ? "bg-primary/10 border border-primary"
                    : "bg-gray-100 dark:bg-content-300"
                }`}
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <Text className="text-2xl">
                      {currencyFlags[account.accountCurrency] || "🏦"}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-lg font-metropolis-semibold text-content-200 dark:text-content-500">
                      {account.accountCurrency}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-xl font-metropolis-bold text-content-200 dark:text-content-500">
                    {formatBalance(
                      account.balance || 0,
                      account.accountCurrency,
                    )}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CurrencyModal;
