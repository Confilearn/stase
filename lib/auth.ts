import { User } from "@/models/User";
import { connectToDatabase } from "./mongodb";

interface AuthResult {
  authenticated: boolean;
  user?: any;
  error?: string;
}

/**
 * Verifies the Authorization header and returns the authenticated user
 * Expects: Authorization: Bearer <clerkUserId>
 */
export async function verifyAuth(request: Request): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return { authenticated: false, error: "Missing Authorization header" };
    }

    if (!authHeader.startsWith("Bearer ")) {
      return {
        authenticated: false,
        error: "Invalid Authorization format. Use: Bearer <token>",
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return { authenticated: false, error: "Missing token" };
    }

    // Connect to database
    const dbResult = await connectToDatabase();
    if (!dbResult.success) {
      return { authenticated: false, error: "Database connection failed" };
    }

    // Find user by clerkUserId
    const user = await User.findOne({ clerkUserId: token });

    if (!user) {
      return { authenticated: false, error: "User not found" };
    }

    return { authenticated: true, user };
  } catch (error: any) {
    console.error("Auth verification error:", error);
    return {
      authenticated: false,
      error: error.message || "Authentication failed",
    };
  }
}

/**
 * Helper function to create an unauthorized response
 */
export function unauthorizedResponse(
  message: string = "Unauthorized",
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
