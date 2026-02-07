import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: "system" | "light" | "dark";
  onThemeSelect: (theme: "system" | "light" | "dark") => void;
}

const ThemeOption: React.FC<{
  theme: "system" | "light" | "dark";
  currentTheme: "system" | "light" | "dark";
  isDarkMode: boolean;
  onSelect: (theme: "system" | "light" | "dark") => void;
}> = ({ theme, currentTheme, isDarkMode, onSelect }) => {
  const themeLabels = {
    system: "Same as device",
    light: "Light",
    dark: "Dark",
  };

  const isSelected = currentTheme === theme;

  return (
    <TouchableOpacity
      className="flex-row items-center gap-4 py-2"
      onPress={() => onSelect(theme)}
    >
      <View className="items-center justify-center">
        <View
          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
            isDarkMode ? "border-gray-500" : "border-gray-300"
          } ${isSelected ? "border-primary" : ""}`}
        >
          {isSelected && (
            <View className="w-2.5 h-2.5 rounded-full bg-primary" />
          )}
        </View>
      </View>
      <Text
        className={`text-xl font-metropolis-semibold ${isSelected ? "default-text-color" : "text-content-300 dark:text-content-400"}`}
      >
        {themeLabels[theme]}
      </Text>
    </TouchableOpacity>
  );
};

const ThemeModal: React.FC<ThemeModalProps> = ({
  visible,
  onClose,
  currentTheme,
  onThemeSelect,
}) => {
  const colorMode = useColorScheme();
  const isDarkMode =
    currentTheme === "dark" ||
    (currentTheme === "system" && colorMode === "dark");

  const handleThemeSelect = (theme: "system" | "light" | "dark") => {
    onThemeSelect(theme);
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
        className="flex-1 bg-black/50 justify-end items-center"
        onPress={onClose}
      >
        <Pressable
          className={`w-full bg-white rounded-t-[20px] px-5 pt-5 pb-10 ${
            isDarkMode ? "bg-content-200" : ""
          }`}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="h-[3px] bg-gray-300 dark:bg-gray-600 mb-7 max-w-[40px] w-full mx-auto rounded-xl" />

          <View className="gap-4">
            <ThemeOption
              theme="system"
              currentTheme={currentTheme}
              isDarkMode={isDarkMode}
              onSelect={handleThemeSelect}
            />
            <ThemeOption
              theme="light"
              currentTheme={currentTheme}
              isDarkMode={isDarkMode}
              onSelect={handleThemeSelect}
            />
            <ThemeOption
              theme="dark"
              currentTheme={currentTheme}
              isDarkMode={isDarkMode}
              onSelect={handleThemeSelect}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ThemeModal;
