import type { PortableTextBlock } from "next-sanity";
import type { CalendarItem } from "./calendar";
// Generated from liturgihefte/familiemesse.html by liturgihefte/til-nettsiden.py; never edit by hand.
import booklet from "../content/messens-ordning.json" with { type: "json" };

import type { EucharisticPrayer, LiturgyLanguage } from "./liturgy-options.ts";
export * from "./liturgy-options.ts";

export type LiturgyBlock = {
  html: string;
  /** A place in the Liturgy of the Word that today's readings fill in. */
  role?: string;
  readingHtml?: string;
  /** Gloria, Creed and the offertory prayers, which depend on the kind of Mass. */
  group?: string;
  /** Which Eucharistic Prayer the block belongs to. */
  ep?: EucharisticPrayer;
  /** Shown for every prayer except this one (Prayer IV has its own Preface). */
  epExcept?: EucharisticPrayer;
  /** The part of the Mass a heading begins, for the explanations. */
  part?: string;
};
export type LiturgySection = { id: string; title: string; blocks: LiturgyBlock[] };

// The generated JSON is checked against the booklet by tests/order-of-mass.test.mjs.
const liturgies = booklet.liturgies as unknown as Record<
  LiturgyLanguage,
  { sections: LiturgySection[] }
>;
export const ORDER_OF_MASS: Record<LiturgyLanguage, LiturgySection[]> = {
  nb: liturgies.nb.sections,
  en: liturgies.en.sections,
};

// How people recognise the prayer the priest has begun: its first words after the Sanctus.
export const PRAYER_OPENINGS: Record<
  LiturgyLanguage,
  Partial<Record<EucharisticPrayer, { name: string; opening: string }>>
> = {
  nb: {
    "1": { name: "Eukaristisk bønn I", opening: "«Mildeste Fader, i ydmykhet bønnfaller vi deg …»" },
    "2": { name: "Eukaristisk bønn II", opening: "«I sannhet hellig er du, Herre, all hellighets kilde.»" },
    "3": { name: "Eukaristisk bønn III", opening: "«I sannhet, hellig er du, Herre, og med rette lovprises du …»" },
    "4": { name: "Eukaristisk bønn IV", opening: "«Vi lovpriser deg, hellige Fader …»" },
  },
  en: {
    "2": { name: "Eucharistic Prayer II", opening: "“You are indeed Holy, O Lord, the fount of all holiness.”" },
    "3": { name: "Eucharistic Prayer III", opening: "“You are indeed Holy, O Lord, and all you have created …”" },
  },
};
export const ORDER_OF_MASS_SOURCE = booklet.source;

export function liturgyLanguage(value: unknown): LiturgyLanguage | null {
  const language = Array.isArray(value) ? value[0] : value;
  return language === "nb" || language === "en" ? language : null;
}

// Short labels for the jump bar. The anchors are the booklet's own heading ids.
export const LITURGY_NAV: Record<
  LiturgyLanguage,
  Array<{ id: string; label: string }>
> = {
  nb: [
    { id: "innledende-riter", label: "Innledning" },
    { id: "ordets-liturgi", label: "Ordet" },
    { id: "nattverdens-liturgi", label: "Nattverden" },
    { id: "kommunionsritus", label: "Kommunion" },
    { id: "avsluttende-ritus", label: "Avslutning" },
  ],
  en: [
    { id: "introductory-rites", label: "Introduction" },
    { id: "liturgy-of-the-word", label: "Word" },
    { id: "liturgy-of-the-eucharist", label: "Eucharist" },
    { id: "communion-rite", label: "Communion" },
    { id: "concluding-rites", label: "Conclusion" },
  ],
};

export type ReadingPart = {
  heading: string;
  /** The heading without its label, such as "Matt 25, 1–13". */
  reference: string;
  blocks: PortableTextBlock[];
};
export type MassReadings = {
  firstReading: ReadingPart;
  psalm: ReadingPart;
  secondReading?: ReadingPart;
  acclamation?: ReadingPart;
  gospel: ReadingPart;
};

// The newsletter lists the readings under these headings, in this order.
const READING_PARTS: Array<[keyof MassReadings, RegExp]> = [
  ["firstReading", /^1\.\s*lesning/i],
  ["psalm", /^responsoriesalme/i],
  ["secondReading", /^2\.\s*lesning/i],
  ["acclamation", /^evangelievers/i],
  ["gospel", /^evangelium/i],
];

function blockText(block: PortableTextBlock) {
  return (block.children ?? [])
    .map((child) => ("text" in child ? String(child.text) : ""))
    .join("")
    .trim();
}

/**
 * Splits a newsletter's readings into the parts of the Liturgy of the Word, so each can stand
 * in its place in the order of Mass. Returns null for anything unusual (Palm Sunday starts
 * with the Gospel of the procession); the page then shows the readings together instead.
 */
export function splitReadings(
  body: PortableTextBlock[] | null | undefined,
): MassReadings | null {
  if (!body?.length) return null;
  const parts: Partial<MassReadings> = {};
  let current: ReadingPart | null = null;
  let lastIndex = -1;
  for (const block of body) {
    if (block._type === "block" && block.style === "h2") {
      const heading = blockText(block);
      const index = READING_PARTS.findIndex(([, pattern]) =>
        pattern.test(heading),
      );
      if (index <= lastIndex) return null;
      lastIndex = index;
      const [key, pattern] = READING_PARTS[index];
      current = {
        heading,
        reference: heading.replace(pattern, "").replace(/^[\s–—-]+/, ""),
        blocks: [],
      };
      parts[key] = current;
    } else if (current) current.blocks.push(block);
    else return null;
  }
  if (!parts.firstReading || !parts.psalm || !parts.gospel) return null;
  return parts as MassReadings;
}

// The newsletter's readings belong to this Mass; see AGENTS.md.
export const READINGS_SCHEDULE_KEY = "mass-schedule:kongsberg:sunday:nb:1100";
// A Mass stays "today's Mass" for a while after it ends, for anyone reading on afterwards.
const AFTER_MASS_MS = 30 * 60_000;

export type TodaysMass = { mass: CalendarItem; cancelled: boolean };

/** The Mass in St. Barbara church in Kongsberg that is going on now, or the next one today. */
export function chooseTodaysMass(
  items: CalendarItem[],
  today: string,
  now: Date,
): TodaysMass | null {
  const masses = items
    .filter(
      (item) =>
        item.eventType === "mass" &&
        item.dateKey === today &&
        item.regionKeys.includes("kongsberg"),
    )
    .toSorted(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  const pick = (list: CalendarItem[]) =>
    list.find(
      (item) =>
        new Date(item.endsAt ?? item.startsAt).getTime() + AFTER_MASS_MS >
        now.getTime(),
    ) ?? list.at(-1);
  const held = masses.filter((item) => item.status === "scheduled");
  if (held.length) return { mass: pick(held)!, cancelled: false };
  if (masses.length) return { mass: pick(masses)!, cancelled: true };
  return null;
}

/** Masses whose newsletter readings serve today's Mass: its own, then the Sunday Mass's. */
export function readingCandidates(mass: CalendarItem, items: CalendarItem[]) {
  return [
    mass,
    ...items.filter(
      (item) =>
        item !== mass &&
        item.dateKey === mass.dateKey &&
        item.scheduleKey === READINGS_SCHEDULE_KEY,
    ),
  ].filter((item) => item.scheduleId && item.occurrenceDate);
}
