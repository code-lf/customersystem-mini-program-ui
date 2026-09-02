<template>
  <view class="app-navbar" :style="{ backgroundColor: bgColor }">
    <view class="nav-safe-top" :style="{ height: metrics.statusBarHeight + 'px' }" />
    <view
      class="custom-nav-bar"
      :style="{
        height: (typeof height === 'number' ? height + 'px' : (height || (metrics.navBarHeight + 'px'))),
        paddingRight: (metrics.capsuleOccupiedWidth ? (metrics.capsuleOccupiedWidth + 10) + 'px' : '24rpx'),
        borderBottom: border ? '1rpx solid #edf1f8' : 'none'
      }"
    >
      <view class="nav-left">
        <view v-if="showBack" class="nav-back-touch" @click="handleBack">
          <up-icon name="arrow-left" :size="leftIconSize" :color="leftIconColor" />
        </view>
        <view v-if="showHome" class="nav-home-touch" @click="goHome">
          <up-icon name="home" :size="Number(leftIconSize) - 2" :color="leftIconColor" />
        </view>
        <slot name="left" />
      </view>
      <!-- 全局统一居中：左右两侧留出相等的安全距离，保证文字绝对居中且不被胶囊/返回键遮挡 -->
      <view
        class="nav-title"
        :style="{
          color: titleColor,
          left: metrics.capsuleOccupiedWidth ? (metrics.capsuleOccupiedWidth + 10) + 'px' : '100rpx',
          right: metrics.capsuleOccupiedWidth ? (metrics.capsuleOccupiedWidth + 10) + 'px' : '100rpx'
        }"
      >
        <text>{{ title }}</text>
      </view>
      <view class="nav-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { getNavMetrics } from '@/utils/system';

const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true },
  showHome: { type: Boolean, default: false },
  bgColor: { type: String, default: 'transparent' },
  titleColor: { type: String, default: '#17233d' },
  leftIconColor: { type: String, default: '#17233d' },
  leftIconSize: { type: [String, Number], default: 20 },
  height: { type: [String, Number], default: '' },
  border: { type: Boolean, default: false },
  // 为 true 时标题以整个屏幕为基准居中，适合“产品中心”这类没有返回按钮的 tabBar 页。
  titleScreenCenter: { type: Boolean, default: false }
});

const metrics = computed(() => getNavMetrics());

const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index',
    fail: () => {
      uni.reLaunch({ url: '/pages/index/index' });
    }
  });
};

const handleBack = () => {
  if (!props.showBack) return;
  try {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
    if (pages && pages.length > 1) {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          goHome();
        }
      });
    } else {
      goHome();
    }
  } catch (e) {
    goHome();
  }
};
</script>

<style lang="scss" scoped>
.app-navbar {
  position: relative;
  z-index: 50;
  width: 100%;
}

.nav-safe-top {
  width: 100%;
}

.custom-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20rpx;
  position: relative;
  box-sizing: border-box;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 60rpx;
  min-height: 60rpx;
  z-index: 2;
}

.nav-back-touch,
.nav-home-touch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2rpx 10rpx rgba(23, 35, 61, 0.08);
}

.nav-title {
  position: absolute;
  text-align: center;
  font-size: 32rpx;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 60rpx;
  min-height: 60rpx;
  z-index: 2;
}
</style>
