<template>
  <view class="ai-home-page">
    <!-- 自定义导航页需避开状态栏和微信胶囊，主体内容再在剩余屏幕内居中。 -->
    <view class="nav-space" :style="{ height: metrics.totalNavHeight + 'px' }" />

    <view class="center-stage">
      <view class="center-content">
        <view class="hero">
          <!-- 浅色圆环只作背景装饰，不参与点击与内容布局。 -->
          <view class="hero-circle hero-circle--large" />
          <view class="hero-circle hero-circle--small" />
          <view class="hero-copy">
            <text class="hero-title">家电 AI 智能助理</text>
            <text class="hero-desc">空调 / 家电选型 · 咨询与方案推荐</text>
            <view class="hero-points">
              <text>专业可靠</text>
              <text>方案精准</text>
            </view>
          </view>
          <image
            class="hero-robot"
            src="https://gh.starall.cn/static/resource/aircon/ai-robot.png"
            mode="aspectFit"
          />
        </view>

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
import { computed } from 'vue';
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app';
import { openPage } from '@/utils/pages';
import { getNavMetrics } from '@/utils/system';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';

// 导航占位跟随设备状态栏和胶囊高度变化，避免中央内容顶到系统按钮。
const metrics = computed(() => getNavMetrics());

// 分享只打开公共助理首页，不携带用户的历史对话内容。
const SHARE_TITLE = '格宏 AI 助理｜家电选型与报价';
onShareAppMessage(() => createShareAppMessageOptions(SHARE_TITLE));
onShareTimeline(() => createShareTimelineOptions(SHARE_TITLE));
onShow(() => showMiniProgramShareMenu());
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
  width: 100%;
  max-width: 760rpx;
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 190rpx;
  padding: 18rpx 22rpx;
  overflow: hidden;
  border: 1rpx solid #dceaff;
  border-radius: 26rpx;
  background: linear-gradient(120deg, #eaf4ff 0%, #f3f8ff 62%, #e5f1ff 100%);
}

// 圆环压在文字和机器人下方，只为浅蓝底色增加轻微层次。
.hero-circle {
  position: absolute;
  z-index: 0;
  border: 2rpx solid rgba(255, 255, 255, .65);
  border-radius: 50%;
  pointer-events: none;
}

.hero-circle--large {
  top: -100rpx;
  right: -24rpx;
  width: 300rpx;
  height: 300rpx;
  background: rgba(255, 255, 255, .18);
}

.hero-circle--small {
  right: 142rpx;
  bottom: -64rpx;
  width: 130rpx;
  height: 130rpx;
}

.hero-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  max-width: 500rpx;
}

.hero-title {
  color: #17233d;
  font-size: 38rpx;
  font-weight: 900;
  line-height: 1.25;
}

.hero-desc {
  margin-top: 10rpx;
  color: #728198;
  font-size: 23rpx;
  line-height: 1.5;
}

.hero-points {
  display: flex;
  gap: 18rpx;
  margin-top: 16rpx;
  color: #4476d5;
  font-size: 21rpx;
}

.hero-points text::before {
  content: '✓';
  margin-right: 5rpx;
  color: #2468e8;
}

.hero-robot {
  position: absolute;
  z-index: 1;
  right: -2rpx;
  bottom: -6rpx;
  width: 190rpx;
  height: 190rpx;
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
