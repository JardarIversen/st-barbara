import assert from "node:assert/strict";
import test from "node:test";
import { buildCalendarItems, calendarDayGroups, calendarPlaceLabel, calendarHistoryStart, calendarTitle, isDateOnlyRange, localDateTime, resolveScheduledMass, toCalendarListItems } from "../src/lib/calendar.ts";

const notodden = { _id: "notodden", sourceKey: "place:notodden", name: "Notodden" };
const heddal = { _id: "heddal", sourceKey: "place:heddal-stavkirke", name: "Heddal stavkirke" };
const schedule = { _id: "schedule", sourceKey: "schedule:notodden", title: "Messe på Notodden", status: "active", place: notodden, language: "nb", anchorWeekday: "sunday", recurrenceType: "monthlyWeeks", weeksOfMonth: [2, 4], dayOffset: 0, startTime: "17:00", validFrom: "2026-01-01" };
const data = { schedules: [schedule], exceptions: [], events: [], bulletins: [] };

test("a programme links its individual appointments and mass without leaking to other Sundays", () => {
  const programme = { title: "Bispevisitas", slug: "bispevisitas-8-11-oktober", links: [{_key: "pdf", label: "Program (PDF)", url: "https://example.org/program.pdf"}] };
  const exception = { scope: "singleOccurrence", scheduleId: schedule._id, occurrenceDate: "2026-10-11", changeType: "changed", announcements: [programme] };
  const meeting = { _id: "meeting", title: "Møte med kirkelyden på Notodden", slug: "mote-notodden", eventType: "activity", status: "scheduled", startsAt: "2026-10-11T16:00:00+02:00", announcements: [programme] };
  const items = buildCalendarItems({...data, exceptions: [exception], events: [meeting]}, "2026-10-01", "2026-10-31");
  assert.equal(items.length, 3);
  assert.equal(items[0].startsAt, meeting.startsAt);
  assert.equal(items[1].startsAt, "2026-10-11T17:00:00+02:00");
  assert.equal(items[2].announcements, undefined);
  assert.deepEqual(toCalendarListItems(items).slice(0, 2).map(item => item.announcements), [[programme], [programme]]);
  assert.equal(resolveScheduledMass({...data, exceptions: [exception]}, items[1].slug, "2026-10-11").announcements[0].links[0].url, programme.links[0].url);
});

test("history is one calendar month, including short months and leap years", () => {
  assert.equal(calendarHistoryStart("2026-09-06"), "2026-08-06");
  assert.equal(calendarHistoryStart("2026-03-31"), "2026-02-28");
  assert.equal(calendarHistoryStart("2024-03-31"), "2024-02-29");
  assert.equal(calendarHistoryStart("2026-01-05"), "2025-12-05");
});

test("a moved mass keeps its parish filter, shows its actual venue, and stays a single entry", () => {
  const exception = { scope: "singleOccurrence", scheduleId: schedule._id, occurrenceDate: "2026-09-13", changeType: "rescheduled", newPlace: heddal, titleOverride: "Messe i Heddal stavkirke" };
  const items = buildCalendarItems({ ...data, exceptions: [exception] }, "2026-09-01", "2026-09-30");
  const moved = toCalendarListItems(items)[0];
  assert.equal(items.length, 2);
  assert.equal(moved.place._id, "heddal");
  assert.ok(moved.regionKeys.includes("notodden"));
  assert.equal(moved.changeLabel, undefined);
  assert.equal(calendarTitle(moved), "Messe");
  assert.equal(moved.dateKey, "2026-09-13");
});

test("newer bulletin corrections win over old cancellations without losing the regular plan", () => {
  const old = { scope: "dateRange", scheduleId: schedule._id, rangeStart: "2026-09-01", rangeEnd: "2026-09-30", changeType: "cancelled", sourceBulletins: [{issueDate: "2026-08-30"}] };
  const correction = { scope: "singleOccurrence", scheduleId: schedule._id, occurrenceDate: "2026-09-13", changeType: "changed", publicNote: "Messen feires som vanlig.", sourceBulletins: [{issueDate: "2026-09-06"}] };
  const items = buildCalendarItems({ ...data, exceptions: [old, correction] }, "2026-09-01", "2026-09-30");
  assert.equal(items[0].status, "scheduled");
  assert.equal(items[0].publicNote, correction.publicNote);
  assert.equal(items[1].status, "cancelled");
});

