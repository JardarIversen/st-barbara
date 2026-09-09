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
  changeLabel?: string;
  eventType: string;
  language?: string;
  place?: Place;
  places: Place[];
  regionKeys: string[];
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
  titleOriginal?: boolean;
  noteOriginal?: boolean;
  bodyOriginal?: boolean;
  detailsOriginal?: boolean;
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
  | "regionKeys"
  | "publicNote"
  | "summary"
  | "changeType"
  | "changeLabel"
  | "titleOriginal"
  | "noteOriginal"
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
      regionKeys,
      publicNote,
      summary,
      changeType,
      changeLabel,
      titleOriginal,
      noteOriginal,
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
      regionKeys,
      publicNote,
      summary,
      changeType,
      changeLabel,
      titleOriginal,
      noteOriginal,
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

export function calendarHistoryStart(today: string) {
  const date = parseDateOnly(today);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return toDateKey(date);
}

export function todayInOslo(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function osloOffset(instant: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    timeZoneName: "longOffset",
  }).formatToParts(instant);
  const label =
    parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+01:00";
  const match = label.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return "+01:00";
  return `${match[1]}${match[2].padStart(2, "0")}:${match[3] ?? "00"}`;
}

export function localDateTime(date: string, time: string) {
  const wallTime = `${date}T${time}:00`;
  let offset = osloOffset(new Date(`${wallTime}Z`));
  offset = osloOffset(new Date(`${wallTime}${offset}`));
  return `${wallTime}${offset}`;
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
  return exceptions
    .filter((exception) => {
      if (exception.scope === "dateRange") {
        return Boolean(
          exception.rangeStart &&
          exception.rangeEnd &&
          date >= exception.rangeStart &&
          date <= exception.rangeEnd,
        );
      }
      return exception.occurrenceDate === date;
    })
    .toSorted((a, b) => {
      const latestSource = (value: MassException) =>
        (value.sourceBulletins ?? [])
          .map((bulletin) => bulletin.issueDate)
          .sort()
          .at(-1) ?? "";
      return (
        latestSource(b).localeCompare(latestSource(a)) ||
        Number(b.scope === "singleOccurrence") -
          Number(a.scope === "singleOccurrence")
      );
    })[0];
}

function bulletinForDate(bulletins: Bulletin[], date: string) {
  return bulletins.find(
    (bulletin) => date >= bulletin.coversFrom && date <= bulletin.coversUntil,
  );
}

function scheduleDates(
  schedule: MassSchedule,
  startDate: string,
  endDate: string,
) {
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

  const monthCursor = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1),
  );
  const lastMonth = new Date(
    Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), 1),
  );
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
  const changedTime =
    new Date(startsAt).getTime() !== new Date(originalStartsAt).getTime();
  const changedPlace = place?._id !== schedule.place?._id &&
    placeFilterKey(place) !== placeFilterKey(schedule.place);

  return {
    id: `${schedule.sourceKey}:${occurrenceDate}`,
    kind: "mass",
    title: exception?.titleOverride ?? schedule.title,
    titleOriginal: exception?.titleOverride
      ? exception.originalFields?.includes("titleOverride")
      : schedule.originalFields?.includes("title"),
    noteOriginal: exception?.publicNote
      ? exception.originalFields?.includes("publicNote")
      : schedule.originalFields?.includes("notes"),
    detailsOriginal: exception?.originalFields?.includes("details"),
    slug,
    href: `/messetider/${slug}`,
    startsAt,
    endsAt,
    dateKey: todayInOslo(new Date(startsAt)),
    status: exception?.changeType === "cancelled" ? "cancelled" : "scheduled",
    changeType: exception?.changeType,
    changeLabel:
      changedTime && changedPlace
        ? "Endret tid og sted"
        : changedTime
          ? "Endret tid"
          : changedPlace
            ? "Annet sted"
            : undefined,
    eventType: "mass",
    language: schedule.language,
    place,
    places: place ? [place] : [],
    // A moved Notodden mass still belongs in the Notodden filter.
    regionKeys: [
      ...new Set([placeFilterKey(schedule.place), placeFilterKey(place)]),
    ],
    publicNote: exception?.publicNote ?? schedule.notes,
    details: exception?.details,
    sourceBulletins,
    scheduleKey: schedule.sourceKey,
    occurrenceDate,
    relatedEventSlug: exception?.relatedEventSlug,
  };
}

export function calendarItemFromEvent(event: ParishEvent): CalendarItem {
  const regions = [...new Set((event.places ?? []).map(placeFilterKey))];
  // Some existing bulletins name the town but do not yet specify a venue.
  // Keep those events discoverable without inventing an address or church.
  if (!event.places?.length) {
    for (const region of ["kongsberg", "notodden", "rjukan", "mo"] as const) {
      if (
        new RegExp(
          `(?:^|\\s)(?:i|på|fra|til|in|at|from|to) ${region}(?:$|[\\s,.!?])`,
          "i",
        ).test(event.title)
      )
        regions.push(region);
    }
  }
  return {
    id: event._id,
    kind: "event",
    title: event.title,
    titleOriginal: event.originalFields?.includes("title"),
    noteOriginal: event.originalFields?.includes("summary"),
    bodyOriginal: event.originalFields?.includes("body"),
    slug: event.slug,
    href: `/messetider/${event.slug}`,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    dateKey: todayInOslo(new Date(event.startsAt)),
    status: event.status,
    eventType: event.eventType,
    language: event.language,
    place: event.places?.[0],
    places: event.places ?? [],
    regionKeys: regions,
    summary: event.summary,
    body: event.body,
    registrationDeadline: event.registrationDeadline,
    links: event.links,
    sourceBulletins: event.sourceBulletins ?? [],
    parentEvent: event.parentEvent,
  };
}

