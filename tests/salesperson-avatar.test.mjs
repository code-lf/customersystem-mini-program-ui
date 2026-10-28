import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { computed, ref, watch } from 'vue';

test('客户经理头像读取业务员mini_member_headimg，兼容上传路径及空头像', async () => {
  const page = await readFile(new URL('../pages/member/salesperson.vue', import.meta.url), 'utf8');
  const logic = page.match(/const avatarFailed = ref\(false\);[\s\S]*?watch\(managerAvatar[^\n]+/)[0];
  const salesperson = ref({ mini_member_headimg: 'https://cdn.example.com/avatar.png' });
  const context = { ref, computed, watch, salesperson, config: { baseUrl: 'https://example.com/api' } };
  runInNewContext(`${logic}\nglobalThis.avatar = managerAvatar;`, context);
  assert.equal(context.avatar.value, 'https://cdn.example.com/avatar.png');
  salesperson.value = { mini_member_headimg: '/upload/manager.png' };
  assert.equal(context.avatar.value, 'https://example.com/upload/manager.png');
  salesperson.value = { mini_member_headimg: '//cdn.example.com/manager.png' };
  assert.equal(context.avatar.value, 'https://cdn.example.com/manager.png');
  salesperson.value = {};
  assert.equal(context.avatar.value, '');
  assert.match(page, /@error="avatarFailed = true"/);
  assert.match(page, /mode="aspectFill"/);
  assert.match(page, /@click="previewManagerAvatar"/);
});

test('点击头像仅预览业务员真实图片，默认图与失败图片不预览', async () => {
  const page = await readFile(new URL('../pages/member/salesperson.vue', import.meta.url), 'utf8');
  const method = page.match(/const previewManagerAvatar = \(\) => \{[\s\S]*?\n\};/)[0];
  const calls = [];
  const context = { managerAvatar: ref('https://example.com/manager.png'), avatarFailed: ref(false), uni: { previewImage: options => calls.push(options) } };
  runInNewContext(`${method}\nglobalThis.preview = previewManagerAvatar;`, context);
  context.preview();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].current, 'https://example.com/manager.png');
  assert.equal(calls[0].urls[0], calls[0].current);
  context.avatarFailed.value = true;
  context.preview();
  context.avatarFailed.value = false;
  context.managerAvatar.value = '';
  context.preview();
  assert.equal(calls.length, 1);
});
