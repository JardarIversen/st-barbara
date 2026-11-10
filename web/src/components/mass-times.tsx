"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import Link from "@/i18n/link";
import { cn } from "@/lib/utils";
import {
  PARISH_REGIONS,
  addDays,
  calendarPlaceLabel,
  calendarTitle,
  comingSunday,
  formatCalendarTime,
  formatDayMonthRange,
  formatShortDate,
  isCalendarChange,
  todayInOslo,
  type CalendarListItem,
  type ScheduleOccurrence,
  type ScheduleOverviewGroup,
  type ScheduleOverviewRow,
} from "@/lib/calendar";
import AgendaList, { LanguageBadge, StatusBadge } from "./agenda-list";
import ContentLanguage from "./content-language";
import { cameBackRecently } from "./navigation-history";
import PlaceFilter, { STICKY_TOOLBAR } from "./place-filter";
import { buttonVariants } from "./ui/button";
import {
  placeFilterLabel,
  placeQuery,
  type MassTimesView,
  type PlaceFilterValue,
} from "@/lib/mass-times";

/** «Senere» lists what differs from the regular schedule this far ahead. */
const LATER_DAYS = 56;
/** Changes this close get a box of their own; later ones wait in «Senere». */
const URGENT_CHANGE_DAYS = 14;

function upcomingFrom(items: CalendarListItem[], now: Date) {
  return items.filter((item) => new Date(item.endsAt ?? item.startsAt) >= now);
}

function isNextMass(item: CalendarListItem) {
  return item.eventType === "mass" && item.status === "scheduled";
}

/**
 * One page, one control: the place. Everything else is read top to bottom —
 * the next Mass, this week, what is special later, and the regular schedule.
 * The full calendar is its own page, for browsing every day and the past.
 */
export default function MassTimes({
  items,
  today,
  now,
  overview,
  initialView,
  initialPlace,
}: {
  items: CalendarListItem[];
  today: string;
  now: string;
  overview: ScheduleOverviewGroup[];
  initialView: MassTimesView;
  initialPlace: PlaceFilterValue;
}) {
  const { t } = useTranslations();
  const [place, setPlace] = useState<PlaceFilterValue>(initialPlace);
  const nowDate = useMemo(() => new Date(now), [now]);
  const placeItems = useMemo(
    () =>
      upcomingFrom(items, nowDate).filter(
        (item) => place === "all" || item.regionKeys.includes(place),
      ),
    [items, nowDate, place],
  );
  const placeLabel = place === "all" ? undefined : placeFilterLabel(place);

  useEffect(() => {
    if (initialView === "fast" && !cameBackRecently())
      document.getElementById("faste-messetider")?.scrollIntoView();
  }, [initialView]);

  const calendarHref = `/messetider/kalender${placeQuery(place)}`;

  function syncUrl(nextPlace: PlaceFilterValue) {
    const params = new URLSearchParams(window.location.search);
    params.delete("visning");
    if (nextPlace === "all") params.delete("sted");
    else params.set("sted", nextPlace);
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }

  function changePlace(next: PlaceFilterValue) {
    setPlace(next);
    syncUrl(next);
  }

  return (
    <div>
      <div className={cn(STICKY_TOOLBAR, "flex items-center gap-3")}>
        <PlaceFilter
          value={place}
          onChange={changePlace}
          className="min-w-0 flex-1"
        />
        <Link
          href={calendarHref}
          className={cn(
            buttonVariants({ variant: "link", size: "sm" }),
            "shrink-0 max-sm:hidden",
          )}
        >
          {t("Hele kalenderen")} <span aria-hidden>→</span>
        </Link>
      </div>
      <NextMasses items={placeItems} today={today} place={place} />
      <ThisWeek items={placeItems} today={today} place={placeLabel} />
      <Later
        items={placeItems}
        today={today}
        place={placeLabel}
        calendarHref={calendarHref}
      />
      <section
        id="faste-messetider"
        aria-labelledby="faste-messetider-heading"
        className="mt-16 scroll-mt-36"
      >
        <SectionHeading id="faste-messetider-heading">
          {t("Faste messetider")}
        </SectionHeading>
        <PlanView
          groups={overview.filter(
            (group) => place === "all" || group.key === place,
          )}
        />
      </section>
      <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          {t("Hele kalenderen viser alle dager, også tidligere måneder.")}
        </p>
        <Link
          href={calendarHref}
          className={buttonVariants({ variant: "outline" })}
        >
          {t("Hele kalenderen")}
        </Link>
      </div>
    </div>
  );
}

function SectionHeading({
  id,
  aside,
  children,
}: {
  id: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2
        id={id}
        className="font-display text-3xl font-semibold text-foreground"
      >
        {children}
      </h2>
      {aside && <p className="text-sm text-muted-foreground">{aside}</p>}
    </div>
  );
}

