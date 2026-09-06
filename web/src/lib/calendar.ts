import type { PortableTextBlock } from "next-sanity";
import type {
  Bulletin,
  CalendarData,
  MassException,
  MassSchedule,
  ParishEvent,
  Place,
} from "@/sanity/types";

const TIME_ZONE = "Europe/Oslo";
const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const LANGUAGE_LABELS: Record<string, string> = {
  nb: "Norsk",
  en: "Engelsk",
  pl: "Polsk",
  es: "Spansk",
  uk: "Ukrainsk",
  other: "Annet språk",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  mass: "Messe",
  parishCouncil: "Menighetsråd",
  pilgrimage: "Pilegrimstur",
  activity: "Aktivitet",
  social: "Sosialt arrangement",
  other: "Hendelse",
};

export type CalendarItem = {
  id: string;
  kind: "mass" | "event";
  title: string;
  slug: string;
  href: string;
  startsAt: string;
  endsAt?: string;
  dateKey: string;
  status: "scheduled" | "cancelled" | "postponed";
  changeType?: "cancelled" | "rescheduled" | "changed";
  eventType: string;
  language?: string;
  place?: Place;
  places: Place[];
  summary?: string;
  body?: PortableTextBlock[];
  publicNote?: string;
  details?: PortableTextBlock[];
  registrationDeadline?: string;
  links?: Array<{ _key: string; label: string; url: string }>;
  sourceBulletins: Bulletin[];
  scheduleKey?: string;
  occurrenceDate?: string;
  relatedEventSlug?: string;
  parentEvent?: { title: string; slug: string };
};

export type CalendarListItem = Pick<
  CalendarItem,
  | "id"
  | "kind"
  | "title"
  | "href"
  | "startsAt"
  | "endsAt"
  | "dateKey"
  | "status"
  | "eventType"
  | "language"
  | "place"
  | "places"
>;

export function toCalendarListItems(items: CalendarItem[]): CalendarListItem[] {
  return items.map(
    ({
      id,
      kind,
      title,
      href,
      startsAt,
      endsAt,
      dateKey,
      status,
      eventType,
      language,
      place,
      places,
    }) => ({
      id,
      kind,
      title,
      href,
      startsAt,
      endsAt,
      dateKey,
      status,
      eventType,
      language,
      place,
      places,
    }),
  );
}

function parseDateOnly(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number) {
  const value = parseDateOnly(date);
  value.setUTCDate(value.getUTCDate() + days);
  return toDateKey(value);
}

export function todayInOslo(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function osloOffset(date: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    timeZoneName: "longOffset",
  }).formatToParts(new Date(`${date}T12:00:00Z`));
  const label = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+01:00";
  const match = label.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return "+01:00";
  return `${match[1]}${match[2].padStart(2, "0")}:${match[3] ?? "00"}`;
}

function localDateTime(date: string, time: string) {
  return `${date}T${time}:00${osloOffset(date)}`;
}

function occurrenceSlug(scheduleKey: string, occurrenceDate: string) {
  return `${scheduleKey}-${occurrenceDate}`
    .normalize("NFKD")
    .replace(/[æÆ]/g, "ae")
    .replace(/[øØ]/g, "o")
    .replace(/[åÅ]/g, "a")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function exceptionForDate(exceptions: MassException[], date: string) {
  return exceptions.find((exception) => {
    if (exception.scope === "dateRange") {
      return Boolean(
        exception.rangeStart &&
          exception.rangeEnd &&
          date >= exception.rangeStart &&
          date <= exception.rangeEnd,
      );
    }
    return exception.occurrenceDate === date;
  });
}

function bulletinForDate(bulletins: Bulletin[], date: string) {
  return bulletins.find(
    (bulletin) => date >= bulletin.coversFrom && date <= bulletin.coversUntil,
  );
}

function scheduleDates(schedule: MassSchedule, startDate: string, endDate: string) {
  const dates: string[] = [];
  const first = parseDateOnly(startDate);
  const last = parseDateOnly(endDate);
  const targetWeekday = WEEKDAY_INDEX[schedule.anchorWeekday];

  if (schedule.recurrenceType === "weekly") {
    const cursor = new Date(first);
    const shift = (targetWeekday - cursor.getUTCDay() + 7) % 7;
    cursor.setUTCDate(cursor.getUTCDate() + shift);
    while (cursor <= last) {
      const date = addDays(toDateKey(cursor), schedule.dayOffset ?? 0);
      if (date >= startDate && date <= endDate) dates.push(date);
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }
    return dates;
  }

  const monthCursor = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1));
  const lastMonth = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), 1));
  while (monthCursor <= lastMonth) {
    const year = monthCursor.getUTCFullYear();
    const month = monthCursor.getUTCMonth();
    for (const week of schedule.weeksOfMonth ?? []) {
      let anchor: Date;
      if (week === -1) {
        const endOfMonth = new Date(Date.UTC(year, month + 1, 0));
        const backwards = (endOfMonth.getUTCDay() - targetWeekday + 7) % 7;
        anchor = new Date(endOfMonth);
        anchor.setUTCDate(anchor.getUTCDate() - backwards);
      } else {
        const firstOfMonth = new Date(Date.UTC(year, month, 1));
        const forwards = (targetWeekday - firstOfMonth.getUTCDay() + 7) % 7;
        anchor = new Date(firstOfMonth);
        anchor.setUTCDate(anchor.getUTCDate() + forwards + (week - 1) * 7);
        if (anchor.getUTCMonth() !== month) continue;
      }
      const date = addDays(toDateKey(anchor), schedule.dayOffset ?? 0);
      if (date >= startDate && date <= endDate) dates.push(date);
    }
    monthCursor.setUTCMonth(monthCursor.getUTCMonth() + 1);
  }

  return dates;
}

