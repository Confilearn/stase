import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isValidEmail, isValidUsername } from "@/utils/validate";

interface CheckUserRequest {
  email?: string;
  username?: string;
}

export const POST = async (request: Request) => {
  try {
    // Parse request body
    const body: CheckUserRequest = await request.json();
    const { email, username } = body;

    // Validate input - at least one identifier must be provided
    if (!email && !username) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Please provide either an email or username to search for a user",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid email format provided",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate username format if provided
    if (username && !isValidUsername(username)) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Invalid username format. Username must be 3-20 characters and contain only letters, numbers, and underscores",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

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

    // Search for user by email or username
    const searchQuery: any = {};
    if (email) searchQuery.email = email.toLowerCase();
    if (username) searchQuery.username = username.toLowerCase();

    const user = await User.findOne(searchQuery).select(
      "firstName lastName email username",
    );

    // Check if user exists
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist, please try again",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Return user's full name
    return new Response(
      JSON.stringify({
        success: true,
        message: "User found successfully",
        data: {
          fullName: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error checking user:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An unexpected error occurred. Please try again later",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
