import assert from 'node:assert/strict';
import test from 'node:test';
import { patchChangesDocument } from '../../studio-st.-barbara-church/scripts/lib/patch-changes.mjs';

test('unchanged imports do not write a new revision', () => {
  const existing = {_id: 'existing', _rev: 'revision', editorial: 'preserved', title: 'Title', body: [{_key: 'p', text: 'Content'}]};
  assert.equal(patchChangesDocument(existing, {body: [{text: 'Content', _key: 'p'}], title: 'Title'}), false);
  assert.equal(patchChangesDocument(existing, {title: 'Updated'}), true);
  assert.equal(patchChangesDocument(existing, {body: [{_key: 'p', text: 'Changed'}]}), true);
});

test('unsetting an absent field is a no-op, but real removals and reference changes persist', () => {
  assert.equal(patchChangesDocument({}, {}, ['missing']), false);
  assert.equal(patchChangesDocument({summary: null}, {}, ['summary']), true);
  assert.equal(patchChangesDocument({links: [1]}, {links: []}), true);
  assert.equal(patchChangesDocument({source: {_ref: 'a'}}, {source: {_ref: 'b'}}), true);
});
