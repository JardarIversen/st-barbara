import { writeFileSync } from "node:fs";

// Snapshot the language catalogue returned by the Google Website Translator.
// This is a maintenance command, not a runtime dependency or a translation API.
const endpoint =
  "https://translate.google.com/translate_a/l?client=te&alpha=true&hl=";
async function catalogue(language) {
  const response = await fetch(endpoint + language);
  if (!response.ok)
    throw new Error(`Language catalogue unavailable: ${response.status}`);
  const data = await response.json();
  if (!data.tl || Object.keys(data.tl).length < 100)
    throw new Error("Unexpected language catalogue");
  return data.tl;
}
const [english, norwegian] = await Promise.all([
  catalogue("en"),
  catalogue("no"),
]);
const aliases = {
  iw: "he",
  jw: "jv",
  tl: "fil",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};
const nativeOverrides = {
  no: "Norsk",
  en: "English",
  pl: "Polski",
  es: "Español",
  vi: "Tiếng Việt",
  uk: "Українська",
  pt: "Português (Brasil)",
  "pt-PT": "Português (Portugal)",
  tl: "Filipino",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  lt: "Lietuvių",
  hr: "Hrvatski",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
};
function nativeName(code, fallback) {
  if (nativeOverrides[code]) return nativeOverrides[code];
  const locale = aliases[code] ?? code;
  try {
    if (!Intl.DisplayNames.supportedLocalesOf([locale]).length) return fallback;
    return (
      new Intl.DisplayNames([locale], {
        type: "language",
        fallback: "none",
      }).of(locale) ?? fallback
    );
  } catch {
    return fallback;
  }
}
const languages = Object.entries(english).map(([code, label]) => {
  if (
    !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(code) ||
    typeof label !== "string"
  )
    throw new Error("Invalid language entry");
  return {
    code,
    native: nativeName(code, label),
    en: label,
    nb: norwegian[code] ?? label,
  };
});
writeFileSync(
  new URL("../src/i18n/google-languages.json", import.meta.url),
  JSON.stringify(languages, null, 2) + "\n",
);
console.log(
  `Updated ${languages.length} verified Website Translator languages.`,
);
