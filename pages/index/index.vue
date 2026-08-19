<template>
  <view class="crm-page home-page">
    <view class="home-safe" />

    <!-- 顶部高质感品牌与状态栏 -->
    <view class="home-header">
      <view class="brand">
        <view class="brand__icon-wrap">
          <image class="brand__logo" src="/static/aircon/notice-cloud.png" mode="aspectFit" />
        </view>
        <view class="brand__text-box">
          <text class="brand__name">格宏助手</text>
          <text class="brand__sub">暖通工程智能选型平台</text>
        </view>
      </view>
      <view class="home-header__status" @click="openPage('/pages/ai/index')">
        <view class="status-dot" />
        <text>AI 在线</text>
      </view>
    </view>

    <!-- 问候与专属顾问卡片 -->
    <view class="greeting-card">
      <view class="greeting-card__top">
        <view class="greeting-user">
          <view class="greeting-name-row">
            <text class="greeting-name">下午好，{{ userStore.userInfo.nickname || '张工' }}</text>
            <text class="greeting-badge">认证工程师</text>
          </view>
          <view class="greeting-company-row">
            <up-icon name="home" size="14" color="#7a8b9e" />
            <text class="greeting-company">{{ userStore.userInfo.company_name || '格宏暖通科技有限公司' }}</text>
          </view>
        </view>
        <image
          class="greeting-avatar"
          :src="userStore.userInfo.avatar || '/static/avatars/avatar-demo.png'"
          mode="aspectFill"
          @click="openPage('/pages/my/my')"
        />
      </view>

      <!-- 搜索栏嵌于问候区下方 -->
      <view class="search-row">
        <up-icon name="search" size="20" color="#9aa5b5" />
        <input
          v-model="keyword"
          class="search-row__input"
          confirm-type="search"
          placeholder="搜索产品型号、报价单、资料手册"
          placeholder-class="search-placeholder"
          @confirm="handleSearch"
        />
        <button class="search-row__btn" @click="handleSearch">搜索</button>
      </view>
    </view>

    <view class="section-head">
      <text>产品入口</text>
      <text class="section-more" @click="openPage('/pages/product/index')">全部产品 ›</text>
    </view>

    <view class="central-card" @click="openPage('/pages/product/category', { type: 'central' })">
      <view class="central-card__copy">
        <text class="central-card__title">中央空调</text>
        <text class="central-card__desc">多联机 / 商用系统 / 空气能</text>
        <button class="white-pill">进入选型</button>
      </view>
      <image src="/static/aircon/central-default.png" mode="aspectFit" />
    </view>

    <view class="entry-row">
      <view class="entry-card entry-card--home" @click="openPage('/pages/product/category', { type: 'home' })">
        <view class="entry-card__copy">
          <text class="entry-card__title">家用空调</text>
          <text class="entry-card__desc">壁挂式 / 柜式</text>
        </view>
        <image src="/static/aircon/home-green.png" mode="aspectFit" />
      </view>
      <view class="entry-card entry-card--ai" @click="openPage('/pages/ai/index')">
        <view class="entry-card__copy">
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
          <up-icon :name="item.icon" size="24" color="#2468e8" />
        </view>
        <text>{{ item.title }}</text>
      </view>
    </view>

    <view class="notice-strip" @click="openPage('/pages/notice/detail', { id: 1 })">
      <text class="notice-tag">最新通知</text>
      <text class="notice-title">关于2026年中央空调价格调整的通知</text>
      <text class="notice-date">06-01</text>
    </view>

    <view class="section-head">
      <text>进行中的报价单</text>
      <text class="section-more" @click="openPage('/pages/solution/index')">查看全部 ›</text>
    </view>
    <view v-if="solutions.length" class="solution-mini" @click="openPage('/pages/solution/edit', { id: solutions[0].id })">
      <view class="solution-mini__left">
        <text class="solution-mini__title">{{ solutions[0].title }}</text>
        <text class="solution-mini__desc">{{ solutions[0].items.length }}项产品 · ¥{{ formatMoney(solutions[0].totalPrice) }}</text>
      </view>
      <text class="solution-mini__link">继续编辑 ›</text>
    </view>

    <view class="section-head latest-head">
      <text>最新动态</text>
      <text class="section-more" @click="openPage('/pages/notice/index')">更多 ›</text>
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

const quickTools = [
  { title: '型号查询', icon: 'search', path: '/pages/password/index' },
  { title: '我的报价单', icon: 'file-text-fill', path: '/pages/solution/index' },
  { title: '新建方案', icon: 'order', path: '/pages/solution/index' },
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
  min-height: 100vh;
  padding: 0 24rpx;
  background: linear-gradient(180deg, #d2e4ff 0%, #e8f1fd 280rpx, #f4f7fc 500rpx, #f4f7fc 100%);
}

.home-safe {
  height: calc(env(safe-area-inset-top) + 20rpx);
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  margin-bottom: 16rpx;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.brand__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 58rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.12);
}

.brand__logo {
  width: 38rpx;
  height: 38rpx;
}

.brand__text-box {
  display: flex;
  flex-direction: column;
}

.brand__name {
  color: #132238;
  font-size: 32rpx;
  font-weight: 900;
  line-height: 36rpx;
  letter-spacing: 0.5rpx;
}

