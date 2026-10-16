import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../utils/member-role.js', import.meta.url), 'utf8');
const { isSalespersonAccount, canUseBusinessFeatures, resolveMemberRole } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
const gateSource = await readFile(new URL('../utils/dealer-access.js', import.meta.url), 'utf8');

test('后台启用账号统一显示业务员，无需经销商绑定或销售角色名称', () => {
  const member = { is_dealer: 0, admin_account: { uid: '12', status: '1', role_names: ['客服'] } };
  assert.equal(isSalespersonAccount(member), true);
  assert.equal(canUseBusinessFeatures(member), true);
  assert.equal(resolveMemberRole({ ...member, is_dealer: 1, dealer_level: '一级经销商' }), '业务员');
  assert.equal(resolveMemberRole({ is_dealer: 1, dealer_level: '一级经销商' }), '一级经销商');
});

test('未关联、删除和禁用后台账号不能获得业务员身份', () => {
  for (const account of [null, {}, { uid: 0, status: 1 }, { uid: 12, status: 0 }, { uid: 12 }, { uid: -1, status: 1 }]) {
    assert.equal(isSalespersonAccount({ admin_account: account }), false);
    assert.equal(canUseBusinessFeatures({ is_dealer: 0, admin_account: account }), false);
  }
  assert.equal(resolveMemberRole({}), '普通用户');
});

// 执行实际入口校验方法，模拟会员接口刷新，验证权限依赖本次服务端响应。
const createGate = (member, cachedMember = {}) => {
  const dialogs = [];
  const userStore = { isLoggedIn: true, userInfo: cachedMember, setUserInfo(value) { this.userInfo = value; } };
  const context = { canUseBusinessFeatures, getMemberInfo: async () => member, openPage() {}, uni: { showModal: (value) => dialogs.push(value) } };
  const executable = gateSource.replace(/^import .*;\r?$/gm, '').replace(/export /g, '');
  runInNewContext(`${executable}\nglobalThis.checkAccess = requireDealerAccess;`, context);
  return { context, userStore, dialogs };
};

test('各业务入口放行有效业务员，后台解绑后清掉缓存身份并拒绝访问', async () => {
  const active = { is_dealer: 0, admin_account: { uid: 12, status: 1 } };
  const allowed = createGate(active);
  assert.equal(await allowed.context.checkAccess(allowed.userStore), true);
  assert.equal(allowed.dialogs.length, 0);
  const revoked = createGate({ is_dealer: 0 }, active);
  assert.equal(await revoked.context.checkAccess(revoked.userStore), false);
  assert.equal(revoked.userStore.userInfo.admin_account, null);
  assert.equal(revoked.dialogs.length, 1);
  const dealer = createGate({ is_dealer: 1 });
  assert.equal(await dealer.context.checkAccess(dealer.userStore), true);
});
