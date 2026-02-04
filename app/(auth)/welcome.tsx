import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
  return (
    <SafeAreaView className="flex-1 justify-around bg-bg-light gap-8 dark:bg-bg-dark items-center p-4">
      <Image
        source={images.wallet}
        className="size-[300px] mt-4"
        resizeMode="contain"
      />

      <Text className="text-5xl font-metropolis-extrabold text-center pt-12 text-content-100 dark:text-content-500 leading-tight tracking-tighter">
        SEND MONEY AND GET PAID WITH EASE
      </Text>

      <View className="w-full flex items-center justify-center gap-2 py-2">
        <CustomButton
          title="Log in"
          style="w-full"
          textStyle="text-secondary"
          onPress={() => router.push("/sign-in")}
        />
        <CustomButton
          title="Register"
          style="w-full bg-secondary"
          textStyle="text-primary"
          onPress={() => router.push("/sign-up")}
        />
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
