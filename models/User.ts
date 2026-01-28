import { Document, Schema, model, models } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  transactionPin: string; // 4-digit PIN
  clerkUserId: string; // userId from Clerk.
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      // Always store a hashed password, never plain text.
    },
    transactionPin: {
      type: String,
      required: true,
      // Stored as bcrypt hash (60 characters)
    },
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User = models.User || model<IUser>("User", UserSchema);
