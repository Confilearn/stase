import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-bg-dark">
      <Text className="text-7xl font-metropolis-semibold text-bg-light">
        $100.07
      </Text>
    </SafeAreaView>
  );
}