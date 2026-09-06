import type { PortableTextBlock } from "next-sanity";

export type SanityImageValue = {
  assetRef: string;
  alt: string;
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; height: number; width: number };
  lqip?: string;
  dimensions?: { width: number; height: number; aspectRatio: number };
};

export type Place = {
  _id: string;
  sourceKey: string;
  name: string;
  slug: string;
  placeType: string;
  streetAddress?: string;
  postalCode?: string;
  locality?: string;
  mapUrl?: string;
};

export type Bulletin = {
  _id: string;
  issueDate: string;
  coversFrom: string;
  coversUntil: string;
  pdfUrl: string;
};

export type MassSchedule = {
  originalFields?: string[];
  _id: string;
  sourceKey: string;
  title: string;
  status: "active" | "inactive";
  place: Place;
  language: "nb" | "en" | "pl" | "es" | "uk" | "other";
  anchorWeekday: string;
  recurrenceType: "weekly" | "monthlyWeeks";
  weeksOfMonth?: number[];
  dayOffset: number;
  startTime: string;
  durationMinutes?: number;
  validFrom: string;
  validUntil?: string;
  notes?: string;
};

export type MassException = {
  originalFields?: string[];
  _id: string;
  sourceKey: string;
  scope: "singleOccurrence" | "dateRange";
  scheduleKey: string;
  occurrenceDate?: string;
  rangeStart?: string;
  rangeEnd?: string;
  changeType: "cancelled" | "rescheduled" | "changed";
  newStartsAt?: string;
  newEndsAt?: string;
  newPlace?: Place;
  relatedEventSlug?: string;
  titleOverride?: string;
  publicNote?: string;
  details?: PortableTextBlock[];
  sourceBulletins?: Bulletin[];
};

export type ParishEvent = {
  originalFields?: string[];
  _id: string;
  sourceKey: string;
  title: string;
  slug: string;
  eventType:
    "mass" | "parishCouncil" | "pilgrimage" | "activity" | "social" | "other";
  status: "scheduled" | "cancelled" | "postponed";
  startsAt: string;
  endsAt?: string;
  places?: Place[];
  parentEvent?: { title: string; slug: string };
  summary?: string;
  body?: PortableTextBlock[];
  language?: "nb" | "en" | "pl" | "es" | "uk" | "other";
  registrationDeadline?: string;
  links?: Array<{ _key: string; label: string; url: string }>;
  sourceBulletins?: Bulletin[];
};

export type CalendarData = {
  schedules: MassSchedule[];
  exceptions: MassException[];
  events: ParishEvent[];
  bulletins: Bulletin[];
};

export type Announcement = {
  originalFields?: string[];
  _id: string;
  sourceKey: string;
  title: string;
  slug: string;
  status: "active" | "resolved";
  priority: "normal" | "important" | "urgent";
  publishedAt: string;
  lastMentionedAt?: string;
  appliesFrom?: string;
  appliesUntil?: string;
  summary?: string;
  body: PortableTextBlock[];
  places?: Place[];
  relatedEvents?: Array<{ title: string; slug: string }>;
  links?: Array<{ _key: string; label: string; url: string }>;
  sourceBulletins?: Bulletin[];
};

export type ArticleCard = {
  originalFields?: string[];
  _id: string;
  sourceKey: string;
  title: string;
  slug: string;
  articleType: string;
  category?: string;
  publishedAt: string;
  summary?: string;
  mainImage?: SanityImageValue;
};

export type Article = ArticleCard & {
  body: PortableTextBlock[];
  places?: Place[];
  relatedEvents?: Array<{ title: string; slug: string }>;
  links?: Array<{ _key: string; label: string; url: string }>;
  sourceBulletins?: Bulletin[];
};

export type MassText = {
  _id: string;
  title: string;
  body: PortableTextBlock[];
};
