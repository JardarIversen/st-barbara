import { cache } from "react";
import { sanityFetch } from "./live";
import {
  ACTIVE_ANNOUNCEMENTS_QUERY,
  ANNOUNCEMENTS_BY_BULLETINS_QUERY,
  ALL_ARTICLES_QUERY,
  ARTICLE_QUERY,
  ARTICLE_SLUGS_QUERY,
  CALENDAR_DATA_QUERY,
  EVENT_QUERY,
  LATEST_ARTICLES_QUERY,
  LATEST_BULLETINS_QUERY,
  MASS_TEXT_QUERY,
  PARISH_PLACES_QUERY,
} from "./queries";
import type {
  Announcement,
  Article,
  ArticleCard,
  Bulletin,
  CalendarData,
  MassText,
  ParishEvent,
  Place,
} from "./types";

const published = { perspective: "published" as const, stega: false as const };

export async function getCalendarData(startDate: string, endDate: string) {
  const { data } = await sanityFetch({
    ...published,
    query: CALENDAR_DATA_QUERY,
    params: {
      startDate,
      endDate,
      start: `${startDate}T00:00:00Z`,
      end: `${endDate}T23:59:59Z`,
    },
  });

  return data as CalendarData;
}

export async function getParishPlaces() {
  const { data } = await sanityFetch({ ...published, query: PARISH_PLACES_QUERY });
  return data as Place[];
}

export async function getActiveAnnouncements(now: string) {
  const { data } = await sanityFetch({
    ...published,
    query: ACTIVE_ANNOUNCEMENTS_QUERY,
    params: { now },
  });
  return data as Announcement[];
}

export async function getLatestArticles() {
  const { data } = await sanityFetch({ ...published, query: LATEST_ARTICLES_QUERY });
  return data as ArticleCard[];
}

export async function getLatestBulletins() {
  const { data } = await sanityFetch({ ...published, query: LATEST_BULLETINS_QUERY });
  return data as Bulletin[];
}

export async function getAnnouncementsByBulletins(bulletinIds: string[]) {
  if (bulletinIds.length === 0) return [];
  const { data } = await sanityFetch({
    ...published,
    query: ANNOUNCEMENTS_BY_BULLETINS_QUERY,
    params: { bulletinIds },
  });
  return data as Announcement[];
}

export async function getAllArticles() {
  const { data } = await sanityFetch({ ...published, query: ALL_ARTICLES_QUERY });
  return data as ArticleCard[];
}

export async function getArticleSlugs() {
  const { data } = await sanityFetch({
    query: ARTICLE_SLUGS_QUERY,
    perspective: "published",
    stega: false,
  });
  return data as Array<{ slug: string }>;
}

export const getArticle = cache(async (slug: string) => {
  const { data } = await sanityFetch({
    ...published,
    query: ARTICLE_QUERY,
    params: { slug },
  });
  return data as Article | null;
});

export const getEvent = cache(async (slug: string) => {
  const { data } = await sanityFetch({
    ...published,
    query: EVENT_QUERY,
    params: { slug },
  });
  return data as ParishEvent | null;
});

export const getMassText = cache(async (date: string, scheduleKey: string) => {
  const { data } = await sanityFetch({
    ...published,
    query: MASS_TEXT_QUERY,
    params: { date, scheduleKey },
  });
  return data as MassText | null;
});
