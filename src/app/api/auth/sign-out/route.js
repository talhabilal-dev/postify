import cookie from "cookie";

export async function POST(req) {
  try {
    const accessTokenCookie = cookie.serialize("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1,
      path: "/",
    });

    const refreshTokenCookie = cookie.serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1,
      path: "/",
    });

    return new Response(
      JSON.stringify({
        message: "Sign out successful.",
        success: true,
        data: null,
      }),
      {
        setCookies: [accessTokenCookie, refreshTokenCookie],
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Sign out failed.",
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
