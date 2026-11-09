"use client";

import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { cameBackRecently } from "./navigation-history";
import { useTranslations } from "@/i18n/client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { calendarDayGroups, type CalendarListItem } from "@/lib/calendar";
import AgendaList from "./agenda-list";
import PlaceFilter, { STICKY_TOOLBAR } from "./place-filter";
import { placeFilterLabel, type PlaceFilterValue } from "@/lib/mass-times";
function monthLabel(key: string, locale: "nb" | "en") {
  const label = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "nb-NO", {
    timeZone: "Europe/Oslo",
    month: "long",
    year: "numeric",
  }).format(new Date(`${key}-15T12:00:00Z`));
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}
function topOffset(toolbar: HTMLElement | null) {
  return (
    (document.querySelector("header")?.getBoundingClientRect().height ?? 76) +
    (toolbar?.offsetHeight ?? 120) +
    20
  );
}
function scrollTo(
  element: HTMLElement | null,
  toolbar: HTMLElement | null,
  offset = 0,
) {
  if (element)
    window.scrollTo({
      top:
        window.scrollY +
        element.getBoundingClientRect().top -
        topOffset(toolbar) -
        offset,
      behavior: "instant",
    });
}
function goToDate(
  root: HTMLElement | null,
  toolbar: HTMLElement | null,
  date: string,
  offset = 0,
) {
  const days = [
    ...(root?.querySelectorAll<HTMLElement>("[data-agenda-date]") ?? []),
  ];
  const target = days.find(
    (day) =>
      day.dataset.agendaDate! >= date &&
      day.dataset.agendaDate!.slice(0, 7) === date.slice(0, 7),
  );
  scrollTo(
    target ?? document.getElementById(`month-${date.slice(0, 7)}`),
    toolbar,
    offset,
  );
}

