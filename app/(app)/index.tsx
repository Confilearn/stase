import CustomButton from "@/components/CustomButton";
import { useUserStore } from "@/store/user.store";
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  const { user, bankAccounts } = useUserStore();

  return (
    <SafeAreaView className="flex-1 bg-background p-4 gap-5">
      <Text className="font-metropolis-semibold text-2xl text-secondary">
        {user?.firstName + " " + user?.lastName}
      </Text>
      <Text className="font-metropolis-semibold text-2xl text-secondary">
        {user?.email}
      </Text>
      <Text className="font-metropolis-semibold text-2xl text-secondary">
        {user?.username}
      </Text>

      <View className="flex-1" />

      <Link href="/(app)/settings" asChild>
        <CustomButton title="Go to Settings" />
      </Link>
    </SafeAreaView>
  );
};

export default index;
