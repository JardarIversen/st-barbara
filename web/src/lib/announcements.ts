import type { Announcement } from "@/sanity/types";

export function rankAnnouncements(items: Announcement[], now = new Date()) {
  const nowMs = now.getTime();

  function score(item: Announcement) {
    const mentioned = new Date(item.lastMentionedAt ?? item.publishedAt).getTime();
    const daysSinceMention = Math.max(0, (nowMs - mentioned) / 86_400_000);
    const recency = Math.max(0, 30 - daysSinceMention);
    const daysRemaining = item.appliesUntil
      ? (new Date(item.appliesUntil).getTime() - nowMs) / 86_400_000
      : Number.POSITIVE_INFINITY;
    // An end date only counts as a deadline when there is something to do before it:
    // a report, such as last Sunday's collection, also ends but asks nothing of the reader.
    const actionable = Boolean(
      item.eventStartsAt ||
        item.registrationDeadline ||
        item.relatedEvents?.length ||
        item.links?.length,
    );
    const deadline = !actionable
      ? 0
      : daysRemaining <= 7
        ? 20
        : daysRemaining <= 30
          ? 10
          : 0;
    const priority =
      item.priority === "urgent" ? 40 : item.priority === "important" ? 20 : 0;
    return recency + deadline + priority + (actionable ? 10 : 0);
  }

  return items.toSorted((a, b) => {
    const relevance = score(b) - score(a);
    if (relevance) return relevance;
    return new Date(b.lastMentionedAt ?? b.publishedAt).getTime()
      - new Date(a.lastMentionedAt ?? a.publishedAt).getTime();
  });
}
