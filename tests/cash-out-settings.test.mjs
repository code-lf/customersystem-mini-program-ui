import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { computed, reactive, ref } from 'vue';

const page = await readFile(new URL('../pages/member/apply-cash-out.vue', import.meta.url), 'utf8');
// 测试微信编译分支，不执行真实提现，会员绑定标识仅为桩数据。
const script = page.match(/<script setup>([\s\S]*?)<\/script>/)[1]
  .replace(/^import .*;\r?$/gm, '').replace(/\/\/ #ifdef H5[\s\S]*?\/\/ #endif/g, '');
function load(overrides = {}) {
  const context = {
    computed, reactive, ref, watch() {}, onLoad() {}, onShow() {}, onMounted() {},
    getPageOptions: () => ({}),
    useUserStore: () => ({ fetchUserInfo: async () => ({ weapp_openid: 'TEST_BINDING' }) }),
    cashOutConfig: async () => ({ is_open: '1', transfer_type: ['wechatpay'], min: 0.1, rate: 0.06 }),
    getBalance: async () => ({ money: 12 }),
    uni: { getStorageSync: () => '', showToast() {} }, ...overrides
  };
  runInNewContext(`${script}\nglobalThis.form = { config, loadSettings, transferCards, loadError, pageLoading, applyData, wechatLoginRequired };`, context);
  return context.form;
}
test('字符串开启值显示微信提现，保留后台最低金额和费率', async () => {
  const form = load();
  await form.loadSettings();
  assert.equal(form.config.is_open, 1);
  assert.equal(form.config.min, 0.1);
  assert.equal(form.config.rate, 0.06);
  assert.equal(form.applyData.transfer_type, 'wechatpay');
  assert.equal(form.transferCards.value[0].title, '提现至微信零钱');
  assert.equal(form.loadError.value, '');
});
test('未绑定微信提示绑定而不是配置关闭', async () => {
  const form = load({ useUserStore: () => ({ fetchUserInfo: async () => ({}) }) });
  await form.loadSettings();
  assert.equal(form.config.is_open, 1);
  assert.equal(form.wechatLoginRequired.value, true);
  assert.equal(form.transferCards.value.length, 0);
});
test('配置错误和加载失败独立显示，明确关闭才显示未开启', async () => {
  for (const cashOutConfig of [async () => ({}), async () => { throw new Error('网络错误'); }]) {
    const form = load({ cashOutConfig });
    await form.loadSettings();
    assert.ok(form.loadError.value);
    assert.equal(form.pageLoading.value, false);
  }
  const closed = load({ cashOutConfig: async () => ({ is_open: '0' }) });
  await closed.loadSettings();
  assert.equal(closed.config.is_open, 0);
  assert.equal(closed.loadError.value, '');
});
