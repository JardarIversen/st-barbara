import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "./i18n/config";

export function proxy(request: NextRequest) {
  const segment = request.nextUrl.pathname.split("/")[1];
  if (!isLocale(segment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/nb${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.redirect(url);
  }
  const headers = new Headers(request.headers);
  headers.set("x-site-locale", segment);
  headers.set("x-site-path", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!api(?:/|$)|_next(?:/|$)|.*\\..*).*)"] };
