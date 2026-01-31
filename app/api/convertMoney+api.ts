import {
    serverErrorResponse,
    unauthorizedResponse,
    verifyAuth,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { BankAccount, SupportedCurrency } from "@/models/BankAccount";
import { Transaction } from "@/models/Transaction";
import {
    convertCurrency,
    SupportedCurrency as CurrencyType,
    getExchangeRate,
    isValidCurrencyPair,
} from "@/utils/currencyRates";
import { generateTransactionReference } from "@/utils/TxReference";
import mongoose from "mongoose";

interface ConvertMoneyRequest {
  // Conversion details
  convertFromAmount: number;
  convertFromAccountCurrency: SupportedCurrency;
  convertToAmount: number;
  convertToAccountCurrency: SupportedCurrency;
  currencyPairs: string; // e.g., "USD-CAD"
}

/**
 * Start a MongoDB transaction for atomic operations
 */
async function startTransaction() {
  const session = await mongoose.startSession();
  session.startTransaction();
  return session;
}

export const POST = async (request: Request) => {
  let session;

  try {
    // Authenticate user
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      if (authResult.status === "server_error") {
        return serverErrorResponse(authResult.error);
      }
      return unauthorizedResponse(authResult.error);
    }

    const user = authResult.user;

    // Parse request body
    const body: ConvertMoneyRequest = await request.json();
    const {
      convertFromAmount,
      convertFromAccountCurrency,
      convertToAmount,
      convertToAccountCurrency,
      currencyPairs,
    } = body;

    // ============= INPUT VALIDATION =============

    // Validate required fields
    if (
      !convertFromAmount ||
      !convertFromAccountCurrency ||
      !convertToAmount ||
      !convertToAccountCurrency ||
      !currencyPairs
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "All conversion fields are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate amounts are positive numbers
    if (convertFromAmount <= 0 || convertToAmount <= 0) {
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
    if (
      !isValidCurrencyPair(convertFromAccountCurrency, convertToAccountCurrency)
    ) {
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
      convertToAccountCurrency as CurrencyType,
    );
    const actualRate = convertToAmount / convertFromAmount;

    // Allow small rounding differences (0.001 tolerance)
    if (Math.abs(expectedRate - actualRate) > 0.001) {
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

    // ============= DATABASE OPERATIONS =============

    // Connect to database
    const { success, conn } = await connectDB();
    
    if (!success || !conn) {
      return new Response(
        JSON.stringify({ error: "Database connection failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Start transaction after successful database connection
    session = await startTransaction();

    // ============= ACCOUNT VALIDATION =============

    // Find source account (account to convert FROM)
    const sourceAccount = await BankAccount.findOne({
      userId: user._id,
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
      userId: user._id,
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
      convertToAccountCurrency as CurrencyType,
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
      convertToAccountCurrency as CurrencyType,
    );

    // Generate unique references for both transactions
    const debitReference = generateTransactionReference();
    const creditReference = generateTransactionReference();

    // Create debit transaction for source account
    const debitTransaction = new Transaction({
      date: new Date(),
      status: "completed",
      reference: debitReference,
      from: user._id,
      to: user._id,
      transactionType: "convert",
      currency: convertFromAccountCurrency,
      amount: convertFromAmount, // Positive amount
      metadata: {
        conversionPair: currencyPairs,
        exchangeRate: exchangeRate,
        convertedAmount: actualConvertedAmount,
        convertedCurrency: convertToAccountCurrency,
        transactionType: "currency_conversion",
        description: `Currency conversion: ${convertFromAmount} ${convertFromAccountCurrency} → ${actualConvertedAmount} ${convertToAccountCurrency}`,
        direction: "debit", // Indicate this is a debit
      },
    });

    // Create credit transaction for target account
    const creditTransaction = new Transaction({
      date: new Date(),
      status: "completed",
      reference: creditReference,
      from: user._id,
      to: user._id,
      transactionType: "convert",
      currency: convertToAccountCurrency,
      amount: actualConvertedAmount, // Positive amount
      metadata: {
        conversionPair: currencyPairs,
        exchangeRate: exchangeRate,
        originalAmount: convertFromAmount,
        originalCurrency: convertFromAccountCurrency,
        transactionType: "currency_conversion",
        description: `Currency conversion received: ${convertFromAmount} ${convertFromAccountCurrency} → ${actualConvertedAmount} ${convertToAccountCurrency}`,
        direction: "credit", // Indicate this is a credit
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
              accountCurrency: sourceAccount.accountCurrency,
              balance: sourceAccount.balance,
              previousBalance: sourceAccount.balance + convertFromAmount,
            },
            targetAccount: {
              accountCurrency: targetAccount.accountCurrency,
              balance: targetAccount.balance,
              previousBalance: targetAccount.balance - actualConvertedAmount,
            },
          },
          transactions: {
            debitTransaction: {
              id: debitTransaction._id,
              reference: debitTransaction.reference,
              transactionType: debitTransaction.transactionType,
              amount: debitTransaction.amount,
              currency: debitTransaction.currency,
            },
            creditTransaction: {
              id: creditTransaction._id,
              reference: creditTransaction.reference,
              transactionType: creditTransaction.transactionType,
              amount: creditTransaction.amount,
              currency: creditTransaction.currency,
            },
          },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    // Abort transaction on error if session exists
    if (session) {
      await session.abortTransaction();
      await session.endSession();
    }

    console.error("Error converting currency:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
    });

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Transaction reference conflict. Please try again",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message:
          "An unexpected error occurred during the conversion. Please try again later",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  } finally {
    // End session if it exists
    if (session) {
      await session.endSession();
    }
  }
};
