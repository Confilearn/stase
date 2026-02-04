import CustomButton from "@/components/CustomButton";
import PinModal from "@/components/PinModal";
import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";
import { localStorage } from "@/utils/localStorage";
import { useAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  const { user, updateUserFromAPI } = useUserStore();
  const { getToken } = useAuth();
  const [showPinModal, setShowPinModal] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Check if user needs to set up PIN when component mounts
  useEffect(() => {
    checkPinSetup();
  }, []);

  const checkPinSetup = async () => {
    try {
      // Get current user data from local storage
      const localUserData = await localStorage.getUserData();
      if (!localUserData || !localUserData.user) return;

      // Check if user has PIN by calling the API
      try {
        const response = await api.checkTransactionPin(
          localUserData.user.clerkUserId,
        );
        if (response.success && !response.hasTransactionPin) {
          // User doesn't have PIN, show modal
          setShowPinModal(true);
        }
      } catch (error) {
        console.error("Error checking PIN status:", error);
        // If API fails, don't show modal
      }

      // User data loaded successfully
      setUserData(localUserData);
    } catch (error) {
      console.error("Error in checkPinSetup:", error);
    }
  };

  const handlePinSuccess = async (pin: string) => {
    setIsCreatingPin(true);
    try {
      if (!userData || !userData.user.clerkUserId) {
        Alert.alert(
          "Error",
          "User data not found. Please try signing in again.",
        );
        setShowPinModal(false);
        return;
      }

      console.log(
        "Setting transaction PIN for user:",
        userData.user.clerkUserId,
      );

      // Call API to set transaction PIN
      const response = await api.createUserTransactionPin(
        pin,
        userData.user.clerkUserId,
      );

      if (response.success) {
        console.log("PIN set successfully:", response);

        // Update user data after PIN creation
        const updatedUserData = {
          ...userData,
          user: {
            ...userData.user,
          },
        };

        await updateUserFromAPI(updatedUserData);
        await localStorage.setUserData(updatedUserData);
        setUserData(updatedUserData);

        setShowPinModal(false);
        Alert.alert("Success", "PIN created successfully!");
      } else {
        console.error("PIN API error:", response);
        Alert.alert(
          "Error",
          response.error || "Failed to set PIN. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error setting PIN:", error);
    } finally {
      setIsCreatingPin(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4 gap-5">
      <Text className="font-metropolis-semibold text-2xl text-secondary">
        {user?.firstName + " " + user?.lastName}
      </Text>
      <Text className="font-metropolis-semibold text-2xl text-secondary">
        {user?.email}
      </Text>
      <Text className="font-metropolis-semibold text-2xl text-secondary">
        {user?.username}
      </Text>

      <View className="flex-1" />

      <Link href="/(app)/settings" asChild>
        <CustomButton title="Go to Settings" />
      </Link>

      {/* PIN Creation Modal */}
      <PinModal
        visible={showPinModal}
        isLoading={isCreatingPin}
        onClose={() => {
          Alert.alert(
            "PIN Required",
            "A transaction PIN is required for transactions. You can set it up later in Settings.",
            [
              {
                text: "Set PIN Now",
                style: "cancel",
                onPress: () => {
                  // Keep modal open
                  setShowPinModal(true);
                },
              },
              {
                text: "Later",
                onPress: () => {
                  setShowPinModal(false);
                },
              },
            ],
          );
        }}
        onSuccess={handlePinSuccess}
        title="Create your Stase PIN"
      />
    </SafeAreaView>
  );
};

export default index;
