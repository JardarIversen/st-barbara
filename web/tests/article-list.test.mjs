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
