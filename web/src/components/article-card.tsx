"use client";

import { useTranslations } from "@/i18n/client";

import Link from "@/i18n/link";
import ContentLanguage from "./content-language";
import type { ArticleCard as ArticleCardType } from "@/sanity/types";
import { formatArticleDate } from "@/lib/calendar";
import SanityImage from "./sanity-image";
import { articleListTitle } from "@/lib/article-list";

export default function ArticleCard({ article }: { article: ArticleCardType }) {
  const { locale, t } = useTranslations();
  return (
    <article className="flex items-start gap-5 border-t border-border pt-5">
      <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">
        <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt, locale)}</time>
        {" · "}{article.category ?? t("Fra menigheten")}
      </p>
      <h3 className="mt-1.5 font-display text-2xl font-semibold leading-snug text-foreground">
        <Link
          href={`/innlegg/${article.slug}`}
          className="focus-ring rounded-sm underline-offset-4 hover:text-primary hover:underline"
        >
          <ContentLanguage original={article.originalFields?.includes("title")}>
            {articleListTitle(article)}
          </ContentLanguage>
        </Link>
      </h3>
      {article.summary && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <ContentLanguage
            original={article.originalFields?.includes("summary")}
          >
            {article.summary}
          </ContentLanguage>
        </p>
      )}
      </div>
      {article.mainImage ? (
        <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-sm bg-muted lg:w-32">
          <SanityImage image={article.mainImage} sizes="(min-width: 1024px) 128px, 96px" className="object-cover" />
        </div>
      ) : null}
    </article>
  );
}
