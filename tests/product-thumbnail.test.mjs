import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// 覆盖商品卡片的各个入口，防止有图商品、默认占位图从其他页面重新出现。
test('商品列表和公共卡片不再渲染缩略图，AI 对话仍保留头像', async () => {
  const paths = [
    'pages/product/list.vue', 'pages/product/category.vue', 'pages/product/favorites.vue',
    'pages/solution/index.vue', 'pages/solution/add-product.vue', 'pages/share/solution.vue',
    'components/product-card.vue', 'components/ai-product-card.vue',
    'components/price-monitor-card.vue', 'components/solution-product-item.vue'
  ];
  for (const path of paths) {
    const source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    const template = source.split('<script')[0];
    assert.doesNotMatch(template, /<image\b/, path);
  }
  const chat = await readFile(new URL('../pages/ai/chat.vue', import.meta.url), 'utf8');
  assert.doesNotMatch(chat.split('<script')[0], /:src="product\.image"/);
  assert.match(chat, /class="avatar user-avatar"/);
  assert.match(chat, /class="avatar ai-avatar"/);
});
