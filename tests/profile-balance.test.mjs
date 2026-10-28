import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('个人中心仅显示可提现余额，标题为账户余额并保留提现入口', async () => {
  const source = await readFile(new URL('../pages/my/my.vue', import.meta.url), 'utf8');
  assert.match(source, /账户余额 \(元\)/);
  assert.match(source, /return userStore.userInfo\?\.money \?\? 0/);
  assert.doesNotMatch(source, /displayBalance|getBalance\(|账户收益 \/ 零钱|账户可用余额/);
  assert.equal((source.match(/class="balance-item"/g) || []).length, 1);
  assert.match(source, /@click="handleWithdrawClick"/);
  assert.doesNotMatch(source, /class="wallet-heading"/);
  assert.match(source, /钱包 · 账户余额 \(元\)/);
  assert.match(source, /class="wallet-body"/);
});
