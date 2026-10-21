import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = (await readFile(new URL('../utils/official-account.js', import.meta.url), 'utf8'))
  .replace(/^import .*;\r?$/gm, '').replace(/^export /gm, '');
function create({ id = 'gh_TEST', wx } = {}) {
  const pages = [];
  const context = { config: { officialAccount: { originalId: id } }, wx,
    openPage: (path, params) => pages.push({ path, mode: params.mode }) };
  runInNewContext(`${source}\nglobalThis.open = openOfficialAccount;`, context);
  return { open: context.open, pages };
}
test('有效原始ID直接同步调用微信主页接口，成功不跳二维码', () => {
  let received;
  const page = create({ wx: { openOfficialAccountProfile: (options) => { received = options.username; } } });
  page.open();
  assert.equal(received, 'gh_TEST');
  assert.equal(page.pages.length, 0);
});
test('缺失配置、接口不可用或同步异常均回退二维码', () => {
  for (const options of [ { id: '' }, { id: '非原始ID' }, {},
    { wx: { openOfficialAccountProfile() { throw new Error('不支持'); } } } ]) {
    const page = create(options);
    page.open();
    assert.deepEqual(page.pages, [{ path: '/pages/wechat/index', mode: 'qr' }]);
  }
});
test('失败回调重复到达也只回退一次', () => {
  const page = create({ wx: { openOfficialAccountProfile: ({ fail }) => { fail(); fail(); } } });
  page.open();
  assert.equal(page.pages.length, 1);
});
