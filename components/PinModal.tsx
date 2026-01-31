import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  isLoading?: boolean;
}

const { width } = Dimensions.get("window");

const PinModal: React.FC<PinModalProps> = ({
  visible,
  onClose,
  onSuccess,
  title = "Create your Stase PIN",
  isLoading = false,
}) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirmStep, setIsConfirmStep] = useState(false);

  // Handle number press
  const handleNumberPress = (num: string) => {
    if (isLoading) return; // Prevent input when loading
    
    if (isConfirmStep) {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + num;
        setConfirmPin(newConfirmPin);
        
        // If confirm PIN is complete, validate and call onSuccess
        if (newConfirmPin.length === 4) {
          if (newConfirmPin === pin) {
            onSuccess(pin);
          } else {
            // PINs don't match, reset to first step
            setTimeout(() => {
              setPin("");
              setConfirmPin("");
              setIsConfirmStep(false);
            }, 500);
          }
        }
      }
    } else {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        
        // If PIN is complete, move to confirm step
        if (newPin.length === 4) {
          setTimeout(() => {
            setIsConfirmStep(true);
          }, 300);
        }
      }
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    if (isConfirmStep) {
      setConfirmPin(confirmPin.slice(0, -1));
    } else {
      setPin(pin.slice(0, -1));
    }
  };

  // Reset modal
  const resetModal = () => {
    setPin("");
    setConfirmPin("");
    setIsConfirmStep(false);
  };

  // Handle modal close
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Render PIN indicators
  const renderPinIndicators = () => {
    const currentPin = isConfirmStep ? confirmPin : pin;
    return (
      <View style={styles.pinIndicators}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinIndicator,
              index < currentPin.length && styles.pinIndicatorFilled,
            ]}
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
      <View key={rowIndex} style={styles.numberRow}>
        {row.map((num, colIndex) => (
          <TouchableOpacity
            key={`${rowIndex}-${colIndex}`}
            style={[
              styles.numberButton,
              num === "" && styles.emptyButton,
              num === "⌫" && styles.backspaceButton,
            ]}
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
              style={[
                styles.numberText,
                num === "⌫" && styles.backspaceText,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isConfirmStep ? "Confirm your PIN" : title}
          </Text>
          
          {renderPinIndicators()}
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Setting up your PIN...</Text>
            </View>
          ) : (
            <View style={styles.numberPad}>
              {renderNumberPad()}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 40,
    textAlign: "center",
  },
  pinIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 60,
    gap: 15,
  },
  pinIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  pinIndicatorFilled: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  numberPad: {
    width: "100%",
    maxWidth: 300,
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyButton: {
    backgroundColor: "transparent",
  },
  backspaceButton: {
    backgroundColor: "#fee2e2",
  },
  numberText: {
    fontSize: 24,
    fontWeight: "500",
  },
  backspaceText: {
    fontSize: 20,
    color: "#dc2626",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default PinModal;
