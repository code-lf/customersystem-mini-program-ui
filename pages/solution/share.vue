<template>
  <view class="design-page preview-page">
    <AppNavbar title="客户方案报价预览" />

    <view class="preview-card">
      <!-- 电器公司信息栏 -->
      <view class="company-row">
        <view class="company-icon"><up-icon name="home" size="20" color="#fff" /></view>
        <view class="company-text">
          <text class="company-name">格宏电器科技有限公司</text>
          <text class="company-tagline">专业空调电器 · 一线品质把控 · 贴心售后维保</text>
        </view>
      </view>

      <!-- 项目方案标题 -->
      <view class="project-title-box">
        <text class="project-name">{{ solution.title }}</text>
        <text class="project-sub">{{ solution.subtitle }}</text>
      </view>

      <image class="project-image" src="/static/aircon/central-default.png" mode="aspectFill" />

      <!-- 报价总价与承诺 -->
      <view class="price-panel">
        <text class="price-label">方案核算总额 (含税包安装)</text>
        <view class="price-main-row">
          <text class="price-symbol">¥</text>
          <text class="price-number">{{ money(exportTotal) }}</text>
          <text v-if="exportSetting.discountRate" class="discount-badge">已享 {{ exportSetting.discountRate }}% 特惠折扣</text>
        </view>
        <text v-if="exportSetting.remark" class="quote-remark-show">备注说明：{{ exportSetting.remark }}</text>

        <!-- 服务保障 4 格 -->
        <view class="promise-grid">
          <view v-for="item in promises" :key="item.text" class="promise-item">
            <up-icon :name="item.icon" size="22" color="#2468e8" />
            <text>{{ item.text }}</text>
          </view>
        </view>
      </view>

      <!-- 专属销售工程师联系名片 -->
      <view class="contact-row">
        <image class="engineer-avatar" src="/static/avatars/avatar-demo.png" mode="aspectFill" />
        <view class="engineer-info">
          <text class="engineer-name">张工 (资深方案工程师)</text>
          <text class="engineer-org">格宏电器工程技术部 · 专属顾问</text>
          <text class="engineer-tel">服务热线：138 8888 8888</text>
        </view>
        <button class="call-btn" @click="call">
          <up-icon name="phone-fill" size="20" color="#2468e8" />
        </button>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="share-actions-wrap">
      <button class="share-btn" @click="shareToClient">立即分享给客户 (微信/链接)</button>
    </view>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { uiSolutions } from '@/mock/ui-fixtures';

const options = getPageOptions();
const solution = uiSolutions.find((item) => String(item.id) === String(options.id)) || uiSolutions[0];
const exportSetting = uni.getStorageSync('quoteExportSetting') || {};
const exportTotal = exportSetting.totalPrice || solution.total;

const promises = [
  { icon: 'file-text-fill', text: '清单透明' },
  { icon: 'leaf', text: '一级能效' },
  { icon: 'rmb-circle-fill', text: '含税专票' },
  { icon: 'checkmark-circle-fill', text: '六年质保' }
];

const money = (value) => Number(value || 0).toLocaleString();

const call = () => {
  uni.makePhoneCall({
    phoneNumber: '13888888888',
    fail: () => {
      uni.showToast({ title: '工程师电话：138 8888 8888', icon: 'none' });
    }
  });
};

const shareToClient = () => {
  uni.showToast({ title: '已生成分享链接并复制', icon: 'success' });
};
</script>

<style lang="scss" scoped>
.preview-page {
  padding: 0 24rpx 140rpx;
  background: #f4f7fc;
}

.preview-card {
  border-radius: 24rpx;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(23, 35, 61, 0.05);
}

.company-row {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  background: #f8faff;
  border-bottom: 1rpx solid #eef3fb;
}

.company-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-right: 18rpx;
  border-radius: 50%;
  background: #2468e8;
  flex-shrink: 0;
}

.company-text {
  flex: 1;
}

.company-name {
  display: block;
  color: #17233d;
  font-size: 28rpx;
  font-weight: 900;
}

.company-tagline {
  display: block;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.project-title-box {
  padding: 24rpx 28rpx 20rpx;
}

.project-name {
  display: block;
  color: #17233d;
  font-size: 36rpx;
  font-weight: 900;
}

.project-sub {
  display: block;
  margin-top: 8rpx;
  color: #647389;
  font-size: 24rpx;
}

.project-image {
  width: 100%;
  height: 280rpx;
  background: #edf3fb;
}

.price-panel {
  padding: 24rpx 28rpx;
}

.price-label {
  color: #8b95a7;
  font-size: 24rpx;
}

.price-main-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.price-symbol {
  color: #ef543f;
  font-size: 32rpx;
  font-weight: 800;
}

.price-number {
  color: #ef543f;
  font-size: 54rpx;
  font-weight: 900;
}

.discount-badge {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
  margin-left: 8rpx;
}

.quote-remark-show {
  display: block;
  margin-top: 14rpx;
  padding: 12rpx 18rpx;
  border-radius: 10rpx;
  background: #f8fafc;
  color: #586477;
  font-size: 24rpx;
  line-height: 1.4;
}

.promise-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  margin-top: 28rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #edf1f8;
}

.promise-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  color: #586477;
  font-size: 22rpx;
  font-weight: 600;
}

.contact-row {
  display: flex;
  align-items: center;
  margin: 0 28rpx;
  padding: 24rpx 0 28rpx;
  border-top: 1rpx solid #edf1f8;
}

.engineer-avatar {
  width: 84rpx;
  height: 84rpx;
  margin-right: 18rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.engineer-info {
  flex: 1;
  min-width: 0;
}

.engineer-name {
  display: block;
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
}

.engineer-org,
.engineer-tel {
  display: block;
  margin-top: 4rpx;
  color: #647389;
  font-size: 22rpx;
}

.call-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #edf4ff;
  flex-shrink: 0;
}

.share-actions-wrap {
  margin-top: 36rpx;
}

.share-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: #2468e8;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 88rpx;
  box-shadow: 0 8rpx 24rpx rgba(36, 104, 232, 0.35);
}
</style>
