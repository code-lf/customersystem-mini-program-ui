<template>
  <view class="crm-page home-page">
    <view class="home-safe" />

    <view class="home-header">
      <view class="brand">
        <image class="brand__logo" src="/static/aircon/notice-cloud.png" mode="aspectFit" />
        <text class="brand__name">格宏助手</text>
      </view>
    </view>

    <view class="hello">
      <text class="hello__title">下午好，{{ userStore.userInfo.nickname || '张工' }}</text>
      <text class="hello__company">{{ userStore.userInfo.company_name || '格宏暖通科技有限公司' }}</text>
    </view>

    <view class="search-row">
      <up-icon name="search" size="18" color="#9aa5b5" />
      <input
        v-model="keyword"
        class="search-row__input"
        confirm-type="search"
        placeholder="搜索产品、报价单、资料"
        placeholder-class="search-placeholder"
        @confirm="handleSearch"
      />
      <button class="search-row__btn" @click="handleSearch">搜索</button>
    </view>

    <view class="section-head">
      <text>产品入口</text>
      <text @click="openPage('/pages/product/index')">全部产品 ›</text>
    </view>

    <view class="central-card" @click="openPage('/pages/product/category', { type: 'central' })">
      <view class="central-card__copy">
        <text class="central-card__title">中央空调</text>
        <text class="central-card__desc">多联机 / 商用系统 / 空气能</text>
        <button class="white-pill">进入选型</button>
      </view>
      <image src="/static/aircon/central-blue.png" mode="aspectFit" />
    </view>

    <view class="entry-row">
      <view class="entry-card entry-card--home" @click="openPage('/pages/product/category', { type: 'home' })">
        <view>
          <text class="entry-card__title">家用空调</text>
          <text class="entry-card__desc">壁挂式 / 柜式</text>
        </view>
        <image src="/static/aircon/home-wall.png" mode="aspectFit" />
      </view>
      <view class="entry-card entry-card--ai" @click="openPage('/pages/ai/index')">
        <view>
          <text class="entry-card__title">格宏助手</text>
          <text class="entry-card__desc">有问题问我</text>
        </view>
        <image src="/static/aircon/ai-robot-card.png" mode="aspectFit" />
      </view>
    </view>

    <view class="section-head section-head--compact section-head--blue">
      <text>快捷工具</text>
    </view>
    <view class="tool-grid">
      <view v-for="item in quickTools" :key="item.title" class="tool-item" @click="openPage(item.path)">
        <view class="tool-item__icon">
          <up-icon :name="item.icon" size="22" color="#2468e8" />
        </view>
        <text>{{ item.title }}</text>
      </view>
    </view>

    <view class="notice-strip" @click="openPage('/pages/notice/detail', { id: 1 })">
      <text>最新通知</text>
      <text>关于2026年中央空调价格调整的通知</text>
      <text>06-01</text>
    </view>

    <view class="section-head">
      <text>进行中的报价单</text>
      <text @click="openPage('/pages/solution/index')">查看全部 ›</text>
    </view>
    <view v-if="solutions.length" class="solution-mini" @click="openPage('/pages/solution/edit', { id: solutions[0].id })">
      <view>
        <text class="solution-mini__title">{{ solutions[0].title }}</text>
        <text class="solution-mini__desc">{{ solutions[0].items.length }}项产品 · ¥{{ formatMoney(solutions[0].totalPrice) }}</text>
      </view>
      <text class="solution-mini__link">继续编辑 ›</text>
    </view>

    <view class="section-head latest-head">
      <text>最新动态</text>
      <text @click="openPage('/pages/notice/index')">更多 ›</text>
    </view>
    <view v-for="notice in notices.slice(0, 2)" :key="notice.id" class="notice-mini" @click="openPage('/pages/notice/detail', { id: notice.id })">
      <text class="notice-mini__tag">{{ notice.type }}</text>
      <text class="notice-mini__title">{{ notice.title }}</text>
      <text class="notice-mini__date">{{ notice.time }}</text>
    </view>

    <view class="tabbar-space" />
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/store/user';
import { getNotices } from '@/api/content';
import { getSolutionList } from '@/api/solution';
import { openPage } from '@/utils/pages';

const userStore = useUserStore();
const keyword = ref('');
const notices = ref([]);
const solutions = ref([]);

// 中文说明：
// 首页快捷工具这里不再放满 6 个，而是按设计稿收成 5 个。
// 这样视觉上会更宽松，图标和文字也能做得更大，更接近设计稿效果。
const quickTools = [
  { title: '型号查询', icon: 'search', path: '/pages/password/index' },
  { title: '我的报价单', icon: 'file-text', path: '/pages/solution/index' },
  { title: '报价单', icon: 'order', path: '/pages/solution/index' },
  { title: '产品对比', icon: 'grid-fill', path: '/pages/product/list' },
  { title: '资料中心', icon: 'coupon', path: '/pages/product/index' }
];

const formatMoney = (value) => Number(value || 0).toLocaleString();

const handleSearch = () => {
  const text = keyword.value.trim();
  if (!text) return;
  openPage('/pages/product/list', { keyword: text });
};

onMounted(async () => {
  const [noticeResult, solutionResult] = await Promise.all([getNotices(), getSolutionList()]);
  notices.value = noticeResult.list || [];
  solutions.value = solutionResult.list || [];
});
</script>

