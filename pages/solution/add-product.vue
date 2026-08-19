<template>
  <view class="design-page add-product-page">
    <AppNavbar title="添加商品" />

    <view class="top-tabs">
      <text>扫码</text>
      <text class="active">搜索</text>
      <text>选型</text>
    </view>

    <view class="search-line">
      <view class="design-search">
        <up-icon name="search" size="20" color="#9aa5b5" />
        <text>搜索产品型号、名称、系列</text>
      </view>
      <button class="filter-btn">筛选</button>
    </view>

    <view v-for="product in uiProducts" :key="product.id" class="add-row">
      <image class="add-row-img" :src="product.image" mode="aspectFit" />
      <view class="add-row-info">
        <text class="add-row__model">{{ product.model }}</text>
        <text class="add-row__spec">{{ product.specs.slice(0, 3).join(' | ') }}</text>
        <text class="add-row__price">¥{{ money(product.price) }}</text>
      </view>
      <button class="add-btn" @click="add(product)">+ 加入</button>
    </view>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, replacePage } from '@/utils/pages';
import { uiProducts } from '@/mock/ui-fixtures';

const solutionId = getPageOptions().id;
const money = (value) => Number(value || 0).toLocaleString();

const add = (product) => {
  uni.setStorageSync('pendingSolutionProduct', product);
  replacePage('/pages/solution/edit', { id: solutionId || 1 });
};
</script>

<style lang="scss" scoped>
.add-product-page {
  min-height: 100vh;
  padding: 0 24rpx 60rpx;
  background: linear-gradient(180deg, #e8f1ff 0%, #f4f7fc 240rpx, #f4f7fc 100%);
}

.top-tabs {
  display: flex;
  justify-content: space-around;
  height: 80rpx;
  color: #586477;
  font-size: 27rpx;
}

.top-tabs text {
  height: 80rpx;
  line-height: 80rpx;
  border-bottom: 4rpx solid transparent;
}

.top-tabs text.active {
  color: #2468e8;
  font-weight: 800;
  border-bottom-color: #2468e8;
}

.search-line {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 20rpx;
}

.search-line .design-search {
  flex: 1;
  display: flex;
  align-items: center;
  height: 74rpx;
  padding: 0 24rpx;
  border-radius: 37rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.04);
}

.search-line .design-search text {
  margin-left: 14rpx;
  color: #9aa5b5;
  font-size: 26rpx;
}

.filter-btn {
  width: 108rpx;
  height: 74rpx;
  margin: 0;
  padding: 0;
  border-radius: 37rpx;
  background: #fff;
  color: #2468e8;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 74rpx;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.04);
}

.add-row {
  display: flex;
  align-items: center;
  min-height: 154rpx;
  padding: 22rpx 24rpx;
  margin-bottom: 18rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.add-row-img {
  width: 128rpx;
  height: 128rpx;
  margin-right: 20rpx;
  border-radius: 14rpx;
  background: #f7f9fc;
  flex-shrink: 0;
}

.add-row-info {
  flex: 1;
  min-width: 0;
}

.add-row__model,
.add-row__spec,
.add-row__price {
  display: block;
}

.add-row__model {
  color: #17233d;
  font-size: 29rpx;
  font-weight: 800;
}

.add-row__spec {
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 23rpx;
  line-height: 30rpx;
}

.add-row__price {
  margin-top: 8rpx;
  color: #ef543f;
  font-size: 28rpx;
  font-weight: 900;
}

.add-btn {
  height: 56rpx;
  padding: 0 26rpx;
  margin: 0 0 0 16rpx;
  border-radius: 28rpx;
  background: #2468e8;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 56rpx;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.25);
  flex-shrink: 0;
}
</style>
