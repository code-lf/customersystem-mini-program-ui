<template>
  <view v-if="watermarkText" class="app-watermark" aria-hidden="true">
    <text
      v-for="index in watermarkCount"
      :key="index"
      class="app-watermark__text"
    >
      {{ watermarkText }}
    </text>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
// 两列七行可覆盖常见手机比例，固定定位后页面滚动时也始终保持水印可见。
const watermarkCount = 14;

const watermarkText = computed(() => {
  const userInfo = userStore.userInfo || {};
  // 优先使用会员手机号；部分账号以手机号作为 username，作为兼容兜底。
  const mobile = String(userInfo.mobile || userInfo.phone || userInfo.username || '').trim();
  return /^1\d{10}$/.test(mobile) ? mobile : '';
});
</script>

<style lang="scss" scoped>
.app-watermark {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(7, 1fr);
  align-items: center;
  justify-items: center;
  overflow: hidden;
  pointer-events: none;
}

.app-watermark__text {
  width: 320rpx;
  color: rgba(23, 35, 61, 0.1);
  font-size: 25rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
  text-align: center;
  white-space: nowrap;
  transform: rotate(-24deg);
  transform-origin: center;
  user-select: none;
}
</style>
