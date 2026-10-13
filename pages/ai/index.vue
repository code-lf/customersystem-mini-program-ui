<template>
  <view class="ai-home-page">
    <!-- 自定义导航页需避开状态栏和微信胶囊，主体内容再在剩余屏幕内居中。 -->
    <view class="nav-space" :style="{ height: metrics.totalNavHeight + 'px' }" />

    <view class="center-stage">
      <view class="center-content">
        <!-- 欢迎语固定占位，带光泽质感与平滑微动效 -->
        <view class="greeting-row">
          <view class="greeting-bubble">
            <text class="bubble-spark">✨</text>
            <view class="bubble-content">
              <text class="bubble-text">{{ greetingText }}</text>
              <text v-if="isTyping" class="typing-cursor">|</text>
            </view>
          </view>
        </view>

        <view class="hero">
          <!-- 柔和科技光晕与微轨道装饰背景 -->
          <view class="hero-glow" />
          <view class="hero-orbit hero-orbit--1" />
          <view class="hero-orbit hero-orbit--2" />
          <view class="hero-pedestal" />

          <view class="hero-copy">
            <view class="hero-title-row">
              <text class="hero-title">AI 小格 · 家电助理</text>
              <view class="hero-status-pill">
                <text class="status-dot" />
                <text class="status-text">实时在线</text>
              </view>
            </view>
            <text class="hero-desc">空调 / 家电选型 · 咨询与方案推荐</text>
            <view class="hero-points">
              <view class="hero-chip">
                <text class="hero-chip__icon">✓</text>
                <text class="hero-chip__text">专业可靠</text>
              </view>
              <view class="hero-chip">
                <text class="hero-chip__icon">✓</text>
                <text class="hero-chip__text">方案精准</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 人物独立于信息框，增加轻盈呼吸悬浮微动效 -->
        <image
          class="hero-robot"
          src="https://gehong-ai-knowledge-bj-20260829.oss-cn-beijing.aliyuncs.com/upload/attachment/image/202610/11/xiaoge-assistant.png"
          mode="aspectFit"
        />

        <!-- 仅保留开始对话和历史对话两个入口，不再展示推荐问题与功能卡片。 -->
        <view class="action-list">
          <view class="action-card action-card--primary" @click="openPage('/pages/ai/chat')">
            <view class="action-icon action-icon--primary">
              <up-icon name="chat-fill" size="27" color="#2468e8" />
            </view>
            <view class="action-copy">
              <text class="action-title">开始对话</text>
              <text class="action-desc">立即咨询空调与家电方案</text>
            </view>
            <view class="action-arrow action-arrow--primary">
              <up-icon name="arrow-right" size="17" color="#ffffff" />
            </view>
          </view>

          <view class="action-card action-card--history" @click="openPage('/pages/ai/history')">
            <view class="action-icon action-icon--history">
              <up-icon name="clock" size="24" color="#2468e8" />
            </view>
            <view class="action-copy">
              <text class="action-title">历史对话</text>
              <text class="action-desc">查看并继续之前的会话记录</text>
            </view>
            <up-icon name="arrow-right" size="17" color="#93a0b3" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue';
import { onHide, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app';
import { openPage } from '@/utils/pages';
import { getNavMetrics } from '@/utils/system';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';

// 导航占位跟随设备状态栏和胶囊高度变化，避免中央内容顶到系统按钮。
const metrics = computed(() => getNavMetrics());

// 每次进入页面重新播放简短欢迎语；离开页面清理计时器，避免后台继续更新。
const GREETING = '嗨！我是 AI 小格，很高兴见到您！';
const greetingText = ref('');
const isTyping = ref(false);
let typingTimer = null;

function stopGreeting() {
  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }
  isTyping.value = false;
}

function startGreeting() {
  stopGreeting();
  greetingText.value = '';
  isTyping.value = true;
  let index = 0;
  typingTimer = setInterval(() => {
    index += 1;
    greetingText.value = GREETING.slice(0, index);
    if (index >= GREETING.length) stopGreeting();
  }, 110);
}

// 分享只打开公共助理首页，不携带用户的历史对话内容。
const SHARE_TITLE = '小格 AI 助理｜家电选型与报价';
onShareAppMessage(() => createShareAppMessageOptions(SHARE_TITLE));
onShareTimeline(() => createShareTimelineOptions(SHARE_TITLE));
onShow(() => {
  showMiniProgramShareMenu();
  startGreeting();
});
onHide(stopGreeting);
onUnmounted(stopGreeting);
</script>

<style lang="scss" scoped>
.ai-home-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 28rpx calc(120rpx + env(safe-area-inset-bottom));
  background: #f4f7fc;
}

.nav-space {
  flex: none;
}

