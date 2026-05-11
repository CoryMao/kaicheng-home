import { NextResponse } from "next/server";

export function GET() {
  const response = NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
  response.cookies.set("admin-verified", "", { maxAge: 0, path: "/" });
  return response;
}
