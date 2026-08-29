<template>
  <view class="chat-page">
    <AppNavbar title="AI 智能电器助手">
      <template #right>
        <view class="clear-history-btn" @click="clearChat">
          <up-icon name="trash" size="18" color="#586477" />
        </view>
      </template>
    </AppNavbar>

    <!-- 聊天记录滚动区域 -->
    <scroll-view
      class="chat-scroll"
      scroll-y
      :scroll-top="scrollTop"
      scroll-with-animation
    >
      <view class="chat-inner">
        <!-- 欢迎气泡 -->
        <view class="message-row ai-row">
          <image class="avatar" src="/static/aircon/ai-robot-card.png" mode="aspectFit" />
          <view class="ai-content">
            <view class="ai-bubble">
              <text class="text-body">您好！我是格宏智能电器 AI 助手。我可以为您进行中央空调及家用空调选型推荐、参数比对、价格测算与资料调阅。请问今天有什么可以帮您？</text>
            </view>
          </view>
        </view>

        <!-- 历史消息列表 -->
        <view
          v-for="msg in messages"
          :key="msg.id"
          class="message-row"
          :class="msg.role === 'user' ? 'user-row' : 'ai-row'"
        >
          <template v-if="msg.role === 'user'">
            <view class="user-bubble">
              <text class="text-body">{{ msg.text }}</text>
            </view>
            <image class="avatar user-avatar" src="/static/avatars/avatar-demo.png" mode="aspectFill" />
          </template>

          <template v-else>
            <image class="avatar" src="/static/aircon/ai-robot-card.png" mode="aspectFit" />
            <view class="ai-content">
              <view class="ai-bubble">
                <text class="text-body">{{ msg.text }}</text>
              </view>

              <!-- 如果 AI 返回了推荐机型卡片 -->
              <view
                v-if="msg.products && msg.products.length"
                class="recommend-cards-wrap"
              >
                <view
                  v-for="(product, idx) in msg.products"
                  :key="product.id"
                  class="recommend-card"
                >
                  <view class="rec-badge">推荐方案 0{{ idx + 1 }} · {{ product.series || '多联机' }}</view>
                  <view class="rec-body">
                    <image class="rec-img" :src="product.image" mode="aspectFit" />
                    <view class="rec-info">
                      <text class="rec-model">{{ product.model }} {{ product.name }}</text>
                      <text class="rec-spec">{{ (product.specs || []).slice(0, 2).join(' | ') }}</text>
                      <text class="rec-area">适用面积：{{ product.area }}</text>
                      <view class="rec-price">
                        <text class="symbol">¥</text>
                        <text class="num">{{ formatPrice(product.price) }}</text>
                      </view>
                    </view>
                  </view>
                  <view class="rec-actions">
                    <button class="btn-view" @click="openPage('/pages/product/detail', { id: product.id })">查看详情</button>
                    <button class="btn-add-quote" @click="addQuote(product)">加入报价单</button>
                  </view>
                </view>
              </view>
            </view>
          </template>
        </view>

        <!-- 输入思考中动画 -->
        <view v-if="isThinking" class="message-row ai-row">
          <image class="avatar" src="/static/aircon/ai-robot-card.png" mode="aspectFit" />
          <view class="ai-content">
            <view class="ai-bubble thinking-bubble">
              <view class="dot" />
              <view class="dot" />
              <view class="dot" />
              <text class="thinking-text">AI 专家正在分析方案中...</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 快捷预设提问标签 -->
    <view class="quick-questions-scroll">
      <view
        v-for="item in quickChips"
        :key="item"
        class="quick-chip"
        @click="sendMessage(item)"
      >
        <text>{{ item }}</text>
      </view>
    </view>

    <!-- 底部输入框与发送按钮 -->
    <view class="input-bar">
      <view class="input-field-wrap">
        <input
          v-model="inputContent"
          placeholder="向 AI 助手提问 (如: 120㎡办公室、VK8R参数)..."
          placeholder-class="placeholder"
          confirm-type="send"
          @confirm="sendMessage(inputContent)"
        />
        <up-icon
          v-if="inputContent"
          name="close-circle-fill"
          size="16"
          color="#a0aec0"
          @click="inputContent = ''"
        />
      </view>
      <button
        class="send-btn"
        :class="{ active: inputContent.trim() }"
        @click="sendMessage(inputContent)"
      >
        <up-icon name="arrow-up" size="18" color="#fff" />
      </button>
    </view>
  </view>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { askAi } from '@/api/ai-assistant';

const pageOptions = getPageOptions();
const inputContent = ref('');
const isThinking = ref(false);
const scrollTop = ref(0);
// sessionId 由后端/百炼返回，用于让连续问题属于同一场会话。
const sessionId = ref('');

const quickChips = [
  '120㎡ 办公室方案',
  'VK8R 与 VK10R 对比',
  'VK 系列能效参数',
  '多联机选型原则'
];

// 欢迎语已经固定显示在模板中，因此不再预置会被误认为真实结果的 Mock 对话。
const messages = ref([]);

const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value = 99999 + Math.random();
  });
};

const formatPrice = (val) => Number(val || 0).toLocaleString();

const addQuote = (product) => {
  uni.setStorageSync('pendingSolutionProduct', {
    id: product.id,
    name: product.name,
    model: product.model,
    image: product.image,
    price: product.price,
    mockUnitPrice: product.price
  });
  uni.showToast({ title: '已加入报价单', icon: 'success' });
};

