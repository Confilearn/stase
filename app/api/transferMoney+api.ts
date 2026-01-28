import { connectToDatabase } from "@/lib/mongodb";
import { BankAccount, SupportedCurrency } from "@/models/BankAccount";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import { isValidEmail, isValidUsername } from "@/utils/validate";
import mongoose from "mongoose";

interface TransferMoneyRequest {
  // Receiver identification
  email?: string;
  username?: string;

  // Transfer details
  accountCurrency: SupportedCurrency;
  amount: number;

  // Sender identification (in a real app, this would come from auth token)
  senderUserId?: string; // Optional for testing, in production get from auth
}

export const POST = async (request: Request) => {
  const session = await startTransaction();

  try {
    // Parse request body
    const body: TransferMoneyRequest = await request.json();
    const { email, username, accountCurrency, amount, senderUserId } = body;

    // ============= INPUT VALIDATION =============

    // Validate receiver identification
    if (!email && !username) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Please provide either an email or username for the recipient",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate required fields
    if (!accountCurrency || amount === undefined) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Missing required fields: accountCurrency and amount are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate currency
    const supportedCurrencies: SupportedCurrency[] = [
      "USD",
      "CAD",
      "EUR",
      "GBP",
    ];
    if (!supportedCurrencies.includes(accountCurrency)) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid currency. Supported currencies: USD, CAD, EUR, GBP",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate amount
    if (typeof amount !== "number" || isNaN(amount)) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Amount must be a valid number",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (amount <= 0) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Transfer amount must be greater than zero",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate amount precision (max 2 decimal places)
    if (!Number.isInteger(amount * 100)) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Amount can have maximum 2 decimal places",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid email format provided",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate username format if provided
    if (username && !isValidUsername(username)) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Invalid username format. Username must be 3-20 characters and contain only letters, numbers, and underscores",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // ============= DATABASE OPERATIONS =============

    // Connect to database
    const dbResult = await connectToDatabase();
    if (!dbResult.success) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Database connection failed. Please try again later",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // For demo purposes, we'll use a default sender user
    // In production, this would come from authentication token
    const defaultSenderId = senderUserId || "507f1f77bcf86cd799439011"; // Example ObjectId

    // Find sender (in production, get from auth)
    const sender = await User.findById(defaultSenderId);
    if (!sender) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "Sender account not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Find receiver by email or username
    const receiverQuery: any = {};
    if (email) receiverQuery.email = email.toLowerCase();
    if (username) receiverQuery.username = username.toLowerCase();

    const receiver = await User.findOne(receiverQuery);
    if (!receiver) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Recipient not found. Please verify the email or username and try again",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Prevent self-transfer
    if (sender._id.toString() === receiver._id.toString()) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: "You cannot transfer money to yourself",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Find sender's bank account for the specified currency
    const senderAccount = await BankAccount.findOne({
      userId: sender._id,
      accountCurrency: accountCurrency,
    }).session(session);

    if (!senderAccount) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `You don't have a ${accountCurrency} account. Please create one or select a different currency`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check sufficient balance
    if (senderAccount.balance < amount) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Insufficient balance. Your ${accountCurrency} account balance is ${senderAccount.balance.toFixed(2)}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Find or create receiver's bank account for the specified currency
    let receiverAccount = await BankAccount.findOne({
      userId: receiver._id,
      accountCurrency: accountCurrency,
    }).session(session);

    if (!receiverAccount) {
      await session.abortTransaction();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Recipient doesn't have a ${accountCurrency} account. They need to create one first`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // ============= PERFORM TRANSFER =============

    const transactionReference = generateTransactionReference();
    const transactionDate = new Date();

    // Update balances (use rounding to handle floating-point precision)
    senderAccount.balance =
      Math.round((senderAccount.balance - amount) * 100) / 100;
    receiverAccount.balance =
      Math.round((receiverAccount.balance + amount) * 100) / 100;

    // Save updated accounts
    await senderAccount.save({ session });
    await receiverAccount.save({ session });

    // Create sender transaction (send)
    const senderTransaction = new Transaction({
      date: transactionDate,
      status: "completed",
      reference: transactionReference,
      from: sender._id,
      to: receiver._id,
      transactionType: "send",
      currency: accountCurrency,
      amount: amount,
      metadata: {
        senderName: `${sender.firstName} ${sender.lastName}`,
        receiverName: `${receiver.firstName} ${receiver.lastName}`,
        description: `Money transfer to ${receiver.firstName} ${receiver.lastName}`,
      },
    });

    // Create receiver transaction (receive)
    const receiverTransaction = new Transaction({
      date: transactionDate,
      status: "completed",
      reference: transactionReference,
      from: sender._id,
      to: receiver._id,
      transactionType: "receive",
      currency: accountCurrency,
      amount: amount,
      metadata: {
        senderName: `${sender.firstName} ${sender.lastName}`,
        receiverName: `${receiver.firstName} ${receiver.lastName}`,
        description: `Money transfer from ${sender.firstName} ${sender.lastName}`,
      },
    });

    // Save transactions
    await senderTransaction.save({ session });
    await receiverTransaction.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully transferred ${amount.toFixed(2)} ${accountCurrency} to ${receiver.firstName} ${receiver.lastName}`,
        data: {
          transactionReference,
          amount: amount.toFixed(2),
          currency: accountCurrency,
          sender: {
            name: `${sender.firstName} ${sender.lastName}`,
            newBalance: senderAccount.balance.toFixed(2),
          },
          receiver: {
            name: `${receiver.firstName} ${receiver.lastName}`,
            newBalance: receiverAccount.balance.toFixed(2),
          },
          timestamp: transactionDate.toISOString(),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    // Abort transaction on error
    await session.abortTransaction();

    console.error("Error transferring money:", error);

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
          "An unexpected error occurred during the transfer. Please try again later",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  } finally {
    // End session
    await session.endSession();
  }
};

/**
 * Starts a MongoDB transaction session
 */
async function startTransaction() {
  const session = await mongoose.startSession();
  session.startTransaction();
  return session;
}

/**
 * Generates a unique transaction reference
 */
function generateTransactionReference(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
}
