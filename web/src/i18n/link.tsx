"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { isLocale, languageFromPath, localizedPath } from "./config";
import { useSiteLanguage } from "./client";

export default function Link({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const language = useSiteLanguage();
  const localize = (path: string) =>
    languageFromPath(path) ? path : localizedPath(path, language);
  const target =
    typeof href === "string"
      ? localize(href)
      : { ...href, pathname: localize(href.pathname ?? "/") };
  const targetLanguage = languageFromPath(
    typeof target === "string" ? target : target.pathname,
  );
  const fullNavigation =
    !isLocale(language) ||
    (targetLanguage !== null && !isLocale(targetLanguage));
  // Full navigation avoids Google Translate DOM mutations conflicting with React.
  return (
    <NextLink
      href={target}
      {...props}
      prefetch={fullNavigation ? false : props.prefetch}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          !event.defaultPrevented &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0 &&
          (!props.target || props.target === "_self") &&
          !props.download &&
          fullNavigation
        ) {
          event.preventDefault();
          window.location.assign(event.currentTarget.href);
        }
      }}
    />
  );
}