<style lang="scss" scoped>
.home-page {
  padding: 0 24rpx;
  background: #f3f7fd;
}

.home-safe {
  height: calc(env(safe-area-inset-top) + 28rpx);
}

.home-header,
.brand,
.section-head,
.solution-mini,
.notice-mini,
.notice-strip {
  display: flex;
  align-items: center;
}

.home-header {
  justify-content: flex-start;
  height: 62rpx;
}

.brand__logo {
  width: 42rpx;
  height: 42rpx;
  margin-right: 8rpx;
}

.brand__name {
  color: #17233d;
  font-size: 31rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.hello {
  margin-top: 14rpx;
}

.hello__title,
.hello__company,
.central-card__title,
.central-card__desc,
.entry-card__title,
.entry-card__desc,
.solution-mini__title,
.solution-mini__desc {
  display: block;
}

.hello__title {
  color: #17233d;
  font-size: 36rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.hello__company {
  margin-top: 8rpx;
  color: #7c8798;
  font-size: 22rpx;
}

.search-row {
  display: flex;
  align-items: center;
  height: 64rpx;
  margin-top: 22rpx;
  padding: 0 10rpx 0 24rpx;
  border-radius: 34rpx;
  background: #fff;
}

.search-row__input {
  flex: 1;
  height: 64rpx;
  margin-left: 12rpx;
  color: #17233d;
  font-size: 24rpx;
}

.search-placeholder {
  color: #9aa5b5;
}

.search-row__btn {
  width: 86rpx;
  height: 48rpx;
  margin: 0;
  padding: 0;
  border-radius: 24rpx;
  background: #2468e8;
  color: #fff;
  font-size: 22rpx;
  line-height: 48rpx;
}

.section-head {
  justify-content: space-between;
  margin: 28rpx 0 16rpx;
}

.section-head--compact {
  margin-top: 26rpx;
}

.section-head--blue text:first-child {
  color: #2468e8;
}

.section-head text:first-child {
  color: #17233d;
  font-size: 29rpx;
  font-weight: 800;
}

.section-head text:last-child {
  color: #2468e8;
  font-size: 22rpx;
}

.central-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 170rpx;
  padding: 26rpx 26rpx 24rpx 30rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #2f75f6 0%, #165ddf 100%);
  overflow: hidden;
}

.central-card__copy {
  position: relative;
  z-index: 1;
}

.central-card__title {
  color: #fff;
  font-size: 38rpx;
  font-weight: 800;
}

.central-card__desc {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, .88);
  font-size: 22rpx;
}

.central-card image {
  width: 258rpx;
  height: 150rpx;
  margin-right: -16rpx;
}

.white-pill {
  width: 128rpx;
  height: 46rpx;
  margin: 22rpx 0 0;
  padding: 0;
  border-radius: 24rpx;
  background: #fff;
  color: #2468e8;
  font-size: 21rpx;
  line-height: 46rpx;
}

.entry-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 18rpx;
}

.entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 132rpx;
  padding: 22rpx;
  border-radius: 14rpx;
}

.entry-card--home {
  background: #e7f7ef;
}

.entry-card--ai {
  background: #edf4ff;
}

.entry-card__title {
  color: #17233d;
  font-size: 26rpx;
  font-weight: 800;
}

.entry-card__desc {
  margin-top: 8rpx;
  color: #7c8798;
  font-size: 20rpx;
}

.entry-card image {
  width: 104rpx;
  height: 94rpx;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  padding: 22rpx 12rpx 18rpx;
  border-radius: 16rpx;
  background: #fff;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #5f6f86;
  font-size: 21rpx;
  font-weight: 500;
  white-space: nowrap;
}

.tool-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 12rpx;
  border-radius: 18rpx;
  background: #f1f5ff;
  box-shadow: inset 0 0 0 1rpx rgba(36, 104, 232, .05);
}

.tool-item :deep(.u-icon__icon) {
  color: #2f73f5 !important;
  font-size: 28rpx !important;
}

.notice-strip {
  min-height: 72rpx;
  margin-top: 14rpx;
  padding: 0 18rpx;
  border-radius: 14rpx;
  background: #fff;
}

.notice-strip text:first-child {
  margin-right: 14rpx;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
}

.notice-strip text:nth-child(2) {
  flex: 1;
  overflow: hidden;
  color: #17233d;
  font-size: 24rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-strip text:last-child {
  margin-left: 12rpx;
  color: #8b95a7;
  font-size: 21rpx;
}

.solution-mini {
  justify-content: space-between;
  min-height: 104rpx;
  padding: 22rpx 24rpx;
  border-radius: 16rpx;
  background: #fff;
}

.solution-mini__title {
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
}

.solution-mini__desc {
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.solution-mini__link {
  color: #2468e8;
  font-size: 22rpx;
}

.notice-mini {
  min-height: 76rpx;
  padding: 0 22rpx;
  border-radius: 14rpx;
  background: #fff;
  margin-bottom: 14rpx;
}

.notice-mini__tag {
  margin-right: 14rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 20rpx;
}

.notice-mini__title {
  flex: 1;
  overflow: hidden;
  color: #17233d;
  font-size: 23rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-mini__date {
  margin-left: 14rpx;
  color: #8b95a7;
  font-size: 20rpx;
}

.tabbar-space {
  height: 120rpx;
}
</style>
