<template>
  <view class="crm-page ai-home-page">
    <AppWatermark />
    <view class="ai-safe-top" :style="{ height: (metrics.statusBarHeight + 6) + 'px' }" />
    <!-- 顶部状态栏与品牌标 -->
    <view
      class="ai-brand"
      :style="{
        height: metrics.navBarHeight + 'px',
        paddingRight: (metrics.capsuleOccupiedWidth ? (metrics.capsuleOccupiedWidth + 8) + 'px' : '0')
      }"
    >
      <view class="brand-tag">
        <up-icon name="server-fill" size="18" color="#2468e8" />
        <text class="brand-title">格宏智能 AI 助手</text>
      </view>
      <text class="brand-status">在线服务中</text>
    </view>

    
      <template v-if="isLoading">
        <view class="skeleton-block" style="width: 100%; height: 160rpx; border-radius: 24rpx; margin-bottom: 30rpx; margin-top: 20rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 280rpx; border-radius: 32rpx; margin-bottom: 30rpx;"></view>
        <view style="display: flex; flex-wrap: wrap; gap: 20rpx; margin-bottom: 30rpx;">
          <view class="skeleton-block" style="width: calc(50% - 10rpx); height: 180rpx; border-radius: 24rpx;"></view>
          <view class="skeleton-block" style="width: calc(50% - 10rpx); height: 180rpx; border-radius: 24rpx;"></view>
          <view class="skeleton-block" style="width: calc(50% - 10rpx); height: 180rpx; border-radius: 24rpx;"></view>
          <view class="skeleton-block" style="width: calc(50% - 10rpx); height: 180rpx; border-radius: 24rpx;"></view>
        </view>
        <view class="skeleton-block" style="width: 100%; height: 220rpx; border-radius: 24rpx;"></view>
      </template>
      <template v-else>
  
    <!-- 问候语 -->
    <view class="hello-card">
      <text class="hello-title">{{ greetingText }}，{{ userDisplayName }}</text>
      <text class="hello-desc">我是您的空调方案专家，为您提供中央空调与家用空调选型推荐、参数比对、价格测算及选型支持。</text>
    </view>

    <!-- AI 机器人视觉形象 -->
    <view class="robot-wrap" @click="openChat('你好，请介绍一下你能帮我做什么')">
      <view class="robot-glow" />
      <image class="robot-img" src="http://gh.starall.cn/static/resource/aircon/ai-robot.png" mode="aspectFit" />
      <view class="robot-chip">
        <up-icon name="chat-fill" size="14" color="#2468e8" />
        <text>点击与我立即交流</text>
      </view>
    </view>

    <!-- 核心功能入口 4 格大卡片 (紧扣中央空调与家用空调两大核心分类) -->
    <view class="feature-grid">
      <view
        v-for="item in features"
        :key="item.title"
        class="feature-card"
        @click="openChat(item.question)"
      >
        <view class="feature-icon-box" :style="{ background: item.bgColor }">
          <up-icon :name="item.icon" size="26" :color="item.color" />
        </view>
        <view class="feature-text-box">
          <text class="feature-title">{{ item.title }}</text>
          <text class="feature-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 猜你想问 -->
    <view class="section-header">
      <text class="section-title">猜你想问</text>
      <text class="section-hint">点击快速提问</text>
    </view>

    <view class="question-list">
      <view
        v-for="(item, index) in questions"
        :key="index"
        class="question-item"
        @click="openChat(item)"
      >
        <view class="question-left">
          <text class="question-num">0{{ index + 1 }}</text>
          <text class="question-text">{{ item }}</text>
        </view>
        <up-icon name="arrow-right" size="14" color="#a0aec0" />
      </view>
    </view>

    <!-- 底部常驻提问栏 -->
    <view class="chat-entry-fixed">
      <view class="chat-entry" @click="openPage('/pages/ai/chat')">
        <up-icon name="edit-pen" size="18" color="#8b95a7" />
        <text class="chat-placeholder">有什么中央空调或家用空调问题，直接问我...</text>
        <view class="entry-send-btn">
          <up-icon name="arrow-right" size="16" color="#fff" />
        </view>
      </view>
    </view>

    </template>
    <view class="tabbar-space" />
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app';
import { openPage } from '@/utils/pages';
import { getNavMetrics } from '@/utils/system';
import { useUserStore } from '@/store/user';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';
import AppWatermark from '@/components/app-watermark.vue';

const metrics = computed(() => getNavMetrics());
const userStore = useUserStore();

// 动态问候语和真实用户信息展示，杜绝硬编码假数据
const greetingText = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '上午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

const userDisplayName = computed(() => {
  const info = userStore.userInfo || {};
  return info.nickname || info.realname || info.username || (info.mobile ? `${info.mobile.slice(-4)}用户` : '空调专家');
});

