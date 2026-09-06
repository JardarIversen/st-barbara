import english from "./en.json" with { type: "json" };
import type { Locale } from "./config";

// Norwegian source strings are stable dictionary keys, never DOM replacements.
export function getTranslator(locale: Locale) {
  return (source: string): string =>
    locale === "en" && Object.hasOwn(english, source)
      ? (english as Record<string, string>)[source]
      : source;
}
