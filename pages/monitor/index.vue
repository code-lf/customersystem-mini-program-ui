<template>
  <view class="monitor-page">
    <AppNavbar title="价格监控" />
    
    <!-- 三类内容分别读取关注列表、近期降价、全部价格波动接口。 -->
    <view class="header-section">
      <view class="tabs">
        <view v-for="tab in tabs" :key="tab.value" class="tab-item" :class="{ active: activeTab === tab.value }" @click="selectTab(tab.value)">
          <text>{{ tab.label }}</text>
          <view v-if="activeTab === tab.value" class="tab-indicator" />
        </view>
      </view>
    </view>

    <!-- 列表区 -->
    <view class="list-container">
      <template v-if="isLoading">
        <view v-for="i in 4" :key="i" class="monitor-card">
          <view class="skeleton-block" style="width: 160rpx; height: 160rpx; border-radius: 16rpx; margin-right: 24rpx;"></view>
          <view class="card-content">
            <view class="card-header" style="margin-bottom: 12rpx;">
              <view class="skeleton-block" style="width: 60%; height: 32rpx; border-radius: 6rpx;"></view>
              <view class="skeleton-block" style="width: 100rpx; height: 32rpx; border-radius: 8rpx;"></view>
            </view>
            <view class="skeleton-block" style="width: 50%; height: 40rpx; margin-bottom: 8rpx; border-radius: 6rpx;"></view>
            <view class="skeleton-block" style="width: 70%; height: 24rpx; border-radius: 6rpx; margin-bottom: 16rpx;"></view>
            <view class="card-footer">
              <view class="skeleton-block" style="width: 160rpx; height: 24rpx; border-radius: 6rpx;"></view>
              <view class="skeleton-block" style="width: 130rpx; height: 52rpx; border-radius: 26rpx;"></view>
            </view>
          </view>
        </view>
      </template>
      
      <template v-else-if="activeTab === 'watches'">
        <view 
          v-for="item in allItems"
          :key="item.id" 
          class="monitor-card" 
          @click="openPage('/pages/monitor/detail', { watchId: item.id })"
        >
        <!-- 图片区 -->
        <view class="image-box">
          <image :src="item.image" mode="aspectFit" />
          <view class="tag">{{ item.watch_target_type === 'category' ? '分类监控' : '商品监控' }}</view>
        </view>
        
        <!-- 内容区 -->
        <view class="card-content">
          <view class="card-header">
            <text class="model-text">{{ item.model }}</text>
            <view v-if="item.watch_target_type === 'goods' && item.change > 0" class="change-badge down">
              <text class="arrow">↓</text>
              <text>¥{{ money(item.change) }}</text>
            </view>
            <view v-else-if="item.watch_target_type === 'goods' && item.change < 0" class="change-badge flat">
              <text>↑ ¥{{ money(-item.change) }}</text>
            </view>
            <view v-else class="change-badge flat">
              <text>{{ item.watch_status === 'paused' ? '已暂停' : (item.watch_target_type === 'category' ? '监控中' : '无变化') }}</text>
            </view>
          </view>
          
          <view v-if="item.watch_target_type === 'goods'" class="price-section">
            <view class="current-price">
              <text class="label">当前监控价</text>
              <text class="symbol">¥</text>
              <text class="amount">{{ money(item.price) }}</text>
            </view>
            <text class="original-price">关注时 ¥{{ money(item.basePrice) }}</text>
          </view>
          <view v-else class="price-section">分类内商品价格变动监控</view>
          
          <view class="card-footer">
            <text class="update-time">关注时间：{{ item.create_time_text || '--' }}</text>
            <button class="action-btn" @click.stop="openPage('/pages/monitor/detail', { watchId: item.id })">查看详情</button>
          </view>
        </view>
      </view>
      
      </template>
      <template v-else>
        <view v-for="change in changes" :key="change.change_id" class="change-card" @click="openChangeProduct(change)">
          <view class="change-card__head">
            <text class="change-card__name">{{ change.goods_name_snapshot || change.model_snapshot || '商品价格变动' }}</text>
            <text class="change-card__direction" :class="change.change_direction === 'down' ? 'down' : 'up'">{{ change.change_direction === 'down' ? '降价' : '涨价' }}</text>
          </view>
          <text class="change-card__model">{{ change.model_snapshot || change.sku_snapshot || '' }}</text>
          <view class="change-card__prices">
            <text class="change-card__old">¥{{ money(change.old_price) }}</text>
            <text class="change-card__arrow">→</text>
            <text class="change-card__new" :class="change.change_direction === 'down' ? 'down' : 'up'">¥{{ money(change.new_price) }}</text>
            <text class="change-card__amount" :class="change.change_direction === 'down' ? 'down' : 'up'">{{ signedAmount(change.change_amount) }}</text>
          </view>
          <text class="change-card__time">{{ change.change_time_text || formatTime(change.change_time) }}</text>
        </view>
      </template>
      <view v-if="!isLoading && !records.length" class="empty-state">
        <text>{{ loadError || emptyMessage }}</text>
        <text v-if="loadError" class="retry-link" @click="loadPage({ reset: true })">重试</text>
      </view>
      <view v-if="isLoadingMore" class="load-more">正在加载更多...</view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onReachBottom, onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { requireDealerAccess } from '@/utils/dealer-access';
