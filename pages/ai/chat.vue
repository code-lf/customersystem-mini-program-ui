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
          <image class="avatar" src="http://gh.starall.cn/static/resource/aircon/ai-robot-card.png" mode="aspectFit" />
          <view class="ai-content">
            <view class="ai-bubble">
              <text class="text-body">您好！我是格宏智能电器 AI 助手（对接阿里云百炼应用）。我可以为您进行中央空调及家用空调选型推荐、参数比对、价格测算与资料调阅。如需咨询，请确保已登录您的有效账号。</text>
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
            <image class="avatar user-avatar" :src="userAvatar" mode="aspectFill" />
          </template>

          <template v-else>
            <image class="avatar" src="http://gh.starall.cn/static/resource/aircon/ai-robot-card.png" mode="aspectFit" />
            <view class="ai-content">
              <view class="ai-bubble" :class="{ 'error-bubble': msg.isError }">
                <view v-if="msg.isStreaming && !msg.text" class="stream-thinking">
                  <view class="dot" />
                  <view class="dot" />
                  <view class="dot" />
                  <text class="thinking-text">AI 专家正在分析方案中...</text>
                </view>
                <text v-else class="text-body">{{ msg.text }}</text>
              </view>

              <!-- 未登录引导卡片 -->
              <view
                v-if="msg.isLoginRequired"
                class="login-action-card"
                @click="goToLogin"
              >
                <view class="login-action-left">
                  <up-icon name="account" size="18" color="#2468e8" />
                  <view class="login-action-text-wrap">
                    <text class="login-action-title">当前未登录或会话已失效</text>
                    <text class="login-action-sub">点击使用账号密码重新登录，以同步百炼选型权限</text>
                  </view>
                </view>
                <view class="login-action-btn">去登录 ›</view>
              </view>

              <!-- 关联报价单直达 -->
              <view
                v-if="msg.quoteId"
                class="quote-link-card"
                @click="openPage('/pages/solution/detail', { id: msg.quoteId })"
              >
                <view class="quote-link-left">
                  <up-icon name="order" size="18" color="#2468e8" />
                  <text class="quote-link-text">已为您生成配套报价方案 #{{ msg.quoteId }}</text>
                </view>
                <text class="quote-link-action">查看详情 ›</text>
              </view>

              <!-- 如果 AI 返回了推荐机型卡片 -->
              <view
                v-if="msg.products && msg.products.length"
                class="recommend-cards-wrap"
              >
                <view
                  v-for="(product, idx) in msg.products"
                  :key="product.id || product.goods_id"
                  class="recommend-card"
                >
                  <view class="rec-badge">推荐方案 0{{ idx + 1 }} · {{ product.series || '空调机型' }}</view>
                  <view class="rec-body">
                    <image class="rec-img" :src="product.image" mode="aspectFit" />
                    <view class="rec-info">
                      <text class="rec-model">{{ product.model }} {{ product.name }}</text>
                      <text class="rec-spec">{{ (product.specs || []).slice(0, 2).join(' | ') }}</text>
                      <text v-if="product.area" class="rec-area">适用：{{ product.area }}</text>
                      <view class="rec-price">
                        <text class="symbol">¥</text>
                        <text class="num">{{ formatPrice(product.price) }}</text>
                      </view>
                    </view>
                  </view>
                  <view class="rec-actions">
                    <button class="btn-view" @click="openPage('/pages/product/detail', { id: product.id || product.goods_id })">查看详情</button>
                    <button class="btn-add-quote" @click="addQuote(product)">加入报价单</button>
                  </view>
                </view>
              </view>
            </view>
          </template>
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

    <!-- 未登录提示条 -->
    <view v-if="!userStore.isLoggedIn" class="unlogin-tip-bar" @click="goToLogin">
      <view class="unlogin-tip-left">
        <up-icon name="lock" size="13" color="#b45309" />
        <text class="unlogin-tip-text">当前未登录账号，请先登录以调用百炼智能模型</text>
      </view>
      <text class="unlogin-tip-btn">立即登录 ›</text>
    </view>

    <!-- 底部输入框与发送按钮 -->
    <view class="input-bar">
      <button
        class="voice-btn"
        :class="{ recording: isRecording }"
        :disabled="isThinking"
        @click="toggleVoiceRecord"
      >
        <up-icon name="mic" size="19" :color="isRecording ? '#fff' : '#2468e8'" />
      </button>
      <view class="input-field-wrap">
        <input
          v-model="inputContent"
          :placeholder="isRecording ? '正在听，请说出问题，再点麦克风结束' : '向百炼 AI 助手提问 (如: 120㎡办公室、VK8R参数)...'"
          placeholder-class="placeholder"
          confirm-type="send"
          :disabled="isRecording"
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
        :class="{ active: inputContent.trim() && !isRecording }"
        :disabled="isRecording"
        @click="sendMessage(inputContent)"
      >
        <up-icon name="arrow-up" size="18" color="#fff" />
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { onUnload } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { askAiStream } from '@/api/ai-assistant';
import { useUserStore } from '@/store/user';

