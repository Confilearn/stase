import { ensureDatabaseConnection } from "@/lib/databaseHealth";
import { BankAccount, SupportedCurrency } from "@/models/BankAccount";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";

// Global variable to cache the database connection
declare global {
  var mongoose: any;
}

export const POST = async (request: Request) => {
  try {
    // Get authorization token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Authorization token required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const clerkUserId = authHeader.substring(7); // Remove "Bearer " prefix

    // Parse request body
    const body = await request.json();
    const { clerkUserId: bodyClerkUserId } = body;

    // Use either the token or the body clerkUserId
    const userId = bodyClerkUserId || clerkUserId;

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Clerk user ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Ensure database connection
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
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Find user by clerkUserId
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "User not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get bank accounts
    const bankAccounts = await BankAccount.find({ userId: user._id });

    // Get transactions
    const transactions = await Transaction.find({
      $or: [{ from: user._id }, { to: user._id }],
    });

    // Build response
    const response = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        clerkUserId: user.clerkUserId,
        hasTransactionPin: !!user.transactionPin,
        createdAt: user.createdAt,
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
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error getting user data:", error);
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
