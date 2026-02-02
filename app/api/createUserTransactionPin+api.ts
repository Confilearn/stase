import {
  serverErrorResponse,
  unauthorizedResponse,
  verifyAuth,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

interface CreatePinRequest {
  pin: string;
}

export const POST = async (request: Request) => {
  try {
    // Ensure database connection
    const dbConnection = await connectDB();
    if (!dbConnection.success || !dbConnection.conn) {
      return serverErrorResponse("Database connection failed");
    }

    // Authenticate user
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      if (authResult.status === "server_error") {
        return serverErrorResponse(authResult.error);
      }
      return unauthorizedResponse(authResult.error);
    }

    const user = authResult.user;

    let body: CreatePinRequest;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { pin } = body;

    // Validate required fields
    if (!pin) {
      return new Response(
        JSON.stringify({
          error: "Missing required field: pin",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return new Response(
        JSON.stringify({
          error: "PIN must be exactly 4 digits",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Hash and update PIN
    const hashedPin = await bcrypt.hash(pin, 12);
    user.transactionPin = hashedPin;

    // Save user with retry logic
    let retries = 3;
    let savedUser;

    while (retries > 0 && !savedUser) {
      try {
        savedUser = await user.save();
        break;
      } catch (error: any) {
        console.error(
          `User save attempt ${4 - retries} failed:`,
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

    // Build response
    const response = {
      success: true,
      message: "Transaction PIN updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error updating transaction PIN:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
