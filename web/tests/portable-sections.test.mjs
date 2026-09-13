import assert from 'node:assert/strict';
import test from 'node:test';
import { splitPortableSections } from '../src/lib/portable-sections.ts';

const block = (key, style = 'normal') => ({
  _type: 'block', _key: key, style, markDefs: [],
  children: [{_type: 'span', _key: key + '-span', text: key, marks: []}],
});

test('sections retain all content once, in order, without modifying CMS blocks', () => {
  const blocks = [block('intro'), block('a', 'h2'), block('text'), block('sub', 'h3'), block('b', 'h2'), block('contact')];
  const before = structuredClone(blocks);
  const { introduction, sections } = splitPortableSections(blocks);
  assert.deepEqual(introduction, [blocks[0]]);
  assert.equal(sections.length, 2);
  assert.deepEqual(sections[0].body, blocks.slice(2, 4));
  assert.deepEqual([...introduction, ...sections.flatMap(s => [s.heading, ...s.body])], blocks);
  assert.deepEqual(blocks, before);
  assert.equal(sections[0].body[0], blocks[2]);
});

test('empty and unsectioned content stays readable', () => {
  assert.deepEqual(splitPortableSections(), {introduction: [], sections: []});
  const intro = block('intro');
  assert.deepEqual(splitPortableSections([intro]), {introduction: [intro], sections: []});
});
