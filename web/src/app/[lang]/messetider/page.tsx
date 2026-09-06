import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import CalendarExplorer from "@/components/calendar-explorer";
import {
  addDays,
  buildCalendarItems,
  calendarHistoryStart,
  toCalendarListItems,
  todayInOslo,
} from "@/lib/calendar";
import { getCalendarData } from "@/sanity/data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Messetider og arrangementer"),
    description: t(
      "Oppdatert kalender for St. Barbara menighet i Kongsberg, Notodden, Rjukan og Mo.",
    ),
  };
}

const OUTLOOK_HTML =
  "https://outlook.office365.com/owa/calendar/d53e47e29da744b1925504238b6848d5@katolsk.no/cf733c95055f4a20b759f774b07ac78f11540496787710115790/calendar.html";
const OUTLOOK_ICS =
  "https://outlook.office365.com/owa/calendar/d53e47e29da744b1925504238b6848d5@katolsk.no/cf733c95055f4a20b759f774b07ac78f11540496787710115790/calendar.ics";

export default async function MessetiderPage() {
  const { t } = await getTranslations();
  await connection();
  const today = todayInOslo();
  const startDate = calendarHistoryStart(today);
  const endDate = addDays(today, 365);
  const data = await getCalendarData(startDate, endDate);
  const items = toCalendarListItems(
    buildCalendarItems(data, startDate, endDate),
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:py-12">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
        {t("Velkommen til fellesskapet")}
      </p>
      <h1 className="font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
        {t("Messetider og arrangementer")}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        {" "}
        {t("Finn din neste messe, eller se hva som skjer i menigheten.")}{" "}
      </p>
      <div className="mt-7">
        <CalendarExplorer items={items} today={today} startDate={startDate} />
      </div>

      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <h2 className="text-sm font-medium text-foreground">
          {t("Menighetens Outlook-kalender")}
        </h2>
        <div className="flex flex-wrap gap-5 text-sm font-medium">
          <a
            href={OUTLOOK_HTML}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("Åpne kalender ↗")}
          </a>
          <a
            href={OUTLOOK_ICS}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("Abonner på kalenderen ↗")}
          </a>
        </div>
      </section>
    </div>
  );
}
