import { Document, Schema, Types, model, models } from "mongoose";
import type { SupportedCurrency } from "./BankAccount";

export type TransactionStatus = "completed" | "pending" | "failed";

export type TransactionType =
    | "convert"
    | "withdraw"
    | "deposit"
    | "send"
    | "receive";

/**
 * TransactionCurrency is the main currency involved in the transaction.
 *
 * For example:
 * - For deposits/withdrawals: the currency of the account being funded/emptied.
 * - For send/receive: the currency that is being transferred.
 * - For convert: typically the target currency; you can store additional
 *   conversion details in `metadata` if needed.
 */
export type TransactionCurrency = SupportedCurrency;

/**
 * Transaction document interface.
 *
 * `from` and `to` are kept generic as ObjectIds to give flexibility:
 * they may reference users, accounts, or external entities, depending
 * on how you design the rest of the system.
 */
export interface ITransaction extends Document {
    date: Date;
    status: TransactionStatus;
    reference: string;
    from: Types.ObjectId | null;
    to: Types.ObjectId | null;
    transactionType: TransactionType;
    currency: TransactionCurrency;
    amount: number;
    metadata?: Record<string, unknown>;
}

/*
 * Notes:
 * - `reference` is unique and indexed for quick lookups.
 * - `date`, `status`, `transactionType`, and `currency` are indexed
 *   to make analytics and history queries efficient.
 */
const TransactionSchema = new Schema<ITransaction>(
    {
        date: {
            type: Date,
            required: true,
            default: () => new Date(),
            index: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["completed", "pending", "failed"],
            default: "pending",
            index: true,
        },
        reference: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        from: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        to: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        transactionType: {
            type: String,
            required: true,
            enum: ["convert", "withdraw", "deposit", "send", "receive"],
            index: true,
        },
        currency: {
            type: String,
            required: true,
            enum: ["USD", "CAD", "EUR", "GBP"],
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

export const Transaction =
    models.Transaction ||
    model<ITransaction>("Transaction", TransactionSchema);


