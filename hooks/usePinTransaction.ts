import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";
import { checkAndNavigateToOffline } from "@/utils/offlineDetection";
interface PinTransactionOptions {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  transactionType: "transfer" | "withdraw" | "deposit" | "convert";
  transactionData: any;
}

export const usePinTransaction = () => {
  const [isConfirmingPin, setIsConfirmingPin] = useState(false);
  const router = useRouter();
  const { user, updateUserFromAPI } = useUserStore();

  const handlePinSuccess = useCallback(
    async (pin: string, options: PinTransactionOptions) => {
      setIsConfirmingPin(true);

      try {
        // Check network connectivity before making API calls
        const isOfflineMode = await checkAndNavigateToOffline(router);
        if (isOfflineMode) {
          setIsConfirmingPin(false);
          return;
        }

        if (!user) {
          throw new Error("User information missing");
        }

        // Validate PIN with backend first
        const pinValidation = await api.validateTransactionPin(
          pin,
          user.clerkUserId,
        );

        if (!pinValidation.success) {
          const errorMessage =
            pinValidation.error || "Invalid PIN. Please try again.";
          options.onError(errorMessage);
          return;
        }

        let response;
        let successMessage = "";

        // Handle different transaction types
        switch (options.transactionType) {
          case "transfer":
            response = await api.transferMoney(
              options.transactionData,
              user.clerkUserId,
            );
            if (response.success) {
              const symbol =
                options.transactionData.accountCurrency === "EUR"
                  ? "€"
                  : options.transactionData.accountCurrency === "GBP"
                    ? "£"
                    : "$";
              const fullName = `${options.transactionData.firstName} ${options.transactionData.lastName}`;
              successMessage = `${symbol}${parseFloat(options.transactionData.amount).toLocaleString()} sent to ${fullName}`;
            }
            break;

          case "withdraw":
            response = await api.withdrawMoney(
              options.transactionData,
              user.clerkUserId,
            );
            if (response.success) {
              const symbol =
                options.transactionData.accountCurrency === "EUR"
                  ? "€"
                  : options.transactionData.accountCurrency === "GBP"
                    ? "£"
                    : "$";
              successMessage = `${symbol}${parseFloat(options.transactionData.amount).toLocaleString()} withdrawn from your ${options.transactionData.accountCurrency} account`;
            }
            break;

          case "deposit":
            response = await api.depositMoney(
              options.transactionData,
              user.clerkUserId,
            );
            if (response.success) {
              const symbol =
                options.transactionData.accountCurrency === "EUR"
                  ? "€"
                  : options.transactionData.accountCurrency === "GBP"
                    ? "£"
                    : "$";
              successMessage = `${symbol}${parseFloat(options.transactionData.amount).toLocaleString()} added to your ${options.transactionData.accountCurrency} account`;
            }
            break;

          case "convert":
            response = await api.convertMoney(
              options.transactionData,
              user.clerkUserId,
            );
            if (response.success) {
              const fromSymbol =
                options.transactionData.convertFromAccountCurrency === "EUR"
                  ? "€"
                  : options.transactionData.convertFromAccountCurrency === "GBP"
                    ? "£"
                    : "$";
              const toSymbol =
                options.transactionData.convertToAccountCurrency === "EUR"
                  ? "€"
                  : options.transactionData.convertToAccountCurrency === "GBP"
                    ? "£"
                    : "$";
              successMessage = `${fromSymbol}${options.transactionData.convertFromAmount.toLocaleString()} converted to ${toSymbol}${options.transactionData.convertToAmount.toLocaleString()}`;
            }
            break;

          default:
            throw new Error("Invalid transaction type");
        }

        if (response.success) {
          // Update user store with data from backend response
          if (response.user && response.bankAccounts && response.transactions) {
            await updateUserFromAPI({
              user: response.user,
              bankAccounts: response.bankAccounts,
              transactions: response.transactions,
            });
          }

          options.onSuccess(successMessage);
        } else {
          throw new Error(response.error || "Transaction failed");
        }
      } catch (err: any) {
        console.error("Transaction error:", err);
        const errorMessage =
          err.message || "Transaction failed. Please try again.";
        options.onError(errorMessage);
      } finally {
        setIsConfirmingPin(false);
      }
    },
    [user, router, updateUserFromAPI],
  );

  return {
    isConfirmingPin,
    handlePinSuccess,
  };
};
