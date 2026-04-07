import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isLoginApi = req.nextUrl.pathname === "/api/auth/login";
  const isAuthed = req.cookies.get("auth")?.value === "1";

  if (isLoginPage || isLoginApi) return NextResponse.next();
  if (isAuthed) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
