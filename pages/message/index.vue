<template>
  <view class="legacy-monitor-entry">正在打开价格监控...</view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';

onLoad(() => {
  // 保留旧页面路径兼容既有收藏或外部链接，实际只展示统一的价格监控页面。
  uni.redirectTo({ url: '/pages/monitor/index' });
});
</script>

<style lang="scss" scoped>
.legacy-monitor-entry { padding: 100rpx 24rpx; color: #8b95a7; text-align: center; font-size: 25rpx; }
</style>
