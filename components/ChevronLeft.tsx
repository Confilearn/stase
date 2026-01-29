import Fontisto from "@expo/vector-icons/Fontisto";
import { useColorScheme } from "react-native";

const ChevronLeft = () => {
  const colorScheme = useColorScheme();

  return (
    <Fontisto
      name="angle-left"
      size={20}
      color={colorScheme === "dark" ? "white" : "black"}
    />
  );
};

export default ChevronLeft;
