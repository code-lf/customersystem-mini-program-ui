import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { reactive, ref, effect } from 'vue';

const source = await readFile(new URL('../api/ai-assistant.js', import.meta.url), 'utf8');
// 按微信条件编译执行实际流式方法，网络使用模拟分块；不冒充线上流式验证。
const executable = source.replace(/^import .*;\r?$/gm, '')
  .replace(/\/\/ #ifndef MP-WEIXIN[\s\S]*?\/\/ #endif/g, '')
  .replace(/export default\s*\{[\s\S]*?\};/g, '').replace(/export /g, '');

const createStream = () => {
  let requestOptions;
  let receiveChunk;
  let fallbackCalls = 0;
  const timers = new Map();
  const chunks = [];
  const context = {
    console: { warn() {} }, TextDecoder,
    config: { baseUrl: 'https://example.test/api', aiAssistant: {} },
    STORAGE_KEYS: { token: 'token' }, getStorage: () => 'test-session',
    resolveAiCards: (text) => ({ text, products: [], quotes: [], materials: [] }),
    request: { post: async () => { fallbackCalls++; return { answer: '完整答案' }; } },
    setTimeout: (callback, ms) => { const id = timers.size + 1; timers.set(id, { callback, ms }); return id; },
    clearTimeout: (id) => timers.delete(id),
    uni: {
      // 即使 canIUse 返回 false，也应实测 RequestTask，而非直接放弃流式。
      canIUse: () => false,
      request: (options) => {
        requestOptions = options;
        return { onChunkReceived: (callback) => { receiveChunk = callback; }, abort() {} };
      }
    }
  };
  runInNewContext(`${executable}\nglobalThis.start = askAiStream;`, context);
  const controller = context.start('你好', [], {}, { onDelta: (delta, text) => chunks.push({ delta, text }) });
  const feed = (value) => { const bytes = new TextEncoder().encode(value); receiveChunk({ data: bytes.buffer }); };
  return { controller, feed, chunks, timers, fallbackCalls: () => fallbackCalls, options: () => requestOptions };
};

test('微信分块按实际能力启用，首字等待保留30秒，完成前逐片回调', async () => {
  const stream = createStream();
  assert.equal(stream.options().enableChunked, true);
  assert.equal(stream.fallbackCalls(), 0);
  assert.equal([...stream.timers.values()][0].ms, 30000);
  stream.feed('data: {"type":"delta","delta":"你"}\n\n');
  assert.equal(stream.chunks[0].text, '你');
  assert.equal(stream.timers.size, 0);
  stream.feed('data: {"type":"delta","delta":"好"}\n\ndata: {"type":"done"}\n\n');
  const result = await stream.controller.promise;
  assert.equal(result.text, '你好');
  assert.equal(result.streamed, true);
  assert.equal(stream.fallbackCalls(), 0);
});

test('首字真正超时仅降级一次，完整答案立即回显而不额外模拟打字', async () => {
  const stream = createStream();
  const timer = [...stream.timers.values()][0];
  timer.callback();
  timer.callback();
  const result = await stream.controller.promise;
  assert.equal(stream.fallbackCalls(), 1);
  assert.equal(stream.chunks.length, 1);
  assert.equal(stream.chunks[0].text, '完整答案');
  assert.equal(result.fallback, true);
});

test('页面流式消息对象可在每次增量写入后触发Vue刷新', async () => {
  const page = await readFile(new URL('../pages/ai/chat.vue', import.meta.url), 'utf8');
  const declaration = page.match(/const aiMessage = reactive\(\{[\s\S]*?\}\);/)[0];
  const context = { reactive };
  runInNewContext(`${declaration}\nglobalThis.message = aiMessage;`, context);
  const messages = ref([context.message]);
  let updates = 0;
  effect(() => { messages.value[0].text; updates++; });
  context.message.text = '首字';
  assert.equal(updates, 2);
  context.message.text += '继续生成';
  assert.equal(updates, 3);
});
