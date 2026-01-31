import {
    serverErrorResponse,
    unauthorizedResponse,
    verifyAuth,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { BankAccount } from "@/models/BankAccount";
import { Transaction } from "@/models/Transaction";
import bcrypt from "bcryptjs";

interface DepositRequest {
  amount: number;
  accountCurrency: string;
  transactionPin: string;
}

export const POST = async (request: Request) => {
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
    let body: DepositRequest;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { amount, accountCurrency, transactionPin } = body;

    // Validate required fields
    if (!amount || !accountCurrency || !transactionPin) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: amount, accountCurrency, transactionPin",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({
          error: "Deposit amount must be greater than 0",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate maximum deposit limit
    if (amount > 100000) {
      return new Response(
        JSON.stringify({
          error: "Maximum deposit limit is $100,000",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate currency
    const supportedCurrencies = ["USD", "CAD", "EUR", "GBP"];
    if (!supportedCurrencies.includes(accountCurrency)) {
      return new Response(
        JSON.stringify({
          error: "Invalid currency. Supported currencies: USD, CAD, EUR, GBP",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Verify transaction PIN
    if (!user.transactionPin) {
      return new Response(
        JSON.stringify({
          error: "Transaction PIN not set. Please set up your PIN first.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const isPinValid = await bcrypt.compare(
      transactionPin,
      user.transactionPin,
    );
    if (!isPinValid) {
      return new Response(
        JSON.stringify({
          error: "Invalid transaction PIN",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

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

    // Find user's bank account for the specified currency
    const bankAccount = await BankAccount.findOne({
      userId: user._id,
      accountCurrency: accountCurrency,
    });

    if (!bankAccount) {
      return new Response(
        JSON.stringify({
          error: `No ${accountCurrency} account found for this user`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Atomically update balance
    const updatedAccount = await BankAccount.findOneAndUpdate(
      { userId: user._id, accountCurrency: accountCurrency },
      { $inc: { balance: amount } },
      { new: true },
    );

    if (!updatedAccount) {
      return new Response(
        JSON.stringify({ error: `No ${accountCurrency} account found` }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const newBalance = updatedAccount.balance;
    const previousBalance = newBalance - amount;

    // Generate unique transaction reference
    const transactionReference = `DEP-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Create transaction record
    const transaction = new Transaction({
      date: new Date(),
      status: "completed",
      reference: transactionReference,
      from: null, // External deposit
      to: user._id,
      transactionType: "deposit",
      currency: accountCurrency,
      amount: amount,
      metadata: {
        previousBalance: bankAccount.balance - amount,
        newBalance: newBalance,
        description: `Deposit of ${amount} ${accountCurrency}`,
      },
    });

    await transaction.save();

    // Build response
    const response = {
      success: true,
      message: `Successfully deposited ${amount} ${accountCurrency}`,
      data: {
        transactionId: transaction._id,
        reference: transactionReference,
        amount: amount,
        currency: accountCurrency,
        newBalance: newBalance,
        timestamp: transaction.date,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing deposit:", error);
    return serverErrorResponse("Failed to process deposit");
  }
};