function useRelativeDay(today: string) {
  const { locale, t } = useTranslations();
  return (iso: string) => {
    const date = todayInOslo(new Date(iso));
    if (date === today) return t("I dag");
    if (date === addDays(today, 1)) return t("I morgen");
    return formatShortDate(iso, locale);
  };
}

/** The most visible answer on the page: when is the next Mass I can go to? */
function NextMasses({
  items,
  today,
  place,
}: {
  items: CalendarListItem[];
  today: string;
  place: PlaceFilterValue;
}) {
  const { t } = useTranslations();
  const masses = items.filter(isNextMass);
  const cards =
    place === "all"
      ? PARISH_REGIONS.map((region) => ({
          region,
          item: masses.find((item) => item.regionKeys.includes(region)),
        }))
      : masses.slice(0, 3).map((item) => ({ region: place, item }));

  return (
    <section aria-labelledby="next-mass" className="mt-7">
      <h2
        id="next-mass"
        className="mb-3 text-sm font-semibold text-primary"
      >
        {place === "all" ? t("Neste messe") : t("Neste messer")}
      </h2>
      {cards.length ? (
        <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {cards.map(({ region, item }, index) => (
            <li
              key={item?.id ?? `${region}-${index}`}
              className={cn(index === 2 && place !== "all" && "max-lg:hidden")}
            >
              <NextMassCard
                item={item}
                label={place === "all" ? region : undefined}
                today={today}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("Ingen messer er satt opp her ennå.")}
        </p>
      )}
    </section>
  );
}

/** «Messe» or «Messe på Rjukan» says nothing the card does not already show. */
function distinctiveTitle(title: string) {
  const normalized = title.toLocaleLowerCase("nb-NO").trim();
  if (
    ["messe", "holy mass", "mass"].includes(normalized) ||
    /^(messe|holy mass|mass) (på|i|in|at) /.test(normalized)
  )
    return undefined;
  return title.replace(/^(messe|holy mass|mass)\s+[–-]\s+/i, "");
}

function NextMassCard({
  item,
  label,
  today,
}: {
  item?: CalendarListItem;
  label?: string;
  today: string;
}) {
  const { locale, t } = useTranslations();
  const relativeDay = useRelativeDay(today);
  const placeName = label ? placeFilterLabel(label) : undefined;
  const placeLabel = placeName && (
    <span
      translate="no"
      className="notranslate text-sm font-semibold text-foreground"
    >
      {placeName}
    </span>
  );
  if (!item)
    return (
      <div className="flex h-full flex-col gap-1 rounded-sm border border-dashed border-border p-3 sm:p-4">
        {placeLabel}
        <span className="text-sm text-muted-foreground">
          {t("Ingen messe satt opp de neste ukene.")}
        </span>
      </div>
    );
  const title = distinctiveTitle(calendarTitle(item));
  const showLanguage =
    item.language && (item.language !== "nb" || locale === "en");
  return (
    <Link
      href={item.href}
      className="focus-ring group flex h-full flex-col gap-1 rounded-sm border border-border bg-muted/50 p-3 transition-colors hover:border-primary/40 hover:bg-muted sm:p-4"
    >
      {placeLabel}
      <time
        dateTime={item.startsAt}
        className="font-display text-2xl font-semibold leading-tight lining-nums text-primary sm:text-[1.7rem]"
      >
        <span className="block">{relativeDay(item.startsAt)}</span>
        <span className="block whitespace-nowrap tabular-nums">
          {t("kl.")} {formatCalendarTime(item.startsAt, locale)}
        </span>
      </time>
      {(title || showLanguage || item.changeLabel) && (
        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-sm leading-snug text-muted-foreground group-hover:text-foreground">
          {title && (
            <ContentLanguage original={item.titleOriginal}>
              {title}
            </ContentLanguage>
          )}
          {showLanguage && <LanguageBadge language={item.language!} />}
          <ChangeBadge item={item} />
        </span>
      )}
    </Link>
  );
}

/** Cancelled, postponed and moved entries: the information that must never be missed. */
export function CalendarChanges({
  items,
  today,
  hideWhenEmpty = false,
  className,
}: {
  items: CalendarListItem[];
  today: string;
  hideWhenEmpty?: boolean;
  className?: string;
}) {
  const { locale, t } = useTranslations();
  const relativeDay = useRelativeDay(today);
  const changes = items;
  if (!changes.length)
    return hideWhenEmpty ? null : (
      <p
        className={cn(
          className,
          "flex items-center gap-2 text-sm text-muted-foreground",
        )}
      >
        <CheckIcon aria-hidden className="size-4 shrink-0 text-primary" />
        {t("Ingen avlysninger eller endringer de neste ukene.")}
      </p>
    );
  return (
    <section
      aria-labelledby="changes"
      className={cn(
        className,
        "rounded-sm border border-primary/20 bg-primary/5 p-4 sm:p-5",
      )}
    >
      <h2 id="changes" className="text-sm font-semibold text-foreground">
        {t("Endringer de neste ukene")}
      </h2>
      <ul className="mt-3 divide-y divide-primary/10">
        {changes.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="focus-ring group -mx-2 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 rounded-sm px-2 py-2.5 text-sm hover:bg-primary/5 sm:grid-cols-[9rem_minmax(0,1fr)]"
            >
              <span className="flex flex-col tabular-nums text-muted-foreground sm:flex-row sm:gap-1">
                <span>{relativeDay(item.startsAt)}</span>
                <span>
                  <span aria-hidden className="max-sm:hidden">
                    ·{" "}
                  </span>
                  {formatCalendarTime(item.startsAt, locale)}
                </span>
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "font-medium group-hover:text-primary",
                      item.status === "cancelled"
                        ? "text-muted-foreground line-through decoration-1"
                        : "text-foreground",
                    )}
                  >
                    <ContentLanguage original={item.titleOriginal}>
                      {calendarTitle(item)}
                    </ContentLanguage>
                  </span>
                  {item.places[0] && (
                    <span
                      translate="no"
                      className="notranslate text-muted-foreground"
                    >
                      {calendarPlaceLabel(item.places[0])}
                    </span>
                  )}
                  <ChangeBadge item={item} />
                </span>
                {item.publicNote && (
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    <ContentLanguage original={item.noteOriginal}>
                      {item.publicNote}
                    </ContentLanguage>
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Everything until the coming Sunday, with what has changed raised above it. */
function ThisWeek({
  items,
  today,
  place,
}: {
  items: CalendarListItem[];
  today: string;
  place?: string;
}) {
  const { locale, t } = useTranslations();
  const end = comingSunday(today);
  const week = items.filter((item) => item.dateKey <= end);
  const changes = items.filter(
    (item) =>
      item.dateKey <= addDays(today, URGENT_CHANGE_DAYS) &&
      isCalendarChange(item),
  );
  return (
    <section aria-labelledby="this-week" className="mt-10">
      <CalendarChanges
        items={changes}
        today={today}
        hideWhenEmpty
        className="mb-10"
      />
      <SectionHeading
        id="this-week"
        aside={formatDayMonthRange(today, end, locale)}
      >
        {t("Denne uken")}
      </SectionHeading>
      {week.length ? (
        <AgendaList
          items={week}
          today={today}
          from={today}
          place={place}
          compact
        />
      ) : (
        <p className="border-t border-border pt-4 text-sm text-muted-foreground">
          {t("Ingen messer eller arrangementer denne uken.")}
        </p>
      )}
    </section>
  );
}

/** After this week, only what the regular schedule does not already say. */
function Later({
  items,
  today,
  place,
  calendarHref,
}: {
  items: CalendarListItem[];
  today: string;
  place?: string;
  calendarHref: string;
}) {
  const { t } = useTranslations();
  const from = addDays(comingSunday(today), 1);
  const until = addDays(today, LATER_DAYS);
  const special = items.filter(
    (item) => item.dateKey >= from && item.dateKey <= until && !item.routine,
  );
  return (
    <section aria-labelledby="later" className="mt-16">
      <SectionHeading
        id="later"
        aside={t("Arrangementer, høytider og endringer")}
      >
        {t("Senere")}
      </SectionHeading>
      <p className="-mt-2 mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {t(
          "Alle arrangementer og alt som avviker fra de faste messetidene, de neste åtte ukene. Vanlige messer står ikke her, men i hele kalenderen.",
        )}
      </p>
      {special.length ? (
        <AgendaList items={special} today={today} place={place} compact />
      ) : (
        <p className="border-t border-border pt-4 text-sm text-muted-foreground">
          {t("Ikke noe spesielt de neste ukene. Messene går som vanlig.")}
        </p>
      )}
      <Link
        href={calendarHref}
        className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
      >
        {t("Se alle messer og arrangementer i kalenderen")}{" "}
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}

function ChangeBadge({
  item,
}: {
  item: Pick<CalendarListItem, "status" | "changeLabel">;
}) {
  const { t } = useTranslations();
  if (item.status === "cancelled")
    return <StatusBadge tone="alert">{t("Avlyst")}</StatusBadge>;
  if (item.status === "postponed")
    return <StatusBadge tone="alert">{t("Utsatt")}</StatusBadge>;
  if (item.changeLabel) return <StatusBadge>{t(item.changeLabel)}</StatusBadge>;
  return null;
}

/** The regular pattern, so nobody has to work out «the Saturday before the third Sunday». */
function PlanView({ groups }: { groups: ScheduleOverviewGroup[] }) {
  const { locale, t } = useTranslations();
  return (
    <div className="space-y-10">
      {groups.map((group) => {
        const address = [group.place?.streetAddress, group.place?.locality]
          .filter(Boolean)
          .join(", ");
        return (
          <section key={group.key} aria-labelledby={`plan-${group.key}`}>
            <div className="border-b border-border pb-3">
              <h3
                id={`plan-${group.key}`}
                translate="no"
                className="notranslate font-display text-2xl font-semibold text-foreground"
              >
                {group.label}
              </h3>
              {group.place && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  <span translate="no" className="notranslate">
                    {group.place.name}
                    {address && `, ${address}`}
                  </span>
                  {group.place.mapUrl && (
                    <>
                      {" · "}
                      <a
                        href={group.place.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {t("Vis kart")}
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
            {group.rows.length ? (
              <PlanDays rows={group.rows} />
            ) : (
              <p className="pt-4 text-sm text-muted-foreground">
                {t("Ingen fast messeplan for tiden.")}{" "}
                {group.nextMass && (
                  <>
                    {t("Neste messe:")}{" "}
                    <Link
                      href={group.nextMass.href}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {formatShortDate(group.nextMass.startsAt, locale)}{" "}
                      {t("kl.")}{" "}
                      {formatCalendarTime(group.nextMass.startsAt, locale)}
                    </Link>
                  </>
                )}
              </p>
            )}
          </section>
        );
      })}

      <p className="rounded-sm bg-muted p-5 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">
          {t("Presten er også tilgjengelig for skriftemål før messene.")}
        </span>{" "}
        {t(
          "Høytider, ekstra messer og endringer kunngjøres i søndagsbladet og står under «Senere».",
        )}
      </p>
    </div>
  );
}

/** One line per weekday, Sunday first, so «when is Mass on Saturday?» is answered in one place. */
function PlanDays({ rows }: { rows: ScheduleOverviewRow[] }) {
  const days = new Map<string, ScheduleOverviewRow[]>();
  for (const row of rows)
    days.set(row.weekday, [...(days.get(row.weekday) ?? []), row]);
  return (
    <ul className="divide-y divide-border/60">
      {[...days.entries()].map(([weekday, dayRows]) => (
        <li
          key={weekday}
          className="grid gap-y-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-4"
        >
          <span className="font-medium leading-7 text-foreground">
            {weekday}
          </span>
          <ul className="space-y-2">
            {dayRows.map((row) => (
              <PlanRow key={row.id} row={row} />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** «tor. 24. des. avlyst»: the exception in words, with the detail one click away. */
function exceptionText(
  change: ScheduleOccurrence,
  locale: "nb" | "en",
  t: (value: string) => string,
) {
  if (change.status === "cancelled") return t("avlyst");
  const parts: string[] = [];
  if (change.changeLabel?.includes("tid"))
    parts.push(`${t("kl.")} ${formatCalendarTime(change.startsAt, locale)}`);
  if (change.changeLabel?.includes("sted")) parts.push(t("annet sted"));
  return parts.join(", ") || t("endret");
}

function PlanRow({ row }: { row: ScheduleOverviewRow }) {
  const { locale, t } = useTranslations();
  const showLanguage = row.language !== "nb" || locale === "en";
  return (
    <li className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-x-4">
      <span className="text-lg font-semibold leading-7 tabular-nums text-primary">
        {row.time}
      </span>
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 py-0.5 text-sm leading-6 text-muted-foreground">
        {!row.weekly && <span className="text-foreground">{row.rule}</span>}
        {showLanguage && <LanguageBadge language={row.language} />}
        {row.notes && <span>{row.notes}</span>}
      </span>
      <span className="col-start-2 text-sm leading-6 sm:col-start-auto sm:py-0.5 sm:text-right">
        {!row.weekly && row.next && <NextLink occurrence={row.next} />}
      </span>
      {row.changes.length > 0 && (
        <p className="col-[2/-1] text-sm leading-6 text-muted-foreground">
          {t("Unntak:")}{" "}
          {row.changes.map((change, index) => (
            <span key={change.href}>
              {index > 0 && ", "}
              <Link
                href={change.href}
                className="underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary"
              >
                {formatShortDate(change.startsAt, locale)}{" "}
                {exceptionText(change, locale, t)}
              </Link>
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

function NextLink({ occurrence }: { occurrence: ScheduleOccurrence }) {
  const { locale, t } = useTranslations();
  return (
    <Link
      href={occurrence.href}
      className="whitespace-nowrap text-primary underline-offset-4 hover:underline"
    >
      <span className="text-muted-foreground">{t("Neste:")}</span>{" "}
      {formatShortDate(occurrence.startsAt, locale)}
      {occurrence.changeLabel && ` · ${t(occurrence.changeLabel)}`}
    </Link>
  );
}
