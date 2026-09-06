"use client";

import { useTranslations } from "@/i18n/client";

import Link from "@/i18n/link";
import ContentLanguage from "./content-language";
import {
  LANGUAGE_LABELS,
  calendarDayGroups,
  calendarPlaceLabel,
  calendarTitle,
  formatCalendarDate,
  formatCalendarTime,
  isDateOnlyRange,
  todayInOslo,
  type CalendarListItem,
} from "@/lib/calendar";

export default function AgendaList({
  items,
  today,
  from,
}: {
  items: CalendarListItem[];
  today: string;
  from?: string;
}) {
  const { locale, t } = useTranslations();
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
          <ul className="divide-y divide-border/60">
            {dayItems.map((item) => {
              const cancelled = item.status === "cancelled";
              const title = calendarTitle(item);
              const multipleDays =
                todayInOslo(new Date(item.endsAt ?? item.startsAt)) !==
                item.dateKey;
              const note =
                item.publicNote ||
                (item.eventType !== "mass" ? item.summary : undefined);
              const places = item.places
                .map(calendarPlaceLabel)
                .filter(
                  (name) =>
                    !title
                      .toLocaleLowerCase("nb-NO")
                      .includes(name.toLocaleLowerCase("nb-NO")),
                );
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group -mx-2 grid grid-cols-[3.5rem_minmax(0,1fr)_0.75rem] items-start gap-x-3 rounded-sm px-2 py-3 transition-colors hover:bg-muted/70 sm:grid-cols-[4rem_minmax(0,1fr)_auto_0.75rem] sm:gap-x-4"
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
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-[0.95rem] font-medium leading-7 text-foreground group-hover:text-primary">
                          <ContentLanguage original={item.titleOriginal}>
                            {title}
                          </ContentLanguage>
                        </span>
                        {item.language && item.eventType === "mass" && (
                          <span className="text-xs text-muted-foreground">
                            {t(LANGUAGE_LABELS[item.language])}
                          </span>
                        )}
                        {cancelled && (
                          <span className="text-xs font-semibold text-primary">
                            {t("Avlyst")}
                          </span>
                        )}
                        {item.status === "postponed" && (
                          <span className="text-xs font-semibold text-primary">
                            {t("Utsatt")}
                          </span>
                        )}
                        {item.changeLabel && !cancelled && (
                          <span className="text-xs font-semibold text-primary">
                            {t(item.changeLabel)}
                          </span>
                        )}
                      </div>
                      {multipleDays && (
                        <p className="text-xs leading-5 text-muted-foreground">
                          {item.dateKey < date
                            ? `${t("Fra")} ${formatCalendarDate(item.startsAt, false, locale)} · `
                            : ""}
                          {`${t("Til")} ${formatCalendarDate(item.endsAt!, false, locale)}`}
                        </p>
                      )}
                      {places.length > 0 && (
                        <p
                          translate="no"
                          className="notranslate text-xs leading-5 text-muted-foreground sm:hidden"
                        >
                          {places.join(" · ")}
                        </p>
                      )}
                      {note && note !== item.title && (
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          <ContentLanguage original={item.noteOriginal}>
                            {note}
                          </ContentLanguage>
                        </p>
                      )}
                    </div>
                    <span
                      translate="no"
                      className="notranslate hidden max-w-40 pt-1 text-right text-sm leading-6 text-muted-foreground sm:block"
                    >
                      {places.join(" · ")}
                    </span>
                    <span
                      aria-hidden
                      className="pt-1 text-muted-foreground/60 group-hover:text-primary"
                    >
                      ›
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
