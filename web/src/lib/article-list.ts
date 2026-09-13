type ArticleIdentity = { sourceKey: string; category?: string; title: string };

// Only destinations implemented by the site may replace an article route.
export function articlePagePath(article: { pagePath?: string }) {
  return article.pagePath === "/katekese" ? article.pagePath : undefined;
}

export function articleHref(article: { pagePath?: string; slug: string }) {
  return articlePagePath(article) ?? `/innlegg/${article.slug}`;
}

export function isCouncilArticle(article: ArticleIdentity) {
  return (
    article.sourceKey.startsWith("article:parish-council:") ||
    ["menighetsråd", "parish council"].includes(
      article.category?.toLowerCase() ?? "",
    )
  );
}

export function articleListTitle(article: ArticleIdentity) {
  if (!isCouncilArticle(article)) return article.title;
  // Only remove a date suffix from the standard minutes title, not other council news.
  return article.title.replace(
    /^(Menighetsrådsreferat|Parish Council minutes)\s+[–—-]\s+\d{1,2}\.?\s+\S+\s+\d{4}$/i,
    "$1",
  );
}
