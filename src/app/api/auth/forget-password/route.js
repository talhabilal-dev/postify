import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { sendEmail } from "@/lib/email";
import argon from "argon2";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  console.log(email);


  if (!email) {
    return new Response(
      JSON.stringify({
        message: "Email is required.",
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

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({
          message: "User not found.",
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

    const otp = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);

    user.otp = otp;
    user.otpExpiry = expiryDate;
    await user.save();

    await sendEmail({
      to: user.email,
      text: `Your OTP is: ${otp}`,
    });

    return new Response(
      JSON.stringify({
        message: "OTP sent successfully.",
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
    console.error(error);
    return new Response(
      JSON.stringify({
        message: "An error occurred.",
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

export async function PATCH(req) {
  await connectDB();
  const { email, password } = await req.json();

  if (!email || !password) {
    return new Response(
      JSON.stringify({
        message: "Email and password are required.",
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

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({
          message: "User not found.",
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

    const hashPassword = await argon.hash(password);
    user.password = hashPassword;
    await user.save({ validateBeforeSave: false });

    return new Response(
      JSON.stringify({
        message: "Password reset successfully.",
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
    console.error(error);
    return new Response(
      JSON.stringify({
        message: "Error resetting password.",
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
