import CurrencyModal from "@/components/CurrencyModal";
import PinModal from "@/components/PinModal";
import CustomAlertModal from "@/components/CustomAlertModal";
import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";
import { localStorage } from "@/utils/localStorage";
import { Link, router } from "expo-router";
import { ArrowDown2, ArrowRight2, Bank, Clock } from "iconsax-react-native";
import { Check as LucideCheck, X } from "lucide-react-native";
import { useEffect, useState, useMemo } from "react";
import {
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  RefreshControl,
  ScrollView,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import type { ListRenderItem } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "convert" | "send" | "receive";
  amount: string;
  currency: string;
  date: string;
  status: "completed" | "failed" | "pending";
}

const TransactionItem = ({ item }: { item: Transaction }) => {
  const getCurrencySymbol = (currency: string) => {
    switch (currency.toUpperCase()) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "CAD":
        return "c$";
      default:
        return currency;
    }
  };

  const getIcon = () => {
    if (item.status === "failed") {
      return <X size="20" color="#FFFFFF" />;
    }
    return <LucideCheck size="20" color="#FFFFFF" />;
  };

  const getIconBgColor = () => {
    switch (item.status) {
      case "completed":
        return "bg-success";
      case "failed":
        return "bg-error";
      case "pending":
        return "bg-warning";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/transactionDetails/${item.id}` as any)}
      className="flex-row items-center justify-between w-full mb-6"
    >
      <View className="flex-row gap-3 items-center">
        <View
          className={`flex items-center justify-center size-11 rounded-full ${getIconBgColor()}`}
        >
          {getIcon()}
        </View>
        <View className="flex gap-1">
          <Text className="font-metropolis-semibold text-[17px] default-text-color capitalize">
            {item.type}
          </Text>
          <Text className="font-metropolis-semibold text-[14px] text-content-300">
            {item.date}
          </Text>
        </View>
      </View>
      <View>
        <Text className="font-metropolis-semibold text-[18px] default-text-color">
          {getCurrencySymbol(item.currency)}
          {Number(item.amount).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const renderTransactionItem: ListRenderItem<Transaction> = ({
  item,
  target,
}) => <TransactionItem item={item} />;

const formatBalance = (balance: number) => {
  const formatted = balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const parts = formatted.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Calculate total length without decimal point for font sizing
  const totalLength =
    integerPart.replace(/,/g, "").length +
    (decimalPart ? decimalPart.length : 0);

  let fontSizeClass = "text-7xl";
  if (totalLength < 6) {
    fontSizeClass = "text-7xl";
  } else if (totalLength < 8) {
    fontSizeClass = "text-6xl";
  } else {
    fontSizeClass = "text-5xl";
  }

  if (decimalPart) {
    return {
      text: (
        <>
          {integerPart}
          <Text className="text-3xl font-metropolis-semibold text-content-100 dark:text-content-500">
            .{decimalPart}
          </Text>
        </>
      ),
      fontSizeClass,
    };
  }

  return {
    text: integerPart,
    fontSizeClass,
  };
};

const BalanceSkeleton = () => {
  return (
    <View className="flex gap-5 mt-14">
      {/* Currency selector skeleton */}
      <View className="border-gray-300 dark:border-gray-600 border-[0.5px] px-3 py-2 rounded-full max-w-[86px] w-full mx-auto">
        <View className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
      </View>

      {/* Balance skeleton */}
      <View className="mt-6 mb-2 items-center">
        <View className="h-20 w-48 bg-gray-300 dark:bg-gray-600 rounded" />
      </View>

      {/* Account details button skeleton */}
      <View className="bg-gray-300 dark:bg-gray-600 rounded-full px-4 py-2 max-w-[210px] w-full mx-auto h-11" />
    </View>
  );
};

const TransactionSkeleton = () => {
  return (
    <View className="flex-row items-center justify-between w-full">
      <View className="flex-row gap-3 items-center">
        {/* Icon skeleton */}
        <View className="size-11 bg-gray-300 dark:bg-gray-600 rounded-full" />

        {/* Text skeletons */}
        <View className="flex gap-1">
          <View className="h-5 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
          <View className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded mt-1" />
        </View>
      </View>

      {/* Amount skeleton */}
      <View className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
    </View>
  );
};

const index = () => {
  const { user, transactions, bankAccounts, updateUserFromAPI, isLoading } =
    useUserStore();
  const [showPinModal, setShowPinModal] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedSymbol, setSelectedSymbol] = useState("$");
  const [selectedBalance, setSelectedBalance] = useState(0);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [] as Array<{
      text?: string;
      style?: "default" | "cancel" | "destructive";
      onPress: () => void;
    }>,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const colorMode = useColorScheme();

  // Format transactions and get last 3
  const recentTransactions = useMemo(() => {
    const formatted = transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.transactionType.toLowerCase() as
        | "deposit"
        | "withdraw"
        | "convert"
        | "send"
        | "receive",
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      date: new Date(transaction.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: transaction.status.toLowerCase() as
        | "completed"
        | "failed"
        | "pending",
    }));

    // Sort by date (most recent first) and take last 3
    return formatted
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [transactions]);

  // Check if user needs to set up PIN when component mounts
  useEffect(() => {
    checkPinSetup();
  }, []);

  // Set initial loading to false when data is available
  useEffect(() => {
    if (user && bankAccounts) {
      setIsInitialLoading(false);
    }
  }, [user, bankAccounts]);

  // Initialize balance and currency from first available account
  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0) {
      const firstAccount = bankAccounts[0];
      setSelectedCurrency(firstAccount.accountCurrency);
      setSelectedSymbol(
        firstAccount.accountCurrency === "EUR"
          ? "€"
          : firstAccount.accountCurrency === "GBP"
            ? "£"
            : "$",
      );
      setSelectedBalance(firstAccount.balance);
    }
  }, [bankAccounts]);

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
        setAlertConfig({
          title: "Error",
          message: "User data not found. Please try signing in again.",
          buttons: [
            {
              text: "OK",
              style: "default",
              onPress: () => {},
            },
          ],
        });
        setShowAlertModal(true);
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
        setAlertConfig({
          title: "Success",
          message: "PIN created successfully!",
          buttons: [
            {
              text: "OK",
              style: "default",
              onPress: () => {},
            },
          ],
        });
        setShowAlertModal(true);
      } else {
        console.error("PIN API error:", response);
        setAlertConfig({
          title: "Error",
          message: response.error || "Failed to set PIN. Please try again.",
          buttons: [
            {
              text: "OK",
              style: "default",
              onPress: () => {},
            },
          ],
        });
        setShowAlertModal(true);
      }
    } catch (error: any) {
      console.error("Error setting PIN:", error);
    } finally {
      setIsCreatingPin(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Get current user data to obtain clerkUserId
      const localUserData = await localStorage.getUserData();
      if (!localUserData?.user?.clerkUserId) {
        console.error("No user ID found for refresh");
        return;
      }

      // Fetch fresh data from API
      const response = await api.fetchUserDetails(
        localUserData.user.clerkUserId,
      );

      if (response.success && response.user) {
        // Update store with fresh data
        await updateUserFromAPI({
          user: response.user,
          bankAccounts: response.bankAccounts || [],
          transactions: response.transactions || [],
        });

        // Re-check PIN setup in case user data changed
        await checkPinSetup();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Memoize refresh control to prevent unnecessary re-renders
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={colorMode === "dark" ? "#ffffff" : "#000000"}
        colors={[colorMode === "dark" ? "#A0CCFF" : "#0A385D"]}
      />
    ),
    [refreshing, colorMode],
  );

  return (
    <>
      <SafeAreaView className="container">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {/* Header */}
          <View className="flex-row my-2 items-center justify-between">
            <TouchableOpacity
              className="px-3 py-2.5 flex justify-center items-center bg-secondary rounded-full"
              onPress={() => {
                router.push("/(app)/profile");
              }}
            >
              <Text className="text-center text-lg font-metropolis-semibold text-primary">
                {user?.firstName && user?.lastName
                  ? `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`
                  : "CE"}
              </Text>
            </TouchableOpacity>
            <Link
              href="/referral"
              className="px-4 py-2 bg-primary rounded-full active:opacity-80"
            >
              <Text className="text-center text-lg font-metropolis-semibold text-secondary">
                Earn $50
              </Text>
            </Link>
          </View>

          {/* Balance Pill */}
          {isInitialLoading ? (
            <BalanceSkeleton />
          ) : (
            <View className="flex gap-5 mt-12">
              <TouchableOpacity
                className="border-gray-300 dark:border-gray-600 border-[0.5px] px-3 py-2 rounded-full max-w-[86px] w-full mx-auto flex-row items-center justify-between"
                onPress={() => setShowCurrencyModal(true)}
              >
                <Text className="text-[13px] font-metropolis-semibold default-text-color">
                  {selectedCurrency}
                </Text>
                <ArrowDown2
                  size={20}
                  color={colorMode === "dark" ? "white" : "black"}
                />
              </TouchableOpacity>
              {/* Balance Display */}
              <View className="mt-6 mb-2">
                {(() => {
                  const formattedBalance = formatBalance(selectedBalance);
                  return (
                    <Text
                      className={`text-center font-metropolis-bold text-content-100 dark:text-content-500 ${formattedBalance.fontSizeClass}`}
                    >
                      {selectedSymbol}
                      {formattedBalance.text}
                    </Text>
                  );
                })()}
              </View>
              {/* Account Details Button */}
              <TouchableOpacity
                className="bg-primary rounded-full px-4 py-2 max-w-[210px] w-full mx-auto flex-row items-center justify-around gap-2"
                onPress={() => {
                  router.push(`/(app)/bankDetails/${selectedCurrency}` as any);
                }}
              >
                <Bank size="20" color="#0A385D" variant="Outline" />
                <Text className="text-center text-secondary font-metropolis-semibold text-lg">
                  Account details
                </Text>
                <ArrowRight2 size="20" color="#0A385D" variant="Outline" />
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View className="mt-14 flex-row items-center justify-between">
            <TouchableOpacity
              className="bg-primary rounded-full px-5 py-3"
              onPress={() => {
                router.push("/(app)/transfer");
              }}
            >
              <Text className="text-center text-secondary font-metropolis-semibold text-[15px]">
                Send
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-secondary rounded-full px-5 py-3"
              onPress={() => {
                router.push("/(app)/deposit");
              }}
            >
              <Text className="text-center text-primary font-metropolis-semibold text-[15px]">
                Add Money
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-secondary rounded-full px-5 py-3"
              onPress={() => {
                router.push("/(app)/withdraw");
              }}
            >
              <Text className="text-center text-primary font-metropolis-semibold text-[15px]">
                Withdraw
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transactions Section */}
          <View className="flex-1">
            {/* Transaction Header */}
            <View className="mt-16 mb-3 flex-row items-center justify-between">
              <Text className="default-text-color font-metropolis-semibold text-2xl">
                Transactions
              </Text>
              <Link
                href="/(app)/(tabs)/history"
                className="default-text-color font-metropolis-semibold text-lg"
              >
                View all
              </Link>
            </View>
            {/* Transactions List */}
            {isInitialLoading ? (
              <View className="flex-1">
                <View className="mt-4" style={{ gap: 20 }}>
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                </View>
              </View>
            ) : recentTransactions.length === 0 ? (
              <View className="mt-5 flex-col items-center justify-center gap-2">
                <Clock size="75" color="#6A6C6A" variant="Outline" />
                <Text className="text-content-300 font-metropolis-semibold text-lg">
                  No transactions yet
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                <FlashList
                  data={recentTransactions}
                  renderItem={renderTransactionItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingTop: 16 }}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  getItemType={(item, index) => "view"}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Currency Modal */}
      <CurrencyModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        onCurrencySelect={(account) => {
          setSelectedCurrency(account.accountCurrency);
          setSelectedSymbol(
            account.accountCurrency === "EUR"
              ? "€"
              : account.accountCurrency === "GBP"
                ? "£"
                : "$",
          );
          setSelectedBalance(account.balance);
        }}
        selectedCurrency={selectedCurrency}
        bankAccounts={bankAccounts}
      />

      {/* PIN Creation Modal */}
      <PinModal
        visible={showPinModal}
        isLoading={isCreatingPin}
        onClose={() => {
          setAlertConfig({
            title: "PIN Required",
            message:
              "A transaction PIN is required for transactions. You can set it up later in Settings.",
            buttons: [
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
          });
          setShowAlertModal(true);
        }}
        onSuccess={handlePinSuccess}
        title="Create your Stase PIN"
      />

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setShowAlertModal(false)}
      />
    </>
  );
};

export default index;
