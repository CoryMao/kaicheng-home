import { NextResponse, type NextRequest } from "next/server";

export function proxy(_request: NextRequest) {
  // Let app/page.tsx handle the root route
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