.brand__sub {
  color: #78879b;
  font-size: 20rpx;
  line-height: 24rpx;
  margin-top: 2rpx;
}

.home-header__status {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 8rpx 18rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2rpx 10rpx rgba(23, 35, 61, 0.05);
}

.home-header__status text {
  color: #10b981;
  font-size: 22rpx;
  font-weight: 700;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8rpx #10b981;
}

/* 问候与搜索整合卡片 */
.greeting-card {
  padding: 24rpx 24rpx 20rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(243, 248, 255, 0.92) 100%);
  box-shadow: 0 8rpx 28rpx rgba(23, 35, 61, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.greeting-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.greeting-user {
  flex: 1;
  min-width: 0;
}

.greeting-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.greeting-name {
  color: #15223a;
  font-size: 36rpx;
  font-weight: 900;
  letter-spacing: 0.5rpx;
}

.greeting-badge {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 20rpx;
  font-weight: 700;
}

.greeting-company-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 6rpx;
}

.greeting-company {
  color: #64748b;
  font-size: 23rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.greeting-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 3rpx solid #fff;
  box-shadow: 0 4rpx 14rpx rgba(23, 35, 61, 0.08);
  flex-shrink: 0;
  margin-left: 16rpx;
}

.search-row {
  display: flex;
  align-items: center;
  height: 76rpx;
  margin-top: 20rpx;
  padding: 0 10rpx 0 24rpx;
  border-radius: 38rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.04);
  border: 1rpx solid #e5edf8;
}

.search-row__input {
  flex: 1;
  height: 76rpx;
  margin-left: 14rpx;
  color: #17233d;
  font-size: 26rpx;
}

.search-placeholder {
  color: #9aa5b5;
}

.search-row__btn {
  width: 108rpx;
  height: 56rpx;
  margin: 0;
  padding: 0;
  border-radius: 28rpx;
  background: #2468e8;
  color: #fff;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 56rpx;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.3);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 32rpx 0 18rpx;
}

.section-head--compact {
  margin-top: 30rpx;
}

.section-head--blue text:first-child {
  color: #2468e8;
}

.section-head text:first-child {
  color: #17233d;
  font-size: 30rpx;
  font-weight: 800;
}

.section-more {
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 600;
}

.central-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 180rpx;
  padding: 28rpx 28rpx 24rpx 32rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #2d72f5 0%, #1555d4 100%);
  overflow: hidden;
  box-shadow: 0 8rpx 28rpx rgba(21, 85, 212, 0.28);
}

.central-card__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.central-card__title {
  display: block;
  color: #fff;
  font-size: 38rpx;
  font-weight: 900;
  line-height: 48rpx;
}

.central-card__desc {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
  line-height: 32rpx;
}

.central-card image {
  width: 260rpx;
  height: 154rpx;
  margin-right: -14rpx;
}

.white-pill {
  display: inline-block;
  width: 144rpx;
  height: 52rpx;
  margin: 18rpx 0 0;
  padding: 0;
  border-radius: 26rpx;
  background: #fff;
  color: #2468e8;
  font-size: 23rpx;
  font-weight: 700;
  line-height: 52rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.entry-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
  margin-top: 20rpx;
}

.entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 140rpx;
  padding: 22rpx 24rpx;
  border-radius: 18rpx;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.03);
}

.entry-card--home {
  background: #e7f7ef;
}

.entry-card--ai {
  background: #edf4ff;
}

.entry-card__copy {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.entry-card__title {
  display: block;
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 36rpx;
}

.entry-card__desc {
  display: block;
  margin-top: 6rpx;
  color: #647389;
  font-size: 22rpx;
  line-height: 30rpx;
}

.entry-card image {
  width: 108rpx;
  height: 98rpx;
  flex-shrink: 0;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  padding: 26rpx 12rpx 22rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #4f5f78;
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
}

.tool-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  margin-bottom: 12rpx;
  border-radius: 22rpx;
  background: #f1f5ff;
}

.notice-strip {
  display: flex;
  align-items: center;
  height: 80rpx;
  margin-top: 20rpx;
  padding: 0 22rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.03);
  border: 1rpx solid #edf2f9;
}

.notice-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 14rpx;
  padding: 6rpx 14rpx;
  border-radius: 10rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.notice-title {
  flex: 1;
  overflow: hidden;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 80rpx;
}

.notice-date {
  margin-left: 14rpx;
  color: #8b95a7;
  font-size: 22rpx;
  flex-shrink: 0;
  line-height: 80rpx;
}

.solution-mini {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 110rpx;
  padding: 24rpx 26rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.solution-mini__left {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.solution-mini__title {
  display: block;
  color: #17233d;
  font-size: 29rpx;
  font-weight: 800;
  line-height: 38rpx;
}

.solution-mini__desc {
  display: block;
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 24rpx;
  line-height: 32rpx;
}

.solution-mini__link {
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.notice-mini {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-bottom: 14rpx;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.03);
}

.notice-mini__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 14rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 21rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.notice-mini__title {
  flex: 1;
  overflow: hidden;
  color: #17233d;
  font-size: 25rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-mini__date {
  margin-left: 14rpx;
  color: #8b95a7;
  font-size: 22rpx;
  flex-shrink: 0;
}

.tabbar-space {
  height: 140rpx;
}
</style>
