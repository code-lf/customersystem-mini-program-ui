<template>
  <view class="coming-page">
    <AppNavbar title="AI 小格 · 家电助理" />
    <view class="coming-content">
      <up-icon name="chat" size="52" color="#2468e8" />
      <text class="coming-title">敬请期待</text>
      <text class="coming-description">AI 助手暂未开放</text>
    </view>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';
// 正式版专用展示组件，不初始化会话、不采集语音、不发起 AI 请求。
</script>

<style scoped>
.coming-page { min-height: 100vh; background: #f4f7fc; }
.coming-content { display: flex; flex-direction: column; align-items: center; padding: 180rpx 40rpx; }
.coming-title { margin-top: 32rpx; color: #17233d; font-size: 40rpx; font-weight: 700; }
.coming-description { margin-top: 20rpx; color: #8290a5; font-size: 28rpx; }
</style>
