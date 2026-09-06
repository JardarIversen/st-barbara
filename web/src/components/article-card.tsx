import Link from "next/link";
import type { ArticleCard as ArticleCardType } from "@/sanity/types";
import { formatArticleDate } from "@/lib/calendar";
import SanityImage from "./sanity-image";

export default function ArticleCard({ article }: { article: ArticleCardType }) {
  return (
    <article className="group border-t border-line pt-5">
      {article.mainImage ? (
        <Link
          href={`/innlegg/${article.slug}`}
          className="relative mb-4 block aspect-[16/9] overflow-hidden rounded-sm bg-cream"
        >
          <SanityImage
            image={article.mainImage}
            sizes="(min-width: 1024px) 280px, 90vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </Link>
      ) : (
        <Link
          href={`/innlegg/${article.slug}`}
          aria-label={article.title}
          className="mb-4 flex aspect-[16/9] items-center justify-center rounded-sm border border-line bg-cream text-center"
        >
          <span>
            <span aria-hidden className="block font-display text-3xl text-gold">✠</span>
            <span className="mt-1 block text-[0.65rem] font-medium uppercase tracking-[0.2em] text-stone">
              {article.category ?? "Fra menigheten"}
            </span>
          </span>
        </Link>
      )}
      <p className="text-xs text-stone/80">
        {article.category ?? "Fra menigheten"} · {formatArticleDate(article.publishedAt)}
      </p>
      <h3 className="mt-1.5 font-display text-2xl font-semibold leading-snug text-ink">
        <Link href={`/innlegg/${article.slug}`} className="transition-colors hover:text-burgundy">
          {article.title}
        </Link>
      </h3>
      {article.summary && (
        <p className="mt-2 text-sm leading-relaxed text-stone">{article.summary}</p>
      )}
    </article>
  );
}
