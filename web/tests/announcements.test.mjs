import assert from "node:assert/strict";
import test from "node:test";
import { rankAnnouncements } from "../src/lib/announcements.ts";

const now = new Date("2026-11-10T12:00:00Z");
const notice = (fields) => ({
  _id: fields.title,
  slug: fields.title,
  status: "active",
  priority: "normal",
  publishedAt: "2026-11-08T10:00:00Z",
  body: [],
  ...fields,
});

test("something to attend or do outranks a report that merely expires soon", () => {
  const ranked = rankAnnouncements(
    [
      notice({ title: "collection", appliesUntil: "2026-11-15T23:00:00Z" }),
      notice({
        title: "trip",
        appliesUntil: "2026-11-15T23:00:00Z",
        relatedEvents: [{ title: "Messe", slug: "messe" }],
      }),
    ],
    now,
  );
  assert.deepEqual(ranked.map((item) => item.title), ["trip", "collection"]);
});

test("priority set by the editor outranks recency", () => {
  const ranked = rankAnnouncements(
    [
      notice({ title: "new" }),
      notice({
        title: "urgent",
        priority: "urgent",
        publishedAt: "2026-10-25T10:00:00Z",
      }),
    ],
    now,
  );
  assert.equal(ranked[0].title, "urgent");
});
