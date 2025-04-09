import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { sendEmail } from "@/lib/email";
import argon from "argon2";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const { fullName, email, password, username } = body;

    if (!fullName || !email || !password || !username) {
      return new Response(
        JSON.stringify({
          message: "All fields are required",
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

    const existingUserVerify = await User.findOne({ email, isVerified: true })
    if (existingUserVerify) {
      return new Response(
        JSON.stringify({
          message: "User already verified",
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

    const existingUser = await User.findOne({ email });

    const otp = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const expiryDate = new Date();

    expiryDate.setMinutes(expiryDate.getMinutes() + 10);

    if (existingUser) {
      if (!existingUser.isVerified) {
        existingUser.verifyCodeExpires = expiryDate;
        existingUser.fullName = fullName;
        const hashedPassword = await argon.hash(password);
        existingUser.verifyCodeExpires = expiryDate;
        existingUser.password = hashedPassword;
        existingUser.username = username;
        existingUser.verifyCode = otp;
        await existingUser.save();
        await sendEmail({
          to: email,
          text: `Your verification code is: ${otp}`,
        });

        const updatedUser = await User.findOne({ email }).select(
          "-password",
          "-refreshToken"
        );

        return new Response(
          JSON.stringify({
            message: "User updated successfully",
            success: true,
            data: updatedUser,
          }),
          {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      const hashedPassword = await argon.hash(password);
      const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        username,
        verifyCodeExpires: expiryDate,
        verifyCode: otp,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      const updatedUser = await User.findOne({ email }).select(
        "-password",
      ).lean();

      await sendEmail({
        to: email,
        text: `Your verification code is: ${otp}`,
      });

      return new Response(
        JSON.stringify({
          message: "User created successfully",
          success: true,
          data: updatedUser,
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        message: "Sign up failed",
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
