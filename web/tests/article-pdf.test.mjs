import test from 'node:test';
import assert from 'node:assert/strict';
import { isArticlePdf } from '../src/lib/article-pdf.ts';

test('only parish PDFs can be embedded', () => {
  assert.equal(isArticlePdf('https://cdn.sanity.io/files/2jd536j2/production/abc.pdf'), true);
  assert.equal(isArticlePdf('https://cdn.sanity.io/files/2jd536j2/production/abc.pdf?dl=minutes.pdf'), true);
  for (const url of ['javascript:alert(1)', '/file.pdf', 'https://example.com/file.pdf',
    'https://cdn.sanity.io/files/other/production/abc.pdf',
    'https://cdn.sanity.io/files/2jd536j2/production/abc.html']) {
    assert.equal(isArticlePdf(url), false);
  }
});
