import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { generateAccessToken } from "./lib/tokenGeneration";

const TOKEN_EXPIRATION_TIME = 60 * 60; // 1 hour in seconds

export async function middleware(req) {
  const { cookies, nextUrl } = req;
  const accessToken = cookies.get("accessToken")?.value;
  const refreshToken = cookies.get("refreshToken")?.value;
  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);

  const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN);
  const refreshTokenSecret = new TextEncoder().encode(
    process.env.REFRESH_TOKEN
  );

  const isProtectedRoute = !["/user/sign-in", "/user/verify-otp"].includes(
    nextUrl.pathname
  );

  try {
    if (nextUrl.pathname === "/user/sign-in") {
      if (accessToken) {
        return NextResponse.redirect(new URL("/home", req.url));
      }
      return NextResponse.next();
    }

    if (!accessToken) {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/user/sign-in", req.url));
      }
      return NextResponse.next();
    }

    const { payload } = await jwtVerify(accessToken, accessTokenSecret);

    if (!payload.verified) {
      return NextResponse.redirect(new URL("/user/verify-otp", req.url));
    }

    return NextResponse.next();
  } catch (accessError) {
    console.error("Access token verification failed:", accessError);

    if (!refreshToken) {
      console.log("No refresh token found.");
      return NextResponse.redirect(new URL("/user/sign-in", req.url));
    }

    try {
      const { payload: refreshPayload } = await jwtVerify(
        refreshToken,
        refreshTokenSecret
      );

      if (!refreshPayload.verified) {
        console.log("Refresh token not verified.");
        return NextResponse.redirect(new URL("/user/verify-otp", req.url));
      }

      const newAccessToken = await generateAccessToken(refreshPayload);

      const response = NextResponse.next();
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: TOKEN_EXPIRATION_TIME,
      });

      return response;
    } catch (refreshError) {
      console.error("Failed to refresh token:", refreshError);
      return NextResponse.redirect(new URL("/user/sign-in", req.url));
    }
  }
}

export const config = {
  matcher: [
    // "/home/:path*",
    "/user/profile",
    "/user/settings",
    "/dashboard/:path*",
    "/protected/:path*",
  ],
};
