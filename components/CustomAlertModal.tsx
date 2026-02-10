import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface AlertButton {
  text?: string;
  style?: "default" | "cancel" | "destructive";
  onPress: () => void;
}

interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onClose: () => void;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title,
  message,
  buttons,
  onClose,
}) => {
  const colorMode = useColorScheme();
  const isDarkMode = colorMode === "dark";

  const getButtonStyle = (style: string = "default") => {
    switch (style) {
      case "destructive":
        return "bg-red-500";
      case "cancel":
        return "bg-gray-300 dark:bg-gray-600";
      default:
        return "bg-primary";
    }
  };

  const getButtonTextStyle = (style: string = "default") => {
    switch (style) {
      case "destructive":
        return "text-white";
      case "cancel":
        return "text-content-100 dark:text-content-500";
      default:
        return "text-white";
    }
  };

  const handleButtonPress = (onPress: () => void) => {
    onPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={onClose}
      >
        <Pressable
          className="w-[85%] max-w-[320px] bg-white dark:bg-content-200 rounded-[16px] p-6"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <Text className="text-2xl font-metropolis-bold default-text-color text-center mb-3">
            {title}
          </Text>

          {/* Message */}
          {message && (
            <Text className="text-base font-metropolis-medium text-content-300 dark:text-content-400 text-center mb-6 leading-relaxed">
              {message}
            </Text>
          )}

          {/* Buttons */}
          <View className="gap-3">
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                className={`py-3 px-4 rounded-lg justify-center items-center ${getButtonStyle(
                  button.style,
                )}`}
                onPress={() => handleButtonPress(button.onPress)}
              >
                <Text
                  className={`text-base font-metropolis-semibold ${getButtonTextStyle(
                    button.style,
                  )}`}
                >
                  {button.text || "OK"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CustomAlertModal;
