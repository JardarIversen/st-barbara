import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catechesisDates} from '../src/lib/catechesis.ts';
import {localizeContent} from '../src/i18n/content.ts';
import {prepareCatechesis} from '../../studio-st.-barbara-church/scripts/lib/catechesis.mjs';
import {catechesisErrors} from '../../studio-st.-barbara-church/scripts/lib/catechesis-validation.mjs';
import {articleHref, articlePagePath} from '../src/lib/article-list.ts';

const article = JSON.parse(readFileSync(new URL('../../studio-st.-barbara-church/scripts/manifests/catechesis-2026-2027.json', import.meta.url), 'utf8')).articles[0];
const input = article.catechesis;
const clean = value => JSON.parse(JSON.stringify(value));

test('one shared date set includes all 17 confirmed Sundays, never inferred young-child sessions', () => {
  assert.equal(input.groups[0].sessionDates, undefined);
  const dates = input.groups[1].sessionDates;
  assert.equal(dates.length, 17);
  assert.ok(dates.every(date => new Date(date).getUTCDay() === 0));
  assert.equal(catechesisDates(dates, '2026-09-13').next, '2026-09-13');
  assert.equal(catechesisDates(dates, '2026-09-14').next, '2026-09-27');
  assert.equal(catechesisDates(dates, '2026-12-14').next, '2027-01-10');
  assert.equal(catechesisDates(dates, '2027-05-24').next, undefined);
  assert.equal(catechesisDates(dates, '2026-09-13').months.length, 9);
  const unsorted = ['2027-01-10', '2026-09-13', '2026-09-13'];
  assert.deepEqual(catechesisDates(unsorted, '2026-09-01').months[0], ['2026-09', ['2026-09-13']]);
  assert.equal(unsorted.length, 3);
});

test('nested editorial translations preserve shared dates, times and contacts and are idempotent', () => {
  const prepared = clean(prepareCatechesis(input, undefined, article.sourceKey));
  const english = localizeContent(prepared, 'en');
  assert.equal(english.groups[0].title, 'Children aged 3–7');
  assert.equal(english.groups[0].sessions[1].title, 'Wednesdays');
  assert.equal(english.groups[0].sessions[1].startTime, '16:30');
  assert.equal(english.groups[1].sessions[1].communionDate, '2027-05-29');
  assert.deepEqual(english.groups[1].sessionDates, prepared.groups[1].sessionDates);
  assert.deepEqual(english.groups[1].contact, prepared.groups[1].contact);
  assert.deepEqual(clean(prepareCatechesis(input, prepared, article.sourceKey)), prepared);
  const changed = structuredClone(input);
  changed.groups[0].title = 'Endret';
  delete changed.groups[0].translations;
  const updated = localizeContent(clean(prepareCatechesis(changed, prepared, article.sourceKey)), 'en');
  assert.equal(updated.groups[0].title, 'Endret');
  assert.ok(updated.groups[0].originalFields.includes('title'));
});

test('invalid and duplicate dates, impossible times and missing contacts are rejected', () => {
  assert.deepEqual(catechesisErrors(input), []);
  for (const date of ['2027-02-30', '2026-09-13']) {
    const invalid = structuredClone(input);
    invalid.groups[1].sessionDates.push(date);
    assert.ok(catechesisErrors(invalid).length);
  }
  const invalid = structuredClone(input);
  invalid.groups[0].sessions[0].endTime = '25:00';
  invalid.groups[0].contact.email = 'not-an-email';
  assert.equal(catechesisErrors(invalid).length, 2);
});

test('article previews link straight to catechesis without changing unrelated articles', () => {
  assert.equal(articleHref(article), '/katekese');
  assert.equal(articleHref({slug: 'minutes'}), '/innlegg/minutes');
  for (const pagePath of ['https://other.example', '//other.example', '/en/katekese', '/innlegg/a']) {
    assert.equal(articlePagePath({pagePath}), undefined);
  }
});