.center-stage {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.center-content {
  position: relative;
  width: 100%;
  max-width: 760rpx;
}

.greeting-row {
  display: flex;
  justify-content: flex-start;
  box-sizing: border-box;
  height: 136rpx;
  padding: 0 18rpx 16rpx 36rpx;
}

.greeting-bubble {
  position: relative;
  align-self: flex-start;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  width: 440rpx;
  min-height: 96rpx;
  padding: 18rpx 24rpx;
  border: 1rpx solid #cce1ff;
  border-radius: 26rpx 26rpx 8rpx 26rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(37, 99, 235, 0.08), 0 2rpx 6rpx rgba(15, 23, 42, 0.02);
}

.greeting-bubble::after {
  position: absolute;
  right: 28rpx;
  bottom: -12rpx;
  width: 22rpx;
  height: 22rpx;
  border-right: 1rpx solid #cce1ff;
  border-bottom: 1rpx solid #cce1ff;
  background: #ffffff;
  content: '';
  transform: rotate(45deg);
  border-radius: 0 0 4rpx 0;
}

.bubble-spark {
  font-size: 26rpx;
  line-height: 1.3;
  flex-shrink: 0;
}

.bubble-content {
  flex: 1;
  font-size: 26rpx;
  line-height: 1.45;
  color: #1e3a8a;
  font-weight: 600;
}

.typing-cursor {
  color: #2563eb;
  font-weight: 700;
  animation: cursor-blink 0.8s infinite;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 200rpx;
  padding: 24rpx 26rpx;
  border: 1rpx solid #d9e8fc;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f6faff 50%, #ecf4ff 100%);
  box-shadow: 0 12rpx 32rpx rgba(37, 99, 235, 0.07), 0 2rpx 6rpx rgba(15, 23, 42, 0.02);
  overflow: visible;
}

/* 科技光晕与背景环 */
.hero-glow {
  position: absolute;
  right: 10rpx;
  top: 10rpx;
  width: 260rpx;
  height: 240rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.32) 0%, rgba(219, 234, 254, 0.05) 65%, transparent 80%);
  pointer-events: none;
}

.hero-orbit {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.hero-orbit--1 {
  right: 15rpx;
  top: 10rpx;
  width: 210rpx;
  height: 210rpx;
  border: 1rpx dashed rgba(147, 197, 253, 0.45);
}

.hero-orbit--2 {
  right: 48rpx;
  top: 42rpx;
  width: 145rpx;
  height: 145rpx;
  border: 1rpx solid rgba(191, 219, 254, 0.4);
}

.hero-pedestal {
  position: absolute;
  right: 60rpx;
  bottom: 12rpx;
  width: 140rpx;
  height: 18rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(30, 64, 175, 0.18) 0%, transparent 72%);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 185rpx);
}

.hero-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.hero-title {
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.5rpx;
}

.hero-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  background: #ecfdf5;
  border: 1rpx solid #a7f3d0;
}

.status-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8rpx rgba(16, 185, 129, 0.6);
  animation: dot-pulse 2s infinite;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

.status-text {
  font-size: 19rpx;
  color: #059669;
  font-weight: 600;
}

.hero-desc {
  margin-top: 10rpx;
  color: #64748b;
  font-size: 23rpx;
  line-height: 1.45;
}

.hero-points {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  background: rgba(239, 246, 255, 0.9);
  border: 1rpx solid rgba(191, 219, 254, 0.85);
}

.hero-chip__icon {
  font-size: 20rpx;
  font-weight: 800;
  color: #2563eb;
}

.hero-chip__text {
  font-size: 21rpx;
  font-weight: 600;
  color: #1e40af;
}

.hero-robot {
  position: absolute;
  z-index: 2;
  top: -46rpx;
  right: -36rpx;
  width: 385rpx;
  height: 385rpx;
  pointer-events: none;
  animation: mascot-float 3.6s ease-in-out infinite;
}

@keyframes mascot-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8rpx);
  }
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.action-card {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  min-height: 126rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
}

.action-card--primary {
  color: #fff;
  background: linear-gradient(115deg, #3797ff, #1764e8 76%, #287df6);
  box-shadow: 0 12rpx 26rpx rgba(36, 104, 232, .18);
}

.action-card--history {
  color: #17233d;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(23, 35, 61, .05);
}

.action-icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 70rpx;
  height: 70rpx;
  border-radius: 20rpx;
}

.action-icon--primary { background: #fff; }
.action-icon--history { background: #edf4ff; }

.action-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.action-title {
  font-size: 31rpx;
  font-weight: 800;
}

.action-desc {
  font-size: 22rpx;
  line-height: 1.4;
  opacity: .82;
}

.action-arrow {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
}

.action-arrow--primary { background: rgba(255, 255, 255, .22); }
</style>
