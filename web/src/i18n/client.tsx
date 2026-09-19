"use client";

import { createContext, useContext } from "react";
import { getTranslator } from "./translate";
import type { Locale } from "./config";

const LocaleContext = createContext<Locale>("nb");
const LanguageContext = createContext("nb");
export function LocaleProvider({
  locale,
  language = locale,
  children,
}: {
  locale: Locale;
  language?: string;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext value={locale}>
      <LanguageContext value={language}>{children}</LanguageContext>
    </LocaleContext>
  );
}
export const useSiteLanguage = () => useContext(LanguageContext);
export function useTranslations() {
  const locale = useContext(LocaleContext);
  return { locale, t: getTranslator(locale) };
}
