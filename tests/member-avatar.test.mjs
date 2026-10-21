import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = (await readFile(new URL('../api/member.js', import.meta.url), 'utf8'))
  .replace(/^import .*;\r?$/gm, '').replace(/^export /gm, '');
function load(uploadFile, extra = {}) {
  const context = { config: {}, request: { upload: uploadFile }, ...extra };
  runInNewContext(`${source}\nglobalThis.persist = persistMemberAvatar;`, context);
  return context.persist;
}

// 验证微信临时头像必须上传，失败时不能返回临时路径作为保存成功结果。
test('头像临时文件转换为持久地址，已有远程地址不重复上传', async () => {
  let calls = 0;
  const persist = load(async () => { calls++; return { file_path: '/uploads/avatar.png' }; });
  assert.equal(await persist('wxfile://tmp/avatar.png'), '/uploads/avatar.png');
  assert.equal(await persist('http://tmp/avatar.png'), '/uploads/avatar.png');
  assert.equal(await persist('https://example.com/avatar.png'), 'https://example.com/avatar.png');
  assert.equal(calls, 2);
});

test('上传失败、缺少地址和返回临时地址时拒绝保存', async () => {
  await assert.rejects(load(async () => { throw new Error('上传失败'); })('wxfile://tmp/a.png'));
  for (const result of [{}, { url: 'http://tmp/a.png' }, { url: 'wxfile://tmp/a.png' }]) {
    await assert.rejects(load(async () => result)('wxfile://tmp/a.png'));
  }
});

test('相册使用file/image和file字段，不调用旧示例接口', async () => {
  const calls = [];
  const persist = load(async (options) => { calls.push(options); return { url: 'upload/avatar.png' }; });
  assert.equal(await persist('wxfile://tmp/album.png'), 'upload/avatar.png');
  assert.equal(calls[0].url, 'file/image');
  assert.equal(calls[0].name, 'file');
  assert.equal(calls[0].filePath, 'wxfile://tmp/album.png');
  assert.equal(await persist('upload/avatar.png'), 'upload/avatar.png');
  assert.equal(calls.length, 1);
});

test('微信头像读取纯Base64并调用file/image/base64，不走multipart', async () => {
  const calls = [];
  const persist = load(async () => { throw new Error('不应走相册上传'); }, {
    uni: { getFileSystemManager: () => ({ readFile: ({ encoding, success }) => {
      assert.equal(encoding, 'base64'); success({ data: 'TEST_BASE64' });
    } }) },
    apiPost: async (url, data) => { calls.push({ url, data }); return { url: 'upload/wx.png' }; }
  });
  assert.equal(await persist('wxfile://tmp/wx.png', { wechat: true }), 'upload/wx.png');
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{ url: 'file/image/base64', data: { content: 'TEST_BASE64' } }]);
});
