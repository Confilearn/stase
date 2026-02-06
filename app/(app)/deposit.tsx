import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import { Link } from "expo-router";
import { ArrowDown2 } from "iconsax-react-native";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import cn from "clsx";
import ConfirmPinModal from "@/components/ConfirmPinModal";

const deposit = () => {
  const colorMode = useColorScheme();
  const onChangeText = (text: string) => {
    setAmount(text);
  };

  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState(true);
  const [isConfirmingPin, setisConfirmingPin] = useState(false);

  const handlePinSuccess = () => {
    setShowPinModal(false);
  };

  return (
    <>
      <SafeAreaView className="container">
        <View className="flex-row gap-5 mt-2 items-center">
          <Link href={"/(app)/(tabs)"}>
            <ChevronLeft />
          </Link>
          <Text className="text-2xl font-metropolis-bold text-content-100 dark:text-content-500">
            Deposit
          </Text>
        </View>

        {/* Currency selector and amount */}
        <View className="mt-16 relative flex-row items-center gap-2 justify-between">
          <TouchableOpacity className="border-gray-300 dark:border-gray-600 border-[0.5px] px-3 py-2 rounded-full max-w-[75px] w-full flex-row items-center justify-between">
            <Text className="text-[12px] font-metropolis-semibold default-text-color">
              GBP
            </Text>
            <ArrowDown2
              size={20}
              color={colorMode === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <TextInput
            className={cn(
              "text-5xl font-metropolis-bold",
              error ? "text-error" : "text-primary",
            )}
            value={amount}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChangeText}
            keyboardType="numeric"
            editable={true}
            placeholder="0"
            placeholderTextColor="#6A6C6A"
          />
        </View>

        {/* Error message */}
        {error && (
          <Text className="text-[14px] text-error font-metropolis-semibold mt-5">
            {error}
          </Text>
        )}

        <View className="h-[0.3px] bg-gray-300 mt-12" />

        {/* Balance info */}
        <View className="flex-row items-center justify-between mt-12">
          <Text className="text-lg font-metropolis-semibold text-content-300">
            Balance
          </Text>
          <Text className="text-lg font-metropolis-semibold default-text-color">
            £500.00
          </Text>
        </View>

        {/* Continue button */}
        <View className="flex-1 justify-end">
          <CustomButton title="Continue" textStyle="text-secondary" />
        </View>
      </SafeAreaView>

      {/* PIN Creation Modal */}
      <ConfirmPinModal
        visible={showPinModal}
        isLoading={isConfirmingPin}
        onClose={() => {}}
        onSuccess={handlePinSuccess}
        title="Confirm your Stase PIN"
      />
    </>
  );
};

export default deposit;
