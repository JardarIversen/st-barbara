"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarListItem } from "@/lib/calendar";
import { placeFilterKey } from "@/lib/calendar";
import TimelineList from "./timeline-list";

const FILTERS = [
  ["all", "Alle steder"],
  ["kongsberg", "Kongsberg"],
  ["notodden", "Notodden"],
  ["rjukan", "Rjukan"],
  ["mo", "Mo"],
] as const;

const monthFormatter = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  month: "long",
  year: "numeric",
});

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function monthLabel(key: string) {
  return monthFormatter.format(new Date(`${key}-15T12:00:00Z`));
}

export default function CalendarExplorer({
  items,
  today,
}: {
  items: CalendarListItem[];
  today: string;
}) {
  const [place, setPlace] = useState("all");
  const filtered = useMemo(
    () =>
      place === "all"
        ? items
        : items.filter((item) => item.places.some((value) => placeFilterKey(value) === place)),
    [items, place],
  );
  const months = useMemo(() => {
    const groups = new Map<string, CalendarListItem[]>();
    for (const item of filtered) {
      const key = monthKey(item.startsAt);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return [...groups.entries()];
  }, [filtered]);
  const anchorItemId = filtered.find((item) => item.dateKey >= today)?.id ?? filtered.at(-1)?.id;
  const [activeMonth, setActiveMonth] = useState("");
  const displayedMonth = months.some(([key]) => key === activeMonth)
    ? activeMonth
    : (months[0]?.[0] ?? "");

  useEffect(() => {
    let frame = 0;

    function updateActiveMonth() {
      const marker = Math.min(220, window.innerHeight * 0.25);
      let nextMonth = months[0]?.[0] ?? "";

      for (const [key] of months) {
        const element = document.getElementById(`month-${key}`);
        if (!element || element.getBoundingClientRect().top > marker) break;
        nextMonth = key;
      }

      setActiveMonth(nextMonth);
    }

    function handleScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateActiveMonth();
      });
    }

    updateActiveMonth();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [months]);

  useEffect(() => {
    if (!anchorItemId) return;
    requestAnimationFrame(() => {
      document.getElementById(`calendar-item-${anchorItemId}`)?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    });
  }, [anchorItemId]);

  function goToMonth(key: string) {
    document.getElementById(`month-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="sticky top-[4.7rem] z-30 -mx-5 border-y border-line bg-paper/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
          {FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPlace(value)}
              aria-pressed={place === value}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                place === value
                  ? "border-burgundy bg-burgundy text-paper"
                  : "border-line bg-paper text-ink hover:border-gold"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {months.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-[8.5rem_minmax(0,1fr)] lg:grid-cols-[10rem_minmax(0,1fr)]">
          <aside className="sticky top-36 hidden h-[65vh] self-start md:block" aria-label="Spol i tid">
            <div className="absolute bottom-1 left-4 top-1 w-px bg-line" aria-hidden />
            <ol className="flex h-full flex-col justify-between">
              {months.map(([key]) => (
                <li key={key} className="relative">
                  <button
                    type="button"
                    onClick={() => goToMonth(key)}
                    className={`group flex w-full items-center gap-3 text-left text-xs capitalize transition ${
                      displayedMonth === key ? "font-semibold text-burgundy" : "text-stone hover:text-ink"
                    }`}
                  >
                    <span
                      className={`relative z-10 block h-px bg-current transition-all ${displayedMonth === key ? "w-8" : "w-4 group-hover:w-6"}`}
                    />
                    <span>{monthLabel(key)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <div>
            <label className="mb-7 block md:hidden">
              <span className="sr-only">Spol til måned</span>
              <select
                value={displayedMonth}
                onChange={(event) => goToMonth(event.target.value)}
                className="w-full rounded-sm border border-line bg-paper px-4 py-3 text-sm text-ink"
              >
                {months.map(([key]) => (
                  <option key={key} value={key}>{monthLabel(key)}</option>
                ))}
              </select>
            </label>
            <div className="space-y-10">
              {months.map(([key, monthItems]) => (
                <section key={key} id={`month-${key}`} className="scroll-mt-40">
                  <h2 className="mb-4 border-b border-line pb-2 font-display text-2xl font-semibold capitalize text-ink">
                    {monthLabel(key)}
                  </h2>
                  <TimelineList items={monthItems} anchorItemId={anchorItemId} />
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="py-16 text-center text-stone">Ingen messer eller hendelser for dette stedet i perioden.</p>
      )}
    </div>
  );
}
