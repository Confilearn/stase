import CustomButton from "@/components/CustomButton";
import PinModal from "@/components/PinModal";
import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";
import { localStorage } from "@/utils/localStorage";
import { syncManager } from "@/utils/sync";
import { useAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  const { user, bankAccounts, updateUserFromAPI } = useUserStore();
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
      const token = await getToken();
      if (!token) return;

      // Get current user data from local storage
      const localUserData = await localStorage.getUserData();
      if (!localUserData) return;

      setUserData(localUserData);

      // Check if user has transaction PIN
      if (!localUserData.user.hasTransactionPin) {
        // Try to check with server first
        try {
          const response = await api.checkTransactionPin(token);
          if (!response.success) {
            // User doesn't have PIN, show modal
            setShowPinModal(true);
          }
        } catch (error) {
          console.error("Error checking PIN status:", error);
          // If offline, check local data and show modal if needed
          if (!localUserData.user.hasTransactionPin) {
            setShowPinModal(true);
          }
        }
      }
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

        // Update user data with PIN status
        const updatedUserData = {
          ...userData,
          user: {
            ...userData.user,
            hasTransactionPin: true,
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

      // Queue the action for later if offline
      if (userData?.user.clerkUserId) {
        await syncManager.queueAction({
          type: "set_pin",
          data: { pin },
        });

        Alert.alert(
          "Offline Mode",
          "PIN will be set when connection is restored. You can continue using the app.",
        );

        // Continue with the flow anyway
        const updatedUserData = {
          ...userData,
          user: {
            ...userData.user,
            hasTransactionPin: true,
          },
        };

        await updateUserFromAPI(updatedUserData);
        await localStorage.setUserData(updatedUserData);
        setUserData(updatedUserData);

        setShowPinModal(false);
      } else {
        Alert.alert(
          "Connection Error",
          "Unable to connect to server. Please check your connection and try again.",
        );
      }
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

      {!user?.hasTransactionPin && (
        <View className="bg-yellow-100 border border-yellow-400 rounded-lg p-3">
          <Text className="text-yellow-800 text-sm">
            ⚠️ You need to set up your transaction PIN to perform transactions.
          </Text>
        </View>
      )}

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
