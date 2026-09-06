"use client";

import { useTranslations } from "@/i18n/client";

import Link from "@/i18n/link";
import ContentLanguage from "./content-language";
import type { ArticleCard as ArticleCardType } from "@/sanity/types";
import { formatArticleDate } from "@/lib/calendar";
import SanityImage from "./sanity-image";

export default function ArticleCard({ article }: { article: ArticleCardType }) {
  const { locale, t } = useTranslations();
  return (
    <article
      className={`group flex flex-col border-t pt-5 ${article.mainImage ? "border-border" : "border-primary/40"}`}
    >
      {article.mainImage ? (
        <Link
          href={`/innlegg/${article.slug}`}
          className="relative mb-4 block aspect-[16/9] overflow-hidden rounded-sm bg-muted"
        >
          <SanityImage
            image={article.mainImage}
            sizes="(min-width: 1024px) 280px, 90vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </Link>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {article.category ?? t("Fra menigheten")} ·{" "}
        {formatArticleDate(article.publishedAt, locale)}
      </p>
      <h3 className="mt-1.5 font-display text-2xl font-semibold leading-snug text-foreground">
        <Link
          href={`/innlegg/${article.slug}`}
          className="transition-colors hover:text-primary"
        >
          <ContentLanguage original={article.originalFields?.includes("title")}>
            {article.title}
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
      <Link
        href={`/innlegg/${article.slug}`}
        className="mt-auto pt-5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        aria-label={`${t("Les")} ${article.title}`}
      >
        {t("Les innlegget")} <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
