<template>
  <view class="app-navbar">
    <view class="nav-safe-top" />
    <view class="custom-nav-bar" :style="{ backgroundColor: bgColor, height: height, borderBottom: border ? '1rpx solid #edf1f8' : 'none' }">
      <view class="nav-left">
        <view v-if="showBack" class="nav-back-touch" @click="handleBack">
          <up-icon name="arrow-left" :size="leftIconSize" :color="leftIconColor" />
        </view>
        <view v-if="showHome" class="nav-home-touch" @click="goHome">
          <up-icon name="home" :size="Number(leftIconSize) - 2" :color="leftIconColor" />
        </view>
        <slot name="left" />
      </view>
      <view class="nav-title" :style="{ color: titleColor }">
        <text>{{ title }}</text>
      </view>
      <view class="nav-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true },
  showHome: { type: Boolean, default: false },
  bgColor: { type: String, default: 'transparent' },
  titleColor: { type: String, default: '#17233d' },
  leftIconColor: { type: String, default: '#17233d' },
  leftIconSize: { type: [String, Number], default: 20 },
  height: { type: [String, Number], default: '88rpx' },
  border: { type: Boolean, default: false }
});

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
  z-index: 20;
}

.nav-safe-top {
  height: 20rpx;
  height: calc(env(safe-area-inset-top) + 12rpx);
}

.custom-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 80rpx;
  min-height: 60rpx;
  z-index: 2;
}

.nav-back-touch,
.nav-home-touch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 2rpx 10rpx rgba(23, 35, 61, 0.08);
}

.nav-title {
  position: absolute;
  left: 90rpx;
  right: 90rpx;
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
  min-width: 80rpx;
  min-height: 60rpx;
  z-index: 2;
}
</style>
