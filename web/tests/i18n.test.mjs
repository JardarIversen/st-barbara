import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { getTranslator } from "../src/i18n/translate.ts";
import { localizedPath, isLocale } from "../src/i18n/config.ts";
import { localizeContent } from "../src/i18n/content.ts";
import {
  buildCalendarItems,
  formatCalendarDate,
  formatCalendarTime,
} from "../src/lib/calendar.ts";
import {
  prepareTranslations,
  translationErrors,
} from "../../studio-st.-barbara-church/scripts/lib/translations.mjs";
import ts from "typescript";
import { sourceFingerprint } from "../src/i18n/translation-source.mjs";
import { planTranslation } from "../../studio-st.-barbara-church/scripts/lib/migrate-translations.mjs";
import {
  LANGUAGES,
  PRIMARY_LANGUAGES,
  languageCode,
  translationLanguage,
  languageSearchText,
} from "../src/i18n/languages.ts";
import { LANGUAGE_FLAGS } from "../src/i18n/language-flags.ts";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("church terminology uses checked English, not ambiguous machine translation", () => {
  const t = getTranslator("en");
  assert.equal(t("Messetider"), "Mass times");
  assert.equal(t("Kirkevigselen"), "Consecration of the church");
  assert.equal(t("Messesteder"), "Where we celebrate Holy Mass");
  assert.equal(t("Messe"), "Holy Mass");
  assert.equal(getTranslator("nb")("Messetider"), "Messetider");
});

test("language switching preserves page, query and anchor without duplicating locale", () => {
  assert.equal(
    localizedPath("/nb/messetider/example?place=mo#readings", "en"),
    "/en/messetider/example?place=mo#readings",
  );
  assert.equal(localizedPath("/en", "nb"), "/nb");
  assert.equal(localizedPath("/", "en"), "/en");
  assert.equal(
    localizedPath("https://example.com", "en"),
    "https://example.com",
  );
  assert.equal(localizedPath("//example.com", "en"), "//example.com");
  assert.equal(isLocale("pl"), false);
});

test("all literal translation keys in pages/components have an English entry", () => {
  const dictionary = JSON.parse(
    readFileSync(new URL("../src/i18n/en.json", import.meta.url), "utf8"),
  );
  const root = new URL("../src/", import.meta.url);
  const missing = [];
  for (const filename of readdirSync(root, { recursive: true }).filter((file) =>
    file.endsWith(".tsx"),
  )) {
    const source = readFileSync(
      new URL(filename.replaceAll("\\", "/"), root),
      "utf8",
    );
    const ast = ts.createSourceFile(
      filename,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function walk(node) {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(ast) === "t" &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        if (!dictionary[node.arguments[0].text])
          missing.push(filename + ": " + node.arguments[0].text);
      }
      ts.forEachChild(node, walk);
    }
    walk(ast);
  }
  assert.deepEqual(missing, []);
});

test("translating content never changes identity, time, cancellation or Mass language", () => {
  const event = {
    _id: "rjukan",
    title: "Messe på Rjukan",
    eventType: "mass",
    language: "nb",
    startsAt: "2026-09-06T17:00:00+02:00",
    status: "cancelled",
    slug: "rjukan",
    places: [],
    links: [{ label: "Messe", url: "https://example.com/Messe" }],
    translations: [{ language: "en", value: { title: "Mass in Rjukan" } }],
  };
  const english = localizeContent(event, "en");
  for (const field of ["_id", "startsAt", "status", "language", "slug"])
    assert.equal(english[field], event[field]);
  assert.equal(english.links[0].url, event.links[0].url);
  assert.equal(english.title, "Mass in Rjukan");
  assert.equal(event.title, "Messe på Rjukan");
  const data = {
    schedules: [],
    exceptions: [],
    bulletins: [],
    events: [event],
  };
  const nb = buildCalendarItems(data, "2026-09-06", "2026-09-06")[0];
  const en = buildCalendarItems(
    localizeContent(data, "en"),
    "2026-09-06",
    "2026-09-06",
  )[0];
  assert.deepEqual(en.regionKeys, nb.regionKeys);
  assert.equal(en.href, nb.href);
});

