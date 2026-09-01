<template>
  <view class="crm-page ai-home-page">
    <!-- 顶部状态栏与品牌标 -->
    <view class="ai-brand" :style="{ paddingTop: safeTop + 'px' }">
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
      <text class="hello-title">下午好，张工</text>
      <text class="hello-desc">我是您的空调方案专家，为您提供选型推荐、技术参数比对、价格测算及资料调阅支持。</text>
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

    <!-- 核心功能入口 4 格大卡片 -->
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
        <text class="chat-placeholder">有什么空调选型或价格问题，直接问我...</text>
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
import { openPage } from '@/utils/pages';


const isLoading = ref(true);
onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 400);
});

const safeTop = computed(() => {
  try {
    const windowInfo = typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : {};
    const systemInfo = typeof uni.getSystemInfoSync === 'function' ? uni.getSystemInfoSync() : {};
    return windowInfo.statusBarHeight || systemInfo.statusBarHeight || 20;
  } catch (error) {
    return 20;
  }
});

const features = [
  {
    title: '查型号参数',
    desc: '冷量/能效/匹数规格',
    icon: 'search',
    color: '#2468e8',
    bgColor: '#edf4ff',
    question: 'VK10R 的具体技术参数和适用面积是多少？'
  },
  {
    title: '智能选型方案',
    desc: '按面积/房型精准配比',
    icon: 'grid-fill',
    color: '#10b981',
    bgColor: '#e6fcf5',
    question: '推荐一套适合 120㎡ 办公室使用的中央空调方案'
  },
  {
    title: '机型多维对比',
    desc: '核心参数及优势分析',
    icon: 'list-dot',
    color: '#f59e0b',
    bgColor: '#fef7e7',
    question: 'VK8R、VK10R 和 VK12R 有什么区别与优缺点？'
  },
  {
    title: '资料手册调阅',
    desc: '说明书/认证/图纸',
    icon: 'file-text-fill',
    color: '#8b5cf6',
    bgColor: '#f3effe',
    question: '帮我调阅 VK 系列多联机产品样本与安装说明书'
  }
];

const questions = [
  '推荐一套适合 120㎡ 办公室使用的中央空调方案',
  'VK8R 和 VK10R 在能效与制冷量上有什么具体差别？',
  '商用办公楼多联机和模块机应该如何选择？',
  '新一级能效壁挂机与柜机如何搭配全屋采暖？'
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

.ai-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
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
