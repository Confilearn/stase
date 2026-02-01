import { Document, Schema, Types, model, models } from "mongoose";

export type SupportedCurrency = "USD" | "CAD" | "EUR" | "GBP";

export interface IBankAccount extends Document {
  userId: Types.ObjectId; // Reference to a User document.
  accountNumber: string;
  iban?: string;
  sortCode?: string;
  accountName: string;
  swiftCode?: string;
  bankName: string;
  bankAddress?: string;
  accountCurrency: SupportedCurrency;
  balance: number;
}

/**
 * BankAccount schema.
 *
 * Notes:
 * - `userId` references the `User` collection.
 * - `accountCurrency` is limited to supported values only.
 * - Compound index `(userId, accountCurrency)` ensures only one account
 *   per currency for each user.
 */
const BankAccountSchema = new Schema<IBankAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    iban: {
      type: String,
      trim: true,
    },
    sortCode: {
      type: String,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    swiftCode: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    bankAddress: {
      type: String,
      trim: true,
    },
    accountCurrency: {
      type: String,
      required: true,
      enum: ["USD", "CAD", "EUR", "GBP"],
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure each user can only have one account per currency.
BankAccountSchema.index({ userId: 1, accountCurrency: 1 }, { unique: true });

/**
 * Exported BankAccount model.
 */
export const BankAccount =
  models.BankAccount || model<IBankAccount>("BankAccount", BankAccountSchema);
