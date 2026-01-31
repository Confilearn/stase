import { ensureDatabaseConnection } from "@/lib/databaseHealth";
import { BankAccount, SupportedCurrency } from "@/models/BankAccount";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import {
  generateAccountNumber,
  generateIBAN,
  generateSortCode,
  getBankAddress,
  getBankName,
  getSwiftCode,
} from "@/utils/createAccount";

// Global variable to cache the database connection
declare global {
  var mongoose: any;
}

interface CreateAccountRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  clerkUserId: string;
}

export const POST = async (request: Request) => {
  try {
    const body: CreateAccountRequest = await request.json();
    const { firstName, lastName, username, email, clerkUserId } = body;

    if (!firstName || !lastName || !username || !email || !clerkUserId) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: firstName, lastName, username, email, clerkUserId",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Ensure database connection with retry logic
    console.log("Starting database connection check...");
    const dbResult = await ensureDatabaseConnection(3);
    console.log("Database connection result:", dbResult);

    if (!dbResult.success) {
      return new Response(
        JSON.stringify({
          error:
            dbResult.error ||
            "Database connection failed after multiple attempts",
        }),
        {
          status: 503, // Service Unavailable instead of 500
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Log connection state
    if (global.mongoose) {
      console.log(
        "Connection readyState:",
        global.mongoose.connection.readyState,
      );
      console.log("Connection host:", global.mongoose.connection.host);
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({
          error: "User with this email or username already exists",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Create user (transactionPin will be set later via PIN modal)
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      clerkUserId,
    });

    const savedUser = await user.save();

    // Create bank accounts
    const currencies: SupportedCurrency[] = ["USD", "CAD", "EUR", "GBP"];
    const bankAccounts = [];

    for (const currency of currencies) {
      const bankAccount = new BankAccount({
        userId: savedUser._id,
        accountNumber: generateAccountNumber(currency),
        accountName: `${firstName} ${lastName}`,
        bankName: getBankName(currency),
        bankAddress: getBankAddress(currency),
        accountCurrency: currency,
        swiftCode: getSwiftCode(currency),
        ...(currency === "EUR" && { iban: generateIBAN() }),
        ...(currency === "GBP" && { sortCode: generateSortCode() }),
      });

      const savedAccount = await bankAccount.save();
      bankAccounts.push(savedAccount);
    }

    // Get transactions
    const transactions = (await Transaction.find({
      $or: [{ from: savedUser._id }, { to: savedUser._id }],
    })) as any[];

    // Build response
    const response = {
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        username: savedUser.username,
        email: savedUser.email,
        clerkUserId: savedUser.clerkUserId,
        createdAt: savedUser.createdAt,
      },
      bankAccounts: bankAccounts.map((account) => ({
        id: account._id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        bankName: account.bankName,
        bankAddress: account.bankAddress,
        accountCurrency: account.accountCurrency,
        swiftCode: account.swiftCode,
        iban: account.iban,
        sortCode: account.sortCode,
        createdAt: account.createdAt,
      })),
      transactions: transactions.map((transaction) => ({
        id: transaction._id,
        date: transaction.date,
        status: transaction.status,
        reference: transaction.reference,
        from: transaction.from,
        to: transaction.to,
        transactionType: transaction.transactionType,
        currency: transaction.currency,
        amount: transaction.amount,
        metadata: transaction.metadata,
        createdAt: transaction.createdAt,
      })),
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating account:", error);

    // Handle specific database connection errors
    if (
      error.message &&
      error.message.includes("before initial connection is complete")
    ) {
      return new Response(
        JSON.stringify({
          error: "Database connection error. Please try again in a moment.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle timeout errors
    if (error.message && error.message.includes("timeout")) {
      return new Response(
        JSON.stringify({
          error: "Request timed out. Please try again.",
        }),
        {
          status: 408,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({
          error: "User with this email or username already exists",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
