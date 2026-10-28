import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const utility = await readFile(new URL('../utils/ai-access.js', import.meta.url), 'utf8');
test('开发版体验版开放AI，正式版及未知版本默认关闭', () => {
  for (const version of ['develop', 'trial', 'release', '', undefined]) {
    const context = { wx: { getAccountInfoSync: () => ({ miniProgram: { envVersion: version } }) } };
    runInNewContext(`${utility.replace('export ', '')}\nglobalThis.allowed = isAiAvailable();`, context);
    assert.equal(context.allowed, ['develop', 'trial'].includes(version));
  }
  const context = { wx: { getAccountInfoSync: () => { throw new Error('不可用'); } } };
  runInNewContext(`${utility.replace('export ', '')}\nglobalThis.allowed = isAiAvailable();`, context);
  assert.equal(context.allowed, false);
});

test('正式版提问和流式提问不发网络请求，保留控制器协议', async () => {
  const source = await readFile(new URL('../api/ai-assistant.js', import.meta.url), 'utf8');
  const script = source.replace(/^import .*;\r?$/gm, '')
    .replace(/export default\s*\{[\s\S]*?\};/g, '').replace(/export /g, '');
  const context = { isAiAvailable: () => false };
  runInNewContext(`${script}\nglobalThis.methods = { askAi, askAiStream };`, context);
  await assert.rejects(context.methods.askAi('测试'), /暂未开放/);
  const controller = context.methods.askAiStream('测试');
  assert.equal(typeof controller.abort, 'function');
  await assert.rejects(controller.promise, /暂未开放/);
});

test('正式版会话接口全拦截，不创建、读取或删除会话', async () => {
  const source = await readFile(new URL('../api/ai-session.js', import.meta.url), 'utf8');
  let requests = 0;
  const context = { isAiAvailable: () => false, apiGet: () => requests++, apiPost: () => requests++, apiDelete: () => requests++ };
  runInNewContext(`${source.replace(/^import .*;\r?$/gm, '').replace(/export /g, '')}\nglobalThis.methods = { getAiSessions, createAiSession, getAiSessionDetail, deleteAiSession };`, context);
  for (const method of Object.values(context.methods)) await assert.rejects(method('test'), /暂未开放/);
  assert.equal(requests, 0);
});

test('首页、聊天与历史直达均显示期待页，聊天初始化不自动问候或启动录音', async () => {
  for (const path of ['index', 'chat', 'history']) {
    const source = await readFile(new URL(`../pages/ai/${path}.vue`, import.meta.url), 'utf8');
    assert.match(source, /<AiComingSoon v-if="!aiAvailable"/);
    assert.match(source, /<view v-else/);
  }
  const chat = await readFile(new URL('../pages/ai/chat.vue', import.meta.url), 'utf8');
  assert.match(chat, /onLoad\(\(pageOptions = \{\}\) => \{\s*if \(!aiAvailable\) return/);
  assert.match(chat, /onMounted\(\(\) => \{\s*if \(!aiAvailable\) return/);
});
