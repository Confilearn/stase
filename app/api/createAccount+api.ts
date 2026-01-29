import { connectToDatabase } from "@/lib/mongodb";
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
import bcrypt from "bcryptjs";

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
            "Missing required fields: firstName, lastName, username, email",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Connect to database
    const dbResult = await connectToDatabase();
    if (!dbResult.success) {
      return new Response(
        JSON.stringify({
          error: dbResult.error || "Database connection failed",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
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

    // Create user
    const defaultPin = "1234";

    const hashedPin = await bcrypt.hash(defaultPin, 12);

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      transactionPin: hashedPin,
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
    const transactions = await Transaction.find({
      $or: [{ from: savedUser._id }, { to: savedUser._id }],
    });

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

    console.error("Error creating account:", error);
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
