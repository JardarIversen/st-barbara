"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { localizedPath } from "./config";
import { useTranslations } from "./client";

export default function Link({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const { locale } = useTranslations();
  const target =
    typeof href === "string"
      ? localizedPath(href, locale)
      : { ...href, pathname: localizedPath(href.pathname ?? "/", locale) };
  // Full navigation avoids Google Translate DOM mutations conflicting with React.
  return (
    <NextLink
      href={target}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          !event.defaultPrevented &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0 &&
          /translated-(ltr|rtl)/.test(document.documentElement.className)
        ) {
          event.preventDefault();
          window.location.assign(event.currentTarget.href);
        }
      }}
    />
  );
}
