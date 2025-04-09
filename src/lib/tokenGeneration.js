import { SignJWT } from "jose";

export const generateAccessToken = async (user) => {
  const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN);
  const token = await new SignJWT({
    userId: user._id,
    email: user.email,
    username: user.username,
    verified: user.isVerified,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  return token;
};

export const generateRefreshToken = async (user) => {
  const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN);
  const token = await new SignJWT({
    userId: user._id,
    email: user.email,
    username: user.username,
    verified: user.isVerified,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  return token;
};
