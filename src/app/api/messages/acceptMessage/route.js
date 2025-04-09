import { jwtVerify } from "jose";
import User from "@/models/user.model";
import connectDB from "@/lib/db";

export async function POST(req) {
  await connectDB();
  const { cookies } = req;
  const accessToken = cookies.get("accessToken")?.value;

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        message: "No access token provided.",
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

  const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN);

  const { payload: accessPayload } = await jwtVerify(
    accessToken,
    accessTokenSecret
  );
  const email = accessPayload.email;

  if (!email) {
    return new Response(
      JSON.stringify({
        message: "No email found in access token.",
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

    if (user) {
      user.isAcceptingMessages = !user.isAcceptingMessages;
      await user.save();
    }

    return new Response(
      JSON.stringify({
        message: `User ${
          user.isAcceptingMessages
            ? "is now accepting"
            : "is no longer accepting"
        } messages.`,
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
        message: "Internal server error.",
        success: false,
        data: null,
        error: error.message || "Unknown error"
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

export async function GET(req) {
  await connectDB();
  const { cookies } = req;
  const accessToken = cookies.get("accessToken")?.value;

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        message: "No access token provided.",
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

  const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN);

  const { payload: accessPayload } = await jwtVerify(
    accessToken,
    accessTokenSecret
  );
  const email = accessPayload.email;

  if (!email) {
    return new Response(
      JSON.stringify({
        message: "No email found in access token.",
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

  try {
    const user = await User.findOne({ email });

    if (user) {
      return new Response(
        JSON.stringify({
          message: "Accepting messages status.",
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
    }

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
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Internal server error.",
        success: false,
        data: null,
        error: error.message || "Unknown error"
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
