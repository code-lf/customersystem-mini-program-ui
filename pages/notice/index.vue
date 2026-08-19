<template>
  <view class="design-page tab-page notice-page">
    <AppNavbar title="公告列表" />

    <view class="tabs">
      <text v-for="item in tabs" :key="item" :class="{ active: active === item }" @click="active = item">{{ item }}</text>
    </view>

    <view v-for="notice in shownNotices" :key="notice.id" class="notice-card" @click="openPage('/pages/notice/detail', { id: notice.id })">
      <view>
        <view class="notice-card__title">
          <text>{{ notice.title }}</text>
          <text v-if="notice.tag">{{ notice.tag }}</text>
        </view>
        <view class="notice-card__meta">
          <text>{{ notice.date }}</text>
          <text>阅读 {{ notice.views }}</text>
        </view>
      </view>
      <image :src="notice.image" mode="aspectFill" />
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { uiNotices } from '@/mock/ui-fixtures';

const tabs = ['全部', '最新通知', '价格调整', '活动政策'];
const active = ref('全部');
const shownNotices = computed(() => active.value === '全部' ? uiNotices : uiNotices.filter((item) => item.type === active.value));
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  justify-content: space-between;
  height: 76rpx;
  align-items: center;
}

.tab-page {
  padding-bottom: 120rpx;
}

.tabs text {
  height: 76rpx;
  color: #667286;
  font-size: 24rpx;
  line-height: 76rpx;
  border-bottom: 4rpx solid transparent;
}

.tabs text.active {
  color: #2468e8;
  font-weight: 800;
  border-bottom-color: #2468e8;
}

.notice-card {
  display: flex;
  min-height: 142rpx;
  padding: 18rpx;
  margin-bottom: 18rpx;
  border-radius: 16rpx;
  background: #fff;
}

.notice-card > view {
  flex: 1;
  min-width: 0;
  padding-right: 18rpx;
}

.notice-card image {
  width: 170rpx;
  height: 108rpx;
  border-radius: 12rpx;
}

.notice-card__title {
  display: flex;
}

.notice-card__title text:first-child {
  flex: 1;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 800;
  line-height: 34rpx;
}

.notice-card__title text:last-child {
  align-self: flex-start;
  margin-left: 8rpx;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  background: #fff1ef;
  color: #ef543f;
  font-size: 18rpx;
}

.notice-card__meta {
  display: flex;
  gap: 32rpx;
  margin-top: 22rpx;
  color: #8b95a7;
  font-size: 20rpx;
}
</style>
