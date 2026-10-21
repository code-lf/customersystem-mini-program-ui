import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { ref, computed } from 'vue';

const source = await readFile(new URL('../pages/password/index.vue', import.meta.url), 'utf8');
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?$/gm, '');

// 使用真实页面查询逻辑，覆盖空结果、异常和扫码入口，测试中不保存实际密码。
function createPage(queryBarcodePassword) {
  const messages = [];
  const context = { ref, computed, queryBarcodePassword, uni: {
    showToast: (data) => messages.push(data.title), showLoading() {}, hideLoading() {},
    scanCode: ({ success }) => success({ result: 'TEST' })
  } };
  runInNewContext(`${script}\nglobalThis.form = { handleQuery, handleScan, showResult, noResult, querying, barcode };`, context);
  context.form.barcode.value = 'TEST';
  return { form: context.form, messages };
}

test('查询无记录显示常驻提示，重新查到记录时清除空状态', async () => {
  let data = {};
  const { form } = createPage(async () => data);
  await form.handleQuery();
  assert.equal(form.noResult.value, true);
  assert.equal(form.showResult.value, false);
  data = { password: 'TEST_ONLY' };
  await form.handleQuery();
  assert.equal(form.noResult.value, false);
  assert.equal(form.showResult.value, true);
});

test('明确未录入显示空提示，网络与权限错误不冒充未录入', async () => {
  for (const message of ['未查询到密码', '网络错误', '无权限']) {
    const { form, messages } = createPage(async () => { throw new Error(message); });
    await form.handleQuery();
    assert.equal(form.noResult.value, message === '未查询到密码');
    if (message !== '未查询到密码') assert.deepEqual(messages, [message]);
    assert.equal(form.querying.value, false);
  }
});

test('扫码复用无结果提示，空输入不发请求', async () => {
  let calls = 0;
  const { form } = createPage(async () => { calls++; return null; });
  form.barcode.value = '';
  await form.handleQuery();
  assert.equal(calls, 0);
  form.handleScan();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 1);
  assert.equal(form.noResult.value, true);
});
