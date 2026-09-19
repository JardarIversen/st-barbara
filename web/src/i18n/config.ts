import { languageCode } from "./languages.ts";

export type Locale = "nb" | "en";
export const locales = ["nb", "en"] as const;
export const isLocale = (value: string): value is Locale =>
  value === "nb" || value === "en";
export const intlLocale = (locale: Locale) =>
  locale === "en" ? "en-GB" : "nb-NO";
// Public URL language and editorial content language are distinct.
export function routeLanguage(value: string | null | undefined): string | null {
  const code = languageCode(value);
  return code === "no" ? "nb" : code;
}
export const contentLocale = (language: string): Locale =>
  language === "nb" ? "nb" : "en";
export function languageFromPath(path: string): string | null {
  return routeLanguage(path.match(/^\/([^/?#]+)(?=\/|$|[?#])/)?.[1]);
}
export function unlocalizedPath(path: string) {
  return languageFromPath(path) ? path.replace(/^\/[^/?#]+/, "") || "/" : path;
}
export function localizedPath(path: string, language: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const target = routeLanguage(language);
  if (!target) return path;
  const bare = unlocalizedPath(path);
  return `/${target}${bare === "/" ? "" : bare}`;
}

export const LANGUAGE_COOKIE = "site_language";
export function languagePreferenceCookie(language: string): string | null {
  const value = routeLanguage(language);
  return value
    ? `${LANGUAGE_COOKIE}=${value};Max-Age=31536000;Path=/;SameSite=Lax;Secure`
    : null;
}

// Explicit URLs always win. Only language-neutral visits use the preference.
export function languageRedirect(url: URL, preference?: string): URL | null {
  const language = languageFromPath(url.pathname);
  const legacy = routeLanguage(url.searchParams.get("translate"));
  const target = new URL(url);
  target.searchParams.delete("translate");
  target.pathname = localizedPath(
    url.pathname,
    ((!language || language === "en") && legacy) ||
      language ||
      routeLanguage(preference) ||
      "nb",
  );
  return target.href === url.href ? null : target;
}
