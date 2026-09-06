export type Locale = "nb" | "en";
export const locales = ["nb", "en"] as const;
export const isLocale = (value: string): value is Locale =>
  value === "nb" || value === "en";
export const intlLocale = (locale: Locale) =>
  locale === "en" ? "en-GB" : "nb-NO";
export function localizedPath(path: string, locale: Locale) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const bare = path.replace(/^\/(?:nb|en)(?=\/|$|[?#])/, "");
  return `/${locale}${bare === "/" ? "" : bare}`;
}
