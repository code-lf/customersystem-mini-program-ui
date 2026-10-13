import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// 纯计算方法直接从源码加载，避免 uni-app 的模块格式影响 Node 测试。
const source = await readFile(new URL('../utils/quote-discount.js', import.meta.url), 'utf8');
const { calculateQuotePreview, isQuoteDiscountExcluded } = await import(`data:text/javascript,${encodeURIComponent(source)}`);

test('商品或祖先分类禁折标记为 0 时不参与折扣', () => {
  assert.equal(isQuoteDiscountExcluded({ quote_discount_enabled: 0 }), true);
  assert.equal(isQuoteDiscountExcluded({ quote_discount_enabled: '0' }), true);
  assert.equal(isQuoteDiscountExcluded({ quote_discount_enabled: 1 }), false);
});

test('混合报价只对允许折扣商品计算让利', () => {
  const result = calculateQuotePreview([
    { price: 100, quantity: 2, quote_discount_enabled: 1 },
    { price: 300, quantity: 1, quote_discount_enabled: 0 }
  ], 80);
  assert.deepEqual(result, {
    goods_amount: 500,
    total_quantity: 3,
    pay_amount: 460,
    discount_amount: 40
  });
});

test('全部禁折时整单折扣不改变金额', () => {
  const result = calculateQuotePreview([{ price: 99.9, quantity: 2, quote_discount_enabled: 0 }], 50);
  assert.equal(result.goods_amount, 199.8);
  assert.equal(result.pay_amount, 199.8);
  assert.equal(result.discount_amount, 0);
});
