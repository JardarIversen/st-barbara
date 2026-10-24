import type { MetadataRoute } from "next";
import { locales, localizedPath } from "@/i18n/config";
import { articlePagePath } from "@/lib/article-list";
import { absoluteUrl } from "@/lib/site";
import { getSitemapDocuments } from "@/sanity/data";

const PAGES = [
  "/",
  "/messetider",
  "/kunngjoringer",
  "/innlegg",
  "/katekese",
  "/om",
  "/kontakt",
  "/donasjoner",
];

// Every page is listed in both edited languages, each pointing to the other.
function bothLanguages(path: string, lastModified?: string) {
  const languages = {
    nb: absoluteUrl(localizedPath(path, "nb")),
    en: absoluteUrl(localizedPath(path, "en")),
    "x-default": absoluteUrl(localizedPath(path, "nb")),
  };
  return locales.map((locale) => ({
    url: languages[locale],
    lastModified,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles, events, announcements } = await getSitemapDocuments();
  return [
    ...PAGES.flatMap((path) => bothLanguages(path)),
    // Articles with their own page, such as catechesis, are already listed above.
    ...articles
      .filter((article) => !articlePagePath(article))
      .flatMap((article) =>
        bothLanguages(`/innlegg/${article.slug}`, article._updatedAt),
      ),
    ...events.flatMap((event) =>
      bothLanguages(`/messetider/${event.slug}`, event._updatedAt),
    ),
    ...announcements.flatMap((announcement) =>
      bothLanguages(
        `/kunngjoringer/${announcement.slug}`,
        announcement._updatedAt,
      ),
    ),
  ];
}
