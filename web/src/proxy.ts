import { NextRequest, NextResponse } from "next/server";
import {
  contentLocale,
  isLocale,
  LANGUAGE_COOKIE,
  languageFromPath,
  languageRedirect,
} from "./i18n/config";

export function proxy(request: NextRequest) {
  const redirect = languageRedirect(
    new URL(request.url),
    request.cookies.get(LANGUAGE_COOKIE)?.value,
  );
  if (redirect) {
    const response = NextResponse.redirect(redirect);
    // A shared cache must never remember one visitor's preferred language.
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Cookie");
    return response;
  }
  const language = languageFromPath(request.nextUrl.pathname) ?? "nb";
  const headers = new Headers(request.headers);
  headers.set("x-site-locale", contentLocale(language));
  headers.set("x-site-language", language);
  headers.set("x-site-path", request.nextUrl.pathname);
  const response = NextResponse.next({ request: { headers } });
  if (!isLocale(language))
    response.headers.set("X-Robots-Tag", "noindex, follow");
  return response;
}

export const config = { matcher: ["/((?!api(?:/|$)|_next(?:/|$)|.*\\..*).*)"] };
