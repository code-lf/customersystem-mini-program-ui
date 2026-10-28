import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// 工具模块不依赖小程序运行时，直接验证真实品牌与金额分组。
const source = await readFile(new URL('../utils/quote-brands.js', import.meta.url), 'utf8');
const { groupQuoteItems } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('方太不归入格力，多品牌独立累计后端行金额', () => {
  const items = [
    { brand_name: '方太', goods_name: '方太烟机Y2', line_amount: 8240 },
    { brand_name: '格力', line_amount: 3000 },
    { brand_name_snapshot: '方太', line_amount: 5910 }
  ];
  const groups = groupQuoteItems(items);
  assert.deepEqual(groups.map(({ name, total }) => ({ name, total })), [
    { name: '方太', total: 14150 }, { name: '格力', total: 3000 }
  ]);
  assert.equal(groups[0].items[0], items[0]);
});

test('无品牌不伪造格力，不把分类名称当成品牌，保留零数量', () => {
  assert.deepEqual(groupQuoteItems([]), []);
  const groups = groupQuoteItems([{ category_name: '烟机', price: 100, quantity: 0 }]);
  assert.equal(groups[0].name, '商品明细');
  assert.equal(groups[0].total, 0);
});

test('报价型号下方显示商品名称快照，表格价格数量列保持不变', async () => {
  const page = await readFile(new URL('../pages/solution/share.vue', import.meta.url), 'utf8');
  assert.match(page, /product-name">\{\{ product.goods_name_snapshot \|\| product.goods_name \|\| product.name/);
  assert.match(page, /v-for="group in brandGroups"/);
  assert.match(page, /v-for="\(product, idx\) in group.items"/);
});
