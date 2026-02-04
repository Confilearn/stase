import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const card = () => {
  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark p-5 relative">
      <Text className="font-metropolis-semibold text-2xl text-content-100 dark:text-content-500">
        Card
      </Text>
    </SafeAreaView>
  );
};

export default card;
