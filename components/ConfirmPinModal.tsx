import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  isLoading?: boolean;
}

const PinModal: React.FC<PinModalProps> = ({
  visible,
  onClose,
  onSuccess,
  title = "Confirm your Stase PIN",
  isLoading = false,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const colorScheme = useColorScheme();

  // Handle number press
  const handleNumberPress = (num: string) => {
    if (isLoading) return; // Prevent input when loading
    setError(""); // Clear error on new input

    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      // If PIN is complete, validate
      if (newPin.length === 4) {
        if (newPin === "1234") {
          setTimeout(() => {
            onSuccess(newPin);
          }, 300);
        } else {
          setError("Invalid PIN. Please try again.");
          setTimeout(() => {
            setPin("");
          }, 500);
        }
      }
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  // Reset modal
  const resetModal = () => {
    setPin("");
  };

  // Handle modal close
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Render PIN indicators
  const renderPinIndicators = () => {
    return (
      <View className="flex-row mb-8 gap-5">
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            className={`w-7 h-7 rounded-2xl ${
              index < pin.length ? "bg-primary" : "bg-content-400"
            }`}
          />
        ))}
      </View>
    );
  };

  // Render number pad
  const renderNumberPad = () => {
    const numbers = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["", "0", "⌫"],
    ];

    return numbers.map((row, rowIndex) => (
      <View key={rowIndex} className="flex-row justify-between">
        {row.map((num, colIndex) => (
          <TouchableOpacity
            key={`${rowIndex}-${colIndex}`}
            className={`w-[70px] h-[70px] rounded-[35px] justify-center items-center`}
            onPress={() => {
              if (num === "⌫") {
                handleBackspace();
              } else if (num !== "") {
                handleNumberPress(num);
              }
            }}
            disabled={num === ""}
          >
            <Text
              className={`font-metropolis-semibold text-[28px] text-content-200 dark:text-content-500 `}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  return (
    <>
      <StatusBar
        style={colorScheme === "dark" ? "light" : "dark"}
        backgroundColor={colorScheme === "dark" ? "#0E0F0C" : "#FFFFFF"}
      />

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClose}
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center bg-bg-light dark:bg-bg-dark">
            <ActivityIndicator size="large" className="text-primary" />
            <Text className="mt-4 text-2xl font-metropolis-semibold text-center text-content-100 dark:text-content-500">
              Setting up your PIN...
            </Text>
          </View>
        ) : (
          <View className="flex-1 bg-bg-light dark:bg-bg-dark p-5">
            <View className="flex-1 mt-8">
              <Text className="mb-8 text-[26px] font-metropolis-semibold text-content-200 dark:text-content-500">
                {title}
              </Text>

              {renderPinIndicators()}

              {error && (
                <Text className="mb-10 text-[17px] font-metropolis-semibold text-error">
                  {error}
                </Text>
              )}

              <View className="w-full max-w-[350px] flex gap-7 justify-end flex-1 mb-8">
                {renderNumberPad()}
              </View>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
};

export default PinModal;
