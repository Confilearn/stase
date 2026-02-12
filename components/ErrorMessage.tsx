import { Text } from "react-native";

interface ErrorMessageProps {
  message: string;
  visible?: boolean;
}

const ErrorMessage = ({ message, visible = true }: ErrorMessageProps) => {
  if (!visible || !message) return null;

  return (
    <Text className="text-[14px] text-error font-metropolis-semibold mt-5">
      {message}
    </Text>
  );
};

export default ErrorMessage;
