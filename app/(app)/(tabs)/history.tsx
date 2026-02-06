import ChevronLeft from "@/components/ChevronLeft";
import { Link } from "expo-router";
import { Clock } from "iconsax-react-native";
import { useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const history = () => {
  const [transactions, setTransactions] = useState([]);

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
        <View className="flex-1 items-center justify-center gap-4">
          <Clock size="100" color="#6A6C6A" variant="Outline" />
          <Text className="text-content-300 font-metropolis-semibold text-xl">
            No transactions yet
          </Text>
        </View>
      ) : (
        <View></View>
      )}
    </SafeAreaView>
  );
};

export default history;