const pageOptions = getPageOptions();
const userStore = useUserStore();
const userAvatar = computed(() => userStore.userInfo?.avatar || '/static/tabbar/wode.png');

const inputContent = ref('');
const isThinking = ref(false);
const isRecording = ref(false);
const recognizedText = ref('');
const scrollTop = ref(0);
// sessionId 由后端返回，用于维持连续会话上下文
const sessionId = ref('');

const quickChips = [
  '120㎡ 办公室中央空调方案',
  '多联机与一拖一风管机对比',
  '客厅 3匹 柜机与风管机推荐',
  '中央空调安装配比与造价'
];

// 对话消息列表
const messages = ref([]);

// 微信同声传译录音识别管理器，仅在微信小程序平台初始化。
let recognitionManager = null;
let isPageLeaving = false;
let activeAiRequest = null;
let scrollTimer = null;

const initVoiceRecognition = () => {
  // #ifdef MP-WEIXIN
  if (recognitionManager) return true;
  try {
    const plugin = requirePlugin('WechatSI');
    recognitionManager = plugin.getRecordRecognitionManager();

    // 实时识别结果同步到输入框，让用户在录音过程中看到识别进度。
    recognitionManager.onRecognize = (result = {}) => {
      const text = String(result.result || '').trim();
      if (text) {
        recognizedText.value = text;
        inputContent.value = text;
      }
    };

    recognitionManager.onStop = (result = {}) => {
      isRecording.value = false;
      const text = String(result.result || recognizedText.value || '').trim();
      console.info('[AI语音输入] 录音识别结束：', {
        hasText: Boolean(text),
        tempFilePath: result.tempFilePath || ''
      });

      // 页面退出触发的停止只负责释放麦克风，不应把半段识别结果继续发送。
      if (isPageLeaving) return;

      if (!text) {
        inputContent.value = '';
        uni.showToast({ title: '没有识别到文字，请重试', icon: 'none' });
        return;
      }

      // 用户结束录音后直接发送识别文字，不再要求二次点击发送按钮。
      inputContent.value = '';
      sendMessage(text);
    };

    recognitionManager.onError = (error = {}) => {
      isRecording.value = false;
      console.error('[AI语音输入] 录音或识别失败：', error);
      // 插件停止录音时偶尔会返回这两个正常终止码，不重复弹出错误提示。
      if (error.retcode === -30001 || error.retcode === -30011) return;
      uni.showToast({
        title: error.msg ? `语音识别失败：${error.msg}` : '语音识别失败，请重试',
        icon: 'none'
      });
    };
    return true;
  } catch (error) {
    console.error('[AI语音输入] WechatSI 插件初始化失败：', error);
    uni.showToast({ title: '语音插件初始化失败', icon: 'none' });
    return false;
  }
  // #endif

  // #ifndef MP-WEIXIN
  uni.showToast({ title: '请在微信小程序中使用语音输入', icon: 'none' });
  return false;
  // #endif
};

