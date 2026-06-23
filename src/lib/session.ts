import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "appeu_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function createSession() {
  const token = await new SignJWT({ auth: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthenticated() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}