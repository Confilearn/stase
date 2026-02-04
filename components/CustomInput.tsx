import cn from "clsx";
import { useState } from "react";
import { Text, TextInput, View, TouchableOpacity } from "react-native";

interface Props {
  value?: string;
  onChangeText?: (text: string) => void;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  editable?: boolean;
}

const CustomInput = ({
  value,
  onChangeText,
  label,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="w-full flex gap-3">
      <Text className="text-[14px] text-content-300 dark:text-content-400 font-metropolis-semibold">
        {label}
      </Text>
      <View className="relative">
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "p-3 rounded-xl text-[16px] text-content-100 dark:text-content-500 font-metropolis-medium pt-4",
            isFocused
              ? "border-primary dark:border-primary border-[1.5px]"
              : "border-gray-300 dark:border-gray-600 border-[0.5px]",
            secureTextEntry && "pr-12",
          )}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
          >
            <Text className="text-content-300 dark:text-content-400 text-[18px]">
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-[14px] text-error font-metropolis-semibold mt-2">
          {error}
        </Text>
      )}
    </View>
  );
};

export default CustomInput;
