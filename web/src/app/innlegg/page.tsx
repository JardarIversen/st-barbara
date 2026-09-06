import type { Metadata } from "next";
import ArticleCard from "@/components/article-card";
import { getAllArticles } from "@/sanity/data";

export const metadata: Metadata = {
  title: "Innlegg",
  description: "Nyheter og artikler fra St. Barbara menighet.",
};

export default async function InnleggPage() {
  const articles = await getAllArticles();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
      <h1 className="font-display text-5xl font-medium leading-tight text-ink">Innlegg</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone">Nyheter og artikler fra menigheten.</p>
      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => <ArticleCard key={article._id} article={article} />)}
      </div>
    </div>
  );
}
