import mongoose from "mongoose";

const MONGODB_URI = process.env.EXPO_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the EXPO_PUBLIC_MONGODB_URI environment variable",
  );
}

// Global variable to cache the database connection
declare global {
  var mongoose: any;
}

interface DatabaseResponse {
  success: boolean;
  error?: string;
}

export async function connectToDatabase(): Promise<DatabaseResponse> {
  try {
    // Check if we have a cached connection that's ready
    if (global.mongoose && global.mongoose.connection.readyState === 1) {
      console.log("Using cached MongoDB connection");
      // Test the connection with a ping
      if (global.mongoose.connection.db) {
        await global.mongoose.connection.db.admin().ping();
      }
      return { success: true };
    }

    // If connection exists but is not ready, disconnect it first
    if (global.mongoose) {
      console.log("Cleaning up stale MongoDB connection");
      await mongoose.disconnect();
      global.mongoose = null;
    }

    console.log("Connecting to MongoDB...");
    const connection = await mongoose.connect(MONGODB_URI!, {
      serverSelectionTimeoutMS: 15000, // Increased to 15 seconds
      connectTimeoutMS: 15000, // Increased to 15 seconds
      socketTimeoutMS: 60000, // Increased to 60 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      bufferCommands: false, // Disable buffering to prevent timeouts
    });

    // Cache the connection
    global.mongoose = connection;

    // Test the connection with a longer timeout
    if (connection.connection.db) {
      await Promise.race([
        connection.connection.db.admin().ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection test timeout")), 5000),
        ),
      ]);
    }
    console.log("Successfully connected to MongoDB");
    return { success: true };
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    // Clear the cached connection on error
    global.mongoose = null;
    return { success: false, error: error.message };
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    if (global.mongoose && global.mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      global.mongoose = null;
      console.log("Disconnected from MongoDB");
    }
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
}

// Get the cached mongoose instance
export function getCachedConnection() {
  return global.mongoose;
}

// Test if the connection is alive
export async function testConnection(): Promise<boolean> {
  try {
    if (!global.mongoose || global.mongoose.connection.readyState !== 1) {
      return false;
    }
    if (global.mongoose.connection.db) {
      await global.mongoose.connection.db.admin().ping();
    }
    return true;
  } catch {
    return false;
  }
}
