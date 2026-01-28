import { connectToDatabase } from "@/lib/mongodb";
import { BankAccount, SupportedCurrency } from "@/models/BankAccount";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import { 
  convertCurrency, 
  getExchangeRate, 
  isValidCurrencyPair, 
  SupportedCurrency as CurrencyType 
} from "@/utils/currencyRates";
import mongoose from "mongoose";

interface ConvertMoneyRequest {
  // Conversion details
  convertFromAmount: number;
  convertFromAccountCurrency: SupportedCurrency;
  convertToAmount: number;
  convertToAccountCurrency: SupportedCurrency;
  currencyPairs: string; // e.g., "USD-CAD"
  
  // User identification (in a real app, this would come from auth token)
  userId?: string; // Optional for testing, in production get from auth
}

/**
 * Start a MongoDB transaction for atomic operations
 */
async function startTransaction() {
  await connectToDatabase();
  const session = await mongoose.startSession();
  session.startTransaction();
  return session;
}

export const POST = async (request: Request) => {
  const session = await startTransaction();

  try {
    // Parse request body
    const body: ConvertMoneyRequest = await request.json();
    const { 
      convertFromAmount, 
      convertFromAccountCurrency, 
      convertToAmount, 
      convertToAccountCurrency, 
      currencyPairs,
      userId 
    } = body;

    // ============= INPUT VALIDATION =============

    // Validate required fields
    if (!convertFromAmount || !convertFromAccountCurrency || 
        !convertToAmount || !convertToAccountCurrency || !currencyPairs) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "All conversion fields are required: convertFromAmount, convertFromAccountCurrency, convertToAmount, convertToAccountCurrency, currencyPairs",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate amounts are positive numbers
    if (convertFromAmount <= 0 || convertToAmount <= 0) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Conversion amounts must be positive numbers",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate currency pair format
    const expectedPair = `${convertFromAccountCurrency}-${convertToAccountCurrency}`;
    if (currencyPairs !== expectedPair) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Currency pair mismatch. Expected: ${expectedPair}, Provided: ${currencyPairs}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate supported currencies
    if (!isValidCurrencyPair(convertFromAccountCurrency, convertToAccountCurrency)) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Unsupported currency pair: ${currencyPairs}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate conversion rate matches our static rates
    const expectedRate = getExchangeRate(
      convertFromAccountCurrency as CurrencyType, 
      convertToAccountCurrency as CurrencyType
    );
    const actualRate = convertToAmount / convertFromAmount;
    
    // Allow small rounding differences (0.001 tolerance)
    if (Math.abs(expectedRate - actualRate) > 0.001) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Invalid conversion rate. Expected rate: ${expectedRate}, Provided rate: ${actualRate}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // ============= USER VALIDATION =============
    
    // In production, userId should come from authentication token
    if (!userId) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Authentication required",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    const targetUserId = userId;
    
    // Find the user
    const user = await User.findById(targetUserId).session(session);
    if (!user) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // ============= ACCOUNT VALIDATION =============

    // Find source account (account to convert FROM)
    const sourceAccount = await BankAccount.findOne({
      userId: targetUserId,
      accountCurrency: convertFromAccountCurrency,
    }).session(session);

    if (!sourceAccount) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Source account not found for currency: ${convertFromAccountCurrency}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Find target account (account to convert TO)
    const targetAccount = await BankAccount.findOne({
      userId: targetUserId,
      accountCurrency: convertToAccountCurrency,
    }).session(session);

    if (!targetAccount) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Target account not found for currency: ${convertToAccountCurrency}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // ============= BALANCE VALIDATION =============

    // Check if source account has sufficient balance
    if (sourceAccount.balance < convertFromAmount) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Insufficient balance in ${convertFromAccountCurrency} account. Available: ${sourceAccount.balance}, Required: ${convertFromAmount}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // ============= PERFORM CONVERSION =============

    // Calculate the actual converted amount using our utility function
    const actualConvertedAmount = convertCurrency(
      convertFromAmount,
      convertFromAccountCurrency as CurrencyType,
      convertToAccountCurrency as CurrencyType
    );

    // Verify the calculated amount matches the requested amount (allowing small rounding differences)
    if (Math.abs(actualConvertedAmount - convertToAmount) > 0.01) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Conversion amount mismatch. Calculated: ${actualConvertedAmount}, Requested: ${convertToAmount}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Update account balances atomically
    sourceAccount.balance -= convertFromAmount;
    targetAccount.balance += actualConvertedAmount;

    // Save updated account balances
    await sourceAccount.save({ session });
    await targetAccount.save({ session });

    // ============= CREATE TRANSACTIONS =============

    const exchangeRate = getExchangeRate(
      convertFromAccountCurrency as CurrencyType,
      convertToAccountCurrency as CurrencyType
    );

    // Create debit transaction for source account
    const debitTransaction = new Transaction({
      userId: targetUserId,
      bankAccountId: sourceAccount._id,
      type: "conversion_debit",
      amount: -convertFromAmount, // Negative for debit
      currency: convertFromAccountCurrency,
      description: `Currency conversion: ${convertFromAmount} ${convertFromAccountCurrency} → ${actualConvertedAmount} ${convertToAccountCurrency}`,
      status: "completed",
      balanceAfter: sourceAccount.balance,
      metadata: {
        conversionPair: currencyPairs,
        exchangeRate: exchangeRate,
        convertedAmount: actualConvertedAmount,
        convertedCurrency: convertToAccountCurrency,
        transactionType: "currency_conversion",
      },
    });

    // Create credit transaction for target account
    const creditTransaction = new Transaction({
      userId: targetUserId,
      bankAccountId: targetAccount._id,
      type: "conversion_credit",
      amount: actualConvertedAmount, // Positive for credit
      currency: convertToAccountCurrency,
      description: `Currency conversion received: ${convertFromAmount} ${convertFromAccountCurrency} → ${actualConvertedAmount} ${convertToAccountCurrency}`,
      status: "completed",
      balanceAfter: targetAccount.balance,
      metadata: {
        conversionPair: currencyPairs,
        exchangeRate: exchangeRate,
        originalAmount: convertFromAmount,
        originalCurrency: convertFromAccountCurrency,
        transactionType: "currency_conversion",
      },
    });

    // Save both transactions
    await debitTransaction.save({ session });
    await creditTransaction.save({ session });

    // ============= COMMIT TRANSACTION =============

    await session.commitTransaction();

    // ============= RETURN SUCCESS RESPONSE =============

    return new Response(
      JSON.stringify({
        success: true,
        message: "Currency conversion completed successfully",
        data: {
          conversionDetails: {
            convertFromAmount,
            convertFromAccountCurrency,
            convertToAmount: actualConvertedAmount,
            convertToAccountCurrency,
            currencyPairs,
            exchangeRate,
          },
          updatedAccounts: {
            sourceAccount: {
              currency: sourceAccount.currency,
              balance: sourceAccount.balance,
              previousBalance: sourceAccount.balance + convertFromAmount,
            },
            targetAccount: {
              currency: targetAccount.currency,
              balance: targetAccount.balance,
              previousBalance: targetAccount.balance - actualConvertedAmount,
            },
          },
          transactions: {
            debitTransaction: {
              id: debitTransaction._id,
              type: debitTransaction.type,
              amount: debitTransaction.amount,
              currency: debitTransaction.currency,
              description: debitTransaction.description,
              balanceAfter: debitTransaction.balanceAfter,
            },
            creditTransaction: {
              id: creditTransaction._id,
              type: creditTransaction.type,
              amount: creditTransaction.amount,
              currency: creditTransaction.currency,
              description: creditTransaction.description,
              balanceAfter: creditTransaction.balanceAfter,
            },
          },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );

  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    
    console.error("Currency conversion error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error during currency conversion",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  } finally {
    // Always end the session
    await session.endSession();
  }
};
