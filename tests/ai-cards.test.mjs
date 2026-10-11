import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// 直接从源码加载纯函数，避免项目的 uni-app 模块格式影响 Node 单元测试。
const source = await readFile(new URL('../utils/ai-cards.js', import.meta.url), 'utf8');
const { parseAiCardText, resolveAiCards } = await import(`data:text/javascript,${encodeURIComponent(source)}`);

test('回答末尾的商品、报价和资料卡片可解析且不显示原始 JSON', () => {
  const answer = '已为您找到商品。\n<gh_cards>{"products":[{"goods_id":1933,"goods_name":"格力72天井机","price":9450}],"quotes":[{"quote_id":12,"quote_no":"Q12"}],"materials":[{"goods_id":1933,"title":"安装手册"}]}</gh_cards>';
  const result = resolveAiCards(answer);
  assert.equal(result.text, '已为您找到商品。');
  assert.equal(result.products[0].goods_id, 1933);
  assert.equal(result.quotes[0].quote_id, 12);
  assert.equal(result.materials[0].goods_id, 1933);
});

test('流式未闭合标记隐藏片段，错误 ID 不生成跳转卡片', () => {
  assert.equal(parseAiCardText('请稍候<gh_cards>{"products":').text, '请稍候');
  const result = resolveAiCards('回答<gh_cards>{"products":[{"goods_id":"no-id"}],"quotes":[{"quote_id":0}]}</gh_cards>');
  assert.deepEqual(result.products, []);
  assert.deepEqual(result.quotes, []);
});

test('后端结构化数据优先，旧的单个 quote_id 仍保留卡片', () => {
  const result = resolveAiCards('完成<gh_cards>{"products":[{"goods_id":1}]}</gh_cards>', {
    products: [{ goods_id: 2, goods_name: '真实商品' }],
    quote_id: 22
  });
  assert.equal(result.products[0].goods_id, 2);
  assert.equal(result.quotes[0].quote_id, 22);
});

test('商品详情按分类分组的资料也能生成预览卡片', () => {
  const result = resolveAiCards('找到安装资料', {
    goods_id: 1933,
    materials: [{ category_name: '安装资料', items: [{ id: 9, title: '安装手册' }] }]
  });
  assert.deepEqual(result.materials[0], {
    id: 9,
    goods_id: 1933,
    title: '安装手册',
    category_name: '安装资料'
  });
});
