import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// 公司代理品牌只做静态展示，每个品牌一次，不允许点击进入详情或发起申请。
test('品牌集合使用竖屏静态网格，不绑定详情操作', async () => {
  const source = await readFile(new URL('../pages/brand/index.vue', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /@click|brand-modal-mask|showDetailModal|activeBrand|<up-popup/);
  assert.match(source, /<image class="brand-logo-image"/);
  assert.doesNotMatch(source, /brand.enName|brand.name|brand.badge/);
  assert.match(source, /v-for="brand in displayBrands" :key="brand.brand_id"/);
  assert.match(source, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(source, /marquee|@keyframes|animation:|duplicate\(/);
  // uni-app 页面配置允许整行注释，解析前跳过被注释的配置。
  const pagesText = await readFile(new URL('../pages.json', import.meta.url), 'utf8');
  const pages = JSON.parse(pagesText.replace(/^\s*\/\/.*$/gm, ''));
  assert.equal(pages.pages.find(page => page.path === 'pages/brand/index').style.pageOrientation, 'portrait');
  assert.doesNotMatch(source, /viewport\.width/);
});

test('品牌页直连上架接口，保持返回顺序且不使用本地品牌兜底', async () => {
  const source = await readFile(new URL('../pages/brand/index.vue', import.meta.url), 'utf8');
  const api = await readFile(new URL('../api/brand.js', import.meta.url), 'utf8');
  assert.match(api, /apiGet\('crm\/brand\/list', \{\}, \{ apiMode: 'api' \}\)/);
  assert.match(source, /:src="brand.brand_image"/);
  assert.match(source, /displayBrands.value = brands;/);
  assert.doesNotMatch(source, /BRAND_LIST|BRAND_LOGOS|\.sort\(/);
  assert.match(source, /暂无上架品牌/);
  assert.match(source, /品牌加载失败/);
});

test('Logo映射均指向实际PNG文件，不使用文字图片或远程占位', async () => {
  const data = await readFile(new URL('../mock/brand-logos.js', import.meta.url), 'utf8');
  const paths = [...data.matchAll(/'((?:\/static\/brand-logos\/)[^']+\.png)'/g)].map(match => match[1]);
  assert.equal(paths.length, 12);
  for (const path of paths) {
    const bytes = await readFile(new URL(`..${path}`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', path);
  }
});
