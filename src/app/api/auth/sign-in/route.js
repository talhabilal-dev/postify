import connectDB from "@/lib/db";
import User from "@/models/user.model";
import argon from "argon2";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/tokenGeneration";
import * as cookie from "cookie";
export async function POST(req) {
  await connectDB();

  try {
    const { email, password } = await req.json();

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

    if (!user.isVerified) {
      return new Response(
        JSON.stringify({
          message: "User is not verified",
          success: false,
          data: null,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const isPasswordValid = await argon.verify(user.password, password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({
          message: "Invalid password",
          success: false,
          data: null,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const accessToken = await generateAccessToken(user);

    const refreshToken = await generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    const tokenCookie = cookie.serialize("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    const refreshCookie = cookie.serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    const userToSend = await User.findById(user._id).select("-password");

    return new Response(
      JSON.stringify({
        message: "Sign in successful",
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: userToSend,
        },
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": [tokenCookie, refreshCookie],
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Sign in failed",
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
