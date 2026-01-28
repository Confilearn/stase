import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { BankAccount } from "@/models/BankAccount";
import { Transaction } from "@/models/Transaction";

export const GET = async (request: Request) => {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error);
    }

    const user = authResult.user;

    // Fetch all bank accounts for this user
    const bankAccounts = await BankAccount.find({ userId: user._id });

    // Fetch all transactions where user is sender or receiver
    const transactions = await Transaction.find({
      $or: [{ from: user._id }, { to: user._id }],
    }).sort({ date: -1 });

    // Build response
    const response = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        clerkUserId: user.clerkUserId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
        updatedAt: account.updatedAt,
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
        updatedAt: transaction.updatedAt,
      })),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
