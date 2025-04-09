import { jwtVerify } from "jose";
import User from "@/models/user.model";
import connectDB from "@/lib/db";
export async function DELETE(req, params) {
  const { messageId } = params.params;

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

  try {
    const user = await User.updateOne(
      { email: email },
      { $pull: { messages: { _id: messageId } } }
    );

    if (user.modifiedCount === 0) {
      return new Response(
        JSON.stringify({
          message: "Message not found.",
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

    return new Response(
      JSON.stringify({
        message: "Message deleted successfully.",
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
        message: "Error deleting message.",
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
