"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "@/i18n/link";
import { useTranslations } from "@/i18n/client";

// The site's own page history in this tab, so «back» can mean what the browser's back button means.
let previousPath: string | null = null;
let currentPath: string | null = null;
let poppedAt = 0;

/** Mounted once in the layout: remembers the previous page and when the visitor used back or forward. */
export function NavigationHistory() {
  const pathname = usePathname();
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== currentPath) {
      previousPath = currentPath;
      currentPath = path;
    }
  }, [pathname]);
  useEffect(() => {
    const onPop = () => {
      poppedAt = Date.now();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return null;
}

/** True right after back or forward, when the page should keep the scroll position the browser restores. */
export function cameBackRecently() {
  return Date.now() - poppedAt < 1500;
}

const subscribe = () => () => {};

/**
 * «← Tilbake» goes back to wherever the visitor came from on this site, scroll position included.
 * Someone arriving from outside gets a normal link to the given page instead.
 */
export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const { t } = useTranslations();
  const inApp = useSyncExternalStore(
    subscribe,
    () => previousPath !== null,
    () => false,
  );
  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (previousPath === null) return;
        event.preventDefault();
        router.back();
      }}
    >
      {inApp ? `← ${t("Tilbake")}` : children}
    </Link>
  );
}
