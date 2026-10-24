import assert from "node:assert/strict";
import test from "node:test";
import { eventStructuredData, parishStructuredData } from "../src/lib/structured-data.ts";

const church = { _id: "kongsberg", sourceKey: "place:kongsberg-st-barbara", name: "St. Barbara kirke", placeType: "church", streetAddress: "Rogstadbakken 2", postalCode: "3616", locality: "Kongsberg", mapUrl: null };
const notodden = { _id: "notodden", sourceKey: "place:notodden", name: "Notodden", placeType: "venue", streetAddress: "Rådhusgata 1", postalCode: "3674", locality: "Notodden", mapUrl: null };
const unknown = { _id: "venue", sourceKey: null, name: "Tusenfryd", placeType: "venue", streetAddress: null, postalCode: null, locality: null, mapUrl: null };

test("the parish's own church is Catholic and carries the parish phone; other places get neither", () => {
  const data = JSON.parse(JSON.stringify(parishStructuredData([church, notodden], { url: "https://kongsberg.katolsk.no/nb", description: "Test" })));
  const [main, other] = data["@graph"][0].location;
  assert.equal(main["@type"], "CatholicChurch");
  assert.equal(main.telephone, "+4794425982");
  assert.deepEqual(main.address, { "@type": "PostalAddress", streetAddress: "Rogstadbakken 2", postalCode: "3616", addressLocality: "Kongsberg", addressCountry: "NO" });
  assert.equal(main.hasMap, undefined);
  assert.equal(other["@type"], "Place");
  assert.equal(other.telephone, undefined);
});

test("only one-off events with a known place are marked up, with whole dates for date-only ranges", () => {
  const event = { kind: "event", title: "Pilegrimstur", status: "cancelled", eventType: "pilgrimage", startsAt: "2026-09-04T00:00:00+02:00", endsAt: "2026-09-06T23:59:00+02:00", place: unknown, places: [unknown], language: "other" };
  const data = JSON.parse(JSON.stringify(eventStructuredData(event, "https://kongsberg.katolsk.no/nb/messetider/pilegrimstur")));
  assert.equal(data.startDate, "2026-09-04");
  assert.equal(data.endDate, "2026-09-06");
  assert.equal(data.eventStatus, "https://schema.org/EventCancelled");
  assert.equal(data.inLanguage, undefined);
  assert.deepEqual(data.location, { "@type": "Place", name: "Tusenfryd" });
  assert.equal(eventStructuredData({ ...event, kind: "mass" }, "x"), null);
  assert.equal(eventStructuredData({ ...event, place: undefined }, "x"), null);
});
