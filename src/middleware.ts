import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

async function isAuthed(req: NextRequest) {
  const token = req.cookies.get("appeu_session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = pathname.startsWith("/login") || pathname.startsWith("/setup");
  const authed = await isAuthed(req);

  if (!authed && !isPublic) return NextResponse.redirect(new URL("/login", req.url));
  if (authed && isPublic) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};