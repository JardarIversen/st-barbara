"use client";

import { useTranslations } from "@/i18n/client";

import Link from "@/i18n/link";
import ContentLanguage from "./content-language";
import AnnouncementTags from "./announcement-tags";
import { cn } from "@/lib/utils";
import {
  LANGUAGE_LABELS,
  addDays,
  calendarDayGroups,
  calendarPlaceLabel,
  calendarTitle,
  formatCalendarDate,
  formatCalendarTime,
  isDateOnlyRange,
  todayInOslo,
  type CalendarListItem,
} from "@/lib/calendar";

/** Status that changes whether someone should come: never colour alone. */
export function StatusBadge({
  tone = "notice",
  children,
}: {
  tone?: "notice" | "alert";
  children: React.ReactNode;
}) {
  return (
    <span
      className={`relative z-10 inline-flex items-center rounded-xs px-1.5 py-px text-xs font-medium ${tone === "alert" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
    >
      {children}
    </span>
  );
}

export function LanguageBadge({ language }: { language: string }) {
  const { t } = useTranslations();
  return (
    <span className="inline-flex items-center rounded-xs border border-border px-1.5 py-px font-sans text-xs font-medium text-muted-foreground">
      {t(LANGUAGE_LABELS[language] ?? "Annet språk")}
    </span>
  );
}

export default function AgendaList({
  items,
  today,
  from,
  place,
  compact = false,
}: {
  items: CalendarListItem[];
  today: string;
  from?: string;
  /** The place the list is already filtered to; its name is not repeated on every row. */
  place?: string;
  /** Front page: the day sits beside its entries instead of above them. */
  compact?: boolean;
}) {
  const { locale, t } = useTranslations();
  const renderItems = (date: string, dayItems: CalendarListItem[]) => (
    <ul className="divide-y divide-border/60">
      {dayItems.map((item) => {
        const cancelled = item.status === "cancelled";
        const title = calendarTitle(item);
        const multipleDays =
          todayInOslo(new Date(item.endsAt ?? item.startsAt)) !== item.dateKey;
        const fullNote =
          item.publicNote ||
          (item.eventType !== "mass" ? item.summary : undefined);
        // Front page: the notice tag already says it, and the notice itself is beside the list.
        const note =
          compact && item.announcements?.length ? undefined : fullNote;
        const places = item.places.map(calendarPlaceLabel).filter(
          (name) =>
            // «Messe på Rjukan» already says «Rjukan kirke».
            !title
              .toLocaleLowerCase("nb-NO")
              .includes(name.split(" ")[0].toLocaleLowerCase("nb-NO")) &&
            !(
              place &&
              name
                .toLocaleLowerCase("nb-NO")
                .includes(place.toLocaleLowerCase("nb-NO"))
            ),
        );
        return (
          <li key={item.id}>
            <div
              className={cn(
                "group relative -mx-2 grid items-start gap-x-3 rounded-sm px-2 py-3 transition-colors hover:bg-muted/70 sm:gap-x-4",
                compact
                  ? "grid-cols-[3.25rem_minmax(0,1fr)] sm:grid-cols-[4rem_minmax(0,1fr)]"
                  : "grid-cols-[3.5rem_minmax(0,1fr)_0.75rem] sm:grid-cols-[4rem_minmax(0,1fr)_0.75rem]",
              )}
            >
              {isDateOnlyRange(item) ? (
                <span className="pt-1 text-xs leading-5 text-muted-foreground">
                  {t("Flere dager")}
                </span>
              ) : (
                <time
                  dateTime={item.startsAt}
                  className={`pt-0.5 text-lg font-semibold tabular-nums leading-6 ${cancelled ? "text-muted-foreground line-through" : "text-primary"}`}
                >
                  {formatCalendarTime(item.startsAt, locale)}
                </time>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="leading-7">
                    <Link
                      href={item.href}
                      className={`text-[0.95rem] font-medium after:absolute after:inset-0 after:rounded-sm group-hover:text-primary ${cancelled ? "text-muted-foreground line-through decoration-1" : "text-foreground"}`}
                    >
                      <ContentLanguage original={item.titleOriginal}>
                        {title}
                      </ContentLanguage>
                    </Link>
                    {places.length > 0 && (
                      <span
                        translate="no"
                        className="notranslate text-[0.95rem] text-muted-foreground"
                      >
                        <span aria-hidden>{"\u00a0· "}</span>
                        <span className="sr-only">, </span>
                        <span className="whitespace-nowrap">
                          {places.join(" · ")}
                        </span>
                      </span>
                    )}
                  </span>
                  {item.language &&
                    item.eventType === "mass" &&
                    (item.language !== "nb" || locale === "en") && (
                      <LanguageBadge language={item.language} />
                    )}
                  {cancelled && (
                    <StatusBadge tone="alert">{t("Avlyst")}</StatusBadge>
                  )}
                  {item.status === "postponed" && (
                    <StatusBadge tone="alert">{t("Utsatt")}</StatusBadge>
                  )}
                  {item.changeLabel && !cancelled && (
                    <StatusBadge>{t(item.changeLabel)}</StatusBadge>
                  )}
                  <AnnouncementTags items={item.announcements} />
                </div>
                {multipleDays && (
                  <p className="text-xs leading-5 text-muted-foreground">
                    {item.dateKey < date
                      ? `${t("Fra")} ${formatCalendarDate(item.startsAt, false, locale)} · `
                      : ""}
                    {`${t("Til")} ${formatCalendarDate(item.endsAt!, false, locale)}`}
                  </p>
                )}
                {note && note !== item.title && (
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    <ContentLanguage original={item.noteOriginal}>
                      {note}
                    </ContentLanguage>
                  </p>
                )}
              </div>
              {!compact && (
                <span
                  aria-hidden
                  className="pt-1 text-muted-foreground/60 group-hover:text-primary"
                >
                  ›
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );

  if (compact)
    return (
      <div className="border-b border-border">
        {calendarDayGroups(items, from).map(([date, dayItems]) => {
          const sunday = new Date(`${date}T12:00:00Z`).getUTCDay() === 0;
          const day = new Date(`${date}T12:00:00Z`);
          const weekday = new Intl.DateTimeFormat(
            locale === "en" ? "en-GB" : "nb-NO",
            { timeZone: "UTC", weekday: "long" },
          ).format(day);
          const shortWeekday = new Intl.DateTimeFormat(
            locale === "en" ? "en-GB" : "nb-NO",
            { timeZone: "UTC", weekday: "short" },
          ).format(day);
          const dayMonth = new Intl.DateTimeFormat(
            locale === "en" ? "en-GB" : "nb-NO",
            { timeZone: "UTC", day: "numeric", month: "short" },
          ).format(day);
          const label =
            date === today
              ? t("I dag")
              : date === addDays(today, 1)
                ? t("I morgen")
                : weekday.charAt(0).toLocaleUpperCase(locale) +
                  weekday.slice(1);
          return (
            <section
              key={date}
              id={`day-${date}`}
              data-agenda-date={date}
              aria-label={formatCalendarDate(
                `${date}T12:00:00Z`,
                false,
                locale,
              )}
              className={cn(
                "grid grid-cols-[5.25rem_minmax(0,1fr)] gap-x-2 border-t border-border sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-4",
                sunday &&
                  "-mx-3 rounded-sm border-transparent bg-muted/70 px-3 [&+section]:border-transparent",
              )}
            >
              <h3 className="py-3 text-sm leading-6">
                <time dateTime={date} className="flex flex-col">
                  <span
                    className={cn(
                      "font-semibold",
                      sunday || date === today
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {label}
                  </span>
                  <span className="whitespace-nowrap text-muted-foreground">
                    {date === today || date === addDays(today, 1)
                      ? `${shortWeekday} ${dayMonth}`
                      : dayMonth}
                  </span>
                </time>
              </h3>
              {renderItems(date, dayItems)}
            </section>
          );
        })}
      </div>
    );

  return (
    <div className="space-y-4">
      {calendarDayGroups(items, from).map(([date, dayItems]) => (
        <section key={date} id={`day-${date}`} data-agenda-date={date}>
          <h3 className="mb-1 flex items-center gap-3 border-b border-border pb-2 text-sm font-semibold text-foreground">
            <time dateTime={date}>
              {formatCalendarDate(`${date}T12:00:00Z`, false, locale)}
            </time>
            {date === today && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-semibold text-background">
                {t("I dag")}
              </span>
            )}
          </h3>
          {renderItems(date, dayItems)}
        </section>
      ))}
    </div>
  );
}
