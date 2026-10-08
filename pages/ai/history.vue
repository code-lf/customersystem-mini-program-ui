<template>
  <view class="crm-page history-page">
    <AppNavbar title="AI 会话记录" />
    <view class="page-actions">
      <text>历史会话</text>
      <button @click="openPage('/pages/ai/chat')">+ 新对话</button>
    </view>

    <view v-if="loading && !sessions.length" class="state">正在加载会话记录...</view>
    <view v-else-if="error && !sessions.length" class="state">{{ error }}<text class="retry" @click="reload">重试</text></view>
    <view v-else-if="!sessions.length" class="state">暂无会话记录，开始一次新对话吧</view>
    <view v-for="item in sessions" :key="item.session_id" class="session-card" @click="openSession(item)">
      <view class="session-main">
        <text class="session-title">{{ item.title || '新会话' }}</text>
        <text class="session-summary">{{ item.last_message || '暂无消息' }}</text>
        <view class="session-meta">
          <text>{{ formatTime(item.last_active_time || item.update_time || item.create_time) }}</text>
          <text>{{ item.message_count || 0 }} 条消息</text>
        </view>
      </view>
      <button class="delete-btn" :disabled="deletingId === item.session_id" @click.stop="confirmDelete(item)">删除</button>
    </view>
    <view v-if="sessions.length && page < lastPage" class="load-more" @click="loadMore">{{ loading ? '加载中...' : '加载更多' }}</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { deleteAiSession, getAiSessions } from '@/api/ai-session';
import { useUserStore } from '@/store/user';
import { openPage } from '@/utils/pages';

const userStore = useUserStore();
const sessions = ref([]);
const page = ref(1);
const lastPage = ref(1);
const loading = ref(false);
const deletingId = ref('');
const error = ref('');

const formatTime = (seconds) => seconds ? new Date(Number(seconds) * 1000).toLocaleString('zh-CN') : '';
const openSession = (item) => openPage('/pages/ai/chat', { session_id: item.session_id });

/** 按后端分页加载会话；返回结构为 data.data，会由统一请求层先解开外层 data。 */
const loadPage = async (targetPage) => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await getAiSessions({ page: targetPage, limit: 20 });
    const rows = Array.isArray(result) ? result : (result?.data || []);
    sessions.value = targetPage === 1 ? rows : [...sessions.value, ...rows];
    page.value = targetPage;
    lastPage.value = Number(result?.last_page || targetPage);
  } catch (err) {
    error.value = err?.message || '会话记录加载失败';
  } finally {
    loading.value = false;
  }
};

const reload = () => loadPage(1);
const loadMore = () => { if (!loading.value && page.value < lastPage.value) loadPage(page.value + 1); };

/** 二次确认后删除后端会话，接口成功才从当前列表移除。 */
const confirmDelete = (item) => {
  uni.showModal({
    title: '删除会话',
    content: '确定删除这条 AI 会话及其消息记录吗？',
    success: async (result) => {
      if (!result.confirm) return;
      deletingId.value = item.session_id;
      try {
        await deleteAiSession(item.session_id);
        sessions.value = sessions.value.filter((row) => row.session_id !== item.session_id);
        uni.showToast({ title: '已删除会话', icon: 'success' });
      } catch (err) {
        uni.showToast({ title: err?.message || '删除失败', icon: 'none' });
      } finally {
        deletingId.value = '';
      }
    }
  });
};

onShow(() => {
  if (!userStore.isLoggedIn) {
    openPage('/pages/auth/login');
    return;
  }
  reload();
});
</script>

<style lang="scss" scoped>
.history-page { min-height: 100vh; padding: 0 24rpx 48rpx; background: #f4f7fc; }
.page-actions { display: flex; align-items: center; justify-content: space-between; margin: 24rpx 0; color: #17233d; font-size: 30rpx; font-weight: 700; }
.page-actions button { margin: 0; padding: 0 24rpx; border-radius: 36rpx; background: #2468e8; color: #fff; font-size: 24rpx; line-height: 62rpx; }
.state { padding: 100rpx 20rpx; color: #8b95a7; font-size: 26rpx; text-align: center; }
.retry { display: block; margin-top: 20rpx; color: #2468e8; }
.session-card { display: flex; align-items: center; gap: 18rpx; margin-bottom: 18rpx; padding: 26rpx; border-radius: 20rpx; background: #fff; }
.session-main { flex: 1; min-width: 0; }
.session-title { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #17233d; font-size: 28rpx; font-weight: 700; }
.session-summary { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 12rpx; color: #667286; font-size: 24rpx; }
.session-meta { display: flex; gap: 20rpx; margin-top: 16rpx; color: #9aa5b5; font-size: 21rpx; }
.delete-btn { flex: none; margin: 0; padding: 0 18rpx; border-radius: 24rpx; background: #fff0ed; color: #ef543f; font-size: 23rpx; line-height: 58rpx; }
.load-more { padding: 30rpx; color: #2468e8; text-align: center; font-size: 25rpx; }
</style>
