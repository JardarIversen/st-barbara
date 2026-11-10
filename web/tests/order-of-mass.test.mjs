import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  ORDER_OF_MASS,
  ORDER_OF_MASS_SOURCE,
  READINGS_SCHEDULE_KEY,
  PRAYERS,
  PRAYER_OPENINGS,
  chooseTodaysMass,
  defaultMode,
  defaultPrayer,
  easterSunday,
  eucharisticPrayer,
  liturgicalSeason,
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
      .filter((role) => role && role !== "ep-or");
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

const blocks = (language) => ORDER_OF_MASS[language].flatMap((section) => section.blocks);
const text = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

test("every Eucharistic Prayer is there once, and its first words name it in the list", () => {
  for (const language of ["nb", "en"]) {
    for (const prayer of PRAYERS[language]) {
      const own = blocks(language).filter((block) => block.ep === prayer);
      assert.equal(
        own.filter((block) => block.part === `eucharistic-prayer-${prayer}`).length,
        1,
        `${language} ${prayer}`,
      );
      const opening = PRAYER_OPENINGS[language][prayer].opening
        .replace(/[«»“”…]/g, "")
        .trim();
      assert.ok(
        own.some((block) => text(block.html).startsWith(opening)),
        `${language} ${prayer}: ${opening}`,
      );
    }
  }
  // Prayer IV brings its own Preface, so the usual one gives way.
  assert.equal(blocks("nb").filter((block) => block.epExcept === "4").length, 1);
  assert.equal(eucharisticPrayer("4", "en"), null);
  assert.equal(eucharisticPrayer(["1"], "nb"), "1");
});

test("the Sunday sentence of Prayers II and III gives way to the weekday form", () => {
  const nb = blocks("nb");
  const sunday = nb.filter((block) => block.html.includes('class="kun-hoymesse"'));
  assert.deepEqual(
    sunday.map((block) => block.ep),
    ["1", "2", "2", "3"],
    "the Sunday Communicantes in I, two sentences in II, one in III",
  );
  const weekday = nb.find((block) => block.ep === "3" && block.html.includes("kun-hverdag"));
  assert.equal(text(weekday.html), "Derfor bønnfaller vi deg, Herre:");
  for (const language of ["nb", "en"]) {
    const groups = new Set(blocks(language).map((block) => block.group).filter(Boolean));
    assert.deepEqual([...groups], ["gloria", "creed", "offertory-prayers"]);
  }
});

test("Sunday or weekday, and the seasons without the Gloria", () => {
  assert.equal(defaultMode("2026-11-08"), "hoymesse");
  assert.equal(defaultMode("2026-11-09"), "hverdag");
  assert.equal(defaultPrayer("hoymesse"), "3");
  assert.equal(defaultPrayer("hverdag"), "2");
  assert.equal(easterSunday(2026), "2026-04-05");
  assert.equal(easterSunday(2027), "2027-03-28");
  assert.equal(liturgicalSeason("2026-02-17"), null); // the day before Ash Wednesday
  assert.equal(liturgicalSeason("2026-02-18"), "lent"); // Ash Wednesday
  assert.equal(liturgicalSeason("2026-04-01"), "lent"); // Wednesday of Holy Week
  assert.equal(liturgicalSeason("2026-04-02"), null); // Holy Thursday has the Gloria
  assert.equal(liturgicalSeason("2026-11-28"), null);
  assert.equal(liturgicalSeason("2026-11-29"), "advent"); // the first Sunday of Advent
  assert.equal(liturgicalSeason("2026-12-24"), "advent");
  assert.equal(liturgicalSeason("2026-12-25"), null);
  assert.equal(liturgicalSeason("2022-11-27"), "advent"); // Christmas on a Sunday
});

test("the Gospel verse is taken from the acclamation without its responses", async () => {
  const { acclamationVerse } = await import("../src/lib/order-of-mass.ts");
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
  const span = (text) => ({ _type: "span", text });
  const body = [
    heading("1. lesning – Visd 6,12–16"),
    paragraph("Lesning"),
    heading("Responsoriesalme – Sal 63"),
    paragraph("Salme"),
    heading("Evangelievers – Matt 24,42a.44"),
    {
      _type: "block",
      style: "acclamation",
      children: [
        span("℟"),
        span(" Halleluja. "),
        span("℣"),
        span(" Så våk da!\nFor Menneskesønnen kan komme."),
        span(" "),
        span("℟"),
        span(" Halleluja."),
      ],
    },
    heading("Evangelium – Matt 25,1–13"),
    paragraph("Evangelium"),
  ];
  assert.deepEqual(acclamationVerse(body), {
    lines: ["Så våk da!", "For Menneskesønnen kan komme."],
    reference: "Matt 24,42a.44",
  });
  assert.equal(acclamationVerse(body.slice(0, 4)), null);
  assert.equal(acclamationVerse(null), null);
});
