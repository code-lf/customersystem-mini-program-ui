<template>
  <view class="design-page history-page">
    <AppNavbar title="历史报价单" />

    <view class="design-search">
      <up-icon name="search" size="18" color="#9aa5b5" />
      <text>搜索报价单名称/项目名称</text>
    </view>

    <view class="tabs">
      <text v-for="item in tabs" :key="item.value" :class="{ active: active === item.value }" @click="active = item.value">{{ item.label }}</text>
    </view>

    <view v-for="item in historyList" :key="item.id" class="history-card">
      <view>
        <text class="history-card__title">{{ item.title }}</text>
        <text class="history-card__desc">{{ item.subtitle }} · {{ item.products }} 件商品</text>
        <text class="history-card__time">{{ item.time }}</text>
      </view>
      <view>
        <text class="history-card__status" :class="item.status">{{ statusText(item.status) }}</text>
        <text class="history-card__price">¥{{ money(item.total) }}</text>
        <button>...</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { uiSolutions } from '@/mock/ui-fixtures';

const active = ref('all');
const tabs = [
  { label: '全部', value: 'all' },
  { label: '编辑中', value: 'draft' },
  { label: '已分享', value: 'shared' },
  { label: '已导出', value: 'exported' }
];

const historyList = [
  ...uiSolutions,
  { id: 4, title: '嘉兴 · 办公室改造报价', subtitle: '多联机报价单', products: 5, total: 88200, time: '2025-05-30 15:40', status: 'exported' },
  { id: 5, title: '台州 · 酒店空调改造报价', subtitle: '多联机报价单', products: 7, total: 126500, time: '2025-05-28 09:25', status: 'shared' }
];

const money = (value) => Number(value || 0).toLocaleString();
const statusText = (status) => ({ draft: '编辑中', shared: '已分享', exported: '已导出' }[status] || '已导出');
</script>

<style lang="scss" scoped>
.design-search {
  margin-top: 8rpx;
}

.design-search text {
  margin-left: 12rpx;
}

.tabs {
  display: flex;
  justify-content: space-between;
  height: 76rpx;
  align-items: center;
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

.history-card {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 22rpx;
  margin-bottom: 14rpx;
  border-radius: 16rpx;
  background: #fff;
}

.history-card__title,
.history-card__desc,
.history-card__time,
.history-card__status,
.history-card__price {
  display: block;
}

.history-card__title {
  color: #17233d;
  font-size: 26rpx;
  font-weight: 900;
}

.history-card__desc,
.history-card__time {
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 20rpx;
}

.history-card > view:last-child {
  text-align: right;
}

.history-card__status {
  display: inline-block;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  color: #2fa777;
  background: #e9f8f0;
  font-size: 19rpx;
}

.history-card__status.draft {
  color: #ff9f2f;
  background: #fff5e6;
}

.history-card__status.shared {
  color: #2468e8;
  background: #edf4ff;
}

.history-card__price {
  margin-top: 16rpx;
  color: #ef543f;
  font-size: 25rpx;
  font-weight: 900;
}

.history-card button {
  width: 46rpx;
  height: 34rpx;
  margin: 12rpx 0 0 auto;
  padding: 0;
  border-radius: 17rpx;
  background: #fff;
  color: #8b95a7;
  font-size: 20rpx;
  line-height: 30rpx;
  border: 1rpx solid #edf0f5;
}
</style>
