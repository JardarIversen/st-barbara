import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "@/i18n/link";
import { buttonVariants } from "@/components/ui/button";
import ContentLanguage from "@/components/content-language";
import { notFound } from "next/navigation";
import PortableContent from "@/components/portable-content";
import SanityImage from "@/components/sanity-image";
import SourceBulletins from "@/components/source-bulletins";
import { formatArticleDate } from "@/lib/calendar";
import { getArticle } from "@/sanity/data";
import { isArticlePdf } from "@/lib/article-pdf";

// Locale and canonical URLs depend on request headers, as on the other pages.
// Do not opt this route into static fallback rendering with generateStaticParams.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  return { title: article.title, description: article.summary };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { locale, t } = await getTranslations();
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
      <p className="text-sm text-muted-foreground/80">
        {article.category ?? t("Fra menigheten")} ·{" "}
        {formatArticleDate(article.publishedAt, locale)}
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
        <ContentLanguage original={article.originalFields?.includes("title")}>
          {article.title}
        </ContentLanguage>
      </h1>
      {article.summary && (
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          <ContentLanguage
            original={article.originalFields?.includes("summary")}
          >
            {article.summary}
          </ContentLanguage>
        </p>
      )}
      {locale === "en" &&
        ["pastoralLetter", "letter"].includes(article.articleType) && (
          <p className="mt-5 border-l-2 border-brand pl-4 text-sm text-muted-foreground">
            English translation of the Norwegian original.{" "}
            <a
              className="text-primary underline underline-offset-2"
              href={`/nb/innlegg/${article.slug}`}
            >
              Read the original
            </a>
          </p>
        )}

      {article.mainImage && (
        <figure className="mt-10">
          <div className="relative aspect-[3/2] overflow-hidden rounded-sm border border-border">
            <SanityImage
              image={article.mainImage}
              priority
              sizes="(min-width: 768px) 720px, 95vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            {article.mainImage.alt}
          </figcaption>
        </figure>
      )}

      <div className="mt-10">
        <PortableContent
          value={article.body}
          original={article.originalFields?.includes("body")}
        />
      </div>

      {article.links?.length ? (
        <div className="mt-9 flex flex-wrap gap-4">
          {article.links.map((link) => (
            <a
              key={link._key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants()}
            >
              {isArticlePdf(link.url) ? t("Åpne PDF i ny fane") : link.label}
            </a>
          ))}
        </div>
      ) : null}

      {article.links?.filter((link) => isArticlePdf(link.url)).map((link) => (
        <section key={link._key} aria-label={link.label} className="mt-6">
          <iframe
            src={`${link.url.split("#")[0]}#view=FitH&navpanes=0`}
            title={`${article.title} – PDF`}
            className="h-[75svh] min-h-96 w-full rounded-sm border border-border bg-muted"
          />
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("Hvis PDF-en ikke vises i nettleseren din, bruk knappen over for å åpne den i en ny fane.")}
          </p>
        </section>
      ))}

      <SourceBulletins bulletins={article.sourceBulletins} />
      <div className="mt-14 border-t border-border pt-6">
        <Link
          href="/innlegg"
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("← Alle innlegg")}
        </Link>
      </div>
    </article>
  );
}
