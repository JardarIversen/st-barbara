import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/i18n/link";
import ContentLanguage from "@/components/content-language";
import PortableContent from "@/components/portable-content";
import SacramentNav from "@/components/sacrament-nav";
import { SACRAMENTS_PATH, findSacrament, sacramentPath } from "@/lib/sacraments";
import { shareMetadata } from "@/lib/share";
import { getArticleByPagePath } from "@/sanity/data";

// Locale and canonical URLs depend on request headers, as on the other pages.

async function getSacramentPage(slug: string) {
  const sacrament = findSacrament(slug);
  if (!sacrament) return null;
  return getArticleByPagePath(sacramentPath(sacrament.slug));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { locale } = await getTranslations();
  const content = await getSacramentPage((await params).slug);
  if (!content) return {};
  return {
    title: content.title,
    description: content.summary,
    ...shareMetadata(locale, { title: content.title, image: content.mainImage }),
  };
}

export default async function SacramentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { t } = await getTranslations();
  const { slug } = await params;
  const content = await getSacramentPage(slug);
  if (!content) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
        <article className="min-w-0 max-w-3xl [overflow-wrap:anywhere]">
          <p className="text-sm font-semibold text-primary">
            <Link
              href={SACRAMENTS_PATH}
              className="focus-ring rounded-sm underline-offset-4 hover:underline"
            >
              {t("Sakramenter")}
            </Link>
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            <ContentLanguage original={content.originalFields?.includes("title")}>
              {content.title}
            </ContentLanguage>
          </h1>
          <div className="mt-8">
            <PortableContent
              value={content.body}
              original={content.originalFields?.includes("body")}
            />
          </div>
          <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
            {t("Har du spørsmål, ta gjerne kontakt med prestene.")}{" "}
            <Link
              href="/kontakt"
              className="focus-ring rounded-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("Kontakt menigheten")}
            </Link>
          </p>
        </article>
        <SacramentNav current={slug} />
      </div>
    </div>
  );
}
