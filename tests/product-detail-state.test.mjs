import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { ref, computed } from 'vue';

const source = await readFile(new URL('../pages/product/detail.vue', import.meta.url), 'utf8');
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?$/gm, '');

// 运行真实页面方法，接口由桩替代，避免测试创建实际收藏或监控记录。
function createPage(overrides = {}) {
  let monitorCalls = 0;
  const user = { isLoggedIn: true };
  const context = {
    ref, computed, console: { error() {} },
    onLoad() {}, onShow() {}, onShareAppMessage() {}, onShareTimeline() {},
    useUserStore: () => user,
    getProductDetail: async () => ({ goods_id: 10, is_favorite: 1, is_price_monitor: '1' }),
    requireDealerAccess: async () => true,
    watchMonitorGoods: async () => { monitorCalls++; },
    addFavoriteProduct: async () => {}, removeFavoriteProduct: async () => {},
    uni: { showToast() {}, showModal: ({ success }) => success({ confirm: false }) }, ...overrides
  };
  runInNewContext(`${script}\nglobalThis.form = { productId, isFav, isMonitored, loadDetail, followPrice, toggleFavorite };`, context);
  context.form.productId.value = 10;
  return { form: context.form, user, monitorCalls: () => monitorCalls };
}

test('详情按接口标识回显，支持数字和字符串，0及未登录重置状态', async () => {
  const { form, user } = createPage();
  await form.loadDetail(10);
  assert.equal(form.isFav.value, true);
  assert.equal(form.isMonitored.value, true);
  user.isLoggedIn = false;
  await form.loadDetail(10);
  assert.equal(form.isFav.value, false);
  assert.equal(form.isMonitored.value, false);
  const empty = createPage({ getProductDetail: async () => ({ is_favorite: '0', is_price_monitor: 0 }) });
  await empty.form.loadDetail(10);
  assert.equal(empty.form.isFav.value, false);
  assert.equal(empty.form.isMonitored.value, false);
});

test('监控成功立即显示已监控，放弃取消时不重复添加', async () => {
  const { form, monitorCalls } = createPage();
  await form.followPrice();
  assert.equal(form.isMonitored.value, true);
  await form.followPrice();
  assert.equal(monitorCalls(), 1);
});

test('取消逐页查找精确商品，用监控记录ID调用接口并刷新状态', async () => {
  const cancelled = [];
  const pages = [];
  const { form } = createPage({
    uni: { showToast() {}, showModal: ({ success }) => success({ confirm: true }) },
    getMonitorList: async ({ page }) => {
      pages.push(page);
      return { last_page: 2, data: page === 1 ? [
        { watch_id: 30, watch_target_type: 'category', watch_target_value: 10, watch_status: 'active' },
        { watch_id: 31, watch_target_type: 'goods', watch_target_value: 11, watch_status: 'active' }
      ] : [{ watch_id: 99, watch_target_type: 'goods', watch_target_value: 10, watch_status: 'active' }] };
    },
    cancelMonitor: async (id) => cancelled.push(id),
    getProductDetail: async () => ({ goods_id: 10, is_price_monitor: 0 })
  });
  form.isMonitored.value = true;
  await form.followPrice();
  assert.deepEqual(pages, [1, 2]);
  assert.deepEqual(cancelled, [99]);
  assert.equal(form.isMonitored.value, false);
});

test('分类监控不自动取消；接口失败保持已监控状态', async () => {
  for (const categoryOnly of [true, false]) {
    let cancellations = 0;
    const { form } = createPage({
      uni: { showToast() {}, showModal: ({ success }) => success({ confirm: true }) },
      openPage() {},
      getMonitorList: async () => ({ data: [{ watch_id: 99, watch_target_type: categoryOnly ? 'category' : 'goods', watch_target_value: 10, watch_status: 'active' }] }),
      cancelMonitor: async () => { cancellations++; throw new Error('取消失败'); }
    });
    form.isMonitored.value = true;
    await form.followPrice();
    assert.equal(form.isMonitored.value, true);
    assert.equal(cancellations, categoryOnly ? 0 : 1);
  }
});

test('取消商品监控后仍有分类监控时保留已监控标识', async () => {
  const { form } = createPage({
    uni: { showToast() {}, showModal: ({ success }) => success({ confirm: true }) },
    getMonitorList: async () => ({ data: [{ watch_id: 99, watch_target_type: 'goods', watch_target_value: 10, watch_status: 'active' }] }),
    cancelMonitor: async () => {}
  });
  form.isMonitored.value = true;
  await form.followPrice();
  assert.equal(form.isMonitored.value, true);
});

test('监控失败不误显示成功，收藏切换成功同步更新状态', async () => {
  const { form } = createPage({ watchMonitorGoods: async () => { throw new Error('失败'); } });
  await form.followPrice();
  assert.equal(form.isMonitored.value, false);
  await form.toggleFavorite();
  assert.equal(form.isFav.value, true);
  await form.toggleFavorite();
  assert.equal(form.isFav.value, false);
});