function massItem(
  schedule: MassSchedule,
  occurrenceDate: string,
  exception: MassException | undefined,
  bulletins: Bulletin[],
): CalendarItem {
  const originalStartsAt = localDateTime(occurrenceDate, schedule.startTime);
  const startsAt = exception?.newStartsAt ?? originalStartsAt;
  const duration = schedule.durationMinutes ?? 60;
  const endsAt = exception?.newEndsAt
    ? exception.newEndsAt
    : new Date(new Date(startsAt).getTime() + duration * 60_000).toISOString();
  const place = exception?.newPlace ?? schedule.place;
  const sourceBulletins = exception?.sourceBulletins?.length
    ? exception.sourceBulletins
    : [bulletinForDate(bulletins, occurrenceDate)].filter(
        (bulletin): bulletin is Bulletin => Boolean(bulletin),
      );
  const slug = occurrenceSlug(schedule.sourceKey, occurrenceDate);

  return {
    id: `${schedule.sourceKey}:${occurrenceDate}`,
    kind: "mass",
    title: exception?.titleOverride ?? schedule.title,
    slug,
    href: `/messetider/${slug}`,
    startsAt,
    endsAt,
    dateKey: startsAt.slice(0, 10),
    status: exception?.changeType === "cancelled" ? "cancelled" : "scheduled",
    changeType: exception?.changeType,
    eventType: "mass",
    language: schedule.language,
    place,
    places: place ? [place] : [],
    publicNote: exception?.publicNote ?? schedule.notes,
    details: exception?.details,
    sourceBulletins,
    scheduleKey: schedule.sourceKey,
    occurrenceDate,
    relatedEventSlug: exception?.relatedEventSlug,
  };
}

export function calendarItemFromEvent(event: ParishEvent): CalendarItem {
  return {
    id: event._id,
    kind: "event",
    title: event.title,
    slug: event.slug,
    href: `/messetider/${event.slug}`,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    dateKey: event.startsAt.slice(0, 10),
    status: event.status,
    eventType: event.eventType,
    language: event.language,
    place: event.places?.[0],
    places: event.places ?? [],
    summary: event.summary,
    body: event.body,
    registrationDeadline: event.registrationDeadline,
    links: event.links,
    sourceBulletins: event.sourceBulletins ?? [],
    parentEvent: event.parentEvent,
  };
}

export function buildCalendarItems(
  data: CalendarData,
  startDate: string,
  endDate: string,
) {
  const items: CalendarItem[] = [];

  for (const schedule of data.schedules ?? []) {
    const activeFrom = schedule.validFrom > startDate ? schedule.validFrom : startDate;
    const activeUntil =
      schedule.validUntil && schedule.validUntil < endDate ? schedule.validUntil : endDate;
    if (activeFrom > activeUntil) continue;
    const exceptions = (data.exceptions ?? []).filter(
      (exception) => exception.scheduleKey === schedule.sourceKey,
    );
    for (const date of scheduleDates(schedule, activeFrom, activeUntil)) {
      items.push(massItem(schedule, date, exceptionForDate(exceptions, date), data.bulletins ?? []));
    }
  }

  for (const event of data.events ?? []) items.push(calendarItemFromEvent(event));

  return items.toSorted((a, b) => {
    const time = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    return time || a.id.localeCompare(b.id);
  });
}

export function formatCalendarDate(iso: string, includeYear = false) {
  const value = new Intl.DateTimeFormat("nb-NO", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(new Date(iso));
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatCalendarTime(iso: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(iso))
    .replace(":", ".");
}

export function formatArticleDate(iso: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function placeFilterKey(place?: Place) {
  if (!place) return "other";
  if (place.sourceKey === "place:kongsberg-st-barbara") return "kongsberg";
  if (place.sourceKey === "place:notodden") return "notodden";
  if (place.sourceKey === "place:rjukan-st-johannes") return "rjukan";
  if (place.sourceKey === "place:mo-kirke") return "mo";
  return "other";
}
