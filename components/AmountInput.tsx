import { TextInput } from "react-native";
import cn from "clsx";

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  editable?: boolean;
  placeholder?: string;
  keyboardType?: "numeric" | "default";
}

const AmountInput = ({
  value,
  onChangeText,
  error = false,
  editable = true,
  placeholder = "0",
  keyboardType = "numeric",
}: AmountInputProps) => {
  return (
    <TextInput
      className={cn(
        "text-5xl font-metropolis-bold",
        error ? "text-error" : "text-primary",
      )}
      value={value}
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      editable={editable}
      placeholder={placeholder}
      placeholderTextColor="#6A6C6A"
    />
  );
};

export default AmountInput;