test("Oslo dates handle midnight UTC, DST and overlapping multi-day events", () => {
  assert.equal(localDateTime("2026-03-29", "00:00"), "2026-03-29T00:00:00+01:00");
  assert.equal(localDateTime("2026-03-29", "11:00"), "2026-03-29T11:00:00+02:00");
  assert.equal(localDateTime("2026-10-25", "00:00"), "2026-10-25T00:00:00+02:00");
  assert.equal(localDateTime("2026-10-24", "17:00"), "2026-10-24T17:00:00+02:00");
  assert.equal(localDateTime("2026-10-25", "17:00"), "2026-10-25T17:00:00+01:00");
  const event = { _id: "trip", title: "Tur", slug: "tur", eventType: "pilgrimage", status: "scheduled", startsAt: "2026-09-04T22:30:00Z", endsAt: "2026-09-08T12:00:00Z" };
  const items = buildCalendarItems({ ...data, schedules: [], events: [event] }, "2026-09-06", "2026-09-10");
  assert.equal(items[0].dateKey, "2026-09-05");
  assert.equal(calendarDayGroups(items, "2026-09-06")[0][0], "2026-09-06");
  assert.equal(buildCalendarItems({ ...data, schedules: [], events: [event] }, "2026-09-09", "2026-09-10").length, 0);
});

test("a mass moved to a different date keeps a working detail URL", () => {
  const exception = { scope: "singleOccurrence", scheduleId: schedule._id, occurrenceDate: "2026-09-13", changeType: "rescheduled", newStartsAt: "2026-09-14T17:00:00+02:00" };
  const changed = { ...data, exceptions: [exception] };
  const item = buildCalendarItems(changed, "2026-09-01", "2026-09-30")[0];
  assert.equal(item.dateKey, "2026-09-14");
  assert.equal(resolveScheduledMass(changed, item.slug, "2026-09-13").startsAt, exception.newStartsAt);
  assert.equal(resolveScheduledMass(changed, "unknown-2026-09-13", "2026-09-13"), null);
});

test("whole-date ranges do not masquerade as midnight appointments; real midnight masses keep the time", () => {
  const range = { eventType: "other", startsAt: "2026-09-07T00:00:00+02:00", endsAt: "2026-09-11T23:59:00+02:00" };
  assert.equal(isDateOnlyRange(range), true);
  assert.equal(isDateOnlyRange({...range, eventType: "mass"}), false);
  assert.equal(isDateOnlyRange({...range, startsAt: "2026-09-07T09:00:00+02:00"}), false);
});

test("a bulletin naming Rjukan remains filterable when the precise venue is not yet specified", () => {
  const event = { _id: "rjukan", title: "Messe på Rjukan", slug: "rjukan", eventType: "mass", status: "scheduled", startsAt: "2026-09-06T17:00:00+02:00", places: [] };
  const [item] = buildCalendarItems({ ...data, schedules: [], events: [event] }, "2026-09-06", "2026-09-06");
  assert.deepEqual(item.regionKeys, ["rjukan"]);
  assert.deepEqual(item.places, []);
  assert.equal(calendarTitle(item), event.title);
});

test("schedules created in Studio without an import key keep separate URLs and exceptions", () => {
  const chapel = { _id: "chapel", sourceKey: null, name: "Kapellet", locality: "Kongsberg" };
  const first = { ...schedule, _id: "studio-a", sourceKey: null, place: chapel };
  const second = { ...first, _id: "studio-b", startTime: "19:00" };
  const cancelled = { scope: "singleOccurrence", scheduleId: first._id, occurrenceDate: "2026-09-13", changeType: "cancelled" };
  const studio = { ...data, schedules: [first, second], exceptions: [cancelled] };
  const items = buildCalendarItems(studio, "2026-09-13", "2026-09-13");
  assert.deepEqual(items.map(item => [item.slug, item.status]), [["studio-a-2026-09-13", "cancelled"], ["studio-b-2026-09-13", "scheduled"]]);
  assert.equal(resolveScheduledMass(studio, "studio-b-2026-09-13", "2026-09-13").startsAt, "2026-09-13T19:00:00+02:00");
  assert.equal(calendarPlaceLabel(chapel), "Kapellet");
  assert.equal(buildCalendarItems(data, "2026-09-13", "2026-09-13")[0].slug, "schedule-notodden-2026-09-13");
});
