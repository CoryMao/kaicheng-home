import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (url.pathname === "/") {
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
