import User from "@/models/user.model";
import connectDB from "@/lib/db";

export async function POST(req) {
  await connectDB();
  try {
    const { otp, email } = await req.json();

    if (!otp || !email) {
      return new Response(
        JSON.stringify({
          message: "OTP and email are required.",
          success: false,
          data: null,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (typeof otp !== "string" || otp.length !== 6 || isNaN(Number(otp))) {
      return new Response(
        JSON.stringify({
          message: "Invalid OTP format.",
          success: false,
          data: null,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({
          message: "Invalid email format.",
          success: false,
          data: null,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const user = await User.findOne({ email });

    if (user.isVerified) {
      return new Response(
        JSON.stringify({
          message: "User is already verified.",
          success: false,
          data: null,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    if (!user || user.verifyCode !== otp) {
      return new Response(
        JSON.stringify({
          message: "Invalid OTP.",
          success: false,
          data: null,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save({ validateBeforeSave: false });

    return new Response(
      JSON.stringify({
        message: "User verified successfully.",
        success: true,
        data: null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error verifying user.",
        success: false,
        data: null,
        error: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
