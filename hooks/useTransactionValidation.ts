import { useState, useCallback } from "react";

interface ValidationOptions {
  amount: string;
  selectedAccount?: any;
  verifiedUser?: any;
  recipientText?: string;
  fromCurrencyAccount?: any;
  toCurrencyAccount?: any;
  transactionType?: 'transfer' | 'withdraw' | 'deposit' | 'convert';
}

interface ValidationError {
  message: string;
  isValid: boolean;
}

export const useTransactionValidation = () => {
  const [error, setError] = useState<string>("");

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const validateAmount = useCallback((options: ValidationOptions): ValidationError => {
    const { amount, selectedAccount, transactionType } = options;
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return {
        message: "Please enter a valid amount",
        isValid: false,
      };
    }

    if (selectedAccount && numAmount > selectedAccount.balance) {
      return {
        message: "Insufficient funds",
        isValid: false,
      };
    }

    if (numAmount > 100000) {
      const limitType = transactionType === 'deposit' ? 'deposit' : 'withdrawal';
      return {
        message: `Maximum ${limitType} limit is 100,000 per transaction`,
        isValid: false,
      };
    }

    return {
      message: "",
      isValid: true,
    };
  }, []);

  const validateTransfer = useCallback((options: ValidationOptions): ValidationError => {
    const { recipientText, verifiedUser, selectedAccount, amount } = options;

    if (!recipientText?.trim()) {
      return {
        message: "Please enter recipient's email or username",
        isValid: false,
      };
    }

    if (!verifiedUser) {
      return {
        message: "Please verify the recipient before continuing",
        isValid: false,
      };
    }

    if (!selectedAccount) {
      return {
        message: "Please select an account",
        isValid: false,
      };
    }

    return validateAmount(options);
  }, [validateAmount]);

  const validateConvert = useCallback((options: ValidationOptions): ValidationError => {
    const { fromCurrencyAccount, toCurrencyAccount } = options;

    if (!fromCurrencyAccount || !toCurrencyAccount) {
      return {
        message: "Please select both currencies",
        isValid: false,
      };
    }

    if (fromCurrencyAccount.accountCurrency === toCurrencyAccount.accountCurrency) {
      return {
        message: "Cannot convert between the same currency",
        isValid: false,
      };
    }

    return validateAmount(options);
  }, [validateAmount]);

  const validateWithdraw = useCallback((options: ValidationOptions): ValidationError => {
    const { selectedAccount } = options;

    if (!selectedAccount) {
      return {
        message: "Please select an account",
        isValid: false,
      };
    }

    return validateAmount(options);
  }, [validateAmount]);

  const validateDeposit = useCallback((options: ValidationOptions): ValidationError => {
    return validateAmount(options);
  }, [validateAmount]);

  const setErrorMessage = useCallback((message: string) => {
    setError(message);
  }, []);

  return {
    error,
    setError: setErrorMessage,
    clearError,
    validateAmount,
    validateTransfer,
    validateConvert,
    validateWithdraw,
    validateDeposit,
  };
};