export default function CalendarExplorer({
  items,
  today,
  startDate,
  place,
  onPlaceChange,
}: {
  items: CalendarListItem[];
  today: string;
  startDate: string;
  place: PlaceFilterValue;
  onPlaceChange: (value: PlaceFilterValue) => void;
}) {
  const { locale, t } = useTranslations();
  const [activeMonth, setActiveMonth] = useState(today.slice(0, 7));
  const [extraMonth, setExtraMonth] = useState<string | null>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const pendingAnchor = useRef<{ date: string; offset: number } | null>(null);
  const pendingMonth = useRef<string | null>(null);
  const navigationPosition = useRef<{ month: string; top: number } | null>(
    null,
  );
  const filtered = useMemo(
    () =>
      items.filter(
        (item) => place === "all" || item.regionKeys.includes(place),
      ),
    [items, place],
  );
  const months = useMemo(
    () => [
      ...new Set(
        calendarDayGroups(items, startDate).map(([date]) => date.slice(0, 7)),
      ),
    ],
    [items, startDate],
  );
  const grouped = useMemo(() => {
    const groups = new Map<string, CalendarListItem[]>();
    for (const item of filtered) {
      const key = (item.dateKey < startDate ? startDate : item.dateKey).slice(
        0,
        7,
      );
      const group = groups.get(key) ?? [];
      group.push(item);
      groups.set(key, group);
    }
    return groups;
  }, [filtered, startDate]);
  const monthOptions = months.map((value) => ({
    value,
    label: monthLabel(value, locale),
  }));
  const visibleMonths = useMemo(
    () =>
      months.filter(
        (key) =>
          grouped.has(key) || key === extraMonth || key === today.slice(0, 7),
      ),
    [months, grouped, extraMonth, today],
  );

  useLayoutEffect(() => {
    // Anchor once, after Next's route positioning. Never rerun on a filter change.
    // Coming back from a detail page keeps the position the visitor left.
    if (cameBackRecently()) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        goToDate(root.current, toolbar.current, today);
        navigationPosition.current = {
          month: today.slice(0, 7),
          top: window.scrollY,
        };
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [today]);

  useLayoutEffect(() => {
    if (pendingAnchor.current) {
      goToDate(
        root.current,
        toolbar.current,
        pendingAnchor.current.date,
        pendingAnchor.current.offset,
      );
      navigationPosition.current = {
        month: pendingAnchor.current.date.slice(0, 7),
        top: window.scrollY,
      };
      pendingAnchor.current = null;
    }
  }, [place]);

  useLayoutEffect(() => {
    if (pendingMonth.current) {
      scrollTo(
        document.getElementById(`month-${pendingMonth.current}`),
        toolbar.current,
      );
      navigationPosition.current = {
        month: pendingMonth.current,
        top: window.scrollY,
      };
      pendingMonth.current = null;
    }
  }, [extraMonth]);

  useEffect(() => {
    let frame = 0;
    function update() {
      // Near the bottom, the browser cannot align a short month to the top.
      // Keep the explicitly selected month until the visitor scrolls again.
      if (
        navigationPosition.current &&
        Math.abs(window.scrollY - navigationPosition.current.top) < 1
      ) {
        setActiveMonth(navigationPosition.current.month);
        return;
      }
      navigationPosition.current = null;
      const marker = topOffset(toolbar.current) + 40;
      let month = visibleMonths[0] ?? today.slice(0, 7);
      for (const key of visibleMonths) {
        if (
          (document.getElementById(`month-${key}`)?.getBoundingClientRect()
            .top ?? Infinity) > marker
        )
          break;
        month = key;
      }
      setActiveMonth(month);
    }
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [visibleMonths, today]);

  function changePlace(value: PlaceFilterValue) {
    if (value === place) return;
    const marker = topOffset(toolbar.current);
    const days = [
      ...(root.current?.querySelectorAll<HTMLElement>("[data-agenda-date]") ??
        []),
    ];
    const visible = days.find(
      (day) =>
        day.dataset.agendaDate!.slice(0, 7) === activeMonth &&
        day.getBoundingClientRect().bottom > marker,
    );
    pendingAnchor.current = {
      date: visible?.dataset.agendaDate ?? `${activeMonth}-01`,
      offset: visible ? visible.getBoundingClientRect().top - marker : 0,
    };
    setExtraMonth(pendingAnchor.current.date.slice(0, 7));
    onPlaceChange(value);
  }

  function changeMonth(value: string) {
    setActiveMonth(value);
    if (value === extraMonth) {
      scrollTo(document.getElementById(`month-${value}`), toolbar.current);
      navigationPosition.current = { month: value, top: window.scrollY };
      return;
    }
    pendingMonth.current = value;
    setExtraMonth(value);
  }

  return (
    <div ref={root}>
      <div ref={toolbar} className={STICKY_TOOLBAR}>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <PlaceFilter value={place} onChange={changePlace} />
          <div className="flex w-full items-center gap-2 border-t border-border pt-3 sm:w-auto sm:border-0 sm:pt-0">
            <div className="min-w-0 flex-1 sm:w-48">
              <Select
                items={monthOptions}
                modal={false}
                disabled={!months.length}
                value={
                  months.includes(activeMonth)
                    ? activeMonth
                    : (months[0] ?? null)
                }
                onValueChange={(value) => {
                  if (value) changeMonth(value);
                }}
              >
                <SelectTrigger aria-label={t("Velg måned")} className="w-full">
                  <SelectValue placeholder={t("Velg måned")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {monthOptions.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                goToDate(root.current, toolbar.current, today);
                navigationPosition.current = {
                  month: today.slice(0, 7),
                  top: window.scrollY,
                };
                setActiveMonth(today.slice(0, 7));
              }}
            >
              {t("I dag")}
            </Button>
          </div>
        </div>
      </div>
      <p className="sr-only" role="status">
        {filtered.length} {t("messer og arrangementer for")}{" "}
        {t(placeFilterLabel(place)).toLowerCase()}.
      </p>
      <div className="space-y-10 py-6">
        {visibleMonths.map((key) => (
          <section key={key} id={`month-${key}`}>
            <h2 className="mb-6 font-display text-3xl font-semibold capitalize text-foreground">
              {monthLabel(key, locale)}
            </h2>
            {grouped.get(key)?.length ? (
              <AgendaList
                items={grouped.get(key)!}
                today={today}
                from={startDate}
              />
            ) : (
              <p className="border-b border-border pb-6 text-sm text-muted-foreground">
                {t("Ingen oppføringer for dette stedet denne måneden.")}
              </p>
            )}
          </section>
        ))}
        {!months.length && (
          <p className="py-10 text-muted-foreground">
            {t("Ingen messer eller arrangementer i perioden.")}
          </p>
        )}
      </div>
    </div>
  );
}