const clearChat = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空当前对话记录吗？',
    success: (res) => {
      if (res.confirm) {
        messages.value = [];
        // 清空聊天时同时结束旧会话，下一条问题会建立新的上下文。
        sessionId.value = '';
        uni.showToast({ title: '已清空', icon: 'none' });
      }
    }
  });
};

const sendMessage = async (text) => {
  if (!text || !text.trim() || isThinking.value) return;

  const userText = text.trim();
  inputContent.value = '';

  // AI 请求需要的是发送前的历史，避免把当前问题在 history 和 question 中重复提交。
  const historyBeforeQuestion = [...messages.value];

  // 插入用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    text: userText
  });
  scrollToBottom();

  isThinking.value = true;
  try {
    const result = await askAi(userText, historyBeforeQuestion, {
      sessionId: sessionId.value
    });

    if (result.sessionId) sessionId.value = result.sessionId;
    messages.value.push({
      id: Date.now() + 1,
      role: 'ai',
      text: result.text,
      products: result.products
    });
  } catch (error) {
    console.error('AI assistant request failed:', error);
    messages.value.push({
      id: Date.now() + 1,
      role: 'ai',
      text: 'AI 助手暂时连接失败，请检查网络或稍后重试。'
    });
  } finally {
    isThinking.value = false;
    scrollToBottom();
  }
};

onMounted(() => {
  if (pageOptions.question) {
    sendMessage(pageOptions.question);
  }
});
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f7fc;
}

.clear-history-btn {
  padding: 8rpx;
}

.chat-scroll {
  flex: 1;
  min-height: 0;
}

.chat-inner {
  padding: 24rpx 24rpx 36rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.message-row {
  display: flex;
  align-items: flex-start;
}

.avatar {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-avatar {
  margin-left: 16rpx;
}

.ai-row .avatar {
  margin-right: 16rpx;
}

.user-row {
  justify-content: flex-end;
}

.user-bubble {
  max-width: 540rpx;
  padding: 22rpx 28rpx;
  border-radius: 28rpx 28rpx 4rpx 28rpx;
  background: #2468e8;
  color: #fff;
  font-size: 28rpx;
  line-height: 1.5;
  box-shadow: 0 6rpx 20rpx rgba(36, 104, 232, 0.25);
  word-break: break-word;
}

.ai-content {
  flex: 1;
  min-width: 0;
  max-width: 600rpx;
}

.ai-bubble {
  padding: 24rpx 28rpx;
  border-radius: 4rpx 28rpx 28rpx 28rpx;
  background: #fff;
  color: #17233d;
  font-size: 28rpx;
  line-height: 1.55;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
  white-space: pre-wrap;
  word-break: break-word;
}

.recommend-cards-wrap {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 16rpx;
}

.recommend-card {
  padding: 22rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(23, 35, 61, 0.05);
  border: 1rpx solid #eef3fb;
}

.rec-badge {
  display: inline-block;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.rec-body {
  display: flex;
  align-items: center;
}

.rec-img {
  width: 130rpx;
  height: 130rpx;
  margin-right: 18rpx;
  border-radius: 12rpx;
  background: #f7f9fc;
  flex-shrink: 0;
}

.rec-info {
  flex: 1;
  min-width: 0;
}

.rec-model {
  display: block;
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-spec,
.rec-area {
  display: block;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.rec-price {
  margin-top: 8rpx;
  color: #ef543f;
  font-weight: 900;
}

.rec-price .symbol {
  font-size: 22rpx;
}

.rec-price .num {
  font-size: 30rpx;
  margin-left: 2rpx;
}

.rec-actions {
  display: flex;
  justify-content: flex-end;
  gap: 14rpx;
  margin-top: 16rpx;
  padding-top: 14rpx;
  border-top: 1rpx solid #f1f5fa;
}

.btn-view {
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 26rpx;
  background: #f1f4f9;
  color: #586477;
  font-size: 22rpx;
  line-height: 52rpx;
}

.btn-add-quote {
  height: 52rpx;
  padding: 0 26rpx;
  border-radius: 26rpx;
  background: #2468e8;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 52rpx;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.25);
}

.thinking-bubble {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #7b889d;
  font-size: 24rpx;
}

.dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #2468e8;
  animation: bounce 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

.thinking-text {
  margin-left: 8rpx;
}

.quick-questions-scroll {
  display: flex;
  padding: 10rpx 24rpx 14rpx;
  gap: 14rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.quick-chip {
  padding: 10rpx 22rpx;
  border-radius: 26rpx;
  background: #fff;
  color: #586477;
  font-size: 24rpx;
  box-shadow: 0 4rpx 14rpx rgba(23, 35, 61, 0.03);
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(23, 35, 61, 0.03);
}

.input-field-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 76rpx;
  padding: 0 24rpx;
  border-radius: 38rpx;
  background: #f4f7fc;
}

.input-field-wrap input {
  flex: 1;
  font-size: 26rpx;
  color: #17233d;
}

.placeholder {
  color: #9aa5b5;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #b0bac7;
  transition: all 0.2s ease;
}

.send-btn.active {
  background: #2468e8;
  box-shadow: 0 6rpx 18rpx rgba(36, 104, 232, 0.35);
}
</style>
