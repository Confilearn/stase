import { ActionButton } from "@/components/ActionButton";
import ChevronLeft from "@/components/ChevronLeft";
import { Link } from "expo-router";
import {
  Add,
  ArrowSwapHorizontal,
  ClipboardText,
  MoneyTick,
  Send2,
} from "iconsax-react-native";
import { Text, TouchableOpacity, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const bankDetails = () => {
  const bankDetailsData = [
    { label: "Account Name", value: "John Michael Smith" },
    { label: "Account Number", value: "1234567890" },
    { label: "Sort Code", value: "40-12-34" },
    { label: "IBAN", value: "GB29 NWBK 6016 1313 3333 22" },
    { label: "Bank Name", value: "National Westminster Bank" },
    { label: "Branch Address", value: "123 Queen Street, London SW1A 1AA" },
    { label: "Swift Code", value: "NWBKGB2L" },
  ];

  const renderBankDetailItem = ({
    item,
  }: {
    item: (typeof bankDetailsData)[0];
  }) => (
    <View className="flex-row items-center justify-between mb-6">
      <View className="gap-0.5">
        <Text className="text-content-300 font-metropolis-semibold text-[16px]">
          {item.label}
        </Text>
        <Text className="text-content-200 dark:text-content-400 font-metropolis-semibold text-lg">
          {item.value}
        </Text>
      </View>
      <TouchableOpacity>
        <ClipboardText size="25" color="#6A6C6A" />
      </TouchableOpacity>
    </View>
  );

  const actions = [
    {
      icon: <Add size="26" color="#0A385D" variant="Outline" />,
      label: "Add",
      onPress: () => console.log("Add pressed"),
    },
    {
      icon: <ArrowSwapHorizontal size="26" color="#0A385D" variant="Outline" />,
      label: "Convert",
      onPress: () => console.log("Convert pressed"),
    },
    {
      icon: <Send2 size="26" color="#0A385D" variant="Outline" />,
      label: "Send",
      onPress: () => console.log("Send pressed"),
    },
    {
      icon: <MoneyTick size="26" color="#0A385D" variant="Outline" />,
      label: "Withdraw",
      onPress: () => console.log("Withdraw pressed"),
    },
  ];
  return (
    <SafeAreaView className="container">
      <View className="flex-row gap-5 mt-2 items-center">
        <Link href={"/(app)/(tabs)"}>
          <ChevronLeft />
        </Link>
      </View>

      {/* Balance Section */}
      <View className="mt-8 gap-1.5">
        <View className="size-24 bg-blue-400 rounded-full"></View>

        <Text className="font-metropolis-semibold text-xl text-content-200 dark:text-content-400 mt-4">
          GBP Balance
        </Text>
        <Text className="font-metropolis-semibold text-6xl default-text-color">
          £1,234<Text className="text-3xl">.56</Text>
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
      <View className="mt-10 mb-7">
        <Text className="font-metropolis-bold text-2xl default-text-color">
          Account Details
        </Text>
      </View>

      <FlatList
        data={bankDetailsData}
        renderItem={renderBankDetailItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default bankDetails;
