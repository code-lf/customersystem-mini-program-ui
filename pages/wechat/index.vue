<template>
  <view class="function-page wechat-page">
    <AppNavbar title="关注公众号" />

    <view class="qr-card">
      <text>关注「格宏助手」公众号</text>
      <text>获取最新产品资讯与专属服务</text>
      <view class="qr-box">
        <view class="fake-qr">
          <view v-for="item in 64" :key="item" :class="{ dark: item % 2 === 0 || item % 7 === 0 || item % 11 === 0 }" />
        </view>
        <view class="qr-logo"><up-icon name="weixin-fill" size="28" color="#2468e8" /></view>
      </view>
      <text>微信扫一扫，关注公众号</text>
    </view>

    <view class="service-card">
      <text class="service-title">关注后可享受以下服务</text>
      <view v-for="item in services" :key="item.title" class="service-row">
        <view><up-icon :name="item.icon" size="24" color="#fff" /></view>
        <view>
          <text>{{ item.title }}</text>
          <text>{{ item.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';

const services = [
  { icon: 'clock', title: '价格变动提醒', desc: '第一时间获取价格调整通知' },
  { icon: 'file-text', title: '产品资料更新', desc: '最新资料及说明书，不错过任何更新' },
  { icon: 'volume', title: '最新活动与政策推送', desc: '促销活动、政策资讯及时送达' },
  { icon: 'server-man', title: '售后与技术支持服务', desc: '快速响应，专业团队为您服务' }
];
</script>

<style lang="scss" scoped>
.function-page {
  min-height: 100vh;
  padding: 0 24rpx 36rpx;
  background: #f3f7fd;
}

.qr-card,
.service-card {
  border-radius: 16rpx;
  background: #fff;
}

.qr-card {
  padding: 34rpx 24rpx;
  text-align: center;
  background: linear-gradient(180deg, #eaf4ff, #fff);
}

.qr-card > text {
  display: block;
}

.qr-card > text:first-child {
  color: #2468e8;
  font-size: 32rpx;
  font-weight: 900;
}

.qr-card > text:nth-child(2),
.qr-card > text:last-child {
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.qr-box {
  position: relative;
  width: 280rpx;
  height: 280rpx;
  margin: 30rpx auto 0;
  padding: 22rpx;
  border-radius: 14rpx;
  background: #fff;
}

.fake-qr {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5rpx;
}

.fake-qr view {
  width: 24rpx;
  height: 24rpx;
  background: #fff;
}

.fake-qr view.dark {
  background: #111827;
}

.qr-logo {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54rpx;
  height: 54rpx;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 50%;
}

.service-card {
  margin-top: 18rpx;
  padding: 24rpx;
}

.service-title {
  display: block;
  color: #17233d;
  font-size: 27rpx;
  font-weight: 900;
}

.service-row {
  display: flex;
  align-items: center;
  margin-top: 22rpx;
}

.service-row > view:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-right: 18rpx;
  border-radius: 14rpx;
  background: #2468e8;
}

.service-row text {
  display: block;
}

.service-row text:first-child {
  color: #17233d;
  font-size: 25rpx;
  font-weight: 800;
}

.service-row text:last-child {
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 21rpx;
}
</style>
