import test from 'node:test';
import assert from 'node:assert/strict';
import { isCouncilArticle, articleListTitle } from '../src/lib/article-list.ts';

test('council detection works across translated categories', () => {
  for (const category of ['Menighetsråd', 'Parish Council']) {
    assert.equal(isCouncilArticle({sourceKey:'legacy', category, title:'Test'}), true);
  }
  assert.equal(isCouncilArticle({sourceKey:'article:parish-council:2026-08-31', title:'Test'}), true);
  assert.equal(isCouncilArticle({sourceKey:'news', category:'Katekese', title:'Test'}), false);
});

test('only standard minutes titles lose their repeated date', () => {
  const article = {sourceKey:'article:parish-council:2026-08-31'};
  assert.equal(articleListTitle({...article, title:'Menighetsrådsreferat – 31. august 2026'}), 'Menighetsrådsreferat');
  assert.equal(articleListTitle({...article, title:'Parish Council minutes – 31 August 2026'}), 'Parish Council minutes');
  assert.equal(articleListTitle({...article, title:'Nytt menighetsråd – veien videre'}), 'Nytt menighetsråd – veien videre');
});


test('manually created Sanity articles without sourceKey are supported', () => {
  const article = {sourceKey:null, title:'Dåpsglede i St. Barbara', category:'Dåp'};
  assert.equal(isCouncilArticle(article), false);
  assert.equal(articleListTitle(article), article.title);
  assert.equal(isCouncilArticle({title:'Council update', category:'Menighetsråd'}), true);
});

test('sacrament pages replace the article route, other paths do not', async () => {
  const { articlePagePath, articleHref } = await import('../src/lib/article-list.ts');
  const { SACRAMENT_PATHS } = await import('../src/lib/sacraments.ts');
  const { articlePagePaths } = await import('../../studio-st.-barbara-church/scripts/lib/manifest-utils.mjs');
  assert.equal(SACRAMENT_PATHS.length, 8);
  assert.deepEqual(articlePagePaths, ['/katekese', ...SACRAMENT_PATHS]);
  assert.equal(articleHref({pagePath:'/sakramenter/dap', slug:'sakramenter-dap'}), '/sakramenter/dap');
  assert.equal(articlePagePath({pagePath:'/sakramenter/ukjent'}), undefined);
  assert.equal(articleHref({slug:'nyhet'}), '/innlegg/nyhet');
});

test('manifest list items become Portable Text bullets without changing other block keys', async () => {
  const { toPortableText } = await import('../../studio-st.-barbara-church/scripts/lib/manifest-utils.mjs');
  const [paragraph, bullet] = toPortableText(['Tekst', {listItem:'bullet', text:'Punkt'}], 'test');
  assert.equal(paragraph.listItem, undefined);
  assert.equal(paragraph._key, toPortableText(['Tekst'], 'test')[0]._key);
  assert.equal(bullet.listItem, 'bullet');
  assert.equal(bullet.level, 1);
  assert.throws(() => toPortableText([{listItem:'dash', text:'x'}], 'test'), /listItem/);
});
