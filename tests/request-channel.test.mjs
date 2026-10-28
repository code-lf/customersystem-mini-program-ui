import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../config/app.js', import.meta.url), 'utf8');

// 模拟 uni-app 条件编译，验证不同端实际生效的渠道值，禁止退回数字1。
function channel(platform, userAgent = '') {
  const script = source.replace(/\/\/ #ifdef ([^\r\n]+)\r?\n([\s\S]*?)\/\/ #endif/g,
    (_, condition, body) => condition.trim() === platform ? body : '')
    .replace(/export default config;?/, 'globalThis.result = config.clientType;')
    .replace(/import.meta.env.VITE_API_BASE_URL/g, 'undefined');
  const context = { navigator: { userAgent } };
  runInNewContext(script, context);
  return context.result;
}

test('微信小程序通用请求渠道必须为weapp', () => {
  assert.equal(channel('MP-WEIXIN'), 'weapp');
});

test('网页和App保留各自渠道，不把其他平台误标成小程序', () => {
  assert.equal(channel('H5', 'MicroMessenger/8'), 'wechat');
  assert.equal(channel('H5', 'Chrome/120'), 'h5');
  assert.equal(channel('APP-PLUS'), 'app');
});

test('通用请求和上传共用配置渠道，提现创建与确认不覆盖渠道头', async () => {
  const request = await readFile(new URL('../utils/request.js', import.meta.url), 'utf8');
  const member = await readFile(new URL('../api/member.js', import.meta.url), 'utf8');
  assert.match(request, /'channel': config.clientType/);
  assert.match(request, /async function upload[\s\S]*?prepareOptions\(options\)/);
  assert.doesNotMatch(member, /channel:\s*['"]1['"]/);
});
