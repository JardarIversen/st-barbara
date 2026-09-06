import type { Metadata } from "next";
import { connection } from "next/server";
import CalendarExplorer from "@/components/calendar-explorer";
import { addDays, buildCalendarItems, toCalendarListItems, todayInOslo } from "@/lib/calendar";
import { getCalendarData } from "@/sanity/data";

export const metadata: Metadata = {
  title: "Messer og hendelser",
  description: "Oppdatert kalender for St. Barbara menighet i Kongsberg, Notodden, Rjukan og Mo.",
};

const OUTLOOK_HTML = "https://outlook.office365.com/owa/calendar/d53e47e29da744b1925504238b6848d5@katolsk.no/cf733c95055f4a20b759f774b07ac78f11540496787710115790/calendar.html";
const OUTLOOK_ICS = "https://outlook.office365.com/owa/calendar/d53e47e29da744b1925504238b6848d5@katolsk.no/cf733c95055f4a20b759f774b07ac78f11540496787710115790/calendar.ics";

export default async function MessetiderPage() {
  await connection();
  const today = todayInOslo();
  const startDate = addDays(today, -180);
  const endDate = addDays(today, 365);
  const data = await getCalendarData(startDate, endDate);
  const items = toCalendarListItems(buildCalendarItems(data, startDate, endDate));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
      <h1 className="font-display text-5xl font-medium leading-tight text-ink">Messer og hendelser</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone">
        Kalenderen kombinerer den faste messeplanen med endringer og hendelser fra søndagsbladet. Avlysninger vises også, slik at det er lett å oppdage dem.
      </p>
      <div className="mt-8"><CalendarExplorer items={items} today={today} /></div>

      <section className="mt-24 border-t border-line pt-10">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone">Ekstern kalender</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Outlook-kalender</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone">Denne kalenderen holdes separat. Du kan åpne den eller abonnere på den i din egen kalenderapp.</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
              <a href={OUTLOOK_HTML} target="_blank" rel="noopener noreferrer" className="text-burgundy underline-offset-2 hover:underline">Åpne Outlook-kalender</a>
              <a href={OUTLOOK_ICS} className="text-burgundy underline-offset-2 hover:underline">Abonner via ICS</a>
            </div>
          </div>
          <iframe src={OUTLOOK_HTML} title="Forhåndsvisning av menighetens Outlook-kalender" loading="lazy" className="h-72 w-full rounded-sm border border-line bg-white" />
        </div>
      </section>
    </div>
  );
}
