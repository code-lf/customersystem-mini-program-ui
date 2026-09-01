<template>
  <view class="design-page solution-edit-page">
    <AppNavbar title="编辑报价单" />

    <view class="base-card">
      <view class="base-card__top">
        <view class="title-wrap">
          <text class="solution-title">{{ solution.title }}</text>
          <text class="solution-sub">{{ solution.subtitle }}</text>
        </view>
        <button class="btn-edit-title" @click="openPage('/pages/solution/create', { id: solution.id })">修改名称</button>
      </view>
    </view>

    <view class="list-card">
      <view class="list-card__head">
        <text class="list-head-txt">设备清单 ({{ solution.items.length }})</text>
        <view class="add-btn-txt" @click="openPage('/pages/solution/add-product', { id: solution.id })">
          <up-icon name="plus" size="14" color="#2468e8" />
          <text>添加设备</text>
        </view>
      </view>

      <view v-for="(item, index) in solution.items" :key="item.id || index" class="item-card">
        <image class="item-img" :src="item.image || 'http://gh.starall.cn/static/resource/aircon/outdoor-unit.png'" mode="aspectFit" />
        <view class="item-card__body">
          <text class="item-card__model">{{ item.model || item.name }}</text>
          <text class="item-card__spec">{{ specText(item) }}</text>
          <text class="item-card__price">¥{{ money(item.price) }}</text>
        </view>
        <view class="item-card__right">
          <view class="trash-wrap" @click="deleteItem(index)">
            <up-icon name="trash" size="18" color="#8b95a7" />
          </view>
          <view class="stepper">
            <button class="step-btn" @click="changeQty(item, -1)">-</button>
            <text class="step-val">{{ item.quantity }}</text>
            <button class="step-btn" @click="changeQty(item, 1)">+</button>
          </view>
        </view>
      </view>
    </view>

    <view class="summary-bar">
      <view class="summary-left">
        <text class="summary-label">设备小计 (含税)</text>
        <text class="summary-val">¥{{ money(total) }}</text>
      </view>
      <button class="summary-next-btn" @click="openPage('/pages/solution/price', { id: solution.id })">下一步：核算价格</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { uiSolutions } from '@/mock/ui-fixtures';

const options = getPageOptions();
const source = uiSolutions.find((item) => String(item.id) === String(options.id)) || uiSolutions[0];
const solution = reactive(JSON.parse(JSON.stringify(source)));
const total = computed(() => (solution.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0));
const money = (value) => Number(value || 0).toLocaleString();
const specText = (item) => Array.isArray(item.specs) ? item.specs.slice(0, 2).join(' · ') : (item.spec || item.name);

const changeQty = (item, delta) => {
  item.quantity = Math.max(1, Number(item.quantity || 1) + delta);
};

const deleteItem = (index) => {
  if (solution.items && solution.items.length > 1) {
    solution.items.splice(index, 1);
    uni.showToast({ title: '已移除设备', icon: 'none' });
  } else {
    uni.showToast({ title: '至少保留一件设备', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped>
.solution-edit-page {
  padding-bottom: 200rpx;
  background: #f4f7fc;
}

.base-card,
.list-card {
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.base-card {
  padding: 24rpx 28rpx;
  margin-bottom: 20rpx;
}

.base-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-wrap {
  flex: 1;
  min-width: 0;
}

.solution-title {
  display: block;
  color: #17233d;
  font-size: 32rpx;
  font-weight: 900;
}

.solution-sub {
  display: block;
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 24rpx;
}

.btn-edit-title {
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 26rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 52rpx;
  margin-left: 16rpx;
}

.list-card {
  padding: 0 24rpx;
}

.list-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84rpx;
  border-bottom: 1rpx solid #edf1f8;
}

.list-head-txt {
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
}

.add-btn-txt {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
}

.item-card {
  display: flex;
  align-items: center;
  padding: 22rpx 0;
  border-top: 1rpx solid #edf1f8;
}

.item-card:first-of-type {
  border-top: none;
}

.item-img {
  width: 120rpx;
  height: 120rpx;
  margin-right: 20rpx;
  border-radius: 14rpx;
  background: #f7f9fc;
  flex-shrink: 0;
}

.item-card__body {
  flex: 1;
  min-width: 0;
}

.item-card__model {
  display: block;
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
}

.item-card__spec {
  display: block;
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.item-card__price {
  display: block;
  margin-top: 8rpx;
  color: #ef543f;
  font-size: 28rpx;
  font-weight: 900;
}

.item-card__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 104rpx;
  margin-left: 14rpx;
}

.trash-wrap {
  padding: 4rpx;
}

.stepper {
  display: flex;
  align-items: center;
  border: 1rpx solid #dce4f0;
  border-radius: 10rpx;
  overflow: hidden;
  background: #fff;
}

.step-btn {
  width: 48rpx;
  height: 44rpx;
  margin: 0;
  padding: 0;
  background: #f5f8fd;
  color: #586477;
  font-size: 24rpx;
  line-height: 44rpx;
}

.step-val {
  width: 50rpx;
  color: #17233d;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
}

.summary-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 28rpx;
  border-radius: 40rpx;
  background: #fff;
  box-shadow: 0 10rpx 32rpx rgba(23, 35, 61, 0.1);
}

.summary-left {
  display: flex;
  flex-direction: column;
}

.summary-label {
  color: #8b95a7;
  font-size: 22rpx;
}

.summary-val {
  color: #ef543f;
  font-size: 36rpx;
  font-weight: 900;
  margin-top: 2rpx;
}

.summary-next-btn {
  height: 72rpx;
  padding: 0 36rpx;
  border-radius: 36rpx;
  background: #2468e8;
  color: #fff;
  font-size: 26rpx;
  font-weight: 800;
  line-height: 72rpx;
  box-shadow: 0 6rpx 18rpx rgba(36, 104, 232, 0.35);
}
</style>
