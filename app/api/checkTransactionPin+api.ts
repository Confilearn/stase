import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

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

    // Connect to database
    const { success, conn } = await connectDB();
    
    if (!success || !conn) {
      return new Response(
        JSON.stringify({ error: "Database connection failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log("Database connected successfully");

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
