import { ensureDatabaseConnection } from "@/lib/databaseHealth";
import { User } from "@/models/User";

// Global variable to cache the database connection
declare global {
  var mongoose: any;
}

export const GET = async (request: Request) => {
  try {
    // Get authorization token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Authorization token required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const clerkUserId = authHeader.substring(7); // Remove "Bearer " prefix

    // Ensure database connection
    console.log("Starting database connection check...");
    const dbResult = await ensureDatabaseConnection(3);
    console.log("Database connection result:", dbResult);

    if (!dbResult.success) {
      return new Response(
        JSON.stringify({
          error:
            dbResult.error ||
            "Database connection failed after multiple attempts",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Find user by clerkUserId
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "User not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if user has transaction PIN
    const hasTransactionPin = !!user.transactionPin;

    return new Response(
      JSON.stringify({
        hasTransactionPin,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          clerkUserId: user.clerkUserId,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error checking transaction PIN:", error);
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
