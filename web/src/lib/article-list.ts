type ArticleIdentity = { sourceKey: string; category?: string; title: string };

export function isCouncilArticle(article: ArticleIdentity) {
  return article.sourceKey.startsWith("article:parish-council:") ||
    ["menighetsråd", "parish council"].includes(article.category?.toLowerCase() ?? "");
}

export function articleListTitle(article: ArticleIdentity) {
  if (!isCouncilArticle(article)) return article.title;
  // Only remove a date suffix from the standard minutes title, not other council news.
  return article.title.replace(
    /^(Menighetsrådsreferat|Parish Council minutes)\s+[–—-]\s+\d{1,2}\.?\s+\S+\s+\d{4}$/i,
    "$1",
  );
}
