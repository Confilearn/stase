import cn from "clsx";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  textStyle?: string;
  leftIcon?: React.ReactNode;
  isLoading?: boolean;
}

const CustomButton = ({
  onPress,
  title = "Click Me",
  style,
  textStyle,
  leftIcon,
  isLoading = false,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      className={cn(
        "p-4 bg-primary rounded-full flex-row items-center justify-center gap-5",
        style,
      )}
      onPress={onPress}
    >
      {leftIcon}
      <View className="flex-center flex-row">
        {isLoading ? (
          <ActivityIndicator size={"small"} color={"white"} />
        ) : (
          <Text
            className={cn(
              "text-center font-metropolis-bold text-[16px]",
              textStyle,
            )}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
