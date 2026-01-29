import { connectToDatabase, testConnection } from "./mongodb";

// Global variable to cache the database connection
declare global {
  var mongoose: any;
}

export async function ensureDatabaseConnection(
  maxRetries: number = 3,
): Promise<{ success: boolean; error?: string }> {
  // First test if existing connection is alive
  if (await testConnection()) {
    return { success: true };
  }

  // If not, try to connect with retries and longer delays
  let dbResult = await connectToDatabase();
  let retryCount = 0;

  while (!dbResult.success && retryCount < maxRetries) {
    console.log(
      `Database connection failed, retrying... (${retryCount + 1}/${maxRetries})`,
    );
    // Exponential backoff with longer delays
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Max 5 seconds
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Clear any stale connection before retrying
    if (global.mongoose) {
      try {
        await global.mongoose.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      global.mongoose = null;
    }

    dbResult = await connectToDatabase();
    retryCount++;
  }

  return dbResult;
}
