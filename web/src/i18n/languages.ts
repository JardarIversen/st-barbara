import catalogue from "./google-languages.json" with { type: "json" };

// A deliberate parish shortlist, not the complete Google catalogue.
// Flags are visual cues; the language name remains the actual label.
const selection = [
  ["no", "NO"],
  ["en", "GB"],
  ["pl", "PL"],
  ["es", "ES"],
  ["vi", "VN"],
  ["uk", "UA"],
  ["tl", "PH"],
  ["lt", "LT"],
  ["hr", "HR"],
  ["pt", "BR"],
  ["fr", "FR"],
  ["de", "DE"],
  ["it", "IT"],
  ["ta", "LK"],
  ["ti", "ER"],
  ["ar", "LB"],
  ["ru", "RU"],
  ["ro", "RO"],
  ["sk", "SK"],
  ["cs", "CZ"],
  ["hu", "HU"],
  ["lv", "LV"],
  ["nl", "NL"],
  ["sv", "SE"],
  ["da", "DK"],
  ["am", "ET"],
  ["ml", "IN"],
  ["zh-CN", "CN"],
  ["ko", "KR"],
  ["id", "ID"],
] as const;

export type LanguageFlag = (typeof selection)[number][1];
export type SiteLanguage = {
  code: string;
  native: string;
  en: string;
  nb: string;
  flag: LanguageFlag;
};
export const LANGUAGES: SiteLanguage[] = selection.map(([code, flag]) => {
  const language = catalogue.find((entry) => entry.code === code);
  if (!language)
    throw new Error(`Missing language in Google catalogue: ${code}`);
  return { ...language, flag };
});
export const PRIMARY_LANGUAGES = ["no", "en"];
const known = new Set(LANGUAGES.map((language) => language.code));
const aliases: Record<string, string> = {
  nb: "no",
  nn: "no",
  he: "iw",
  jv: "jw",
  fil: "tl",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
};

export function languageCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = aliases[value] ?? value;
  return known.has(code) ? code : null;
}

export function translationLanguage(
  search: string,
  cookie: string,
): string | null {
  const requested = new URLSearchParams(search).get("translate");
  const saved = cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;\s]+)/)?.[1];
  const code = languageCode(requested ?? saved);
  return code && !PRIMARY_LANGUAGES.includes(code) ? code : null;
}

export function languageSearchText(language: SiteLanguage): string {
  return [
    language.code,
    language.native,
    language.nb,
    language.en,
    ...Object.entries(aliases)
      .filter(([, target]) => target === language.code)
      .map(([alias]) => alias),
  ]
    .join(" ")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase();
}
