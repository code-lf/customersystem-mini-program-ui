import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../api/member.js', import.meta.url), 'utf8');

// 模拟实际 API 层，验证两个名称接口分别调用、回读检查与错误传播。
const createApi = (failurePath = '') => {
  const calls = [];
  const member = { nickname: '旧姓名', dealer_name: '旧档案' };
  const context = {
    config: {}, console, setTimeout: (callback) => { callback(); },
    apiGet: async () => ({ ...member }),
    apiPut: async (path, data) => {
      calls.push({ path, data: JSON.parse(JSON.stringify(data)) });
      if (path === failurePath) throw new Error('档案更新失败');
      if (path === 'member/modify/nickname') member.nickname = data.value;
      if (path === 'member/dealer/name') member.dealer_name = data.dealer_name;
    }
  };
  const script = source.replace(/^import .*;\r?$/gm, '').replace(/export /g, '');
  runInNewContext(`${script}\nglobalThis.update = updateMemberInfo;`, context);
  return { update: context.update, calls };
};

test('修改经销商姓名同时更新昵称和档案名称并核对回读', async () => {
  const api = createApi();
  const result = await api.update({ nickname: '张先生', dealer_name: '张先生' });
  assert.deepEqual(api.calls, [
    { path: 'member/modify/nickname', data: { value: '张先生' } },
    { path: 'member/dealer/name', data: { dealer_name: '张先生' } }
  ]);
  assert.equal(result.synced, true);
  assert.equal(result.member.dealer_name, '张先生');
});

test('普通会员仅修改昵称，档案名称可独立重试且接口失败不误报成功', async () => {
  const regular = createApi();
  await regular.update({ nickname: '李先生' });
  assert.equal(regular.calls.length, 1);
  const retry = createApi();
  await retry.update({ dealer_name: '张先生' });
  assert.equal(retry.calls[0].path, 'member/dealer/name');
  const failed = createApi('member/dealer/name');
  await assert.rejects(failed.update({ nickname: '张先生', dealer_name: '张先生' }), /档案更新失败/);
  const invalid = createApi();
  await assert.rejects(invalid.update({ nickname: '张先生', dealer_name: '' }), /不能为空/);
  assert.equal(invalid.calls.length, 0);
});
