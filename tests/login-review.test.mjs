import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../pages/auth/login.vue', import.meta.url), 'utf8');
test('协议默认不勾选，授权按钮只在主动同意后开放', () => {
  assert.match(page, /const isAgreed = ref\(false\)/);
  assert.doesNotMatch(page, /isAgreed.value\s*=\s*true/);
  assert.match(page, /:open-type="isAgreed \? 'getPhoneNumber' : ''"/);
  for (const method of ['handleWechatLogin', 'handleMobileLogin', 'handleAccountLogin']) {
    assert.match(page, new RegExp(`const ${method} = async[^\\n]*\\n\\s*if \\(!validateAgreement\\(\\)`));
  }
  assert.match(page, /@click.stop="openAgreement\('privacy'\)"/);
  assert.match(page, /@click.stop="openAgreement\('service'\)"/);
});
test('登录展示不含微信官方图标及一键登录宣传，保留手机号授权实现', () => {
  const template = page.split('<script setup>')[0];
  assert.doesNotMatch(template, /weixin-fill|微信一键|微信认证信息/);
  assert.match(template, /手机号快捷登录/);
  assert.match(template, /验证码登录/);
  assert.match(template, /@getphonenumber="handleWechatPhoneLogin"/);
  assert.match(page, /weappLogin/);
});
