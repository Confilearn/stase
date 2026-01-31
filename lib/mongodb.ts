import mongoose from "mongoose";

// Global variable to cache the database connection
declare global {
  var mongoose: { conn: any; promise: any } | null;
}

const MONGODB_URI = process.env.EXPO_PUBLIC_MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the EXPO_PUBLIC_MONGODB_URI environment variable",
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  try {
    if (!cached) {
      cached = global.mongoose = { conn: null, promise: null };
    }

    if (cached.conn) return { conn: cached.conn, success: true };

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 30000,
        bufferMaxEntries: 0,
        family: 4,
      };
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
      console.log("Successfully connected to MongoDB");
    }

    cached.conn = await cached.promise;
    return { conn: cached.conn, success: true };
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    // Clear the cached connection on error
    global.mongoose = null;
    cached = global.mongoose = { conn: null, promise: null };
    return { conn: null, success: false, error: error.message };
  }
}
