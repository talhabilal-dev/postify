import User from "@/models/user.model";
import connectDB from "@/lib/db";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  console.log(searchParams)
  const username = searchParams.get("username");

  if (!username) {
    return new Response(
      JSON.stringify({
        message: "No username provided.",
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
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return new Response(
        JSON.stringify({
          message: "Username already exists.",
          success: false,
          data: null,
        }),
        { status: 400 }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Username available.",
          success: true,
          data: null,
        }),
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.log(error);
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
