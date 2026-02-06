import { View, TouchableOpacity, Text } from "react-native";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
}) => (
  <View className="flex items-center justify-center gap-2">
    <TouchableOpacity
      className="size-16 bg-primary flex items-center justify-center rounded-full"
      onPress={onPress}
    >
      {icon}
    </TouchableOpacity>
    <Text className="font-metropolis-semibold text-[15px] default-text-color">
      {label}
    </Text>
  </View>
);
