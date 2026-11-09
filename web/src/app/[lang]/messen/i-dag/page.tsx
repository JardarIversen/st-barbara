import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "@/i18n/link";
import { getTranslations } from "@/i18n/server";
import LiturgyBar from "@/components/liturgy-bar";
import { LiturgyView, MassSettings } from "@/components/liturgy-view";
import OrderOfMass, {
  type OrderOfMassReadings,
} from "@/components/order-of-mass";
import PostureLegend from "@/components/posture-legend";
import {
  LANGUAGE_LABELS,
  addDays,
  buildCalendarItems,
  formatCalendarDate,
  formatCalendarTime,
  todayInOslo,
  type CalendarItem,
} from "@/lib/calendar";
import {
  READINGS_SCHEDULE_KEY,
  chooseTodaysMass,
  defaultMode,
  defaultPrayer,
  eucharisticPrayer,
  liturgicalSeason,
  liturgyLanguage,
  massMode,
  readingCandidates,
  splitReadings,
} from "@/lib/order-of-mass";
import { getCalendarData, getMassText } from "@/sanity/data";

// The QR code in the parish booklet points here: kongsberg.katolsk.no/messen/i-dag
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Dagens messe"),
    description: t(
      "Messens ordning med dagens lesninger, for messen i St. Barbara kirke.",
    ),
    // The page changes every day; /messen is the one to find in search.
    robots: { index: false, follow: true },
  };
}

async function findReadings(mass: CalendarItem, items: CalendarItem[]) {
  for (const candidate of readingCandidates(mass, items)) {
    const text = await getMassText(
      candidate.occurrenceDate!,
      candidate.scheduleId!,
    );
    if (text?.body?.length) return { text, from: candidate };
  }
  return null;
}

export default async function TodaysMassPage({
  searchParams,
}: {
  searchParams: Promise<{
    liturgi?: string | string[];
    modus?: string | string[];
    eb?: string | string[];
    forklaringer?: string;
    tid?: string;
  }>;
}) {
  const { locale, t } = await getTranslations();
  await connection();
  const query = await searchParams;
  // In development, ?tid=2026-11-08T10:30:00%2B01:00 shows the page as it looks at that moment.
  const now =
    process.env.NODE_ENV === "development" && query.tid
      ? new Date(query.tid)
      : new Date();
  const today = todayInOslo(now);
  const until = addDays(today, 7);
  const items = buildCalendarItems(
    await getCalendarData(today, until),
    today,
    until,
  );
  const todays = chooseTodaysMass(items, today, now);
  const mass = todays?.mass;
  const found =
    mass && !todays.cancelled ? await findReadings(mass, items) : null;
  const nextSunday = found
    ? undefined
    : items.find(
        (item) =>
          item.scheduleKey === READINGS_SCHEDULE_KEY &&
          item.dateKey > today &&
          item.status === "scheduled",
      );
  const nextSundayText = nextSunday
    ? await getMassText(nextSunday.occurrenceDate!, nextSunday.scheduleId!)
    : null;

  const language =
    liturgyLanguage(query.liturgi) ??
    liturgyLanguage(mass?.language) ??
    locale;
  // Opinionated: a Mass with the newsletter's readings, or any Sunday Mass, is the Sunday Mass.
  const defaultKind = found ? "hoymesse" : defaultMode(mass?.dateKey ?? today);
  const defaults = { mode: defaultKind, prayer: defaultPrayer(defaultKind) };
  const mode = massMode(query.modus) ?? defaults.mode;
  const fromOtherMass = found && found.from !== mass;
  const readings: OrderOfMassReadings | null = found
    ? {
        body: found.text.body,
        parts: splitReadings(found.text.body),
        note:
          fromOtherMass || language === "en" ? (
            <>
              {fromOtherMass
                ? `${t("Lesningene er på norsk, fra messen kl.")} ${formatCalendarTime(found.from.startsAt, locale)}.`
                : t("Lesningene er på norsk.")}
              {language === "en" && (
                <>
                  {" "}
                  <a
                    href="https://universalis.com/mass.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring rounded-sm font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {t("Engelske lesninger hos Universalis ↗")}
                  </a>
                </>
              )}
            </>
          ) : undefined,
      }
    : null;

  const notice = !mass
    ? t("Det er ingen messe i St. Barbara kirke i dag.")
    : todays.cancelled
      ? t("Dagens messe er avlyst.")
      : !found
        ? `${t("Det er ingen lesninger registrert for dagens messe.")} ${t("Lesningene legges ut for søndagsmessen kl. 11.")}`
        : null;
  const details = mass
    ? [
        found ? formatCalendarDate(mass.startsAt, false, locale) : null,
        `${t("Kl. ")}${formatCalendarTime(mass.startsAt, locale)}`,
        mass.place?.name,
        mass.language ? t(LANGUAGE_LABELS[mass.language]) : null,
      ].filter(Boolean)
    : [];

  return (
    <article className="mx-auto max-w-2xl px-5 py-10 lg:py-14">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
        {t("Dagens messe")}
      </p>
      <h1 className="font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
        {found ? (
          <span lang="nb" translate="no" className="notranslate">
            {found.text.title}
          </span>
        ) : (
          formatCalendarDate(now.toISOString(), false, locale)
        )}
      </h1>
      {details.length ? (
        <p
          className={`mt-3 text-lg text-muted-foreground ${todays?.cancelled ? "line-through" : ""}`}
        >
          {details.join(" · ")}
        </p>
      ) : null}

      {notice && (
        <div className="mt-7 rounded-sm border border-border bg-muted p-5">
          <p className="leading-relaxed text-foreground">{notice}</p>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            {nextSunday && nextSundayText && (
              <Link
                href={`${nextSunday.href}#lesninger`}
                className="focus-ring rounded-sm text-primary underline-offset-2 hover:underline"
              >
                {t("Søndagens lesninger →")}
              </Link>
            )}
            <Link
              href="/messetider"
              className="focus-ring rounded-sm text-primary underline-offset-2 hover:underline"
            >
              {t("Messetider →")}
            </Link>
          </p>
        </div>
      )}

      <LiturgyView
        initial={{
          mode,
          prayer: eucharisticPrayer(query.eb, language) ?? defaultPrayer(mode),
          explain: query.forklaringer === "1",
        }}
        defaults={defaults}
        season={liturgicalSeason(today)}
        language={language}
      >
        <MassSettings automatic={t("Valgt ut fra dagens messe. Du kan endre det.")} />
        <PostureLegend />
        <LiturgyBar language={language} path="/messen/i-dag" />
        <div className="mt-10">
          <OrderOfMass language={language} readings={readings} />
        </div>
      </LiturgyView>
    </article>
  );
}
