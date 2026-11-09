"use client";

import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { PLACE_FILTERS, type PlaceFilterValue } from "@/lib/mass-times";

/** Sticky bar under the site header that keeps the place filter within reach. */
export const STICKY_TOOLBAR =
  "sticky top-16 z-30 -mx-5 border-y border-border bg-background/95 px-5 py-2.5 backdrop-blur lg:top-[4.7rem]";

/** The primary control on the Mass times page: everything below follows the chosen place. */
export default function PlaceFilter({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: PlaceFilterValue) => void;
  className?: string;
}) {
  const { t } = useTranslations();
  return (
    <div
      role="group"
      aria-label={t("Velg sted")}
      className={cn(
        "-mx-1 flex gap-0.5 overflow-x-auto px-1 py-0.5 sm:gap-1",
        className,
      )}
    >
      {PLACE_FILTERS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={cn(
            "focus-ring shrink-0 rounded-full px-2.5 py-2 text-sm font-medium transition-colors sm:px-3.5",
            value === key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {key === "all" ? (
            <>
              <span className="sm:hidden">{t("Alle")}</span>
              <span className="max-sm:hidden">{t(label)}</span>
            </>
          ) : (
            <span translate="no" className="notranslate">
              {label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
