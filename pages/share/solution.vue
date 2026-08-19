<template>
  <view class="design-page customer-page">
    <AppNavbar title="报价详情" />

    <view class="brand-row">
      <view><up-icon name="home" size="18" color="#fff" /></view>
      <view>
        <text>格宏暖通科技有限公司</text>
        <text>专业暖通 · 品质服务</text>
      </view>
    </view>

    <view class="customer-card">
      <view class="project-row">
        <view>
          <text>{{ solution.title }}</text>
          <text>{{ solution.subtitle }}</text>
        </view>
        <view>
          <text>报价总价（含税）</text>
          <text>¥{{ money(solution.total) }}</text>
        </view>
      </view>
    </view>

    <view class="customer-card">
      <text class="section-title">配置清单</text>
      <view class="item-row" v-for="item in solution.items" :key="item.id">
        <image :src="item.image" mode="aspectFit" />
        <view>
          <text>{{ item.model }}</text>
          <text>{{ specText(item) }}</text>
        </view>
        <text>x {{ item.quantity }}</text>
      </view>
    </view>

    <view class="customer-card">
      <text class="section-title">报价说明</text>
      <text class="paragraph">本报价采用高效节能设备，运行稳定，控制灵活，满足此项目空调使用需求，具体配置可根据实际情况调整优化。</text>
    </view>

    <view class="customer-card contact">
      <text class="section-title">联系方式</text>
      <view>
        <text>张工</text>
        <text>销售工程师</text>
      </view>
      <text>138 8888 8888</text>
      <button><up-icon name="phone" size="18" color="#2468e8" /></button>
    </view>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions } from '@/utils/pages';
import { uiSolutions } from '@/mock/ui-fixtures';

const options = getPageOptions();
const solution = uiSolutions.find((item) => String(item.id) === String(options.id)) || uiSolutions[0];
const money = (value) => Number(value || 0).toLocaleString();
const specText = (item) => Array.isArray(item.specs) ? item.specs.slice(0, 2).join(' | ') : item.name;
</script>

<style lang="scss" scoped>
.brand-row,
.project-row,
.item-row,
.contact {
  display: flex;
  align-items: center;
}

.brand-row {
  padding: 10rpx 0 18rpx;
}

.brand-row > view:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54rpx;
  height: 54rpx;
  margin-right: 14rpx;
  border-radius: 50%;
  background: #2468e8;
}

.brand-row text,
.project-row text,
.item-row text,
.section-title,
.paragraph,
.contact text {
  display: block;
}

.brand-row text:first-child {
  color: #17233d;
  font-size: 25rpx;
  font-weight: 800;
}

.brand-row text:last-child {
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 20rpx;
}

.customer-card {
  padding: 24rpx;
  margin-bottom: 18rpx;
  border-radius: 16rpx;
  background: #fff;
}

.project-row {
  justify-content: space-between;
}

.project-row > view:first-child text:first-child {
  color: #17233d;
  font-size: 32rpx;
  font-weight: 900;
}

.project-row > view:first-child text:last-child {
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.project-row > view:last-child {
  text-align: right;
}

.project-row > view:last-child text:first-child {
  color: #8b95a7;
  font-size: 20rpx;
}

.project-row > view:last-child text:last-child {
  margin-top: 8rpx;
  color: #ef543f;
  font-size: 34rpx;
  font-weight: 900;
}

.section-title {
  color: #17233d;
  font-size: 27rpx;
  font-weight: 900;
  margin-bottom: 16rpx;
}

.item-row {
  min-height: 70rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.item-row image {
  width: 48rpx;
  height: 48rpx;
  margin-right: 14rpx;
}

.item-row view {
  flex: 1;
}

.item-row view text:first-child {
  color: #17233d;
  font-size: 22rpx;
  font-weight: 800;
}

.item-row view text:last-child,
.item-row > text {
  color: #8b95a7;
  font-size: 19rpx;
}

.paragraph {
  color: #586477;
  font-size: 24rpx;
  line-height: 38rpx;
}

.contact {
  position: relative;
}

.contact .section-title {
  position: absolute;
  left: 24rpx;
  top: 20rpx;
}

.contact view {
  flex: 1;
  margin-top: 40rpx;
}

.contact view text:first-child {
  color: #17233d;
  font-size: 25rpx;
  font-weight: 800;
}

.contact view text:last-child,
.contact > text {
  color: #8b95a7;
  font-size: 21rpx;
}

.contact button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62rpx;
  height: 62rpx;
  margin: 40rpx 0 0;
  padding: 0;
  border-radius: 50%;
  background: #edf4ff;
}
</style>