test("Sanity supplies English copy, never structural fields", () => {
  const data = {
    title: "Messe på Rjukan",
    startsAt: "2026-09-06",
    translations: [
      {
        language: "en",
        value: { title: "Parish Mass in Rjukan", startsAt: "2027-01-01" },
      },
    ],
  };
  assert.equal(localizeContent(data, "en").title, "Parish Mass in Rjukan");
  assert.equal(localizeContent(data, "en").startsAt, "2026-09-06");
  assert.strictEqual(localizeContent(data, "nb"), data);
});

test("new source text invalidates stale English; repeated imports are idempotent", () => {
  const original = { title: "Messe", summary: "Gammel beskjed" };
  const translations = prepareTranslations(
    null,
    original,
    { en: { title: "Mass", summary: "Old notice", body: "A paragraph." } },
    "test",
  );
  const existing = { ...original, translations };
  const stale = prepareTranslations(
    existing,
    { summary: "Ny beskjed" },
    undefined,
    "test",
  );
  assert.equal(stale[0].value.summary, undefined);
  assert.equal(stale[0].value.title, "Mass");
  assert.deepEqual(
    prepareTranslations(
      existing,
      original,
      { en: { title: "Mass", summary: "Old notice", body: "A paragraph." } },
      "test",
    ),
    translations,
  );
  assert.ok(
    translationErrors({ en: { startsAt: "2027-01-01" } }, "event").length,
  );
  assert.ok(translationErrors({ en: { title: "Text" } }, "massText").length);
});

test("English dates retain Oslo timezone and 24-hour times", () => {
  assert.equal(formatCalendarTime("2026-09-06T09:00:00Z", "en"), "11:00");
  assert.equal(formatCalendarTime("2026-09-06T09:00:00Z", "nb"), "11.00");
  assert.match(
    formatCalendarDate("2026-09-06T09:00:00Z", true, "en"),
    /Sunday,? 6 September 2026/,
  );
});

test("missing English copy stays an explicitly labelled Norwegian original", () => {
  const source = {
    title: "En helt ny kunngjøring",
    body: [
      {
        _type: "block",
        children: [
          { _type: "span", text: "En ny tekst som ikke er oversatt." },
        ],
      },
    ],
  };
  const result = localizeContent(source, "en");
  assert.deepEqual(result.originalFields, ["title", "body"]);
  assert.deepEqual(result.body, source.body);
  const reviewed = localizeContent(
    {
      ...source,
      translations: [
        { language: "en", value: { title: "A new announcement", body: [] } },
      ],
    },
    "en",
  );
  assert.equal(reviewed.originalFields, undefined);
  assert.equal(getTranslator("en")("constructor"), "constructor");
});

test("direct Studio source changes also prevent stale English being displayed", () => {
  const document = {
    title: "Opprinnelig",
    translations: [
      {
        language: "en",
        value: {
          title: "Original",
          sourceHashes: { title: sourceFingerprint("Opprinnelig") },
        },
      },
    ],
  };
  assert.equal(localizeContent(document, "en").title, "Original");
  const changed = localizeContent(
    { ...document, title: "Endret innhold" },
    "en",
  );
  assert.equal(changed.title, "Endret innhold");
  assert.deepEqual(changed.originalFields, ["title"]);
  assert.equal(
    sourceFingerprint([{ _key: "a", text: "Hei" }]),
    sourceFingerprint([{ _key: "b", text: "Hei" }]),
  );
  assert.notEqual(
    sourceFingerprint({ _ref: "a" }),
    sourceFingerprint({ _ref: "b" }),
  );
});

