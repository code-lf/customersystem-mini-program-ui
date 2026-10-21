<template>
  <view v-if="visible" class="follow-mask" @click="close">
    <view class="follow-panel" @click.stop>
      <view class="follow-heading">
        <text>关注「格宏助手」服务号</text>
        <text class="follow-close" @click="close">关闭 ×</text>
      </view>
      <!-- 每页只挂载一个微信原生关注组件，不把加载成功当作已关注。 -->
      <!-- #ifdef MP-WEIXIN -->
      <official-account @load="handleLoad" @error="handleError" />
      <!-- #endif -->
      <text class="follow-tip">{{ message }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';
import { openPage } from '@/utils/pages';
const props = defineProps({ visible: { type: Boolean, default: false } });
const emit = defineEmits(['close']);
const message = ref('');
let fallbackStarted = false;
const close = () => emit('close');
// 每次展开都重置提示，关注行为必须由用户在微信卡片中确认，不能自动执行。
watch(() => props.visible, (visible) => {
  if (!visible) return;
  fallbackStarted = false;
  message.value = '请在微信卡片中点击关注，无需扫码。若卡片未显示，请核对后台配置与当前进入场景。';
  // #ifndef MP-WEIXIN
  message.value = '请在微信小程序中使用关注服务号功能。';
  // #endif
}, { immediate: true });
const handleLoad = () => { message.value = '请在上方微信卡片中操作，关注状态以微信显示为准。'; };
const handleError = () => {
  // 微信可能重复发送错误事件；只跳转一次，并强制二维码模式，避免兜底页再次加载失败组件。
  if (!props.visible || fallbackStarted) return;
  fallbackStarted = true;
  close();
  openPage('/pages/wechat/index', { mode: 'qr' });
};
</script>

<style lang="scss" scoped>
/* 底部安全区与原生组件宽度留足，不覆盖关闭按钮。 */
.follow-mask { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: flex-end; background: rgba(15, 23, 42, 0.35); }
.follow-panel { width: 100%; box-sizing: border-box; padding: 32rpx 24rpx calc(32rpx + env(safe-area-inset-bottom)); border-radius: 28rpx 28rpx 0 0; background: #fff; }
.follow-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28rpx; color: #174b94; font-size: 28rpx; font-weight: 700; }
.follow-close { padding: 8rpx; color: #718098; font-size: 24rpx; font-weight: 400; }
.follow-tip { display: block; margin-top: 24rpx; color: #6482a7; font-size: 24rpx; line-height: 1.7; }
</style>