const toggleVoiceRecord = () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录后使用语音提问', icon: 'none' });
    return;
  }
  if (isThinking.value) {
    uni.showToast({ title: '请等待当前回答完成', icon: 'none' });
    return;
  }
  if (!initVoiceRecognition()) return;

  // #ifdef MP-WEIXIN
  if (isRecording.value) {
    recognitionManager.stop();
    return;
  }

  recognizedText.value = '';
  inputContent.value = '';
  try {
    recognitionManager.start({
      // 单次最长录音 60 秒，与参考项目保持一致。
      duration: 60000,
      lang: 'zh_CN'
    });
    isRecording.value = true;
  } catch (error) {
    console.error('[AI语音输入] 启动录音失败：', error);
    uni.showToast({ title: '无法启动录音，请检查麦克风权限', icon: 'none' });
  }
  // #endif
};

const goToLogin = () => {
  openPage('/pages/auth/login', { tab: 'account' });
};

const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value = 99999 + Math.random();
  });
};

// 流式分片可能非常密集，限制滚动刷新频率，避免每个字都触发一次页面重排。
const scheduleScrollToBottom = () => {
  if (scrollTimer) return;
  scrollTimer = setTimeout(() => {
    scrollTimer = null;
    scrollToBottom();
  }, 60);
};

const formatPrice = (val) => Number(val || 0).toLocaleString();

const addQuote = (product) => {
  const goodsId = product.goods_id || product.id;
  uni.setStorageSync('pendingSolutionProduct', {
    id: goodsId,
    goods_id: goodsId,
    name: product.name,
    model: product.model,
    image: product.image,
    price: product.price
  });
  uni.showToast({ title: '已加入待选，可在报价单中添加', icon: 'success' });
};

const clearChat = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空当前对话记录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清空对话时同步中止正在进行的流式请求，避免旧回答继续写回页面。
        activeAiRequest?.abort?.();
        activeAiRequest = null;
        isThinking.value = false;
        messages.value = [];
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

  // 1. 如果当前未登录，直接给出未登录提示，不执行请求
  if (!userStore.isLoggedIn) {
    messages.value.push({
      id: Date.now(),
      role: 'user',
      text: userText
    });
    messages.value.push({
      id: Date.now() + 1,
      role: 'ai',
      isError: true,
      isLoginRequired: true,
      text: '您当前处于未登录状态。阿里云百炼智能助手需要验证您的有效会员账号方可提供机型查询与选型服务。请点击下方卡片登录账号。'
    });
    scrollToBottom();
    return;
  }

  const historyBeforeQuestion = [...messages.value];

  // 插入用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    text: userText
  });
  scrollToBottom();

  // 先插入空的 AI 消息，后续每收到一个 delta 就原位追加，实现边生成边展示。
  const aiMessage = {
    id: Date.now() + 1,
    role: 'ai',
    text: '',
    products: [],
    quoteId: null,
    isStreaming: true
  };
  messages.value.push(aiMessage);
  isThinking.value = true;

  const requestController = askAiStream(userText, historyBeforeQuestion, {
    sessionId: sessionId.value
  }, {
    onDelta(delta, fullText) {
      // 使用 API 层提供的累计文本覆盖，避免网络重试或重复分片造成内容重复。
      aiMessage.text = fullText || (aiMessage.text + delta);
      scheduleScrollToBottom();
    },
    onFallback(reason) {
      console.warn('[AI助手页面] 流式接收不可用，正在使用非流式打字机：', reason);
      // 回退时清空流式阶段的半段内容，再从完整答案开头播放，避免重复文字。
      aiMessage.text = '';
      aiMessage.products = [];
      aiMessage.quoteId = null;
    }
  });
  activeAiRequest = requestController;

  try {
    const result = await requestController.promise;

    if (result.sessionId) sessionId.value = result.sessionId;
    // 最终结果补齐 meta 中的报价单与商品卡片；文本通常已由 delta 实时写入。
    aiMessage.text = result.text || aiMessage.text;
    aiMessage.products = result.products || [];
    aiMessage.quoteId = result.quoteId;
    aiMessage.isStreaming = false;
  } catch (error) {
    if (error?.cancelled) return;
    console.warn('[AI助手页面] 请求失败：', error);
    const tip = error?.message || '百炼智能助手调用异常，请稍后重试。';
    const isLoginErr = tip.includes('登录') || tip.includes('401');

    aiMessage.isStreaming = false;
    aiMessage.isError = true;
    aiMessage.isLoginRequired = isLoginErr;
    aiMessage.text = isLoginErr
      ? '后端接口校验提示：请先登录。您当前的登录会话已失效或未在后台鉴权，请重新登录。'
      : ('百炼 AI 助手请求失败：' + tip);

    if (isLoginErr) {
      uni.showModal({
        title: '需要登录',
        content: '使用阿里云百炼 AI 智能助手需要登录账号，是否前往登录？',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            goToLogin();
          }
        }
      });
    }
  } finally {
    if (activeAiRequest === requestController) {
      activeAiRequest = null;
      isThinking.value = false;
    }
    scrollToBottom();
  }
};

