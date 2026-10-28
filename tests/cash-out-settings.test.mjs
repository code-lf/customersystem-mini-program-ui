import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { computed, reactive, ref } from 'vue';

const page = await readFile(new URL('../pages/member/apply-cash-out.vue', import.meta.url), 'utf8');
const amountSource = await readFile(new URL('../utils/member-account.js', import.meta.url), 'utf8');
const { readMemberAmount } = await import(`data:text/javascript;base64,${Buffer.from(amountSource).toString('base64')}`);
// 测试微信编译分支，不执行真实提现，会员绑定标识仅为桩数据。
const script = page.match(/<script setup>([\s\S]*?)<\/script>/)[1]
  .replace(/^import .*;\r?$/gm, '').replace(/\/\/ #ifdef H5[\s\S]*?\/\/ #endif/g, '');
function load(overrides = {}) {
  const context = {
    computed, reactive, ref, watch() {}, onLoad() {}, onShow() {}, onMounted() {},
    getPageOptions: () => ({}),
    useUserStore: () => ({ userInfo: {}, setUserInfo() {} }),
    getMemberInfo: async () => ({ weapp_openid: 'TEST_BINDING', money: '1.01', balance: '0.01' }),
    readMemberAmount,
    cashOutConfig: async () => ({ is_open: '1', transfer_type: ['wechatpay'], min: 0.1, rate: 0.06 }),
    uni: { getStorageSync: () => '', showToast() {} }, ...overrides
  };
  runInNewContext(`${script}\nglobalThis.form = { config, loadSettings, transferCards, loadError, pageLoading, applyData, wechatLoginRequired, cashOutMoney, allMoney };`, context);
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
  const form = load({ getMemberInfo: async () => ({ money: '1.01', balance: '0.01' }) });
  await form.loadSettings();
  assert.equal(form.config.is_open, 1);
  assert.equal(form.wechatLoginRequired.value, true);
  assert.equal(form.transferCards.value.length, 0);
});

test('提现读取会员 money，全部提现填入1.01而不是流水接口的默认零', async () => {
  const form = load();
  await form.loadSettings();
  assert.equal(form.cashOutMoney.value, 1.01);
  form.allMoney();
  assert.equal(form.applyData.apply_money, '1.01');
});

test('真实零余额有效，字段缺失和网络失败显示错误而非零余额', async () => {
  const zero = load({ getMemberInfo: async () => ({ money: '0.00' }) });
  await zero.loadSettings();
  assert.equal(zero.loadError.value, '');
  assert.equal(zero.cashOutMoney.value, 0);
  for (const getMemberInfo of [async () => ({ data: [] }), async () => { throw new Error('网络错误'); }]) {
    const form = load({ getMemberInfo });
    await form.loadSettings();
    assert.ok(form.loadError.value);
    assert.equal(form.pageLoading.value, false);
  }
});

test('佣金提现独立读取commission，不混用money', async () => {
  const form = load({
    uni: { getStorageSync: () => 'commission', showToast() {} },
    getMemberInfo: async () => ({ money: 1.01, commission: '2.50' })
  });
  await form.loadSettings();
  assert.equal(form.cashOutMoney.value, 2.5);
});

test('余额页总览读取会员资料，流水仍保留原接口', async () => {
  const balancePage = await readFile(new URL('../pages/member/balance.vue', import.meta.url), 'utf8');
  assert.match(balancePage, /await getMemberInfo\(\)/);
  assert.match(balancePage, /readMemberAmount\(member, 'money'\)/);
  assert.match(balancePage, /readMemberAmount\(member, 'balance'\)/);
  assert.match(balancePage, /getBalanceListAll\(/);
  assert.doesNotMatch(balancePage, /await getBalance\(\)/);
  assert.equal(readMemberAmount({ money: '1.01' }) + readMemberAmount({ balance: '0.01' }, 'balance'), 1.02);
  for (const money of [undefined, null, '', 'invalid']) {
    assert.throws(() => readMemberAmount({ money }));
  }
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