import { useUserStore } from '@/store/user';
import { getMonitorList, getRecentPriceDrops, getPriceFluctuations } from '@/api/monitor';

const userStore = useUserStore();
const tabs = [
  { label: '我关注的', value: 'watches' },
  { label: '近期降价', value: 'drops' },
  { label: '价格波动', value: 'fluctuations' }
];
const activeTab = ref('watches');
const isLoading = ref(false);
const isLoadingMore = ref(false);
const loadError = ref('');
const records = ref([]);
const currentPage = ref(1);
const hasMore = ref(true);
const pageSize = 20;
let requestSequence = 0;

/** 三个标签分别请求对应接口，并复用后端的分页结构。 */
const loadPage = async ({ reset = false } = {}) => {
  if (!reset && (isLoading.value || isLoadingMore.value)) return;
  if (reset) {
    currentPage.value = 1;
    hasMore.value = true;
    records.value = [];
    loadError.value = '';
  }
  if (!hasMore.value) return;
  const sequence = ++requestSequence;
  const pageNumber = currentPage.value;
  const tab = activeTab.value;
  const request = tab === 'drops' ? getRecentPriceDrops : tab === 'fluctuations' ? getPriceFluctuations : getMonitorList;
  if (reset) isLoading.value = true;
  else isLoadingMore.value = true;
  try {
    // request 层已剥离顶层 code/data，此处拿到的是 { data, total, last_page }。
    const page = await request({ page: pageNumber, limit: pageSize });
    // 切换标签后忽略上一个标签尚未返回的请求，避免列表串页。
    if (sequence !== requestSequence) return;
    const rows = Array.isArray(page) ? page : page?.data;
    if (!Array.isArray(rows)) throw new Error('价格监控列表格式不正确');
    records.value = reset ? rows : [...records.value, ...rows];
    const lastPage = Number(page?.last_page || 0);
    hasMore.value = lastPage > 0 ? pageNumber < lastPage : rows.length >= pageSize;
    currentPage.value = pageNumber + 1;
    loadError.value = '';
  } catch (error) {
    if (sequence !== requestSequence) return;
    console.error('[价格监控] 列表加载失败：', error);
    loadError.value = error?.message || '价格监控加载失败';
  } finally {
    if (sequence === requestSequence) {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }
};

/** 标签切换时从第一页重新加载。 */
const selectTab = (tab) => {
  if (tab === activeTab.value) return;
  activeTab.value = tab;
  loadPage({ reset: true });
};

onShow(async () => {
  // 价格监控页面本身也校验，阻止从收藏链接或历史页面绕过入口。
  if (!(await requireDealerAccess(userStore, () => openPage('/pages/index/index')))) return;
  loadPage({ reset: true });
});

onReachBottom(() => {
  if (hasMore.value) loadPage();
});

// 列表字段均取自 PriceWatch 快照，不能用本地商品参考价冒充监控价。
const allItems = computed(() => {
  return (activeTab.value === 'watches' ? records.value : []).map((item) => {
    const basePrice = Number(item.base_price ?? 0);
    const currentPrice = Number(item.last_price ?? item.base_price ?? 0);
    return {
      ...item,
      id: item.watch_id,
      model: item.model_snapshot || item.target_name_snapshot || item.goods_name_snapshot || '未命名监控',
      image: item.image_snapshot || 'https://gh.starall.cn/static/resource/aircon/outdoor-unit.png',
      basePrice,
      price: currentPrice,
      change: basePrice - currentPrice
    };
  });
});

const changes = computed(() => activeTab.value === 'watches' ? [] : records.value);
const emptyMessage = computed(() => ({
  watches: '暂无关注的价格监控商品',
  drops: '暂无近期降价记录',
  fluctuations: '暂无价格波动记录'
})[activeTab.value]);

/** 价格变动事件关联真实商品，可直接进入商品详情。 */
const openChangeProduct = (change) => {
  if (change.goods_id) openPage('/pages/product/detail', { id: change.goods_id });
};

const money = (value) => Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signedAmount = (value) => `${Number(value || 0) > 0 ? '+' : ''}${money(value)} 元`;
/** 接口时间戳为秒，兼容后端直接返回的展示时间。 */
const formatTime = (value) => {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '--';
  const date = new Date(timestamp * 1000);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
</script>

<style lang="scss" scoped>
.monitor-page {
  min-height: 100vh;
  background-color: #f4f7fb;
  padding-bottom: 40rpx;
}

.header-section {
  background-color: #ffffff;
  padding: 0 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs {
  display: flex;
  align-items: stretch;
}

.tab-item {
  position: relative;
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #687b95;
  font-size: 27rpx;
}

.tab-item.active {
  color: #2468e8;
  font-weight: 700;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 44rpx;
  height: 5rpx;
  border-radius: 5rpx;
  background: #2468e8;
}

/* 列表容器 */
.list-container {
  padding: 24rpx;
}

/* 精美卡片设计 */
.monitor-card {
  display: flex;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.monitor-card:active {
  transform: scale(0.98);
}

.image-box {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-right: 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.image-box image {
  width: 120rpx;
  height: 120rpx;
}

.tag {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #2468e8, #4f86f7);
  color: #fff;
  font-size: 18rpx;
  padding: 4rpx 10rpx;
  border-radius: 16rpx 0 16rpx 0;
  font-weight: bold;
}

.card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.model-text {
  color: #1a2233;
  font-size: 30rpx;
  font-weight: bold;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 10rpx;
}

.change-badge {
  display: flex;
  align-items: center;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.change-badge.down {
  background: #ecfdf5;
  color: #10b981;
}

.change-badge.flat {
  background: #f1f5f9;
  color: #94a3b8;
}

.arrow {
  font-size: 20rpx;
  margin-right: 2rpx;
}

.price-section {
  margin: 12rpx 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
}

.current-price {
  display: flex;
  align-items: baseline;
  color: #ef4444;
  margin-right: 16rpx;
}

.current-price .label {
  font-size: 22rpx;
  color: #64748b;
  margin-right: 8rpx;
}

.current-price .symbol {
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 2rpx;
}

.current-price .amount {
  font-size: 36rpx;
  font-weight: 900;
  letter-spacing: -1rpx;
}

.original-price {
  font-size: 22rpx;
  color: #94a3b8;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6rpx;
}

.update-time {
  font-size: 22rpx;
  color: #cbd5e1;
}

.action-btn {
  margin: 0;
  padding: 0 24rpx;
  height: 52rpx;
  line-height: 52rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: bold;
  border-radius: 26rpx;
  border: none;
}

.action-btn::after {
  border: none;
}

/* 降价与波动共用事件卡片，展示接口返回的变动前后价格。 */
.change-card {
  padding: 28rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.change-card__head, .change-card__prices {
  display: flex;
  align-items: center;
}

.change-card__head { justify-content: space-between; gap: 16rpx; }
.change-card__name { flex: 1; min-width: 0; font-size: 29rpx; font-weight: 700; color: #1a2233; }
.change-card__direction { flex-shrink: 0; padding: 6rpx 12rpx; border-radius: 8rpx; font-size: 22rpx; }
.change-card__model { display: block; margin-top: 8rpx; color: #8190a5; font-size: 22rpx; }
.change-card__prices { gap: 14rpx; margin: 22rpx 0 16rpx; flex-wrap: wrap; }
.change-card__old { color: #94a3b8; font-size: 24rpx; text-decoration: line-through; }
.change-card__arrow { color: #94a3b8; font-size: 24rpx; }
.change-card__new { font-size: 34rpx; font-weight: 700; }
.change-card__amount { margin-left: auto; font-size: 23rpx; font-weight: 600; }
.change-card__time { color: #94a3b8; font-size: 21rpx; }
.change-card__direction.down { color: #ef4444; background: #fff1f1; }
.change-card__direction.up { color: #2468e8; background: #edf4ff; }
.change-card__new.down, .change-card__amount.down { color: #ef4444; }
.change-card__new.up, .change-card__amount.up { color: #2468e8; }

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  height: 300rpx;
  color: #94a3b8;
  font-size: 28rpx;
}
.retry-link { color: #2468e8; font-size: 25rpx; }
.load-more { padding: 20rpx; text-align: center; color: #94a3b8; font-size: 23rpx; }
.skeleton-block {
  background: #e2e8f0;
  background-image: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 37%, #e2e8f0 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>
