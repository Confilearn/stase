import ChevronLeft from "@/components/ChevronLeft";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { Link } from "expo-router";
import { Moon, Sun1 } from "iconsax-react-native";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const colorMode = useColorScheme();

  return (
    <SafeAreaView className="container justify-between align-center">
      <View className="flex-row gap-5 mt-2 items-center justify-between">
        <Link href={"/(app)/(tabs)"}>
          <ChevronLeft />
        </Link>
        <TouchableOpacity>
          {colorMode === "light" ? (
            <Moon size="26" color="#000000" variant="Bulk" />
          ) : (
            <Sun1 size="26" color="#FFFFFF" variant="Bulk" />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex items-center justify-center gap-7">
        <View className="bg-bg-neutral dark:bg-content-200 size-36 rounded-full flex items-center justify-center">
          <Text className="text-5xl font-metropolis-semibold default-text-color">
            CE
          </Text>
        </View>

        <Text className="font-metropolis-extrabold text-5xl default-text-color text-center">
          EZEORAH CONFIDENCE
        </Text>

        <TouchableOpacity className="flex items-center justify-center py-1.5 px-4 rounded-full bg-bg-neutral dark:bg-content-200">
          <Text className="font-metropolis-semibold text-lg default-text-color">
            @confidence
          </Text>
        </TouchableOpacity>
      </View>

      <View className="justify-end">
        <CustomButton
          title="Logout"
          textStyle="text-content-500"
          style="bg-error"
        />
      </View>
    </SafeAreaView>
  );
};

export default Profile;