onMounted(() => {
  // #ifdef MP-WEIXIN
  initVoiceRecognition();
  // #endif
  if (pageOptions.question) {
    sendMessage(pageOptions.question);
  }
});

onUnload(() => {
  // 页面退出时主动停止录音，避免插件在后台继续占用麦克风。
  isPageLeaving = true;
  activeAiRequest?.abort?.();
  activeAiRequest = null;
  if (scrollTimer) {
    clearTimeout(scrollTimer);
    scrollTimer = null;
  }
  if (isRecording.value && recognitionManager) {
    try {
      recognitionManager.stop();
    } catch (error) {
      console.warn('[AI语音输入] 页面退出停止录音失败：', error);
    }
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

.quote-link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  background: #edf4ff;
  border: 1rpx solid #c7dcfe;
  border-radius: 16rpx;

  .quote-link-left {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .quote-link-text {
    font-size: 26rpx;
    font-weight: 700;
    color: #2468e8;
  }

  .quote-link-action {
    font-size: 24rpx;
    color: #2468e8;
    font-weight: 600;
  }
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

.stream-thinking {
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

.voice-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  padding: 0;
  border: 2rpx solid #bfd3fb;
  border-radius: 50%;
  background: #edf4ff;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.voice-btn::after {
  display: none;
}

.voice-btn.recording {
  border-color: #ef4444;
  background: #ef4444;
  box-shadow: 0 0 0 10rpx rgba(239, 68, 68, 0.12);
  animation: voice-pulse 1.1s ease-in-out infinite;
}

@keyframes voice-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
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

.unlogin-tip-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 28rpx;
  background: #fffbeb;
  border-top: 1rpx solid #fde68a;
  border-bottom: 1rpx solid #fef3c7;
}

.unlogin-tip-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.unlogin-tip-text {
  font-size: 24rpx;
  color: #92400e;
}

.unlogin-tip-btn {
  font-size: 24rpx;
  font-weight: bold;
  color: #d97706;
}

.ai-bubble.error-bubble {
  background: #fef2f2;
  border: 1rpx solid #fee2e2;
  color: #991b1b;
}

.login-action-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #dbeafe;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.08);
}

.login-action-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.login-action-text-wrap {
  display: flex;
  flex-direction: column;
}

.login-action-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #1e3a8a;
}

.login-action-sub {
  font-size: 22rpx;
  color: #64748b;
  margin-top: 4rpx;
}

.login-action-btn {
  padding: 8rpx 18rpx;
  background: #2468e8;
  color: #fff;
  font-size: 24rpx;
  font-weight: 500;
  border-radius: 24rpx;
  white-space: nowrap;
}
</style>
