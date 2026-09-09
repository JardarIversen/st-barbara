import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "@/i18n/link";
import ContentLanguage from "@/components/content-language";
import SanityImage from "@/components/sanity-image";
import { buttonVariants } from "@/components/ui/button";
import { formatArticleDate } from "@/lib/calendar";
import { articleListTitle, isCouncilArticle } from "@/lib/article-list";
import { getAllArticles } from "@/sanity/data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Innlegg"),
    description: t("Nyheter og artikler fra St. Barbara menighet."),
  };
}

export default async function InnleggPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const [{ locale, t }, articles, query] = await Promise.all([
    getTranslations(), getAllArticles(), searchParams,
  ]);
  const category = query.category === "council" || query.category === "other"
    ? query.category : "all";
  const visible = articles.filter((article) => category === "all" ||
    (category === "council" ? isCouncilArticle(article) : !isCouncilArticle(article)));
  const filters = [
    { value: "all", label: t("Alle") },
    { value: "council", label: t("Menighetsråd") },
    { value: "other", label: t("Øvrige innlegg") },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:py-16">
      <h1 className="font-display text-5xl font-medium leading-tight text-foreground">
        {t("Innlegg")}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        {t("Nyheter og artikler fra menigheten.")}
      </p>
      <nav aria-label={t("Filtrer innlegg")} className="mt-7 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link key={filter.value}
            href={filter.value === "all" ? "/innlegg" : `/innlegg?category=${filter.value}`}
            scroll={false}
            aria-current={category === filter.value ? "page" : undefined}
            className={buttonVariants({ variant: category === filter.value ? "default" : "ghost", size: "sm" })}
          >{filter.label}</Link>
        ))}
      </nav>
      <div className="mt-6 divide-y divide-border border-y border-border">
        {visible.map((article) => (
          <article key={article._id} className="flex items-start gap-5 py-6 sm:gap-8 sm:py-7">
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt, locale)}</time>
                {" · "}{article.category ?? t("Fra menigheten")}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                <Link href={`/innlegg/${article.slug}`} className="focus-ring rounded-sm underline-offset-4 hover:text-primary hover:underline">
                  <ContentLanguage original={article.originalFields?.includes("title")}>
                    {articleListTitle(article)}
                  </ContentLanguage>
                </Link>
              </h2>
              {article.summary && (
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  <ContentLanguage original={article.originalFields?.includes("summary")}>
                    {article.summary}
                  </ContentLanguage>
                </p>
              )}
            </div>
            {article.mainImage && (
              <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-48">
                <SanityImage image={article.mainImage} sizes="(min-width: 640px) 192px, 96px" className="object-cover" />
              </div>
            )}
          </article>
        ))}
      </div>
      {visible.length === 0 && <p className="py-8 text-muted-foreground">{t("Ingen innlegg her ennå.")}</p>}
    </div>
  );
}