// AI 对话可能包含用户业务信息，因此分享卡片只打开公共首页，不复制聊天内容。
const SHARE_TITLE = '格宏 AI 助手｜智能选型与报价';
onShareAppMessage(() => createShareAppMessageOptions(SHARE_TITLE));
onShareTimeline(() => createShareTimelineOptions(SHARE_TITLE));
onShow(() => showMiniProgramShareMenu());
const isLoading = ref(true);
onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 400);
});

// 核心功能卡片：严格围绕后台定死的中央空调 (58) 与家用空调 (86)
const features = [
  {
    title: '中央空调选型',
    desc: '商用多联/风管/大冷量',
    icon: 'grid-fill',
    color: '#2468e8',
    bgColor: '#edf4ff',
    question: '推荐一套适合 120㎡ 办公室使用的格力中央空调多联机方案'
  },
  {
    title: '家用空调搭配',
    desc: '挂机/柜机/全屋冷量配比',
    icon: 'home-fill',
    color: '#10b981',
    bgColor: '#e6fcf5',
    question: '3室2厅约100㎡家用空调应该如何配置挂机和柜机？'
  },
  {
    title: '参数规格比对',
    desc: '能效/冷量/外机占位分析',
    icon: 'list-dot',
    color: '#f59e0b',
    bgColor: '#fef7e7',
    question: '商用多联机和一拖一变频风管机在能效和造价上有什么区别？'
  },
  {
    title: '选型规范调阅',
    desc: '配比/铜管/安装施工指导',
    icon: 'file-text-fill',
    color: '#8b5cf6',
    bgColor: '#f3effe',
    question: '请提供格力中央空调室内外机配比率及铜管安装规范'
  }
];

const questions = [
  '推荐一套适合 120㎡ 办公室使用的格力中央空调方案',
  '家用中央空调变频风管机和多联机如何选择？',
  '25-35㎡ 客厅选择 2匹 还是 3匹 立式柜机更合适？',
  '商用办公楼多联机系统室外机匹数如何根据面积折算？'
];

const openChat = (question) => openPage('/pages/ai/chat', { question });
</script>

<style lang="scss" scoped>
.ai-home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 28rpx;
  background: #f4f7fc;
}

.ai-safe-top {
  width: 100%;
}

.ai-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

.brand-tag {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-title {
  color: #17233d;
  font-size: 32rpx;
  font-weight: 900;
  letter-spacing: 0.5rpx;
}

.brand-status {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  background: #e6fcf5;
  color: #10b981;
  font-size: 22rpx;
  font-weight: 700;
}

.hello-card {
  margin-top: 14rpx;
}

.hello-title {
  display: block;
  color: #17233d;
  font-size: 46rpx;
  font-weight: 900;
  line-height: 1.2;
}

.hello-desc {
  display: block;
  margin-top: 12rpx;
  color: #647389;
  font-size: 26rpx;
  line-height: 1.55;
}

.robot-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 18rpx auto 14rpx;
}

.robot-img {
  width: 320rpx;
  height: 240rpx;
  z-index: 2;
}

.robot-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: -12rpx;
  padding: 8rpx 22rpx;
  border-radius: 24rpx;
  background: #fff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 16rpx rgba(36, 104, 232, 0.12);
  z-index: 3;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-top: 12rpx;
}

.feature-card {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 20rpx rgba(23, 35, 61, 0.04);
}

.feature-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  margin-right: 18rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
}

.feature-text-box {
  flex: 1;
  min-width: 0;
}

.feature-title {
  display: block;
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
}

.feature-desc {
  display: block;
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 22rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 32rpx 0 16rpx;
}

.section-title {
  color: #17233d;
  font-size: 32rpx;
  font-weight: 900;
}

.section-hint {
  color: #929fb2;
  font-size: 24rpx;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding-bottom: 180rpx;
}

.question-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 24rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.03);
}

.question-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 16rpx;
}

.question-num {
  margin-right: 16rpx;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 900;
}

.question-text {
  flex: 1;
  color: #3b485d;
  font-size: 26rpx;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-entry-fixed {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(108rpx + env(safe-area-inset-bottom));
  z-index: 20;
}

.chat-entry {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 20rpx 0 28rpx;
  border-radius: 44rpx;
  background: #fff;
  box-shadow: 0 10rpx 32rpx rgba(23, 35, 61, 0.1);
}

.chat-placeholder {
  flex: 1;
  margin-left: 16rpx;
  color: #8b95a7;
  font-size: 26rpx;
}

.entry-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #2468e8;
}

.tabbar-space {
  height: calc(160rpx + env(safe-area-inset-bottom));
}
.skeleton-block {
  background: #e2e8f0;
  background-image: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 37%, #e2e8f0 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>
