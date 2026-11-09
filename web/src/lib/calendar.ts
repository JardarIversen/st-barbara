import type { PortableTextBlock } from "next-sanity";
import type {
  Bulletin,
  CalendarAnnouncement,
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
  announcements?: CalendarAnnouncement[];
  id: string;
  kind: "mass" | "event";
  title: string;
  slug: string;
  href: string;
  startsAt: string;
  endsAt?: string;
  estimatedEndTime?: boolean;
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
  scheduleId?: string;
  occurrenceDate?: string;
  relatedEventSlug?: string;
  parentEvent?: { title: string; slug: string };
  titleOriginal?: boolean;
  noteOriginal?: boolean;
  bodyOriginal?: boolean;
  detailsOriginal?: boolean;
  /** An ordinary weekday occurrence of a weekly Mass that nothing has changed. */
  routine?: boolean;
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
  | "announcements"
  | "routine"
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
      announcements,
      routine,
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
      announcements,
      routine,
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

// Imported schedules keep their published URLs; schedules created in Studio use their id.
function occurrenceSlug(schedule: MassSchedule, occurrenceDate: string) {
  return `${schedule.sourceKey ?? schedule._id}-${occurrenceDate}`
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
  const slug = occurrenceSlug(schedule, occurrenceDate);
  const changedTime =
    new Date(startsAt).getTime() !== new Date(originalStartsAt).getTime();
  const changedPlace = place?._id !== schedule.place?._id &&
    placeFilterKey(place) !== placeFilterKey(schedule.place);
  // Exactly what the regular schedule promises: the page lists it there, not again under «Senere».
  const routine =
    !changedTime &&
    !changedPlace &&
    !exception?.titleOverride &&
    !exception?.relatedEventSlug &&
    !exception?.announcements?.length &&
    (!exception || exception.changeType === "changed");

  return {
    id: `${schedule.sourceKey ?? schedule._id}:${occurrenceDate}`,
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
    estimatedEndTime: !exception?.newEndsAt,
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
    scheduleId: schedule._id,
    occurrenceDate,
    relatedEventSlug: exception?.relatedEventSlug,
    announcements: exception?.announcements,
    routine,
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
    announcements: event.announcements,
  };
}

// The URL keeps the original occurrence date, even when the mass moves to another day.
export function resolveScheduledMass(
  data: CalendarData,
  slug: string,
  date: string,
): CalendarItem | null {
  const schedule = data.schedules.find(
    (value) => occurrenceSlug(value, date) === slug,
  );
  if (
    !schedule ||
    date < schedule.validFrom ||
    (schedule.validUntil && date > schedule.validUntil)
  )
    return null;
  const exceptions = data.exceptions.filter(
    (value) => value.scheduleId === schedule._id,
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
      (exception) => exception.scheduleId === schedule._id,
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
  return names[place.sourceKey ?? ""] ?? place.name;
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

/** Cancellations, postponements and moved times or places: what a visitor must not miss. */
export function isCalendarChange(
  item: Pick<CalendarItem, "status" | "changeType" | "changeLabel">,
) {
  return (
    item.status !== "scheduled" ||
    item.changeType === "cancelled" ||
    item.changeType === "rescheduled" ||
    Boolean(item.changeLabel)
  );
}

/** Monday of the (Norwegian) week that contains the date. */
/** The Sunday that closes «this week»: the coming one, or next week's when today is Sunday. */
export function comingSunday(today: string) {
  return addDays(today, 7 - parseDateOnly(today).getUTCDay());
}

export function weekStart(date: string) {
  const day = parseDateOnly(date).getUTCDay();
  return addDays(date, -((day + 6) % 7));
}

export function isoWeekNumber(date: string) {
  const value = parseDateOnly(date);
  value.setUTCDate(value.getUTCDate() + 3 - ((value.getUTCDay() + 6) % 7));
  const firstThursday = new Date(Date.UTC(value.getUTCFullYear(), 0, 4));
  return (
    1 +
    Math.round(
      ((value.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    )
  );
}

export function formatDayMonthRange(
  from: string,
  to: string,
  locale: "nb" | "en" = "nb",
) {
  const format = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "nb-NO", {
      timeZone: "UTC",
      ...options,
    }).format(parseDateOnly(date));
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  if (locale === "en")
    return sameMonth
      ? `${format(from, { day: "numeric" })}–${format(to, { day: "numeric", month: "long" })}`
      : `${format(from, { day: "numeric", month: "long" })} – ${format(to, { day: "numeric", month: "long" })}`;
  return sameMonth
    ? `${format(from, { day: "numeric" })}–${format(to, { day: "numeric", month: "long" })}`
    : `${format(from, { day: "numeric", month: "long" })} – ${format(to, { day: "numeric", month: "long" })}`;
}

export function formatShortDate(iso: string, locale: "nb" | "en" = "nb") {
  const value = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "nb-NO", {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const WEEKDAY_NAMES = {
  nb: ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

function ordinal(week: number, locale: "nb" | "en") {
  if (locale === "nb") return week === -1 ? "siste" : `${week}.`;
  if (week === -1) return "last";
  return `${week}${week === 1 ? "st" : week === 2 ? "nd" : week === 3 ? "rd" : "th"}`;
}

function joinList(values: string[], locale: "nb" | "en") {
  if (values.length < 2) return values.join("");
  return `${values.slice(0, -1).join(", ")} ${locale === "en" ? "and" : "og"} ${values.at(-1)}`;
}

/** Plain-language rule, such as «Hver søndag» or «Lørdag før 3. søndag i måneden». */
export function describeScheduleRule(
  schedule: Pick<
    MassSchedule,
    "anchorWeekday" | "recurrenceType" | "weeksOfMonth" | "dayOffset"
  >,
  locale: "nb" | "en" = "nb",
) {
  const anchor = WEEKDAY_INDEX[schedule.anchorWeekday];
  const offset = schedule.dayOffset ?? 0;
  const names = WEEKDAY_NAMES[locale];
  const capitalize = (value: string) =>
    value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);
  if (schedule.recurrenceType === "weekly") {
    const day = names[(((anchor + offset) % 7) + 7) % 7];
    return locale === "en" ? `Every ${day}` : `Hver ${day}`;
  }
  const weeks = joinList(
    (schedule.weeksOfMonth ?? []).toSorted((a, b) =>
      a === -1 ? 1 : b === -1 ? -1 : a - b,
    ).map((week) => ordinal(week, locale)),
    locale,
  );
  const anchorName = names[anchor];
  if (offset === 0)
    return locale === "en"
      ? `${weeks} ${anchorName} of the month`
      : capitalize(`${weeks} ${anchorName} i måneden`);
  const day = names[(((anchor + offset) % 7) + 7) % 7];
  const relation =
    offset === -1
      ? locale === "en" ? "before" : "før"
      : offset === 1
        ? locale === "en" ? "after" : "etter"
        : "";
  if (!relation) return capitalize(`${day}`);
  return locale === "en"
    ? `${capitalize(day)} ${relation} the ${weeks} ${anchorName} of the month`
    : capitalize(`${day} ${relation} ${weeks} ${anchorName} i måneden`);
}

export type ScheduleOccurrence = Pick<
  CalendarListItem,
  "href" | "startsAt" | "status" | "changeLabel" | "publicNote" | "noteOriginal" | "title"
>;

export type ScheduleOverviewRow = {
  id: string;
  rule: string;
  /** Weekday name, used under a «Hver uke» heading instead of repeating the rule. */
  weekday: string;
  time: string;
  language: MassSchedule["language"];
  notes?: string;
  weekly: boolean;
  next?: ScheduleOccurrence;
  /** Upcoming cancellations or moves of this Mass, so the plan never misleads. */
  changes: ScheduleOccurrence[];
};

export type ScheduleOverviewGroup = {
  key: string;
  label: string;
  place?: Place;
  rows: ScheduleOverviewRow[];
  /** Places without a regular plan still point to their next Mass. */
  nextMass?: ScheduleOccurrence;
};

export const PARISH_REGIONS = ["kongsberg", "notodden", "rjukan", "mo"] as const;
const REGION_LABELS: Record<string, string> = {
  kongsberg: "Kongsberg",
  notodden: "Notodden",
  rjukan: "Rjukan",
  mo: "Mo",
};

function occurrence(item: CalendarItem): ScheduleOccurrence {
  return {
    href: item.href,
    startsAt: item.startsAt,
    status: item.status,
    changeLabel: item.changeLabel,
    publicNote: item.publicNote,
    noteOriginal: item.noteOriginal,
    title: item.title,
  };
}

function capitalizedWeekday(schedule: MassSchedule, locale: "nb" | "en") {
  const index =
    (((WEEKDAY_INDEX[schedule.anchorWeekday] + (schedule.dayOffset ?? 0)) % 7) + 7) % 7;
  const name = WEEKDAY_NAMES[locale][index];
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

function ruleSortKey(schedule: MassSchedule) {
  const weekday =
    (((WEEKDAY_INDEX[schedule.anchorWeekday] + (schedule.dayOffset ?? 0)) % 7) + 7) % 7;
  const firstWeek = Math.min(...(schedule.weeksOfMonth ?? [0]));
  return `${weekday}-${schedule.startTime}-${String(firstWeek + 1).padStart(2, "0")}`;
}

/** The regular plan per place, with the next real occurrence of each Mass. */
export function buildScheduleOverview(
  data: CalendarData,
  items: CalendarItem[],
  now: Date,
  today: string,
  locale: "nb" | "en" = "nb",
  changeHorizonDays = 56,
): ScheduleOverviewGroup[] {
  const upcoming = items.filter(
    (item) => new Date(item.endsAt ?? item.startsAt) >= now,
  );
  const horizon = addDays(today, changeHorizonDays);
  const active = (data.schedules ?? []).filter(
    (schedule) =>
      schedule.status !== "inactive" &&
      schedule.validFrom <= horizon &&
      (!schedule.validUntil || schedule.validUntil >= today),
  );
  return PARISH_REGIONS.map((key) => {
    const schedules = active
      .filter((schedule) => placeFilterKey(schedule.place) === key)
      .toSorted((a, b) => ruleSortKey(a).localeCompare(ruleSortKey(b)));
    const rows = schedules.map((schedule): ScheduleOverviewRow => {
      const own = upcoming.filter((item) => item.scheduleId === schedule._id);
      return {
        id: schedule._id,
        rule: describeScheduleRule(schedule, locale),
        weekday: capitalizedWeekday(schedule, locale),
        time: formatCalendarTime(localDateTime(today, schedule.startTime), locale),
        language: schedule.language,
        notes: schedule.notes,
        weekly: schedule.recurrenceType === "weekly",
        next: own.find((item) => item.status === "scheduled")
          ? occurrence(own.find((item) => item.status === "scheduled")!)
          : undefined,
        changes: own
          .filter((item) => item.dateKey <= horizon && isCalendarChange(item))
          .slice(0, 3)
          .map(occurrence),
      };
    });
    const nextMass = upcoming.find(
      (item) =>
        item.eventType === "mass" &&
        item.status === "scheduled" &&
        item.regionKeys.includes(key),
    );
    return {
      key,
      label: REGION_LABELS[key],
      place: schedules[0]?.place ?? nextMass?.place,
      rows,
      nextMass: nextMass ? occurrence(nextMass) : undefined,
    };
  });
}
