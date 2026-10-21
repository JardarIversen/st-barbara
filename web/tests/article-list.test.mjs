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
  const article = {title:'Dåpsglede i St. Barbara', category:'Dåp'};
  assert.equal(isCouncilArticle(article), false);
  assert.equal(articleListTitle(article), article.title);
  assert.equal(isCouncilArticle({title:'Council update', category:'Menighetsråd'}), true);
});
