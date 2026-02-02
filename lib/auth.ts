import { User } from "@/models/User";
import { connectDB } from "./mongodb";

type AuthStatus = "success" | "unauthorized" | "server_error";

export interface AuthResult {
  authenticated: boolean;
  status: AuthStatus;
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
      return {
        authenticated: false,
        status: "unauthorized",
        error: "Missing Authorization header",
      };
    }

    if (!authHeader.startsWith("Bearer ")) {
      return {
        authenticated: false,
        status: "unauthorized",
        error: "Invalid Authorization format. Use: Bearer <token>",
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return {
        authenticated: false,
        status: "unauthorized",
        error: "Missing token",
      };
    }

    // Connect to database
    const { success, conn } = await connectDB();

    if (!success || !conn) {
      return {
        authenticated: false,
        status: "server_error",
        error: "Database connection failed",
      };
    }

    // Find user by clerkUserId with retry logic
    let user;
    let retries = 3;

    while (retries > 0 && !user) {
      try {
        user = await User.findOne({ clerkUserId: token });
        break;
      } catch (error: any) {
        console.error(
          `User lookup attempt ${4 - retries} failed:`,
          error.message,
        );
        retries--;

        if (retries > 0) {
          // Wait a bit before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }

    if (!user) {
      return {
        authenticated: false,
        status: "unauthorized",
        error: "User not found",
      };
    }

    return { authenticated: true, status: "success", user };
  } catch (error: any) {
    console.error("Auth verification error:", error);
    return {
      authenticated: false,
      status: "server_error",
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

/**
 * Helper function to create a server error response
 */
export function serverErrorResponse(
  message: string = "Internal server error",
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
