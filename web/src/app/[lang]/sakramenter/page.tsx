import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "@/i18n/link";
import ContentLanguage from "@/components/content-language";
import { SACRAMENTS, SACRAMENT_PATHS, sacramentPath } from "@/lib/sacraments";
import { shareMetadata } from "@/lib/share";
import { getSacramentArticles } from "@/sanity/data";

const INTRODUCTION =
  "Praktisk informasjon om sakramentene og andre kirkelige handlinger i St. Barbara menighet: hva Kirken tilbyr, og hvordan du avtaler med presten.";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslations();
  const title = t("Sakramenter");
  return {
    title,
    description: t(INTRODUCTION),
    ...shareMetadata(locale, { title }),
  };
}

export default async function SacramentsPage() {
  const { t } = await getTranslations();
  const articles = await getSacramentArticles(SACRAMENT_PATHS);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
      <h1 className="font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
        {t("Sakramenter")}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        {t(INTRODUCTION)}
      </p>

      <ul className="mt-10 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
        {SACRAMENTS.map((sacrament) => {
          const path = sacramentPath(sacrament.slug);
          const article = articles.find((item) => item.pagePath === path);
          return (
            <li key={sacrament.slug} className="flex bg-background">
              <Link
                href={path}
                className="group block w-full p-6 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-(length:--focus-width) focus-visible:outline-ring focus-visible:-outline-offset-4 sm:p-8"
              >
                <h2 className="font-display text-2xl font-semibold text-foreground group-hover:text-primary">
                  <ContentLanguage
                    original={article?.originalFields?.includes("title")}
                  >
                    {article?.title ?? t(sacrament.label)}
                  </ContentLanguage>{" "}
                  <span aria-hidden className="text-primary">
                    →
                  </span>
                </h2>
                {article?.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    <ContentLanguage
                      original={article.originalFields?.includes("summary")}
                    >
                      {article.summary}
                    </ContentLanguage>
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
