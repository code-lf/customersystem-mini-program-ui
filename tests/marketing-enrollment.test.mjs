import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { ref, reactive, computed } from 'vue';

const source = await readFile(new URL('../utils/marketing-enrollment.js', import.meta.url), 'utf8');
const helpers = await import(`data:text/javascript,${encodeURIComponent(source)}`);
const { getCampaignGroupQuantity, buildCampaignEnrollmentItems } = helpers;
const page = await readFile(new URL('../pages/marketing/detail.vue', import.meta.url), 'utf8');

test('套餐包含全部启用商品，统一套数且不传客户端价格或件数', () => {
  const items = [
    { item_id: 123, goods_id: 1001, group_quantity: 10, campaign_price: 3650 },
    { item_id: 124, goods_id: 1002, group_quantity: 2 },
    { item_id: 125, goods_id: 1003, item_status: 0 }
  ];
  assert.deepEqual(buildCampaignEnrollmentItems(items, '5'), [
    { campaign_item_id: 123, group_count: 5 }, { campaign_item_id: 124, group_count: 5 }
  ]);
  assert.deepEqual(buildCampaignEnrollmentItems(items, 1), [{ campaign_item_id: 123, group_count: 1 }, { campaign_item_id: 124, group_count: 1 }]);
  assert.equal(getCampaignGroupQuantity({}), 1);
  assert.equal(getCampaignGroupQuantity({ group_quantity: '10' }), 10);
});

test('空选择、负数、小数、无效整数及重复活动商品均在提交前拦截', () => {
  const items = [{ item_id: 123 }];
  for (const value of [0, '', -1, 1.5, '1.5', 'abc', 'Infinity', '9007199254740992']) {
    assert.throws(() => buildCampaignEnrollmentItems(items, value));
  }
  assert.throws(() => buildCampaignEnrollmentItems([...items, ...items], 1), /重复/);
  assert.throws(() => buildCampaignEnrollmentItems([{ goods_id: 123 }], 1));
});

// 使用真实页面提交逻辑和 Vue 响应式状态，模拟接口验证请求和成功回显。
const createPage = (overrides = {}) => {
  const requests = [];
  const dialogs = [];
  const toasts = [];
  const serverRecord = {
    enrollment_id: 456, total_quantity: 50, total_amount: 182500,
    items: [{ campaign_item_id: 123, group_quantity: 10, group_count: 5, quantity: 50, line_amount: 182500 }]
  };
  const activity = { campaign_id: 7, can_enroll: true, items: [{ item_id: 123, goods_id: 1001, group_quantity: 10, campaign_price: 1 }, { item_id: 124, goods_id: 1002, group_quantity: 2, campaign_price: 2 }] };
  const context = {
    ref, reactive, computed, ...helpers, console: { warn() {} },
    onLoad() {}, onShow() {}, onShareAppMessage() {}, onShareTimeline() {},
    useUserStore: () => ({ isLoggedIn: true, userInfo: {} }),
    getCampaignDetail: async () => activity,
    enrollCampaign: async (id, payload) => { requests.push({ id, payload: JSON.parse(JSON.stringify(payload)) }); return serverRecord; },
    uni: { showToast: (value) => toasts.push(value), showLoading() {}, hideLoading() {}, showModal: (value) => dialogs.push(value) },
    ...overrides
  };
  const script = page.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?$/gm, '');
  runInNewContext(`${script}\nglobalThis.form = { campaignId, campaign, enrollForm, packageCount, submittedEnrollment, handleSubmitEnroll };`, context);
  const form = context.form;
  form.campaignId.value = 7;
  form.campaign.value = activity;
  form.enrollForm.contact_name = '王先生';
  form.enrollForm.contact_mobile = '13800000000';
  form.packageCount.value = '5';
  return { form, requests, dialogs, toasts };
};

test('报名成功以服务端金额回显，刷新失败保留成功记录，连续点击只提交一次', async () => {
  const { form, requests, dialogs } = createPage({ getCampaignDetail: async () => { throw new Error('刷新失败'); } });
  await Promise.all([form.handleSubmitEnroll(), form.handleSubmitEnroll()]);
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0], { id: 7, payload: { contact_name: '王先生', contact_mobile: '13800000000', remark: '', items: [{ campaign_item_id: 123, group_count: 5 }, { campaign_item_id: 124, group_count: 5 }] } });
  assert.equal(form.submittedEnrollment.value.total_amount, 182500);
  assert.equal(form.submittedEnrollment.value.items[0].quantity, 50);
  assert.ok(form.campaign.value);
  assert.ok(dialogs.some((value) => value.title === '报名提交成功'));
});

test('套数不合法时不请求报名接口，后端拒绝时保留表单且不显示成功', async () => {
  const invalid = createPage();
  invalid.form.packageCount.value = '1.5';
  await invalid.form.handleSubmitEnroll();
  assert.equal(invalid.requests.length, 0);
  assert.equal(invalid.toasts.length, 1);
  const failed = createPage({ enrollCampaign: async () => { throw new Error('超过限购数量'); } });
  await failed.form.handleSubmitEnroll();
  assert.equal(failed.form.submittedEnrollment.value, null);
  assert.equal(failed.form.packageCount.value, '5');
  assert.equal(failed.dialogs.length, 0);
  assert.equal(failed.toasts[0].title, '超过限购数量');
});
