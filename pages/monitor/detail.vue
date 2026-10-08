<template>
  <view class="crm-page monitor-detail-page">
    <AppNavbar title="监控详情" />
    <view v-if="loading" class="crm-card state-card">正在加载价格监控...</view>
    <view v-else-if="watch" class="crm-card">
      <view class="product">
        <image :src="watch.image_snapshot || fallbackImage" mode="aspectFit" />
        <view class="product-info">
          <text class="product-name">{{ watch.goods_name_snapshot || watch.target_name_snapshot || '价格监控' }}</text>
          <text class="product-model">{{ watch.model_snapshot || (watch.watch_target_type === 'category' ? '分类监控' : '') }}</text>
          <text class="watch-status">{{ statusText }}</text>
        </view>
      </view>

      <!-- 接口仅提供关注时价格和最近检测价，不虚构逐次价格历史。 -->
      <template v-if="watch.watch_target_type === 'goods'">
        <view class="price-row"><text>关注时价格</text><text>¥{{ money(watch.base_price) }}</text></view>
        <view class="price-row current-price"><text>最近检测价</text><text>¥{{ money(watch.last_price ?? watch.base_price) }}</text></view>
        <view class="price-row"><text>价格变化</text><text>{{ changeText }}</text></view>
      </template>
      <view v-else class="category-tip">正在监控该分类内商品的价格变化</view>
      <view class="price-row"><text>关注时间</text><text>{{ watch.create_time_text || '--' }}</text></view>
      <view class="price-row"><text>最近通知</text><text>{{ watch.last_notify_time_text || '暂无' }}</text></view>
      <view class="actions">
        <button v-if="watch.watch_status === 'active'" :disabled="saving" @click="changeStatus('pause')">暂停监控</button>
        <button v-if="watch.watch_status === 'paused'" :disabled="saving" @click="changeStatus('resume')">恢复监控</button>
        <button v-if="watch.watch_status !== 'cancelled'" class="cancel" :disabled="saving" @click="confirmCancel">取消监控</button>
      </view>
    </view>
    <view v-else class="crm-card state-card">{{ errorText || '未找到这条价格监控' }}</view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { cancelMonitor, getMonitorList, pauseMonitor, resumeMonitor } from '@/api/monitor';
import { requireDealerAccess } from '@/utils/dealer-access';
import { openPage } from '@/utils/pages';
import { useUserStore } from '@/store/user';

const fallbackImage = 'https://gh.starall.cn/static/resource/aircon/outdoor-unit.png';
const userStore = useUserStore();
const watchId = ref('');
const watch = ref(null);
const loading = ref(false);
const saving = ref(false);
const errorText = ref('');

const statusText = computed(() => ({ active: '监控中', paused: '已暂停', cancelled: '已取消' })[watch.value?.watch_status] || '状态未知');
const changeText = computed(() => {
  if (!watch.value) return '--';
  const difference = Number(watch.value.base_price ?? 0) - Number(watch.value.last_price ?? watch.value.base_price ?? 0);
  return difference > 0 ? `降价 ¥${money(difference)}` : difference < 0 ? `上涨 ¥${money(-difference)}` : '暂无变化';
});
const money = (value) => Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

onLoad((options = {}) => {
  // 列表传关注记录 ID；兼容旧入口的商品 ID，以免已存在的页面链接失效。
  watchId.value = String(options.watchId || options.productId || '');
});

/** 后端没有单条详情接口，按真实分页逐页查找关注记录，不拼造历史记录。 */
const loadWatch = async () => {
  if (!watchId.value) {
    errorText.value = '缺少监控记录 ID';
    return;
  }
  loading.value = true;
  errorText.value = '';
  watch.value = null;
  try {
    let pageNo = 1;
    let lastPage = 1;
    do {
      const page = await getMonitorList({ page: pageNo, limit: 100 });
      const rows = Array.isArray(page) ? page : page?.data;
      if (!Array.isArray(rows)) throw new Error('价格监控列表格式不正确');
      watch.value = rows.find((row) => String(row.watch_id) === watchId.value || String(row.goods_id) === watchId.value) || null;
      lastPage = Number(page?.last_page || 1);
      pageNo += 1;
    } while (!watch.value && pageNo <= lastPage);
  } catch (error) {
    console.error('[价格监控] 读取详情失败：', error);
    errorText.value = error?.message || '价格监控加载失败';
  } finally {
    loading.value = false;
  }
};

onShow(async () => {
  if (!(await requireDealerAccess(userStore, () => openPage('/pages/index/index')))) return;
  await loadWatch();
});

/** 暂停、恢复、取消成功后才更新页面状态，保持与后端一致。 */
const changeStatus = async (action) => {
  if (!watch.value?.watch_id || saving.value) return;
  saving.value = true;
  try {
    if (action === 'pause') await pauseMonitor(watch.value.watch_id);
    if (action === 'resume') await resumeMonitor(watch.value.watch_id);
    if (action === 'cancel') await cancelMonitor(watch.value.watch_id);
    await loadWatch();
    uni.showToast({ title: '操作成功', icon: 'success' });
  } catch (error) {
    console.error('[价格监控] 更新状态失败：', error);
  } finally {
    saving.value = false;
  }
};

const confirmCancel = () => {
  uni.showModal({
    title: '取消价格监控',
    content: '取消后将不再监控该商品或分类，确定继续吗？',
    success: ({ confirm }) => { if (confirm) changeStatus('cancel'); }
  });
};
</script>

<style lang="scss" scoped>
.monitor-detail-page { min-height: 100vh; }
.state-card { color: #64748b; text-align: center; }
.product { display: flex; align-items: center; gap: 20rpx; }
.product image { width: 150rpx; height: 150rpx; flex-shrink: 0; background: #f4f8ff; border-radius: 14rpx; }
.product-info { min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
.product-name { color: #17233d; font-size: 30rpx; font-weight: 700; }
.product-model, .watch-status { color: #718098; font-size: 24rpx; }
.watch-status { color: #2468e8; }
.price-row { display: flex; justify-content: space-between; gap: 20rpx; padding: 22rpx 0; border-bottom: 1rpx solid #edf0f5; color: #718098; font-size: 25rpx; }
.price-row text:last-child { color: #17233d; text-align: right; }
.current-price text:last-child { color: #ef543f; font-size: 34rpx; font-weight: 700; }
.category-tip { padding: 30rpx 0; color: #64748b; font-size: 25rpx; }
.actions { display: flex; gap: 16rpx; margin-top: 30rpx; }
.actions button { flex: 1; background: #edf4ff; color: #2468e8; font-size: 26rpx; }
.actions .cancel { background: #fff0ed; color: #ef543f; }
</style>
