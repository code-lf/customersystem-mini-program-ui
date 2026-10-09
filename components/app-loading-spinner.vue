<template>
  <!-- 使用 CSS 绘制加载图标，不依赖图标字体，避免显示英文图标名称。 -->
  <view class="app-loading-spinner" aria-label="加载中" />
</template>

<style scoped>
.app-loading-spinner {
  width: 54rpx;
  height: 54rpx;
  box-sizing: border-box;
  border: 5rpx solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: loading-rotate 0.8s linear infinite;
}

@keyframes loading-rotate {
  to { transform: rotate(360deg); }
}
</style>
