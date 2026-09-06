import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { isLocale } from "./config";
import { getTranslator } from "./translate";

// The proxy overwrites this header from the URL; never trust a caller's header.
export const getLocale = cache(async () => {
  const value = (await headers()).get("x-site-locale") ?? "nb";
  return isLocale(value) ? value : "nb";
});
export async function getTranslations() {
  const locale = await getLocale();
  return { locale, t: getTranslator(locale) };
}
