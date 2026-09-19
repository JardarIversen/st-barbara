"use client";

import { useEffect, useState } from "react";
import { useSiteLanguage, useTranslations } from "@/i18n/client";
import {
  isLocale,
  languagePreferenceCookie,
  localizedPath,
} from "@/i18n/config";
import { ChevronDownIcon } from "lucide-react";
import { LANGUAGE_FLAGS } from "@/i18n/language-flags";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LANGUAGES,
  PRIMARY_LANGUAGES,
  languageCode,
  languageSearchText,
  type SiteLanguage,
} from "@/i18n/languages";

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            autoDisplay: boolean;
            includedLanguages: string;
          },
          element: string,
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export function Flag({
  code,
  className = "h-4 w-6",
}: {
  code: string;
  className?: string;
}) {
  const language = LANGUAGES.find((entry) => entry.code === languageCode(code));
  const FlagIcon = LANGUAGE_FLAGS[language?.flag ?? "GB"];
  return (
    <FlagIcon
      aria-hidden="true"
      focusable="false"
      className={cn(className, "rounded-xs border border-foreground/10")}
    />
  );
}

function clearTranslationCookie() {
  try {
    const expiry =
      ";path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax;Secure";
    document.cookie = "googtrans=" + expiry;
    const parts = location.hostname.split(".");
    for (let i = 0; i < parts.length - 1; i++) {
      document.cookie =
        "googtrans=" + expiry + ";domain=" + parts.slice(i).join(".");
    }
  } catch {
    /* Cookies may be disabled; the URL still controls the language. */
  }
}

function applyLang(next: string) {
  if (!languageCode(next)) return;
  clearTranslationCookie();
  const preference = languagePreferenceCookie(next);
  // Explicit URLs still work if the browser disallows cookies.
  try {
    if (preference) document.cookie = preference;
  } catch {
    /* Navigation does not require browser storage. */
  }
  const url = new URL(location.href);
  url.pathname = localizedPath(url.pathname, next);
  url.searchParams.delete("translate");
  // Reload so Google never translates an already translated React tree.
  location.assign(url.toString());
}

export function useCurrentLang() {
  return languageCode(useSiteLanguage()) ?? "no";
}

export function AutomaticTranslation() {
  const siteLanguage = useSiteLanguage();
  const language = isLocale(siteLanguage) ? null : siteLanguage;
  const [status, setStatus] = useState<"off" | "loading" | "ready" | "failed">(
    language ? "loading" : "off",
  );
  useEffect(() => {
    clearTranslationCookie();
    if (!language) {
      return;
    }
    try {
      document.cookie = `googtrans=/en/${language};path=/;SameSite=Lax;Secure`;
    } catch {
      /* The loading timeout will offer the English fallback. */
    }
    const observer = new MutationObserver(() => {
      if (/translated-(ltr|rtl)/.test(document.documentElement.className)) {
        document.documentElement.lang = language;
        setStatus("ready");
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const timer = window.setTimeout(() => {
      if (!/translated-(ltr|rtl)/.test(document.documentElement.className))
        setStatus("failed");
    }, 15000);
    window.googleTranslateElementInit = () => {
      if (window.google?.translate)
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
            includedLanguages: LANGUAGES.map(({ code }) => code).join(","),
          },
          "google_translate_element",
        );
    };
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => setStatus("failed");
    document.body.appendChild(script);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      script.remove();
    };
  }, [language]);
  return (
    <>
      <div id="google_translate_element" />
      {status !== "off" && (
        <div
          translate="no"
          lang="en"
          className="notranslate border-b border-border bg-muted px-5 py-2 text-center text-xs text-muted-foreground"
          role="status"
        >
          {status === "loading"
            ? "Loading automatic translation from English…"
            : status === "failed"
              ? "Automatic translation is unavailable. The English version is shown."
              : "Automatically translated from English by Google. Translation may contain errors."}{" "}
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={() => applyLang("en")}
          >
            English
          </Button>
          {" · "}
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={() => applyLang("no")}
          >
            Norsk
          </Button>
        </div>
      )}
    </>
  );
}

export default function LanguageSwitcher() {
  const lang = useCurrentLang();
  const { locale, t } = useTranslations();
  const [open, setOpen] = useState(false);
  const selected = LANGUAGES.find((language) => language.code === lang);
  const primary = PRIMARY_LANGUAGES.map((code) =>
    LANGUAGES.find((l) => l.code === code)!,
  );
  const automatic = LANGUAGES.filter(
    (language) => !PRIMARY_LANGUAGES.includes(language.code),
  );
  function option(language: SiteLanguage) {
    return (
      <CommandItem
        key={language.code}
        value={language.code}
        keywords={[languageSearchText(language)]}
        data-checked={lang === language.code}
        onSelect={() => {
          setOpen(false);
          applyLang(language.code);
        }}
      >
        <span
          aria-hidden="true"
          className="flex h-4 w-6 shrink-0 items-center justify-center"
        >
          <Flag code={language.code} className="size-full" />
        </span>
        <span className="flex min-w-0 flex-col">
          <bdi className="truncate">{language.native}</bdi>
          {language.native.toLocaleLowerCase() !==
            language[locale].toLocaleLowerCase() && (
            <span className="text-xs text-muted-foreground">
              {language[locale]}
            </span>
          )}
        </span>
      </CommandItem>
    );
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" size="sm" />}
        translate="no"
        lang={locale}
        className="notranslate"
        aria-label={`${t("Velg språk")}: ${selected?.native ?? lang}`}
        title={selected?.native}
      >
        <span
          aria-hidden="true"
          className="flex h-4 w-6 items-center justify-center"
        >
          <Flag code={lang} className="size-full" />
        </span>
        <span>{lang.split("-")[0].toUpperCase()}</span>
        <ChevronDownIcon
          aria-hidden="true"
          data-icon="inline-end"
          className={cn(open && "rotate-180")}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="notranslate w-80 max-w-[calc(100vw-2rem)] p-0"
        translate="no"
        dir="ltr"
        lang={locale}
      >
        <PopoverTitle className="sr-only">{t("Velg språk")}</PopoverTitle>
        <Command
          loop
          filter={(value, search, keywords) => {
            const normalized = search
              .normalize("NFD")
              .replace(/\p{M}/gu, "")
              .toLocaleLowerCase()
              .trim();
            const text = `${value} ${keywords?.join(" ") ?? ""}`;
            return normalized.split(/\s+/).every((word) => text.includes(word))
              ? 1
              : 0;
          }}
        >
          <CommandInput
            placeholder={t("Søk etter språk…")}
            aria-label={t("Søk etter språk")}
          />
          <CommandList className="max-h-[min(65dvh,24rem)]">
            <CommandEmpty>{t("Ingen språk funnet.")}</CommandEmpty>
            <CommandGroup heading={t("Norsk og engelsk")}>
              {primary.map(option)}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t("Flere språk · Google Translate")}>
              {automatic.map(option)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
