"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher, { LanguageFlags } from "./language-switcher";

const NAV = [
  { href: "/messetider", label: "Messetider" },
  { href: "/katekese", label: "Katekese" },
  { href: "/innlegg", label: "Innlegg" },
  { href: "/om", label: "Om menigheten" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="font-display text-3xl leading-none text-gold transition-colors group-hover:text-burgundy"
          >
            ✠
          </span>
          <span>
            <span
              translate="no"
              className="notranslate block font-display text-[1.45rem] leading-tight font-semibold tracking-wide text-ink"
            >
              St. Barbara menighet
            </span>
            <span className="block text-[0.6rem] font-medium uppercase tracking-[0.28em] text-stone">
              Den katolske kirke i Kongsberg
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <nav className="flex items-center gap-6">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[0.95rem] transition-colors ${
                    active
                      ? "font-medium text-burgundy"
                      : "text-ink/75 hover:text-burgundy"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher />
          <Link
            href="/donasjoner"
            className="rounded-sm bg-burgundy px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-burgundy-deep"
          >
            Gi en gave
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Meny"
            className="flex size-10 items-center justify-center text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-6"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line px-5 pb-6 pt-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/70 py-3 font-display text-xl text-ink"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-5 flex items-center justify-between gap-4">
            <Link
              href="/donasjoner"
              onClick={() => setOpen(false)}
              className="rounded-sm bg-burgundy px-5 py-2.5 text-sm font-medium text-paper"
            >
              Gi en gave
            </Link>
            <LanguageFlags />
          </div>
        </nav>
      )}
    </header>
  );
}
