import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { Link } from "expo-router";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Offline = () => {
  return (
    <SafeAreaView className="container justify-between align-center">
      <View className="flex-row gap-5 mt-2 items-center">
        <Link href={"/(app)/(tabs)"}>
          <ChevronLeft />
        </Link>
      </View>

      <View className="gap-20">
        <Image
          source={images.wifi}
          className="size-[300px] mt-4"
          resizeMode="contain"
        />
        <View className="flex items-center justify-center gap-5">
          <Text className="font-metropolis-extrabold text-5xl text-secondary dark:text-white text-center">
            Looks Like You’re Offline
          </Text>
          <Text className="text-center font-metropolis-medium text-lg text-content-300">
            Check your connection and refresh
          </Text>
        </View>
      </View>
      <View className="justify-end">
        <CustomButton title="Refresh" textStyle="text-secondary" />
      </View>
    </SafeAreaView>
  );
};

export default Offline;
