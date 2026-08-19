<template>
  <view class="design-page price-page">
    <AppNavbar title="价格设置" />

    <view class="mode-tabs">
      <text :class="{ active: mode === 'discount' }" @click="mode = 'discount'">统一折扣</text>
      <text :class="{ active: mode === 'total' }" @click="mode = 'total'">设置报价总价</text>
    </view>

    <view class="price-card">
      <view class="total-line">
        <text>商品总价（含税）</text>
        <text>¥{{ money(productTotal) }}</text>
      </view>
      <view v-if="mode === 'discount'" class="setting-box">
        <text>统一折扣</text>
        <view class="stepper">
          <button @click="discount = Math.max(1, discount - 1)">-</button>
          <text>{{ discount }}%</text>
          <button @click="discount = Math.min(100, discount + 1)">+</button>
        </view>
      </view>
      <view v-if="mode === 'discount'" class="discount-line">
        <text>折扣金额</text>
        <text>- ¥{{ money(productTotal - finalTotal) }}</text>
      </view>
    </view>

    <view class="tax-card">
      <view>
        <text>税费设置</text>
        <text>增值税</text>
      </view>
      <text>13%（含税） ></text>
    </view>

    <view class="remark-card">
      <text>备注（选填）</text>
      <textarea maxlength="100" placeholder="可填写报价备注信息..." placeholder-class="placeholder" />
      <text>0/100</text>
    </view>

    <view class="bottom-bar">
      <view>
        <text>报价最终价格（含税）</text>
        <text>¥{{ money(finalTotal) }}</text>
      </view>
      <button @click="openPage('/pages/solution/share', { id: solution.id })">保存设置</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { uiSolutions } from '@/mock/ui-fixtures';

const options = getPageOptions();
const solution = uiSolutions.find((item) => String(item.id) === String(options.id)) || uiSolutions[0];
const mode = ref('discount');
const discount = ref(95);
const productTotal = computed(() => solution.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0));
const finalTotal = computed(() => Math.round(productTotal.value * discount.value / 100));
const money = (value) => Number(value || 0).toLocaleString();
</script>

<style lang="scss" scoped>
.mode-tabs {
  display: flex;
  height: 72rpx;
  padding: 6rpx;
  border-radius: 12rpx;
  background: #fff;
}

.mode-tabs text {
  flex: 1;
  border-radius: 10rpx;
  color: #586477;
  font-size: 24rpx;
  line-height: 60rpx;
  text-align: center;
}

.mode-tabs text.active {
  background: #2468e8;
  color: #fff;
  font-weight: 800;
}

.price-card,
.tax-card,
.remark-card {
  margin-top: 18rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
}

.total-line,
.setting-box,
.discount-line,
.tax-card,
.tax-card view {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total-line {
  padding-bottom: 22rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.total-line text:first-child,
.discount-line text:first-child,
.tax-card text,
.remark-card > text:first-child {
  color: #586477;
  font-size: 24rpx;
}

.total-line text:last-child {
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
}

.setting-box {
  min-height: 94rpx;
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
}

.stepper {
  display: flex;
  align-items: center;
}

.stepper button {
  width: 48rpx;
  height: 48rpx;
  margin: 0;
  padding: 0;
  border-radius: 24rpx;
  background: #f5f8fd;
  color: #586477;
  font-size: 24rpx;
  line-height: 48rpx;
}

.stepper text {
  width: 84rpx;
  color: #17233d;
  text-align: center;
  font-size: 25rpx;
}

.discount-line text:last-child {
  color: #586477;
  font-size: 24rpx;
}

.tax-card view {
  display: block;
}

.tax-card view text {
  display: block;
}

.tax-card view text:first-child {
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
}

.tax-card view text:last-child {
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.remark-card textarea {
  width: 100%;
  height: 145rpx;
  margin-top: 16rpx;
  padding: 18rpx;
  border-radius: 12rpx;
  background: #f7f9fc;
  color: #17233d;
  font-size: 24rpx;
}

.placeholder {
  color: #b0bac7;
}

.remark-card > text:last-child {
  display: block;
  margin-top: -34rpx;
  padding-right: 16rpx;
  color: #b0bac7;
  font-size: 20rpx;
  text-align: right;
}

.bottom-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 112rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 22rpx;
  border-radius: 16rpx;
  background: #fff;
}

.bottom-bar text {
  display: block;
}

.bottom-bar text:first-child {
  color: #8b95a7;
  font-size: 21rpx;
}

.bottom-bar text:last-child {
  margin-top: 6rpx;
  color: #ef543f;
  font-size: 31rpx;
  font-weight: 900;
}

.bottom-bar button {
  width: 210rpx;
  height: 66rpx;
  margin: 0;
  padding: 0;
  border-radius: 12rpx;
  background: #2468e8;
  color: #fff;
  font-size: 25rpx;
  line-height: 66rpx;
}
</style>
