import { Link } from "expo-router";
import { View, Text } from "react-native";
import ChevronLeft from "./ChevronLeft";

interface ScreenHeaderProps {
  title: string;
  backHref?: string;
  rightComponent?: React.ReactNode;
}

const ScreenHeader = ({
  title,
  backHref = "/(app)/(tabs)",
  rightComponent,
}: ScreenHeaderProps) => {
  return (
    <View className="flex-row gap-5 mt-2 items-center justify-between">
      <View className="flex-row gap-5 items-center">
        <Link href={backHref as any}>
          <ChevronLeft />
        </Link>
        <Text className="text-2xl font-metropolis-bold text-content-100 dark:text-content-500">
          {title}
        </Text>
      </View>
      {rightComponent}
    </View>
  );
};

export default ScreenHeader;
