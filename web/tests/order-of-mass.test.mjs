import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  ORDER_OF_MASS,
  ORDER_OF_MASS_SOURCE,
  READINGS_SCHEDULE_KEY,
  chooseTodaysMass,
  liturgyLanguage,
  readingCandidates,
  splitReadings,
} from "../src/lib/order-of-mass.ts";

const repo = new URL("../../", import.meta.url);

test("the website's order of Mass follows the printed booklet", () => {
  const booklet = readFileSync(new URL(ORDER_OF_MASS_SOURCE.file, repo));
  assert.equal(
    createHash("sha256").update(booklet).digest("hex"),
    ORDER_OF_MASS_SOURCE.sha256,
    "The booklet has changed: run liturgihefte/til-nettsiden.py (bygg.sh does it).",
  );
  for (const icon of ["staende", "sittende", "knelende"])
    assert.deepEqual(
      readFileSync(new URL(`web/public/liturgi/${icon}.svg`, repo)),
      readFileSync(new URL(`liturgihefte/ikoner/${icon}.svg`, repo)),
    );
});

test("both languages mark every place a reading goes", () => {
  for (const language of ["nb", "en"]) {
    const roles = ORDER_OF_MASS[language]
      .flatMap((section) => section.blocks)
      .map((block) => block.role)
      .filter(Boolean);
    assert.deepEqual(roles, [
      "reading-response-priest",
      "reading-response-all",
      "psalm-heading",
      "psalm-placeholder",
      "acclamation-heading",
      "acclamation-placeholder",
      "gospel-heading",
      "gospel-placeholder",
    ]);
  }
  assert.equal(liturgyLanguage(["en"]), "en");
  assert.equal(liturgyLanguage("pl"), null);
});

const heading = (text) => ({
  _type: "block",
  style: "h2",
  children: [{ _type: "span", text }],
});
const paragraph = (text) => ({
  _type: "block",
  style: "normal",
  children: [{ _type: "span", text }],
});

test("newsletter readings split into the parts of the Liturgy of the Word", () => {
  const readings = splitReadings([
    heading("1. lesning – Visd 6, 12–16"),
    paragraph("Visdommen er som et strålende lys."),
    heading("Responsoriesalme"),
    paragraph("Min sjel tørster etter den levende Gud."),
    heading("2. lesning – 1 Tess 4, 13–18"),
    paragraph("Brødre, vi vil ikke at dere skal være uvitende."),
    heading("Evangelievers"),
    paragraph("Halleluja."),
    heading("Evangelium – Matt 25, 1–13"),
    paragraph("Himlenes rike kan lignes med ti terner."),
  ]);
  assert.equal(readings.firstReading.heading, "1. lesning – Visd 6, 12–16");
  assert.equal(readings.psalm.reference, "");
  assert.equal(readings.gospel.reference, "Matt 25, 1–13");
  assert.equal(readings.secondReading.blocks.length, 1);

  // Weekdays have no second reading.
  assert.ok(
    splitReadings([
      heading("1. lesning"),
      heading("Responsoriesalme"),
      heading("Evangelium"),
    ]),
  );
  // Palm Sunday opens with the Gospel of the procession: shown together instead.
  assert.equal(
    splitReadings([
      heading("Evangelium Mat 21, 1–11"),
      heading("1. lesning Jes 50, 4-7"),
      heading("Responsoriesalme"),
      heading("2. lesning Fil 2,6-11"),
    ]),
    null,
  );
  assert.equal(splitReadings([paragraph("Uten overskrift")]), null);
  assert.equal(splitReadings([heading("Prekenen")]), null);
  assert.equal(splitReadings(undefined), null);
});

const mass = (id, start, extra = {}) => ({
  id,
  kind: "mass",
  eventType: "mass",
  title: "Messe",
  slug: id,
  href: `/messetider/${id}`,
  startsAt: start,
  endsAt: new Date(new Date(start).getTime() + 60 * 60_000).toISOString(),
  dateKey: start.slice(0, 10),
  status: "scheduled",
  places: [],
  regionKeys: ["kongsberg"],
  sourceBulletins: [],
  scheduleId: `schedule-${id}`,
  occurrenceDate: start.slice(0, 10),
  ...extra,
});

test("today's Mass is the one going on now, or the next one in Kongsberg", () => {
  const high = mass("nb", "2026-11-08T11:00:00+01:00", {
    language: "nb",
    scheduleKey: READINGS_SCHEDULE_KEY,
  });
  const english = mass("en", "2026-11-08T13:00:00+01:00", { language: "en" });
  const notodden = mass("notodden", "2026-11-08T17:00:00+01:00", {
    regionKeys: ["notodden"],
  });
  const items = [notodden, english, high];
  const at = (time) =>
    chooseTodaysMass(items, "2026-11-08", new Date(`2026-11-08T${time}+01:00`));

  assert.equal(at("08:00:00").mass, high);
  assert.equal(at("12:20:00").mass, high); // still reading on after Mass
  assert.equal(at("12:40:00").mass, english);
  assert.equal(at("21:00:00").mass, english); // the last Mass, never Notodden
  assert.equal(chooseTodaysMass(items, "2026-11-09", new Date()), null);

  // The English Mass uses the Sunday Mass's readings, marked as such on the page.
  assert.deepEqual(readingCandidates(english, items), [english, high]);
  assert.deepEqual(readingCandidates(high, items), [high]);

  const cancelled = { ...high, status: "cancelled" };
  assert.deepEqual(
    chooseTodaysMass([cancelled], "2026-11-08", new Date("2026-11-08T08:00:00+01:00")),
    { mass: cancelled, cancelled: true },
  );
  assert.equal(
    chooseTodaysMass([cancelled, english], "2026-11-08", new Date("2026-11-08T08:00:00+01:00")).mass,
    english,
  );
});
