<template>
  <view class="function-page password-page">
    <AppNavbar title="密码查询" />

    <view class="top-tabs">
      <text class="active">扫码查询</text>
      <text>输入条码</text>
    </view>

    <view class="scan-panel">
      <view class="scan-frame">
        <view />
        <view />
        <view />
        <view />
      </view>
      <text>将条码置于扫码框内，即可自动识别</text>
      <button>轻触照亮</button>
    </view>

    <view class="result-card">
      <text class="result-card__title">查询结果</text>
      <view class="product-info">
        <image src="/static/aircon/central-vk.png" mode="aspectFit" />
        <view>
          <text>VK8R 多联式空调室外机</text>
          <text>20HP | 56.0kW | R410A</text>
        </view>
      </view>
      <view v-for="item in codes" :key="item.label" class="code-row">
        <text>{{ item.label }}</text>
        <text>{{ item.value }}</text>
        <button>复制</button>
      </view>
    </view>
    <text class="tips">密码仅供授权人员使用，请妥善保管，切勿泄露给他人。</text>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';

const codes = [
  { label: '机组条码', value: 'SN25052800012345' },
  { label: '当前密码', value: 'A1B2C3D4' },
  { label: '备用密码', value: 'E5F6G7H8' }
];
</script>

<style lang="scss" scoped>
.function-page {
  min-height: 100vh;
  padding: 0 24rpx 36rpx;
  background: #f3f7fd;
}

.top-tabs {
  display: flex;
  height: 72rpx;
  border-radius: 12rpx;
  background: #fff;
}

.top-tabs text {
  flex: 1;
  text-align: center;
  color: #667286;
  font-size: 25rpx;
  line-height: 72rpx;
  border-bottom: 4rpx solid transparent;
}

.top-tabs text.active {
  color: #2468e8;
  font-weight: 800;
  border-bottom-color: #2468e8;
}

.scan-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 292rpx;
  margin-top: 18rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #314c76, #172b4d);
  color: #fff;
}

.scan-frame {
  position: relative;
  width: 155rpx;
  height: 112rpx;
  border-top: 4rpx solid #5aa7ff;
  border-bottom: 4rpx solid #5aa7ff;
}

.scan-frame view {
  position: absolute;
  width: 28rpx;
  height: 28rpx;
  border-color: #fff;
}

.scan-frame view:nth-child(1) { left: -4rpx; top: -4rpx; border-left: 4rpx solid; border-top: 4rpx solid; }
.scan-frame view:nth-child(2) { right: -4rpx; top: -4rpx; border-right: 4rpx solid; border-top: 4rpx solid; }
.scan-frame view:nth-child(3) { left: -4rpx; bottom: -4rpx; border-left: 4rpx solid; border-bottom: 4rpx solid; }
.scan-frame view:nth-child(4) { right: -4rpx; bottom: -4rpx; border-right: 4rpx solid; border-bottom: 4rpx solid; }

.scan-panel > text {
  margin-top: 34rpx;
  color: rgba(255,255,255,.9);
  font-size: 23rpx;
}

.scan-panel button {
  height: 40rpx;
  margin: 18rpx 0 0;
  padding: 0 22rpx;
  border-radius: 20rpx;
  background: rgba(255,255,255,.14);
  color: #fff;
  font-size: 20rpx;
  line-height: 40rpx;
}

.result-card {
  margin-top: 18rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
}

.result-card__title {
  display: block;
  color: #17233d;
  font-size: 27rpx;
  font-weight: 900;
}

.product-info {
  display: flex;
  align-items: center;
  margin-top: 18rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f7f9fc;
}

.product-info image {
  width: 100rpx;
  height: 100rpx;
  margin-right: 16rpx;
}

.product-info text {
  display: block;
}

.product-info text:first-child {
  color: #17233d;
  font-size: 24rpx;
  font-weight: 800;
}

.product-info text:last-child {
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 20rpx;
}

.code-row {
  display: flex;
  align-items: center;
  min-height: 72rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.code-row text:first-child {
  width: 150rpx;
  color: #586477;
  font-size: 23rpx;
}

.code-row text:nth-child(2) {
  flex: 1;
  color: #17233d;
  font-size: 24rpx;
}

.code-row button {
  width: 76rpx;
  height: 42rpx;
  margin: 0;
  padding: 0;
  border-radius: 21rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 20rpx;
  line-height: 42rpx;
}

.tips {
  display: block;
  margin-top: 20rpx;
  color: #b0bac7;
  font-size: 21rpx;
  line-height: 32rpx;
  text-align: center;
}
</style>
