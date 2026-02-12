import { ArrowDown2 } from "iconsax-react-native";
import { TouchableOpacity, Text, useColorScheme } from "react-native";

interface CurrencySelectorProps {
  selectedCurrency?: string;
  onPress: () => void;
  placeholder?: string;
}

const CurrencySelector = ({
  selectedCurrency,
  onPress,
  placeholder = "Select",
}: CurrencySelectorProps) => {
  const colorMode = useColorScheme();

  return (
    <TouchableOpacity
      className="border-gray-300 dark:border-gray-600 border-[0.5px] px-3 py-2 rounded-full max-w-[75px] w-full flex-row items-center justify-between"
      onPress={onPress}
    >
      <Text className="text-[12px] font-metropolis-semibold default-text-color">
        {selectedCurrency || placeholder}
      </Text>
      <ArrowDown2 size={20} color={colorMode === "dark" ? "white" : "black"} />
    </TouchableOpacity>
  );
};

export default CurrencySelector;
