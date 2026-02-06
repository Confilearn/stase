import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { View, Text, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

const SuccessModal = ({ visible, onClose, message }: SuccessModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView className="container">
        <View className="gap-10 mt-20">
          <Image
            source={images.checkbox}
            className="size-[180px] mt-4 mx-auto"
            resizeMode="contain"
          />

          <Text className="text-center font-metropolis-semibold text-3xl default-text-color">
            {message}
          </Text>
        </View>
        <View className="flex-1 justify-end">
          <CustomButton
            title="Done"
            onPress={onClose}
            textStyle="text-secondary"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SuccessModal;
