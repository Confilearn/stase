import mongoose from "mongoose";

// Global variable to cache the database connection
declare global {
  var mongooseCache: { conn: any; promise: any } | null;
}

const MONGODB_URI = process.env.EXPO_PUBLIC_MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the EXPO_PUBLIC_MONGODB_URI environment variable",
  );
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  try {
    if (!cached) {
      cached = global.mongooseCache = { conn: null, promise: null };
    }

    if (cached.conn) return { conn: cached.conn, success: true };

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        family: 4,
      };

      // Try to connect with better error handling
      cached.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then((m) => {
          console.log("Successfully connected to MongoDB");
          return m;
        })
        .catch((error) => {
          console.error("MongoDB connection failed:", error.message);

          // If it's a DNS error, provide helpful guidance
          if (
            error.message.includes("ESERVFAIL") ||
            error.message.includes("ENOTFOUND")
          ) {
            console.log("\n🔧 MongoDB Connection Issue Detected:");
            console.log(
              "1. Your connection string may be using SRV format (mongodb+srv://)",
            );
            console.log("2. Try using direct connection format (mongodb://)");
            console.log("3. Ensure your MongoDB Atlas cluster is active");
            console.log("4. Check if your IP is whitelisted in MongoDB Atlas");
            console.log("5. Verify your username and password are correct");
            console.log("\n💡 Quick fix: Use local MongoDB for development:");
            console.log(
              "   EXPO_PUBLIC_MONGODB_URI=mongodb://localhost:27017/stase",
            );
          }

          throw error;
        });
    }

    cached.conn = await cached.promise;
    return { conn: cached.conn, success: true };
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    // Clear the cached connection on error
    global.mongooseCache = null;
    cached = global.mongooseCache = { conn: null, promise: null };
    return { conn: null, success: false, error: error.message };
  }
}
