<template>
  <view class="design-page monitor-page">
    <AppNavbar title="价格监控" :show-back="false" />
    <view class="brand-head">
      <image src="/static/aircon/notice-cloud.png" mode="aspectFit" />
      <text>格宏助手</text>
    </view>

    <view class="tabs">
      <text v-for="item in tabs" :key="item.value" :class="{ active: active === item.value }" @click="active = item.value">{{ item.label }}</text>
    </view>

    <view v-for="item in monitorList" :key="item.id" class="monitor-card" @click="openPage('/pages/monitor/detail', { productId: item.id })">
      <image :src="item.image" mode="aspectFit" />
      <view class="monitor-card__body">
        <view class="monitor-card__title">
          <text>{{ item.model }}</text>
          <text>多联机</text>
        </view>
        <view class="price-line"><text>当前价</text><text>¥{{ money(item.price) }}</text></view>
        <text class="monitor-card__line">原价　¥{{ money(item.price + item.change) }}</text>
        <text class="monitor-card__time">更新：2026-06-20 10:30</text>
      </view>
      <view class="monitor-card__right">
        <text v-if="item.change" class="down">- ¥{{ money(item.change) }}</text>
        <text v-else class="flat">--</text>
        <button>查看详情</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { uiProducts } from '@/mock/ui-fixtures';

const active = ref('all');
const tabs = [
  { label: '全部', value: 'all' },
  { label: '已降价', value: 'down' },
  { label: '有变化', value: 'changed' }
];

const monitorList = computed(() => uiProducts.filter((item) => item.category === 'multi').map((item, index) => ({
  ...item,
  change: index === 1 ? 0 : (index + 1) * 600
})));
const money = (value) => Number(value || 0).toLocaleString();
</script>

<style lang="scss" scoped>
.brand-head {
  display: flex;
  align-items: center;
  height: 58rpx;
}

.brand-head image {
  width: 42rpx;
  height: 42rpx;
  margin-right: 8rpx;
}

.brand-head text {
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
}

.tabs {
  display: flex;
  gap: 64rpx;
  height: 76rpx;
  align-items: center;
}

.tabs text {
  height: 76rpx;
  color: #667286;
  font-size: 25rpx;
  line-height: 76rpx;
  border-bottom: 4rpx solid transparent;
}

.tabs text.active {
  color: #2468e8;
  font-weight: 800;
  border-bottom-color: #2468e8;
}

.monitor-card {
  display: flex;
  min-height: 160rpx;
  padding: 18rpx;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
  background: #fff;
}

.monitor-card image {
  width: 132rpx;
  height: 132rpx;
  margin-right: 18rpx;
  border-radius: 12rpx;
  background: #f4f8ff;
}

.monitor-card__body {
  flex: 1;
  min-width: 0;
}

.monitor-card__title {
  display: flex;
  align-items: center;
}

.monitor-card__title text:first-child {
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
}

.monitor-card__title text:last-child {
  margin-left: 10rpx;
  padding: 3rpx 8rpx;
  border-radius: 6rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 18rpx;
}

.price-line,
.monitor-card__line,
.monitor-card__time {
  display: block;
  margin-top: 7rpx;
  color: #8b95a7;
  font-size: 21rpx;
}

.price-line {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.price-line text:last-child {
  color: #ef543f;
  font-size: 30rpx;
  font-weight: 900;
}

.monitor-card__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.down {
  color: #2fa777;
  font-size: 23rpx;
  font-weight: 800;
}

.flat {
  color: #b0bac7;
  font-size: 24rpx;
}

.monitor-card__right button {
  width: 112rpx;
  height: 44rpx;
  margin: 0;
  padding: 0;
  border-radius: 22rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 20rpx;
  line-height: 44rpx;
}
</style>
