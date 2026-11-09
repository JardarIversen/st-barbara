import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations } from "@/i18n/server";
import FullCalendar from "@/components/full-calendar";
import { isPlaceFilter } from "@/lib/mass-times";
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
    title: t("Kalender"),
    description: t(
      "Alle messer og arrangementer i St. Barbara menighet, dag for dag.",
    ),
  };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ sted?: string | string[] }>;
}) {
  const query = await searchParams;
  await connection();
  const today = todayInOslo(new Date());
  const startDate = calendarHistoryStart(today);
  const endDate = addDays(today, 365);
  const data = await getCalendarData(startDate, endDate);
  const items = toCalendarListItems(
    buildCalendarItems(data, startDate, endDate),
  );
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:py-12">
      <FullCalendar
        items={items}
        today={today}
        startDate={startDate}
        initialPlace={isPlaceFilter(query.sted) ? query.sted : "all"}
      />
    </div>
  );
}
