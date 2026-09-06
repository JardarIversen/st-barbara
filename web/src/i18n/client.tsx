"use client";

import { createContext, useContext } from "react";
import { getTranslator } from "./translate";
import type { Locale } from "./config";

const LocaleContext = createContext<Locale>("nb");
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}
export function useTranslations() {
  const locale = useContext(LocaleContext);
  return { locale, t: getTranslator(locale) };
}
