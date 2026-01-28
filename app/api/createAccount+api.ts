import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb";
import { BankAccount, SupportedCurrency } from "@/models/BankAccount";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

interface CreateAccountRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export const POST = async (request: Request) => {
  try {
    const body: CreateAccountRequest = await request.json();
    const { firstName, lastName, username, email } = body;

    if (!firstName || !lastName || !username || !email) {
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
    const clerkUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
  } finally {
    await disconnectFromDatabase();
  }
};

function generateAccountNumber(currency: SupportedCurrency): string {
  const prefix = {
    USD: "1234",
    CAD: "5678",
    EUR: "9012",
    GBP: "3456",
  };

  const randomDigits = Math.random().toString().substr(2, 8);
  return `${prefix[currency]}${randomDigits}`;
}

function generateIBAN(): string {
  const countryCode = "DE";
  const checkDigits = Math.random().toString().substr(2, 2);
  const bankCode = "12345678";
  const accountNumber = Math.random().toString().substr(2, 10);
  return `${countryCode}${checkDigits}${bankCode}${accountNumber}`;
}

function generateSortCode(): string {
  return `${Math.random().toString().substr(2, 2)}-${Math.random().toString().substr(2, 2)}-${Math.random().toString().substr(2, 2)}`;
}

function getBankName(currency: SupportedCurrency): string {
  const banks = {
    USD: "Stase Bank USA",
    CAD: "Stase Bank Canada",
    EUR: "Stase Bank Europe",
    GBP: "Stase Bank UK",
  };
  return banks[currency];
}

function getBankAddress(currency: SupportedCurrency): string {
  const addresses = {
    USD: "123 Wall Street, New York, NY 10005",
    CAD: "456 Bay Street, Toronto, ON M5V 2V6",
    EUR: "789 Friedrichstraße, Berlin, 10117",
    GBP: "321 Threadneedle Street, London, EC2R 8AY",
  };
  return addresses[currency];
}

function getSwiftCode(currency: SupportedCurrency): string {
  const swiftCodes = {
    USD: "STASEUS33",
    CAD: "STASECA33",
    EUR: "STASEDE33",
    GBP: "STASEGB33",
  };
  return swiftCodes[currency];
}
