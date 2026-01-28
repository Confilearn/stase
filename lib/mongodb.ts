import mongoose from "mongoose";

const MONGODB_URI = process.env.EXPO_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the EXPO_PUBLIC_MONGODB_URI environment variable",
  );
}

interface DatabaseResponse {
  success: boolean;
  error?: string;
}

export async function connectToDatabase(): Promise<DatabaseResponse> {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log("Successfully connected to MongoDB");
    return { success: true };
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
}
