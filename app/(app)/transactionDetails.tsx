import { View, Text, FlatList } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ChevronLeft from "@/components/ChevronLeft";

const transactionDetails = () => {
  const transactionData = [
    { label: "Type", value: "Convert", valueClass: "default-text-color" },
    { label: "Pair", value: "USD - CAD", valueClass: "default-text-color" },
    { label: "From", value: "@confibiz", valueClass: "default-text-color" },
    { label: "Date", value: "22 Jan 2026", valueClass: "default-text-color" },
    {
      label: "Reference",
      value: "123456ABC",
      valueClass: "default-text-color",
    },
    { label: "status", value: "Completed", valueClass: "text-success" },
  ];

  const renderItem = ({ item }: { item: (typeof transactionData)[0] }) => (
    <View className="flex-row items-center justify-between">
      <Text className="font-metropolis-semibold text-xl text-content-300">
        {item.label}
      </Text>
      <Text className={`font-metropolis-semibold text-xl ${item.valueClass}`}>
        {item.value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="container">
      <View className="flex-row gap-5 mt-2 items-center">
        <Link href={"/(app)/(tabs)"}>
          <ChevronLeft />
        </Link>
      </View>

      <View className="mt-16 mb-16">
        <Text className="text-center font-metropolis-semibold default-text-color text-6xl">
          £632
        </Text>
      </View>

      <View className="h-[0.3px] dark:bg-gray-700 bg-gray-300" />

      <Text className="mt-12 font-metropolis-semibold default-text-color text-2xl">
        Transaction Details
      </Text>

      <FlatList
        data={transactionData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerClassName="gap-10"
        className="mt-12"
      />
    </SafeAreaView>
  );
};

export default transactionDetails;
