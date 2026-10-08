<template>
  <view class="crm-page notice-page">
    <AppNavbar title="降价监控通知" />
    <view class="tabs">
      <text :class="{ active: active === 'drops' }" @click="switchTab('drops')">近期降价</text>
      <text :class="{ active: active === 'all' }" @click="switchTab('all')">全部波动</text>
    </view>
    <view v-if="loading && !records.length" class="state">正在加载价格变动...</view>
    <view v-else-if="error && !records.length" class="state">{{ error }}<text class="retry" @click="reload">重试</text></view>
    <view v-else-if="!records.length" class="state">{{ active === 'drops' ? '关注商品近期暂无降价记录' : '关注商品暂无价格波动记录' }}</view>
    <view v-for="item in records" :key="item.change_id" class="change-card" @click="openProduct(item)">
      <view class="card-top">
        <text class="goods-name">{{ item.goods_name_snapshot || item.model_snapshot || '商品价格变动' }}</text>
        <text class="direction" :class="item.change_direction === 'down' ? 'down' : 'up'">{{ item.change_direction === 'down' ? '降价' : '涨价' }}</text>
      </view>
      <text class="model">{{ item.model_snapshot || item.sku_snapshot || '' }}</text>
      <view class="price-line">
        <text class="old-price">¥{{ money(item.old_price) }}</text>
        <text class="arrow">→</text>
        <text class="new-price" :class="item.change_direction === 'down' ? 'down' : 'up'">¥{{ money(item.new_price) }}</text>
        <text class="difference" :class="item.change_direction === 'down' ? 'down' : 'up'">{{ signedAmount(item.change_amount) }}</text>
      </view>
      <text class="time">{{ item.change_time_text || formatTime(item.change_time) }}</text>
    </view>
    <view v-if="records.length && page < lastPage" class="load-more" @click="loadMore">{{ loading ? '加载中...' : '加载更多' }}</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getPriceFluctuations, getRecentPriceDrops } from '@/api/monitor';
import { useUserStore } from '@/store/user';
import { requireDealerAccess } from '@/utils/dealer-access';
import { openPage } from '@/utils/pages';

const userStore = useUserStore();
const active = ref('drops');
const records = ref([]);
const page = ref(1);
const lastPage = ref(1);
const loading = ref(false);
const error = ref('');
let requestSequence = 0;

const money = (value) => Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
const signedAmount = (value) => `${Number(value) > 0 ? '+' : ''}${money(value)} 元`;
const formatTime = (seconds) => seconds ? new Date(Number(seconds) * 1000).toLocaleString('zh-CN') : '';
const openProduct = (item) => { if (item.goods_id) openPage('/pages/product/detail', { id: item.goods_id }); };

/** 按当前页签读取 PriceMonitor 分页记录，切换页签时忽略旧请求的迟到响应。 */
const loadPage = async (targetPage) => {
  if (loading.value && targetPage !== 1) return;
  const sequence = ++requestSequence;
  loading.value = true;
  error.value = '';
  try {
    const method = active.value === 'drops' ? getRecentPriceDrops : getPriceFluctuations;
    const result = await method({ page: targetPage, limit: 10 });
    if (sequence !== requestSequence) return;
    const rows = Array.isArray(result) ? result : (result?.data || []);
    records.value = targetPage === 1 ? rows : [...records.value, ...rows];
    page.value = targetPage;
    lastPage.value = Number(result?.last_page || targetPage);
  } catch (err) {
    if (sequence === requestSequence) error.value = err?.message || '价格变动加载失败';
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
};

const reload = () => loadPage(1);
const loadMore = () => { if (!loading.value && page.value < lastPage.value) loadPage(page.value + 1); };
const switchTab = (tab) => {
  if (active.value === tab) return;
  active.value = tab;
  records.value = [];
  reload();
};

onShow(async () => {
  // 消息页也必须校验经销商身份，避免绕过个人中心入口直接访问价格数据。
  if (!(await requireDealerAccess(userStore))) return;
  reload();
});
</script>

<style lang="scss" scoped>
.notice-page { min-height: 100vh; padding: 0 24rpx 48rpx; background: #f5f8fd; }
.tabs { display: flex; gap: 40rpx; margin: 18rpx 0 24rpx; border-bottom: 1rpx solid #e6ebf2; }
.tabs text { padding: 20rpx 8rpx; color: #667286; font-size: 27rpx; }
.tabs text.active { color: #2468e8; font-weight: 700; border-bottom: 4rpx solid #2468e8; }
.state { padding: 100rpx 20rpx; text-align: center; color: #8b95a7; font-size: 26rpx; }
.retry { display: block; margin-top: 20rpx; color: #2468e8; }
.change-card { margin-bottom: 18rpx; padding: 26rpx; border-radius: 20rpx; background: #fff; }
.card-top { display: flex; justify-content: space-between; gap: 20rpx; align-items: center; }
.goods-name { flex: 1; color: #17233d; font-size: 28rpx; font-weight: 700; }
.direction { font-size: 22rpx; font-weight: 700; }
.model, .time { display: block; margin-top: 12rpx; color: #8b95a7; font-size: 23rpx; }
.price-line { display: flex; align-items: center; flex-wrap: wrap; gap: 14rpx; margin-top: 20rpx; }
.old-price { color: #718098; font-size: 25rpx; text-decoration: line-through; }
.arrow { color: #aab4c1; }
.new-price { font-size: 32rpx; font-weight: 800; }
.difference { margin-left: auto; font-size: 23rpx; }
.down { color: #10b981; }
.up { color: #ef543f; }
.load-more { padding: 32rpx; text-align: center; color: #2468e8; font-size: 25rpx; }
</style>
