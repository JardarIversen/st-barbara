"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import Link from "@/i18n/link";
import type { CalendarListItem } from "@/lib/calendar";
import { placeQuery, type PlaceFilterValue } from "@/lib/mass-times";
import CalendarExplorer from "./calendar-explorer";

/** The full calendar page: every day, past months included. The chosen place follows the visitor back. */
export default function FullCalendar({
  items,
  today,
  startDate,
  initialPlace,
}: {
  items: CalendarListItem[];
  today: string;
  startDate: string;
  initialPlace: PlaceFilterValue;
}) {
  const { t } = useTranslations();
  const [place, setPlace] = useState<PlaceFilterValue>(initialPlace);

  function changePlace(next: PlaceFilterValue) {
    setPlace(next);
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${placeQuery(next)}`,
    );
  }

  return (
    <>
      <Link
        href={`/messetider${placeQuery(place)}`}
        className="text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        ← {t("Messetider og arrangementer")}
      </Link>
      <h1 className="mt-6 font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
        {t("Kalender")}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        {t(
          "Alle messer og arrangementer, dag for dag, også tidligere måneder.",
        )}
      </p>
      <div className="mt-7">
        <CalendarExplorer
          items={items}
          today={today}
          startDate={startDate}
          place={place}
          onPlaceChange={changePlace}
        />
      </div>
    </>
  );
}
