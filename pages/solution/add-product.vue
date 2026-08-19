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
        <up-icon name="search" size="18" color="#9aa5b5" />
        <text>搜索产品型号、名称、系列</text>
      </view>
      <button>筛选</button>
    </view>

    <view v-for="product in uiProducts" :key="product.id" class="add-row">
      <image :src="product.image" mode="aspectFit" />
      <view>
        <text class="add-row__model">{{ product.model }}</text>
        <text class="add-row__spec">{{ product.specs.slice(0, 3).join(' | ') }}</text>
        <text class="add-row__price">¥{{ money(product.price) }}</text>
      </view>
      <button @click="add(product)">加入</button>
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
  // 添加商品页只负责选中商品，报价单编辑页读取缓存后合并到清单。
  uni.setStorageSync('pendingSolutionProduct', product);
  replacePage('/pages/solution/edit', { id: solutionId || 1 });
};
</script>

<style lang="scss" scoped>
.top-tabs {
  display: flex;
  justify-content: space-around;
  height: 74rpx;
  color: #586477;
  font-size: 25rpx;
}

.top-tabs text {
  height: 74rpx;
  line-height: 74rpx;
  border-bottom: 4rpx solid transparent;
}

.top-tabs text.active {
  color: #2468e8;
  font-weight: 800;
  border-bottom-color: #2468e8;
}

.search-line {
  display: flex;
  gap: 14rpx;
  margin-bottom: 18rpx;
}

.search-line .design-search {
  flex: 1;
}

.search-line .design-search text {
  margin-left: 12rpx;
}

.search-line button {
  width: 92rpx;
  height: 64rpx;
  margin: 0;
  padding: 0;
  border-radius: 32rpx;
  background: #fff;
  color: #2468e8;
  font-size: 22rpx;
  line-height: 64rpx;
}

.add-row {
  display: flex;
  align-items: center;
  min-height: 142rpx;
  padding: 18rpx;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
  background: #fff;
}

.add-row image {
  width: 112rpx;
  height: 112rpx;
  margin-right: 18rpx;
}

.add-row view {
  flex: 1;
}

.add-row__model,
.add-row__spec,
.add-row__price {
  display: block;
}

.add-row__model {
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
}

.add-row__spec {
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 20rpx;
  line-height: 28rpx;
}

.add-row__price {
  margin-top: 8rpx;
  color: #ef543f;
  font-size: 24rpx;
  font-weight: 800;
}

.add-row button {
  width: 92rpx;
  height: 52rpx;
  margin: 0;
  padding: 0;
  border-radius: 26rpx;
  background: #2468e8;
  color: #fff;
  font-size: 22rpx;
  line-height: 52rpx;
}
</style>
