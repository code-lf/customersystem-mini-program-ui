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

// 使用真实预设文件验证内容格式和上传数据，防止只改后缀却仍提交 SVG，或直接保存安装包路径。
test('全部系统头像上传真实PNG，返回持久地址且保持原有分类和名称', async () => {
  const presetsSource = await readFile(new URL('../utils/avatar-presets.js', import.meta.url), 'utf8');
  const context = {};
  runInNewContext(`${presetsSource.replace(/^export /gm, '')}\nglobalThis.groups = PRESET_AVATAR_GROUPS;`, context);
  const { PRESET_AVATAR_GROUPS: originals } = await import('../scripts/avatar-presets-source.mjs');
  let uploads = 0;
  for (const [group, avatars] of Object.entries(context.groups)) {
    assert.deepEqual(Array.from(avatars, ({ id, name }) => ({ id, name })), originals[group].map(({ id, name }) => ({ id, name })));
    for (const avatar of avatars) {
      const bytes = await readFile(new URL(`..${avatar.url}`, import.meta.url));
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      const persist = load(async () => { throw new Error('预设不使用multipart'); }, {
        uni: { getFileSystemManager: () => ({ readFile: ({ filePath, encoding, success }) => {
          assert.equal(filePath, avatar.url.slice(1));
          assert.equal(encoding, 'base64');
          success({ data: bytes.toString('base64') });
        } }) },
        apiPost: async (url, data) => {
          assert.equal(url, 'file/image/base64');
          assert.equal(Buffer.from(data.content, 'base64').equals(bytes), true);
          uploads++;
          return { url: `upload/avatar/${avatar.id}.png` };
        }
      });
      assert.equal(await persist(avatar.url), `upload/avatar/${avatar.id}.png`);
    }
  }
  assert.equal(uploads, 11);
});

test('系统头像读取或上传失败时拒绝保存，不返回本地路径', async () => {
  const uni = { getFileSystemManager: () => ({ readFile: ({ fail }) => fail(new Error('读取失败')) }) };
  await assert.rejects(load(async () => {}, { uni })('/static/avatars/gf-3.png'), /读取失败/);
  const readableUni = { getFileSystemManager: () => ({ readFile: ({ success }) => success({ data: 'PNG' }) }) };
  await assert.rejects(load(async () => {}, {
    uni: readableUni, apiPost: async () => { throw new Error('上传失败'); }
  })('/static/avatars/gf-3.png'), /上传失败/);
});
