"use client";

import { useTranslations } from "@/i18n/client";

import Link from "@/i18n/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "./language-switcher";
import { Button, buttonVariants } from "./ui/button";

const NAV = [
  { href: "/messetider", label: "Messetider" },
  { href: "/katekese", label: "Katekese" },
  { href: "/innlegg", label: "Innlegg" },
  { href: "/om", label: "Om menigheten" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const { t } = useTranslations();
  const pathname = usePathname().replace(/^\/(nb|en)(?=\/|$)/, "") || "/";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-5 lg:h-[4.7rem] lg:gap-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 lg:gap-3"
        >
          <span
            aria-hidden
            className="font-display text-3xl leading-none text-brand transition-colors group-hover:text-primary"
          >
            ✠
          </span>
          <span>
            <span
              translate="no"
              className="notranslate block font-display text-lg leading-tight font-semibold tracking-wide text-foreground sm:text-[1.45rem]"
            >
              {" "}
              {t("St. Barbara menighet")}{" "}
            </span>
            <span className="hidden text-[0.6rem] font-medium uppercase tracking-[0.28em] text-muted-foreground sm:block">
              {" "}
              {t("Den katolske kirke i Kongsberg")}{" "}
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
                      ? "font-medium text-primary"
                      : "text-foreground/75 hover:text-primary"
                  }`}
                >
                  {t(item.label)}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher />
          <Link href="/donasjoner" className={buttonVariants({ size: "sm" })}>
            {" "}
            {t("Gi en gave")}{" "}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={t("Meny")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              data-icon="inline-start"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border px-5 pb-6 pt-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border/70 py-3 font-display text-xl text-foreground"
            >
              {t(item.label)}
            </Link>
          ))}
          <div className="mt-5 flex items-center justify-between gap-4">
            <Link
              href="/donasjoner"
              onClick={() => setOpen(false)}
              className={buttonVariants()}
            >
              {" "}
              {t("Gi en gave")}{" "}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
