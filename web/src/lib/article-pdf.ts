/** Only embed PDFs hosted in this parish's Sanity dataset. Other links stay links. */
export function isArticlePdf(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.origin === "https://cdn.sanity.io" &&
      /^\/files\/2jd536j2\/production\/[^/]+\.pdf$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}
