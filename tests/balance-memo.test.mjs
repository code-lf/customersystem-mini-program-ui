import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

test('可提现账户的奖励显示收，普通扣款显示支，仅提现业务显示提', async () => {
  const page = await readFile(new URL('../pages/member/balance.vue', import.meta.url), 'utf8');
  const methods = ['logSymbol', 'logColorClass'].map(name => page.match(new RegExp(`const ${name} = \\(item\\) => \\{[\\s\\S]*?\\n\\};`))[0]).join('\n');
  const context = {};
  runInNewContext(`${methods}\nglobalThis.methods = { logSymbol, logColorClass };`, context);
  const { logSymbol, logColorClass } = context.methods;
  assert.equal(logSymbol({ account_type: 'money', from_type: 'reward', account_data: '1.01' }), '收');
  assert.equal(logColorClass({ account_type: 'money', from_type: 'reward', account_data: '1.01' }), 'is-red');
  assert.equal(logSymbol({ account_type: 'money', from_type: 'adjust', account_data: '-1' }), '支');
  assert.equal(logColorClass({ account_type: 'money', from_type: 'adjust', account_data: '-1' }), 'is-green');
  for (const amount of ['-0.10', '0.10']) {
    assert.equal(logSymbol({ from_type: 'cash_out', account_data: amount }), '提');
    assert.equal(logColorClass({ from_type: 'cash_out', account_data: amount }), 'is-blue');
  }
});

test('余额明细直接展示接口备注，空备注隐藏，长备注完整换行', async () => {
  const page = await readFile(new URL('../pages/member/balance.vue', import.meta.url), 'utf8');
  assert.match(page, /v-if="item.memo && String\(item.memo\).trim\(\)" class="log-memo">备注：\{\{ item.memo \}\}/);
  assert.match(page, /class="log-time"/);
  assert.match(page, /white-space: pre-wrap/);
  assert.match(page, /\.log-side \{ flex-shrink: 0; \}/);
  assert.doesNotMatch(page, /\.log-main text:last-child/);
});
