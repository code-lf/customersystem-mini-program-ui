import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { ref } from 'vue';

const page = await readFile(new URL('../pages/feedback/index.vue', import.meta.url), 'utf8');
const script = page.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?$/gm, '');

// 直接运行页面逻辑，验证真实提交字段、失败保留和重复点击保护。
function createPage(overrides = {}) {
  const requests = [];
  const messages = [];
  const context = {
    ref, onShow: (callback) => callback(),
    useUserStore: () => ({ isLoggedIn: true, userInfo: { mobile: '13800000000', nickname: '张先生' } }),
    createFeedback: async (data) => { requests.push(data); return { feedback_id: 10 }; },
    uploadFile: async () => ({ url: '/uploads/test.jpg' }),
    uni: { showToast: (data) => messages.push(data), showModal: (data) => messages.push(data),
      chooseImage: ({ success }) => success({ tempFilePaths: ['local.jpg'] }) },
    ...overrides
  };
  runInNewContext(`${script}\nglobalThis.form = { content, mobile, pictures, submitting, uploading, submitFeedback, choosePictures };`, context);
  return { form: context.form, requests, messages };
}

test('反馈无需分类，预填手机号，带真实附件提交且阻止重复请求', async () => {
  const { form, requests, messages } = createPage();
  assert.equal(form.mobile.value, '13800000000');
  form.content.value = '  商品价格问题  ';
  await form.choosePictures();
  await Promise.all([form.submitFeedback(), form.submitFeedback()]);
  assert.equal(requests.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(requests[0])), {
    feedback_content: '商品价格问题', contact_mobile: '13800000000', contact_name: '张先生',
    attachments: [{ url: '/uploads/test.jpg' }]
  });
  assert.equal(form.content.value, '');
  assert.equal(form.pictures.value.length, 0);
  assert.ok(messages.some((item) => item.title === '提交成功'));
});

test('无内容、手机号错误和上传未完成时不提交', async () => {
  const { form, requests } = createPage();
  await form.submitFeedback();
  form.content.value = '反馈';
  form.mobile.value = '123';
  await form.submitFeedback();
  form.mobile.value = '13800000000';
  form.uploading.value = true;
  await form.submitFeedback();
  assert.equal(requests.length, 0);
});

test('后端拒绝或未返回编号时保留内容，不伪造成功', async () => {
  for (const createFeedback of [async () => { throw new Error('提交失败'); }, async () => ({})]) {
    const { form, messages } = createPage({ createFeedback });
    form.content.value = '需要保留的内容';
    await form.submitFeedback();
    assert.equal(form.content.value, '需要保留的内容');
    assert.equal(form.submitting.value, false);
    assert.ok(!messages.some((item) => item.title === '提交成功'));
  }
});

test('上传失败不加入虚假附件，活动明细不再渲染缩略图', async () => {
  const { form } = createPage({ uploadFile: async () => ({}) });
  await form.choosePictures();
  assert.equal(form.pictures.value.length, 0);
  assert.equal(form.uploading.value, false);
  const detail = await readFile(new URL('../pages/marketing/detail.vue', import.meta.url), 'utf8');
  assert.ok(!detail.includes('prod-thumb'));
});
