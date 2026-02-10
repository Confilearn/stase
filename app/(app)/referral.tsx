import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const card = () => {
  return (
    <SafeAreaView className="container justify-around align-center">
      <Image
        source={images.gift}
        className="size-[300px] mx-auto mt-4"
        resizeMode="contain"
      />

      <View className="flex items-center justify-center gap-5">
        <Text className="font-metropolis-extrabold text-4xl text-secondary dark:text-white text-center">
          FEATURE COMING SOON
        </Text>
        <Text className="text-center font-metropolis-medium text-lg text-content-300">
          Join our waitlist to be the first to hear when this feature becomes
          available.
        </Text>
      </View>

      <View className="gap-2 justify-end">
        <CustomButton title="Join the waitlist" textStyle="text-secondary" />
        <CustomButton
          title="Learn more"
          style="bg-white border-[0.7px] border-content-400 dark:border-0"
          textStyle="text-secondary"
        />
      </View>
    </SafeAreaView>
  );
};

export default card;
