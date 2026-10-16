import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { ref, reactive, computed, watch, nextTick } from 'vue';

const page = await readFile(new URL('../pages/auth/login.vue', import.meta.url), 'utf8');
const createPage = (overrides = {}) => {
  const requests = [];
  const notices = [];
  let intervals = 0;
  const userStore = { setToken() {}, setUserInfo() {}, fetchUserInfo: async () => ({ nickname: '真实会员' }) };
  const context = {
    ref, reactive, computed, watch, console: { warn() {} }, onLoad() {}, onUnload() {}, useUserStore: () => userStore,
    getCaptcha: async () => ({ captcha_key: 'image-key', img: 'data:image/png;base64,test' }),
    getLoginConfig: async () => ({ is_mobile: 1 }),
    sendMobileCode: async (value) => { requests.push(value); return { key: 'sms-key' }; },
    mobileLogin: async () => ({ token: 'test-token' }),
    setInterval: () => { intervals++; return intervals; }, clearInterval() {}, setTimeout() {},
    uni: { showToast: (value) => notices.push(value) }, ...overrides
  };
  const script = page.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?$/gm, '');
  runInNewContext(`${script}\nglobalThis.form = { mobileForm, loginConfig, captchaForm, countdown, handleSendCode, confirmSendCode, handleMobileLogin };`, context);
  return { form: context.form, requests, notices, intervals: () => intervals };
};

test('图形验证码发送成功后保存短信key并倒计时，登录提交真实验证码', async () => {
  let loginPayload;
  const view = createPage({ mobileLogin: async (data) => { loginPayload = JSON.parse(JSON.stringify(data)); return { token: 'test-token' }; } });
  view.form.loginConfig.value = { is_mobile: 1 };
  view.form.mobileForm.mobile = '13800000000';
  await nextTick();
  await view.form.handleSendCode();
  view.form.captchaForm.captcha_code = 'ABCD';
  await view.form.confirmSendCode();
  assert.equal(view.requests[0].captcha_key, 'image-key');
  assert.equal(view.requests[0].captcha_code, 'ABCD');
  assert.equal(view.form.mobileForm.mobile_key, 'sms-key');
  assert.equal(view.form.mobileForm.mobile_code, '');
  assert.equal(view.form.countdown.value, 60);
  view.form.mobileForm.mobile_code = '8624';
  await view.form.handleMobileLogin();
  assert.deepEqual(loginPayload, { mobile: '13800000000', mobile_code: '8624', mobile_key: 'sms-key' });
  view.form.mobileForm.mobile = '13900000000';
  await nextTick();
  assert.equal(view.form.mobileForm.mobile_key, '');
  assert.equal(view.form.countdown.value, 0);
});

test('后台未开放时不发送短信；发送失败不伪造验证码、不启动倒计时', async () => {
  const disabled = createPage();
  disabled.form.loginConfig.value = { is_mobile: 0, is_bind_mobile: 0 };
  disabled.form.mobileForm.mobile = '13800000000';
  await disabled.form.handleSendCode();
  assert.equal(disabled.requests.length, 0);
  const failed = createPage({ sendMobileCode: async () => { throw new Error('短信未配置'); } });
  failed.form.loginConfig.value = { is_mobile: 1 };
  failed.form.mobileForm.mobile = '13800000000';
  await nextTick();
  await failed.form.handleSendCode();
  failed.form.captchaForm.captcha_code = 'ABCD';
  await failed.form.confirmSendCode();
  assert.equal(failed.form.mobileForm.mobile_code, '');
  assert.equal(failed.form.mobileForm.mobile_key, '');
  assert.equal(failed.intervals(), 0);
  assert.ok(failed.notices.some((value) => value.title === '短信未配置'));
});

test('认证API使用真实请求模式、场景短信路径以及mobile_key/mobile_code协议', async () => {
  const source = await readFile(new URL('../api/auth.js', import.meta.url), 'utf8');
  const calls = [];
  const context = { apiPost: (path, data, options) => { calls.push({ path, data, options }); }, apiGet() {} };
  runInNewContext(`${source.replace(/^import .*;\r?$/gm, '').replace(/export /g, '')}\nglobalThis.auth = {sendMobileCode, mobileLogin};`, context);
  context.auth.sendMobileCode({ mobile: '13800000000', type: 'login', captcha_key: 'image-key', captcha_code: 'ABCD' });
  assert.equal(calls[0].path, 'send/mobile/login');
  assert.equal(calls[0].options.apiMode, 'api');
  context.auth.mobileLogin({ mobile: '13800000000', mobile_key: 'sms-key', mobile_code: '8624', code: 'bad' });
  assert.equal(calls[1].data.mobile_code, '8624');
  assert.equal(calls[1].data.mobile_key, 'sms-key');
  assert.equal('code' in calls[1].data, false);
});
