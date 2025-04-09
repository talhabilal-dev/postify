import { jwtVerify } from "jose";
import User from "@/models/user.model";
import Message from "@/models/message.model";
import connectDB from "@/lib/db";

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
    const user = await User.aggregate([
      { $match: { email: email } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No messages found.",
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

    return new Response(
      JSON.stringify({
        messages: "Messages fetched successfully.",
        success: true,
        data: user[0].messages,
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
        message: "Error fetching messages.",
        success: false,
        data: null,
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

export async function POST(req) {
  await connectDB();

  const { username, message } = await req.json();

  try {
    const user = await User.findOne({ username });

    if (!user || user.length === 0) {
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

    if (!user.isAcceptingMessages) {
      return new Response(
        JSON.stringify({
          message: "User is not accepting messages.",
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

    const newMessage = await Message.create({ text: message });
    if (!message) {
      return new Response(
        JSON.stringify({
          message: "Error creating message.",
          success: false,
          data: null,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    user.messages.push(newMessage._id);
    await user.save({ validateBeforeSave: false });

    return new Response(
      JSON.stringify({
        message: "Message sent successfully.",
        success: true,
        data: newMessage,
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
        message: "Error sending message.",
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
