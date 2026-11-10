"use client";

import { useTranslations } from "@/i18n/client";

import Link from "@/i18n/link";
import ContentLanguage from "./content-language";
import type { ArticleCard as ArticleCardType } from "@/sanity/types";
import { formatArticleDate } from "@/lib/calendar";
import SanityImage from "./sanity-image";
import { articleHref, articleListTitle } from "@/lib/article-list";

export default function ArticleCard({
  article,
  lead = false,
}: {
  article: ArticleCardType;
  /** The newest article on the front page: the picture is set large above the text. */
  lead?: boolean;
}) {
  const { locale, t } = useTranslations();
  return (
    <article
      className={
        lead
          ? "flex flex-col-reverse gap-5"
          : "flex items-start gap-5 border-t border-border pt-5 first:border-t-0 first:pt-0"
      }
    >
      <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">
        <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt, locale)}</time>
        {" · "}{article.category ?? t("Fra menigheten")}
      </p>
      <h3
        className={`mt-1.5 font-display font-semibold leading-snug text-foreground ${lead ? "text-3xl sm:text-4xl" : "text-2xl"}`}
      >
        <Link
          href={articleHref(article)}
          className="focus-ring rounded-sm underline-offset-4 hover:text-primary hover:underline"
        >
          <ContentLanguage original={article.originalFields?.includes("title")}>
            {articleListTitle(article)}
          </ContentLanguage>
        </Link>
      </h3>
      {article.summary && (
        <p
          className={`mt-2 leading-relaxed text-muted-foreground ${lead ? "max-w-xl" : "text-sm"}`}
        >
          <ContentLanguage
            original={article.originalFields?.includes("summary")}
          >
            {article.summary}
          </ContentLanguage>
        </p>
      )}
      </div>
      {article.mainImage ? (
        <div
          className={
            lead
              ? "relative aspect-[3/2] w-full overflow-hidden rounded-sm bg-muted"
              : "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-sm bg-muted lg:w-32"
          }
        >
          <SanityImage
            image={article.mainImage}
            sizes={
              lead
                ? "(min-width: 1024px) 600px, 100vw"
                : "(min-width: 1024px) 128px, 96px"
            }
            className="object-cover"
          />
        </div>
      ) : null}
    </article>
  );
}
