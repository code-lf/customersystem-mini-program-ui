import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { ref } from 'vue';

const page = await readFile(new URL('../pages/ai/chat.vue', import.meta.url), 'utf8');
const handler = page.match(/recognitionManager.onStop = \(result = \{\}\) => \{[\s\S]*?\n    \};/)[0];
function setup(action = '', leaving = false) {
  const sends = [], notices = [];
  const context = {
    recognitionManager: {}, isRecording: ref(true), isVoiceStopping: ref(false),
    pendingVoiceAction: action, recognizedText: ref('实时识别'), hasVoiceDraft: ref(true),
    inputContent: ref(''), isPageLeaving: leaving, console: { info() {} },
    sendMessage: text => sends.push(text), uni: { showToast: data => notices.push(data.title) }
  };
  runInNewContext(handler, context);
  return { context, sends, notices, stop: context.recognitionManager.onStop };
}

test('手动结束及自然结束均自动发送最终文字，重复回调不会重发', () => {
  for (const action of ['', 'stop', 'send']) {
    const view = setup(action);
    view.stop({ result: '最终问题' });
    view.stop({ result: '最终问题' });
    assert.deepEqual(view.sends, ['最终问题']);
    assert.equal(view.context.hasVoiceDraft.value, false);
  }
});
test('取消及退出页面不发送，空识别提示重试', () => {
  for (const [action, leaving] of [['cancel', false], ['', true]]) {
    const view = setup(action, leaving);
    view.stop({ result: '不发送' });
    assert.equal(view.sends.length, 0);
  }
  const empty = setup();
  empty.context.recognizedText.value = '';
  empty.stop({ result: '' });
  assert.equal(empty.sends.length, 0);
  assert.deepEqual(empty.notices, ['没有识别到文字，请重试']);
});
