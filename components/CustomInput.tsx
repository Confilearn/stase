import cn from "clsx";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

interface Props {
  value?: string;
  onChangeText?: (text: string) => void;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
}

const CustomInput = ({
  value,
  onChangeText,
  label,
  error,
  secureTextEntry = false,
  keyboardType = "default",
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full flex gap-2">
      <Text className="text-[14px] text-content-300 dark:text-content-400 font-metropolis-semibold">
        {label}
      </Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(true)}
        className={cn(
          "p-3 border-content-200 dark:border-content-400 rounded-xl text-[16px] text-content-100 dark:text-content-500 font-metropolis-medium pt-4",
          isFocused
            ? "border-primary dark:border-primary border-[1.5px]"
            : "border-gray-300 border-[0.5px] ",
        )}
      />
      {error && (
        <Text className="text-[14px] text-error font-metropolis-semibold mt-2">
          {error}
        </Text>
      )}
    </View>
  );
};

export default CustomInput;
