import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('价格变动上涨红色下降绿色，金额放大且不挤压标签', async () => {
  const page = await readFile(new URL('../pages/monitor/index.vue', import.meta.url), 'utf8');
  assert.match(page, /item.change < 0" class="change-badge up"/);
  assert.match(page, /\.change-badge.up \{ background: #fff1f2; color: #dc2626;/);
  assert.match(page, /\.change-badge.down \{[\s\S]*?color: #059669;/);
  assert.match(page, /\.change-badge.up, .change-badge.down \{ font-size: 28rpx; font-weight: 800;/);
  assert.match(page, /\.change-card__new.down, .change-card__amount.down \{ color: #059669;/);
});