// The URL keeps the original occurrence date, even when the mass moves to another day.
export function resolveScheduledMass(
  data: CalendarData,
  slug: string,
  date: string,
): CalendarItem | null {
  const schedule = data.schedules.find(
    (value) => occurrenceSlug(value.sourceKey, date) === slug,
  );
  if (
    !schedule ||
    date < schedule.validFrom ||
    (schedule.validUntil && date > schedule.validUntil)
  )
    return null;
  const exceptions = data.exceptions.filter(
    (value) => value.scheduleKey === schedule.sourceKey,
  );
  if (
    !scheduleDates(schedule, addDays(date, -7), addDays(date, 7)).includes(date)
  )
    return null;
  return massItem(
    schedule,
    date,
    exceptionForDate(exceptions, date),
    data.bulletins ?? [],
  );
}

export function buildCalendarItems(
  data: CalendarData,
  startDate: string,
  endDate: string,
) {
  const items: CalendarItem[] = [];

  for (const schedule of data.schedules ?? []) {
    const activeFrom =
      schedule.validFrom > startDate ? schedule.validFrom : startDate;
    const activeUntil =
      schedule.validUntil && schedule.validUntil < endDate
        ? schedule.validUntil
        : endDate;
    if (activeFrom > activeUntil) continue;
    const exceptions = (data.exceptions ?? []).filter(
      (exception) => exception.scheduleKey === schedule.sourceKey,
    );
    for (const date of scheduleDates(schedule, activeFrom, activeUntil)) {
      items.push(
        massItem(
          schedule,
          date,
          exceptionForDate(exceptions, date),
          data.bulletins ?? [],
        ),
      );
    }
  }

  for (const event of data.events ?? [])
    items.push(calendarItemFromEvent(event));

  return items
    .filter(
      (item) =>
        item.dateKey <= endDate &&
        todayInOslo(new Date(item.endsAt ?? item.startsAt)) >= startDate,
    )
    .toSorted((a, b) => {
      const time =
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      return time || a.id.localeCompare(b.id);
    });
}

export function formatCalendarDate(
  iso: string,
  includeYear = false,
  locale: "nb" | "en" = "nb",
) {
  const value = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "nb-NO", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(new Date(iso));
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatCalendarTime(iso: string, locale: "nb" | "en" = "nb") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "nb-NO", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(iso))
    .replace(":", locale === "en" ? ":" : ".");
}

export function formatArticleDate(iso: string, locale: "nb" | "en" = "nb") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "nb-NO", {
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
  if (place.sourceKey === "place:heddal-stavkirke") return "notodden";
  const locality = place.locality?.toLocaleLowerCase("nb-NO");
  if (locality === "kongsberg") return "kongsberg";
  if (locality === "notodden" || locality === "heddal") return "notodden";
  if (locality === "rjukan") return "rjukan";
  return "other";
}

export function calendarPlaceLabel(place?: Place) {
  if (!place) return "";
  const names: Record<string, string> = {
    "place:kongsberg-st-barbara": "Kongsberg",
    "place:notodden": "Notodden",
    "place:rjukan-st-johannes": "Rjukan",
    "place:mo-kirke": "Mo",
  };
  return names[place.sourceKey] ?? place.name;
}

export function calendarTitle(item: CalendarListItem) {
  let title = item.title;
  for (const place of item.places) {
    for (const name of [calendarPlaceLabel(place), place.name]) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      title = title.replace(new RegExp(` (?:i|på|in|at) ${escaped}$`, "i"), "");
    }
  }
  if (item.eventType === "mass") {
    title = title.replace(/^(norsk|engelsk|polsk|spansk|ukrainsk) /i, "");
    title = title.replace(
      /^(søndags|mandags|tirsdags|onsdags|torsdags|fredags|lørdags)?messe$/i,
      "Messe",
    );
    title = title.replace(/^Messe i Mo før tredje søndag$/i, "Messe");
    title = title.replace(
      /^(Norwegian|English|Polish|Spanish|Ukrainian) /i,
      "",
    );
    title = title.replace(
      /^(?:(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) )?Mass$/i,
      "Mass",
    );
    title = title.replace(/^Mass in Mo before the third Sunday$/i, "Mass");
    title = title.replace(/^Mass$/i, "Holy Mass");
  }
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function calendarDayGroups(items: CalendarListItem[], from?: string) {
  const groups = new Map<string, CalendarListItem[]>();
  for (const item of items) {
    const day = from && item.dateKey < from ? from : item.dateKey;
    const group = groups.get(day) ?? [];
    group.push(item);
    groups.set(day, group);
  }
  return [...groups.entries()];
}

export function calendarDateRange(
  item: Pick<CalendarItem, "startsAt" | "endsAt">,
  locale: "nb" | "en" = "nb",
) {
  const start = formatCalendarDate(item.startsAt, true, locale);
  if (
    !item.endsAt ||
    todayInOslo(new Date(item.startsAt)) === todayInOslo(new Date(item.endsAt))
  )
    return start;
  return `${start} – ${formatCalendarDate(item.endsAt, true, locale)}`;
}

// Existing date-only, multi-day imports use midnight through 23:59 as their bounds.
// Do not suppress real midnight masses or other explicitly timed events.
export function isDateOnlyRange(
  item: Pick<CalendarItem, "eventType" | "startsAt" | "endsAt">,
) {
  return (
    item.eventType !== "mass" &&
    Boolean(item.endsAt) &&
    todayInOslo(new Date(item.startsAt)) !==
      todayInOslo(new Date(item.endsAt!)) &&
    formatCalendarTime(item.startsAt) === "00.00" &&
    formatCalendarTime(item.endsAt!) === "23.59"
  );
}
