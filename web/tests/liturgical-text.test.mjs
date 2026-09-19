import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { toPortableText, validateManifest } from '../../studio-st.-barbara-church/scripts/lib/manifest-utils.mjs';
import { massTextFormattingWarnings } from '../../studio-st.-barbara-church/scripts/lib/liturgical-text.mjs';
import { patchChangesDocument } from '../../studio-st.-barbara-church/scripts/lib/patch-changes.mjs';

// Render the actual website component, including its custom acclamation style.
const hook = registerHooks({
  load(url, context, nextLoad) {
    if (!url.endsWith('/components/portable-content.tsx')) return nextLoad(url, context);
    const { outputText } = ts.transpileModule(fs.readFileSync(new URL(url), 'utf8'), {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
    });
    return { format: 'module', source: outputText, shortCircuit: true };
  },
});
const { default: PortableContent } = await import('../src/components/portable-content.tsx');
hook.deregister();

const render = body => renderToStaticMarkup(createElement(PortableContent, {
  value: toPortableText(body, 'mass-text:test'),
}));

test('psalm renders a bold italic refrain and one bold response on a new line per stanza', () => {
  const html = render([
    { type: 'refrain', text: 'Herren er nær' },
    { type: 'verse', lines: ['Første linje,', 'andre linje.'] },
    { type: 'verse', lines: ['Neste strofe.'] },
  ]);
  assert.match(html, /<strong><em>℟ Herren er nær<\/em><\/strong>/);
  assert.match(html, /Første linje,<br\/>andre linje\.<br\/><strong>℟<\/strong>/);
  assert.match(html, /Neste strofe\.<br\/><strong>℟<\/strong>/);
  assert.equal((html.match(/℟/gu) ?? []).length, 3);
});

test('gospel acclamation is centered, bold italic, with source line breaks and automatic cues', () => {
  const html = render([{ type: 'acclamation', response: 'Allelúia.', lines: [
    'Herre, gjør våre hjerter åpne', 'for din Sønns ord.',
  ] }]);
  assert.match(html, /<p class="text-center [^"]*"><strong><em>℟ Allelúia\. ℣ Herre, gjør våre hjerter åpne<br\/>for din Sønns ord\. ℟ Allelúia\.<\/em><\/strong><\/p>/);
  const withoutResponse = render([{ type: 'acclamation', lines: ['Et vers uten omkved.'] }]);
  assert.ok(!withoutResponse.includes('℟'));
  assert.ok(!withoutResponse.includes('Allelúia'));
  assert.match(withoutResponse, /℣ Et vers uten omkved\./);
});

test('dry-run validation rejects malformed stanzas and manually entered cues', () => {
  for (const block of [
    { type: 'verse', lines: [] }, { type: 'verse', lines: [''] },
    { type: 'verse', lines: ['En\nto'] }, { type: 'verse', lines: ['Tekst', '℟'] },
    { type: 'refrain', text: '℟ Omkved' }, { type: 'refrain', text: '' },
    { type: 'acclamation', lines: ['℣ Vers'] },
    { type: 'acclamation', response: '', lines: ['Vers'] },
    { type: 'verse', lines: ['Vers'], text: 'Ignored?' },
    { type: 'vers', lines: ['Typo'] },
  ]) {
    const errors = validateManifest({ schemaVersion: 1, massTexts: [{
      sourceKey: 'test', massDate: '2026-09-20', scheduleKey: 'schedule', bulletinKey: 'bulletin', body: [block],
    }] }, '.');
    assert.ok(errors.length > 0, JSON.stringify(block));
    assert.throws(() => toPortableText([block], 'test'));
  }
});

test('legacy content stays unchanged and repeated imports preserve revisions', () => {
  const raw = { _type: 'block', _key: 'original', style: 'normal', markDefs: [], children: [
    { _type: 'span', _key: 's', text: 'Original', marks: [] },
  ] };
  assert.equal(toPortableText([raw], 'test')[0], raw);
  assert.equal(toPortableText(['Vanlig lesning.'], 'test')[0].children[0].text, 'Vanlig lesning.');
  const input = [{ type: 'verse', lines: ['En', 'To'] }, { type: 'acclamation', response: 'Lovet være du.', lines: ['Vers'] }];
  const body = toPortableText(input, 'test');
  assert.equal(patchChangesDocument({ body }, { body: toPortableText(input, 'test') }), false);
  assert.equal(new Set(body.flatMap(b => [b._key, ...b.children.map(s => s._key)])).size, 5);
});

test('current bulletin and example use structured psalm and gospel text without warnings', () => {
  for (const path of ['manifests/2026-09-20.json', 'bulletin-manifest.example.json']) {
    const manifest = JSON.parse(fs.readFileSync(new URL(`../../studio-st.-barbara-church/scripts/${path}`, import.meta.url)));
    assert.deepEqual(massTextFormattingWarnings(manifest), []);
    const html = render(manifest.massTexts[0].body);
    assert.equal((html.match(/<strong>℟<\/strong>/gu) ?? []).length, 3);
    assert.match(html, /text-center/);
  }
  assert.equal(massTextFormattingWarnings({ massTexts: [{ sourceKey: 'legacy', body: ['℟ Omkved. Vers. ℟'] }] }).length, 1);
});
