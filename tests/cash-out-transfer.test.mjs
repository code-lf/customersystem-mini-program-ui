import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { computed, ref } from 'vue';

const utility = await readFile(new URL('../utils/cash-out.js', import.meta.url), 'utf8');
const helpers = await import(`data:text/javascript;base64,${Buffer.from(utility).toString('base64')}`);
const page = await readFile(new URL('../pages/member/cash-out-detail.vue', import.meta.url), 'utf8');
const script = page.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?$/gm, '');
const transfer = { extra: { mch_id: 'TEST_MERCHANT', appid: 'TEST_APP' }, package_info: 'SIGNED+PACKAGE==' };

// 只运行桩接口，绝不调用真实转账或微信确认收款。
function load(status, overrides = {}) {
  const calls = [];
  const record = { id: 7, status, transfer_type: 'wechatpay', transfer };
  const context = {
    computed, ref, ...helpers,
    onLoad: callback => callback({ id: '7' }), getPageOptions: () => ({}),
    useCashOutRefresh: callback => ({ refresh: async () => { await callback(); } }),
    getCashOutDetail: async () => ({ ...record }),
    getMemberInfo: async () => ({ weapp_openid: 'TEST_MEMBER' }),
    getCashOutTransfer: async data => { calls.push(['transfer', data]); return transfer; },
    wx: { requestMerchantTransfer: options => { calls.push(['wechat', options]); options.success({}); } },
    uni: { showToast: data => calls.push(['toast', data]) }, ...overrides
  };
  runInNewContext(`${script}\nglobalThis.form = { confirmTransfer, detail, operating };`, context);
  return { ...context.form, calls };
}

test('状态2明确表示审核通过；完成、拒绝及取消状态不误报通过', () => {
  assert.equal(helpers.cashOutStatus({ status: '2', status_name: '待转账' }), '审核通过，待转账');
  assert.equal(helpers.cashOutStatus({ status: 3 }), '已转账');
  assert.equal(helpers.cashOutStatus({ status: -1 }), '已拒绝');
  assert.equal(helpers.cashOutStatus({ status: -2 }), '已取消');
});

test('审核通过点击后创建转账并原样透传微信签名包，不本地标记到账', async () => {
  const form = load(2);
  await form.confirmTransfer();
  assert.equal(form.calls.filter(([type]) => type === 'transfer').length, 1);
  assert.equal(form.calls.find(([type]) => type === 'transfer')[1].open_id, 'TEST_MEMBER');
  assert.equal(form.calls.find(([type]) => type === 'wechat')[1].package, transfer.package_info);
  assert.equal(form.detail.value.status, 2);
  assert.equal(form.operating.value, false);
});

test('处理中复用已有transfer；待审核或已到账不创建转账', async () => {
  for (const status of [1, 3, 4, -1, -2]) {
    const form = load(status);
    await form.confirmTransfer();
    assert.equal(form.calls.filter(([type]) => type === 'transfer').length, 0);
    assert.equal(form.calls.filter(([type]) => type === 'wechat').length, status === 4 ? 1 : 0);
  }
});

test('未绑定微信或不支持客户端时不创建转账，缺参数不能调起收款', async () => {
  for (const overrides of [{ wx: {} }, { getMemberInfo: async () => ({}) }]) {
    const form = load(2, overrides);
    await form.confirmTransfer();
    assert.equal(form.calls.filter(([type]) => type === 'transfer').length, 0);
    assert.equal(form.calls.filter(([type]) => type === 'wechat').length, 0);
  }
  assert.throws(() => helpers.merchantTransferOptions({}), /参数不完整/);
});

test('用户取消微信确认后保持后端状态并可重试，不提示到账成功', async () => {
  const form = load(4, { wx: { requestMerchantTransfer: options => options.fail({ errMsg: 'requestMerchantTransfer:cancel' }) } });
  await form.confirmTransfer();
  assert.equal(form.operating.value, false);
  assert.equal(form.detail.value.status, 4);
  assert.equal(form.calls.find(([type]) => type === 'toast')[1].title, '已取消确认收款');
});

test('补齐Gitee转账接口，自动刷新只查询且离开页面清理定时器', async () => {
  const api = await readFile(new URL('../api/member.js', import.meta.url), 'utf8');
  assert.match(api, /apiPost\(`member\/cash_out\/transfer\/\$\{data.id\}`/);
  const hook = await readFile(new URL('../hooks/use-cash-out-refresh.js', import.meta.url), 'utf8');
  assert.match(hook, /onHide\(stop\)/);
  assert.match(hook, /onUnload\(stop\)/);
  assert.doesNotMatch(hook, /getCashOutTransfer|cashOutApply/);
});
