import Link from "next/link";
import type { CalendarListItem } from "@/lib/calendar";
import { formatCalendarDate, formatCalendarTime } from "@/lib/calendar";

export default function TimelineList({
  items,
  compact = false,
  anchorItemId,
}: {
  items: CalendarListItem[];
  compact?: boolean;
  anchorItemId?: string;
}) {
  if (!items.length) {
    return <p className="py-10 text-center text-sm text-stone">Ingen hendelser i denne perioden.</p>;
  }

  return (
    <div className="relative py-1">
      <div className="absolute bottom-0 left-4 top-0 w-px bg-line md:left-1/2" aria-hidden />
      <ol className="space-y-2 md:space-y-0">
        {items.map((item, index) => {
          const cancelled = item.status === "cancelled";
          const right = index % 2 === 1;

          return (
            <li
              key={item.id}
              id={item.id === anchorItemId ? `calendar-item-${item.id}` : undefined}
              className={`relative ml-9 md:ml-0 md:grid md:grid-cols-2 ${
                index > 0 ? (compact ? "md:-mt-7" : "md:-mt-5") : ""
              } ${right ? "" : "md:text-right"}`}
            >
              <span
                aria-hidden
                className="absolute -left-[1.5625rem] top-1/2 z-10 size-2.5 -translate-y-1/2 rounded-full border-2 border-paper bg-burgundy ring-1 ring-burgundy md:left-1/2 md:-translate-x-1/2"
              />
              <span
                aria-hidden
                className={`absolute -left-5 top-1/2 h-px w-5 bg-burgundy/40 md:w-6 ${
                  right ? "md:left-1/2" : "md:left-auto md:right-1/2"
                }`}
              />
              <Link
                href={item.href}
                className={`block rounded-sm border border-line bg-paper transition hover:border-gold hover:bg-cream/60 ${compact ? "p-2.5" : "p-3"} ${
                  right ? "md:col-start-2 md:ml-6" : "md:mr-6"
                } ${cancelled ? "opacity-70" : ""}`}
              >
                <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${right ? "" : "md:justify-end"}`}>
                  <time className="text-[0.7rem] font-medium text-stone">
                    {formatCalendarDate(item.startsAt)}
                  </time>
                  <span className={`font-display text-lg font-semibold leading-none text-burgundy ${cancelled ? "line-through" : ""}`}>
                    {formatCalendarTime(item.startsAt)}
                  </span>
                  {cancelled && (
                    <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-burgundy">Avlyst</span>
                  )}
                </div>
                <h3 className={`mt-0.5 font-display text-[1.05rem] font-semibold leading-snug text-ink ${cancelled ? "line-through" : ""}`}>
                  {item.title}
                </h3>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
