"use client";

import { useTranslations } from "@/i18n/client";
import { unlocalizedPath } from "@/i18n/config";

import Link from "@/i18n/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SACRAMENTS, SACRAMENTS_PATH, sacramentPath } from "@/lib/sacraments";
import LanguageSwitcher from "./language-switcher";
import TowerMark from "./tower-mark";
import { Button, buttonVariants } from "./ui/button";

const SACRAMENT_LINKS = SACRAMENTS.map((sacrament) => ({
  href: sacramentPath(sacrament.slug),
  label: sacrament.label,
}));

const NAV: Array<{
  href: string;
  label: string;
  children?: typeof SACRAMENT_LINKS;
}> = [
  { href: "/messetider", label: "Messetider" },
  { href: SACRAMENTS_PATH, label: "Sakramenter", children: SACRAMENT_LINKS },
  { href: "/katekese", label: "Katekese" },
  { href: "/innlegg", label: "Innlegg" },
  { href: "/om", label: "Om menigheten" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const { t } = useTranslations();
  const pathname = unlocalizedPath(usePathname());
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-5 lg:h-[4.7rem] lg:gap-4 xl:gap-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 lg:gap-3"
        >
          <TowerMark className="h-8 w-6 shrink-0 text-primary lg:h-9 lg:w-7" />
          <span className="min-w-0">
            <span
              translate="no"
              className="notranslate block font-display text-xl leading-tight font-semibold whitespace-nowrap text-foreground sm:text-2xl lg:text-xl xl:text-2xl"
            >
              {t("St. Barbara menighet")}
            </span>
            {/* The four places, not the tagline: the front page already says that in its heading. */}
            <span
              translate="no"
              className="notranslate hidden text-xs leading-tight text-muted-foreground sm:block lg:hidden xl:block"
            >
              Kongsberg · Notodden · Rjukan · Mo
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 lg:flex xl:gap-6">
          <nav className="flex items-center gap-3.5 xl:gap-6">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap text-sm transition-colors xl:text-[0.95rem] ${
                    active
                      ? "font-medium text-primary"
                      : "text-foreground/75 hover:text-primary"
                  }`}
                >
                  {t(item.label)}
                </Link>
              );
              if (!item.children) return link;
              // The list opens on hover and while a keyboard user tabs through it. It stays
              // in the page while closed, so the links remain reachable without a pointer.
              return (
                <div key={item.href} className="group relative">
                  {link}
                  <div className="pointer-events-none absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                    <ul className="w-60 rounded-sm border border-border bg-popover p-1.5 text-popover-foreground shadow-popover">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={pathname === child.href ? "page" : undefined}
                            className={`block rounded-xs px-3 py-2 text-[0.95rem] outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground ${
                              pathname === child.href
                                ? "font-medium text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {t(child.label)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
            <div key={item.href} className="border-b border-border/70">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-display text-xl text-foreground"
              >
                {t(item.label)}
              </Link>
              {item.children && (
                <ul className="-mt-1 grid grid-cols-2 gap-x-4 pb-3">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="block py-1.5 text-[0.95rem] text-foreground/75"
                      >
                        {t(child.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
