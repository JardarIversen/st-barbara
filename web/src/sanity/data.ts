import { cache } from "react";
import { getLocale } from "@/i18n/server";
import { localizeContent } from "@/i18n/content";
import { addDays, localDateTime } from "@/lib/calendar";
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
      start: localDateTime(startDate, "00:00"),
      end: localDateTime(addDays(endDate, 1), "00:00"),
    },
  });

  return localizeContent(data, await getLocale()) as CalendarData;
}

export async function getParishPlaces() {
  const { data } = await sanityFetch({
    ...published,
    query: PARISH_PLACES_QUERY,
  });
  return localizeContent(data, await getLocale()) as Place[];
}

export async function getActiveAnnouncements(now: string) {
  const { data } = await sanityFetch({
    ...published,
    query: ACTIVE_ANNOUNCEMENTS_QUERY,
    params: { now },
  });
  return localizeContent(data, await getLocale()) as Announcement[];
}

export async function getLatestArticles() {
  const { data } = await sanityFetch({
    ...published,
    query: LATEST_ARTICLES_QUERY,
  });
  return localizeContent(data, await getLocale()) as ArticleCard[];
}

export async function getLatestBulletins() {
  const { data } = await sanityFetch({
    ...published,
    query: LATEST_BULLETINS_QUERY,
  });
  return localizeContent(data, await getLocale()) as Bulletin[];
}

export async function getAnnouncementsByBulletins(bulletinIds: string[]) {
  if (bulletinIds.length === 0) return [];
  const { data } = await sanityFetch({
    ...published,
    query: ANNOUNCEMENTS_BY_BULLETINS_QUERY,
    params: { bulletinIds },
  });
  return localizeContent(data, await getLocale()) as Announcement[];
}

export async function getAllArticles() {
  const { data } = await sanityFetch({
    ...published,
    query: ALL_ARTICLES_QUERY,
  });
  return localizeContent(data, await getLocale()) as ArticleCard[];
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
  return localizeContent(data, await getLocale()) as Article | null;
});

export const getEvent = cache(async (slug: string) => {
  const { data } = await sanityFetch({
    ...published,
    query: EVENT_QUERY,
    params: { slug },
  });
  return localizeContent(data, await getLocale()) as ParishEvent | null;
});

export const getMassText = cache(async (date: string, scheduleKey: string) => {
  const { data } = await sanityFetch({
    ...published,
    query: MASS_TEXT_QUERY,
    params: { date, scheduleKey },
  });
  return data as MassText | null;
});
