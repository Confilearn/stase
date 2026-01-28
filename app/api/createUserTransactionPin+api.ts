import { unauthorizedResponse, verifyAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

interface CreatePinRequest {
  pin: string;
}

export const POST = async (request: Request) => {
  try {
    // Authenticate user
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return unauthorizedResponse(authResult.error);
    }

    const user = authResult.user;

    const body: CreatePinRequest = await request.json();
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
    await user.save();

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
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
