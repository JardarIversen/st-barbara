import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PortableContent from "@/components/portable-content";
import SanityImage from "@/components/sanity-image";
import SourceBulletins from "@/components/source-bulletins";
import { formatArticleDate } from "@/lib/calendar";
import { getArticle, getArticleSlugs } from "@/sanity/data";

export async function generateStaticParams() {
  return getArticleSlugs();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  return { title: article.title, description: article.summary };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
      <p className="text-sm text-stone/80">{article.category ?? "Fra menigheten"} · {formatArticleDate(article.publishedAt)}</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{article.title}</h1>
      {article.summary && <p className="mt-5 text-lg leading-relaxed text-stone">{article.summary}</p>}

      {article.mainImage && (
        <figure className="mt-10">
          <div className="relative aspect-[3/2] overflow-hidden rounded-sm border border-line">
            <SanityImage image={article.mainImage} priority sizes="(min-width: 768px) 720px, 95vw" className="object-cover" />
          </div>
          <figcaption className="mt-2 text-xs text-stone">{article.mainImage.alt}</figcaption>
        </figure>
      )}

      <div className="mt-10"><PortableContent value={article.body} /></div>

      {article.links?.length ? (
        <div className="mt-9 flex flex-wrap gap-4">
          {article.links.map((link) => (
            <a key={link._key} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-sm bg-burgundy px-5 py-2.5 text-sm font-medium text-paper hover:bg-burgundy-deep">{link.label}</a>
          ))}
        </div>
      ) : null}

      <SourceBulletins bulletins={article.sourceBulletins} />
      <div className="mt-14 border-t border-line pt-6">
        <Link href="/innlegg" className="text-sm font-medium text-burgundy underline-offset-2 hover:underline">← Alle innlegg</Link>
      </div>
    </article>
  );
}
