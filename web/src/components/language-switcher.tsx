"use client";

import { useEffect, useRef, useState } from "react";

const LANGS = [
  { code: "no", label: "Norsk" },
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "es", label: "Español" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "uk", label: "Українська" },
  { code: "pt", label: "Português" },
  { code: "tl", label: "Filipino" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "lt", label: "Lietuvių" },
  { code: "hr", label: "Hrvatski" },
];

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay: boolean },
          element: string
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
  const cls = `${className} rounded-[2px] border border-ink/10`;
  switch (code) {
    case "no":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="20" fill="#ba0c2f" />
          <path d="M0 10h30M11 0v20" stroke="#fff" strokeWidth="5" />
          <path d="M0 10h30M11 0v20" stroke="#00205b" strokeWidth="2.5" />
        </svg>
      );
    case "en":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="20" fill="#012169" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.6" />
          <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6.5" />
          <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="4" />
        </svg>
      );
    case "pl":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="10" fill="#fff" />
          <rect y="10" width="30" height="10" fill="#dc143c" />
        </svg>
      );
    case "es":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="20" fill="#aa151b" />
          <rect y="5" width="30" height="10" fill="#f1bf00" />
        </svg>
      );
    case "vi":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="20" fill="#da251d" />
          <polygon
            points="15,4 16.41,8.06 20.71,8.15 17.28,10.74 18.53,14.85 15,12.4 11.47,14.85 12.72,10.74 9.29,8.15 13.59,8.06"
            fill="#ffff00"
          />
        </svg>
      );
    case "uk":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="10" fill="#0057b7" />
          <rect y="10" width="30" height="10" fill="#ffd700" />
        </svg>
      );
    case "pt":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="12" height="20" fill="#046a38" />
          <rect x="12" width="18" height="20" fill="#da291c" />
          <circle cx="12" cy="10" r="3.5" fill="#ffe900" />
          <circle cx="12" cy="10" r="2" fill="#da291c" />
        </svg>
      );
    case "tl":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="10" fill="#0038a8" />
          <rect y="10" width="30" height="10" fill="#ce1126" />
          <polygon points="0,0 12,10 0,20" fill="#fff" />
          <circle cx="4.5" cy="10" r="2" fill="#fcd116" />
        </svg>
      );
    case "fr":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="10" height="20" fill="#002395" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#ed2939" />
        </svg>
      );
    case "de":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="6.67" fill="#000" />
          <rect y="6.67" width="30" height="6.67" fill="#dd0000" />
          <rect y="13.33" width="30" height="6.67" fill="#ffce00" />
        </svg>
      );
    case "it":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="10" height="20" fill="#009246" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#ce2b37" />
        </svg>
      );
    case "lt":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="6.67" fill="#ffb81c" />
          <rect y="6.67" width="30" height="6.67" fill="#046a38" />
          <rect y="13.33" width="30" height="6.67" fill="#be3a34" />
        </svg>
      );
    case "hr":
      return (
        <svg viewBox="0 0 30 20" className={cls}>
          <rect width="30" height="6.67" fill="#ff0000" />
          <rect y="6.67" width="30" height="6.67" fill="#fff" />
          <rect y="13.33" width="30" height="6.67" fill="#171796" />
          <g>
            <rect x="13" y="6" width="2" height="2" fill="#ff0000" />
            <rect x="15" y="6" width="2" height="2" fill="#fff" />
            <rect x="13" y="8" width="2" height="2" fill="#fff" />
            <rect x="15" y="8" width="2" height="2" fill="#ff0000" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

function readLangFromCookie(): string {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/no\/(\w+)/);
  return match ? match[1] : "no";
}

function loadTranslateScript() {
  if (document.getElementById("google-translate-script")) return;
  window.googleTranslateElementInit = () => {
    if (window.google?.translate) {
      new window.google.translate.TranslateElement(
        { pageLanguage: "no", autoDisplay: false },
        "google_translate_element"
      );
    }
  };
  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(script);
}

function applyLang(next: string) {
  const host = location.hostname;
  if (next === "no") {
    document.cookie = `googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `googtrans=;path=/;domain=${host};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } else {
    document.cookie = `googtrans=/no/${next};path=/`;
    document.cookie = `googtrans=/no/${next};path=/;domain=${host}`;
  }
  location.reload();
}

export function useCurrentLang() {
  const [lang, setLang] = useState("no");
  useEffect(() => {
    const current = readLangFromCookie();
    // The cookie is an external store and is only available after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(current);
    if (current !== "no") loadTranslateScript();
  }, []);
  return lang;
}

/* Compact flag row, used in the mobile menu */
export function LanguageFlags() {
  const lang = useCurrentLang();
  return (
    <div translate="no" className="notranslate flex flex-wrap items-center gap-2">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => applyLang(l.code)}
          aria-label={l.label}
          title={l.label}
          className={`rounded-[3px] p-1 transition-colors ${
            lang === l.code
              ? "bg-burgundy/10 ring-1 ring-burgundy"
              : "hover:bg-cream"
          }`}
        >
          <Flag code={l.code} className="h-4.5 w-7" />
        </button>
      ))}
    </div>
  );
}

/* Dropdown with flags, used in the navbar */
export default function LanguageSwitcher() {
  const lang = useCurrentLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Velg språk"
        className="flex items-center gap-1.5 rounded-sm border border-line px-2.5 py-2 transition-colors hover:bg-cream"
      >
        <Flag code={lang} className="h-4 w-6" />
        <svg
          viewBox="0 0 12 12"
          className={`size-3 text-stone transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" />
        </svg>
      </button>

      {open && (
        <ul
          translate="no"
          className="notranslate absolute right-0 z-50 mt-2 w-44 rounded-sm border border-line bg-paper py-1 shadow-lg shadow-ink/10"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => applyLang(l.code)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-cream ${
                  lang === l.code ? "font-medium text-burgundy" : "text-ink/80"
                }`}
              >
                <Flag code={l.code} className="h-3.5 w-[1.3rem]" />
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