test("translation migration is lossless, idempotent and preserves editorial English", () => {
  const source = {
    _id: "test",
    _rev: "a",
    title: "Messe",
    summary: "Hei",
    startsAt: "2026-09-06",
    body: [
      {
        _key: "b",
        _type: "block",
        children: [
          { _key: "s", _type: "span", text: "Hei", marks: ["strong"] },
        ],
      },
    ],
    links: [
      { _key: "link", label: "Les mer", url: "https://example.com/norsk" },
    ],
    mainImage: { alt: "Kirke", asset: { _ref: "image" } },
    translations: [
      { _key: "en", language: "en", value: { title: "Reviewed title" } },
    ],
  };
  const before = structuredClone(source);
  const dictionary = {
    Messe: "Holy Mass",
    Hei: "Hello",
    "Les mer": "Read more",
    Kirke: "Church",
  };
  const plan = planTranslation(source, dictionary);
  assert.deepEqual(source, before);
  assert.deepEqual(plan.missing, []);
  const translated = { ...source, translations: plan.translations };
  assert.deepEqual(planTranslation(translated, dictionary).added, []);
  const localized = localizeContent(translated, "en");
  assert.equal(localized.title, "Reviewed title");
  assert.equal(localized.body[0].children[0].text, "Hello");
  assert.deepEqual(localized.body[0].children[0].marks, ["strong"]);
  assert.equal(localized.links[0].url, source.links[0].url);
  assert.equal(localized.mainImage.asset._ref, "image");
  assert.equal(localized.mainImage.alt, "Church");
  assert.equal(localized.originalFields, undefined);
  assert.deepEqual(
    planTranslation({ _id: "new", title: "Mangler" }, dictionary).missing,
    ["Mangler"],
  );
  assert.ok(translationErrors({ en: { links: [null] } }, "article").length);
});

test("translated link labels cannot change link destinations", () => {
  const source = {
    links: [{ label: "Kilde", url: "https://example.com/source" }],
    translations: [
      {
        language: "en",
        value: {
          links: [{ label: "Wrong link", url: "https://elsewhere.test" }],
        },
      },
    ],
  };
  assert.deepEqual(localizeContent(source, "en").links, source.links);
});

test("language picker contains exactly 30 curated languages with searchable names and real flags", () => {
  assert.equal(LANGUAGES.length, 30);
  assert.equal(new Set(LANGUAGES.map((l) => l.code)).size, LANGUAGES.length);
  assert.ok(
    LANGUAGES.every(
      (l) => l.native && l.en && l.nb && /^[A-Za-z-]+$/.test(l.code),
    ),
  );
  for (const language of LANGUAGES) {
    assert.equal(languageCode(language.code), language.code);
    const markup = renderToStaticMarkup(
      createElement(LANGUAGE_FLAGS[language.flag]),
    );
    assert.match(markup, /<svg/);
    assert.match(markup, /<(path|rect|circle|g)\b/);
  }
  assert.deepEqual(PRIMARY_LANGUAGES, ["no", "en"]);
  assert.equal(languageCode("nb"), "no");
  assert.equal(languageCode("fil"), "tl");
  assert.equal(languageCode("made-up"), null);
  const polish = languageSearchText(LANGUAGES.find((l) => l.code === "pl"));
  for (const name of ["polski", "polish", "polsk"])
    assert.ok(polish.includes(name));
});

test("automatic language selection handles script and region codes safely", () => {
  assert.equal(translationLanguage("?translate=zh-Hans", ""), "zh-CN");
  assert.equal(translationLanguage("", "some=1; googtrans=/en/mni-Mtei"), null);
  assert.equal(translationLanguage("?translate=zh-TW", ""), null);
  assert.equal(translationLanguage("?translate=ar", "googtrans=/en/pl"), "ar");
  assert.equal(translationLanguage("?translate=invalid", ""), null);
  assert.equal(translationLanguage("?translate=en", ""), null);
  assert.equal(translationLanguage("?translate=nb", ""), null);
});
