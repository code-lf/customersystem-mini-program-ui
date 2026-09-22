<template>
  <view class="crm-page home-page">
    <AppWatermark />
    <view class="home-safe" :style="{ height: (metrics.statusBarHeight + 6) + 'px' }" />

    <!-- 顶部高质感品牌与状态栏 -->
    <view
      class="home-header"
      :style="{
        minHeight: metrics.navBarHeight + 'px',
        paddingRight: (metrics.capsuleOccupiedWidth ? (metrics.capsuleOccupiedWidth + 8) + 'px' : '0')
      }"
    >
      <view class="brand">
        <view class="brand__icon-wrap">
          <image class="brand__logo" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%232468e8' /%3E%3Cstop offset='100%25' stop-color='%2306b6d4' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M85,60 H60 V75 H70 C66,85 58,90 50,90 C35,90 25,78 25,60 C25,42 35,30 50,30 C58,30 65,34 69,40 L82,30 C74,18 64,12 50,12 C24,12 8,30 8,60 C8,90 24,108 50,108 C75,108 85,90 85,75 Z' fill='url(%23grad1)' /%3E%3Ccircle cx='85' cy='45' r='10' fill='%2310b981' /%3E%3C/svg%3E" mode="aspectFit" />
        </view>
        <view class="brand__text-box">
          <text class="brand__name">格宏电器</text>
          <text class="brand__sub">智能选型与报价平台</text>
        </view>
      </view>
      <view class="home-header__status" @click="openPage('/pages/ai/index')">
        <view class="status-dot" />
        <text>AI 在线</text>
      </view>
    </view>

    
      <template v-if="isLoading">
        <view class="skeleton-block" style="width: 100%; height: 240rpx; border-radius: 24rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 180rpx; border-radius: 20rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 140rpx; border-radius: 20rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 220rpx; border-radius: 20rpx;"></view>
      </template>
      <template v-else>
  
    <!-- 问候与专属顾问卡片 -->
    <view class="greeting-card">
      <view class="greeting-card__top" @click="handleGreetingClick">
        <view class="greeting-user">
          <view class="greeting-name-row">
            <text class="greeting-name">{{ userStore.isLoggedIn ? `${greetingPeriod}好，${currentDisplayName}` : `${greetingPeriod}好，请登录` }}</text>
            <text class="greeting-badge" :class="{ 'greeting-badge--unlogin': !userStore.isLoggedIn }">{{ currentDisplayRole }}</text>
          </view>
          <view class="greeting-company-row">
            <up-icon :name="userStore.isLoggedIn ? 'home' : 'lock'" size="14" color="rgba(255,255,255,0.8)" />
            <text class="greeting-company">{{ currentDisplayCompany }}</text>
          </view>
        </view>
        <view class="greeting-avatar-box">
          <image
            v-if="userStore.isLoggedIn && (userStore.userInfo.avatar || userStore.userInfo.headimg)"
            class="greeting-avatar"
            :src="userStore.userInfo.avatar || userStore.userInfo.headimg"
            mode="aspectFill"
          />
          <view v-else class="greeting-avatar-placeholder">
            <up-icon name="account" size="24" color="#ffffff" />
          </view>
        </view>
      </view>

      <!-- 搜索栏嵌于问候区下方 -->
      <view class="search-row">
        <up-icon name="search" size="20" color="#9aa5b5" />
        <input
          v-model="keyword"
          class="search-row__input"
          confirm-type="search"
          placeholder="搜索产品型号、报价单、资料手册"
          placeholder-class="search-placeholder"
          @confirm="handleSearch"
        />
        <button class="search-row__btn" @click="handleSearch">搜索</button>
      </view>
    </view>

    <!-- 顶置报价单综合卡片（放高置顶于搜索栏正下方） -->
    <view class="hero-quote-card">
      <view class="hero-quote-card__top" @click="handleActiveQuoteClick">
        <view class="hero-quote-card__badge-row">
          <view class="hero-quote-badge">
            <view class="hero-quote-badge__dot" />
            <text class="hero-quote-badge__text">{{ activeQuoteDisplay.statusText }}</text>
          </view>
          <up-icon name="arrow-right" size="14" color="#94a3b8" />
        </view>

        <view class="hero-quote-card__price-row">
          <text class="hero-quote-symbol">¥</text>
          <text class="hero-quote-price">{{ formatMoney(activeQuoteDisplay.price) }}</text>
        </view>

        <view class="hero-quote-card__desc">
          <text>{{ activeQuoteDisplay.desc }}</text>
        </view>
      </view>

      <view class="hero-quote-card__divider" />

      <view class="hero-quote-card__bottom" @click="handleHistoryQuoteClick">
        <text class="hero-quote-card__history-label">历史报价单</text>
        <view class="hero-quote-card__history-right">
          <text class="hero-quote-card__history-count">{{ solutions.length ? `${solutions.length} 笔` : '暂无' }}</text>
          <up-icon name="arrow-right" size="13" color="#94a3b8" />
        </view>
      </view>
    </view>

    <!-- 快捷工作台 -->
    <view class="section-head section-head--compact">
      <text>快捷工作台</text>
    </view>
    <view class="tool-grid">
      <view v-for="item in quickTools" :key="item.title" class="tool-item" @click="openPage(item.path)">
        <view class="tool-item__icon" :style="{ backgroundColor: item.bg }">
          <up-icon :name="item.icon" size="24" :color="item.color" />
        </view>
        <text>{{ item.title }}</text>
      </view>
    </view>

    <view class="section-head latest-head">
      <text>最新公告</text>
      <text class="section-more" @click="openPage('/pages/notice/index')">更多 ›</text>
    </view>
    <view v-if="notices.length === 0" class="empty-notice-tip">
      <text>暂无最新公告</text>
    </view>
    <view v-for="notice in notices.slice(0, 3)" :key="notice.id" class="notice-mini" @click="openPage('/pages/notice/detail', { id: notice.id })">
      <text class="notice-mini__tag" v-if="notice.type">{{ notice.type }}</text>
      <text class="notice-mini__title">{{ notice.title }}</text>
      <text class="notice-mini__date">{{ notice.time }}</text>
    </view>

    </template>
    <view class="tabbar-space" />
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { getNotices } from '@/api/content';
import { getSolutionList, getCart } from '@/api/solution';
import { openPage } from '@/utils/pages';
import { getNavMetrics } from '@/utils/system';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';
import AppWatermark from '@/components/app-watermark.vue';

const metrics = computed(() => getNavMetrics());
// 首页路由：/pages/index/index；生命周期直接注册在页面顶层，编译器才能启用分享菜单。
const SHARE_TITLE = '格宏助手｜智能选型与报价平台';
onShareAppMessage(() => createShareAppMessageOptions(SHARE_TITLE));
onShareTimeline(() => createShareTimelineOptions(SHARE_TITLE));
const isLoading = ref(true);
const userStore = useUserStore();

const quoteStatusText = (status) => ({
  draft: '草稿',
  sent: '已发送',
  accepted: '已确认',
  rejected: '已拒绝',
  void: '已作废'
}[status] || '草稿');
const keyword = ref('');
const notices = ref([]);
const solutions = ref([]);
const cartInfo = ref({
  count: 0,
  amount: 0,
  hasItems: false
});

const loadCartSummary = async () => {
  // 1. 本地缓存快速渲染，避免闪烁
  try {
    const localCart = uni.getStorageSync('solution_local_cart');
    if (localCart && Array.isArray(localCart.items) && localCart.items.length) {
      cartInfo.value = {
        count: Number(localCart.total_quantity || localCart.items.length || 0),
        amount: Number(localCart.pay_amount || localCart.goods_amount || 0),
        hasItems: true
      };
    }
  } catch (e) {}

  // 2. 登录时向后端核实真实购物车数据
  if (userStore.isLoggedIn) {
    try {
      const res = await getCart({ showError: false });
      const serverCart = res?.data || res;
      if (serverCart && Array.isArray(serverCart.items)) {
        const count = Number(serverCart.total_quantity || serverCart.items.length || 0);
        const amount = Number(serverCart.pay_amount || serverCart.goods_amount || 0);
        cartInfo.value = {
          count,
          amount,
          hasItems: count > 0
        };
      } else if (serverCart && Array.isArray(serverCart.items) && serverCart.items.length === 0) {
        cartInfo.value = { count: 0, amount: 0, hasItems: false };
      }
    } catch (e) {}
  }
};

const activeQuoteDisplay = computed(() => {
  // 1. 如果当前报价篮暂存有商品，优先展示进行中的暂存清单
  if (cartInfo.value.hasItems) {
    return {
      price: cartInfo.value.amount,
      count: cartInfo.value.count,
      statusText: '进行中',
      desc: `${cartInfo.value.count} 件商品 · 面价合计`,
      actionPath: '/pages/solution/index'
    };
  }
  // 2. 否则若有报价单方案，展示最新一笔方案
  if (solutions.value.length > 0) {
    const latest = solutions.value[0];
    const count = latest.items ? latest.items.length : 1;
    return {
      price: latest.totalPrice || 0,
      count,
      statusText: quoteStatusText(latest.status) || '进行中',
      desc: `${count} 件商品 · 面价合计`,
      actionPath: '/pages/solution/share',
      actionQuery: { id: latest.id }
    };
  }
  // 3. 暂无设备/报价
  return {
    price: 0,
    count: 0,
    statusText: '进行中',
    desc: '0 件商品 · 面价合计',
    actionPath: '/pages/solution/index'
  };
});

const handleActiveQuoteClick = () => {
  const active = activeQuoteDisplay.value;
  if (active.actionQuery) {
    openPage(active.actionPath, active.actionQuery);
  } else {
    openPage(active.actionPath);
  }
};

const handleHistoryQuoteClick = () => {
  openPage('/pages/solution/index');
};

const greetingPeriod = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨';
  if (hour < 9) return '早上';
  if (hour < 12) return '上午';
  if (hour < 14) return '中午';
  if (hour < 18) return '下午';
  return '晚上';
});

const currentDisplayName = computed(() => {
  if (!userStore.isLoggedIn) return '请登录';
  return userStore.userInfo.nickname || userStore.userInfo.username || '格宏用户';
});

const currentDisplayRole = computed(() => {
  if (!userStore.isLoggedIn) return '点击登录';
  return userStore.userInfo.member_level_name || userStore.userInfo.role_name || '认证服务商';
});

const currentDisplayCompany = computed(() => {
  if (!userStore.isLoggedIn) return '登录后查看专属经销商政策与报价';
  return userStore.userInfo.company_name || '格宏电器科技有限公司';
});

const handleGreetingClick = () => {
  if (!userStore.isLoggedIn) {
    openPage('/pages/auth/login');
  } else {
    openPage('/pages/my/my');
  }
};

const quickTools = [
  { title: '产品选型', icon: 'grid-fill', color: '#2563eb', bg: '#eff6ff', path: '/pages/product/category' },
  { title: '我的报价', icon: 'file-text-fill', color: '#6366f1', bg: '#eef2ff', path: '/pages/solution/index' },
  { title: '价格监控', icon: 'order', color: '#f59e0b', bg: '#fef3c7', path: '/pages/monitor/index' },
  { title: 'AI 顾问', icon: 'kefu-ermai', color: '#0ea5e9', bg: '#e0f2fe', path: '/pages/ai/index' },
  { title: '品牌资讯', icon: 'volume-fill', color: '#ec4899', bg: '#fce7f3', path: '/pages/notice/index' }
];

const formatMoney = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const handleSearch = () => {
  const text = keyword.value.trim();
  if (!text) return;
  openPage('/pages/product/list', { keyword: text });
};

const syncData = async () => {
  if (userStore.token) {
    userStore.fetchUserInfo().catch(() => {});
  }
  loadCartSummary().catch(() => {});
};

onShow(() => {
  // 兼容微信开发者工具缓存过旧的页面分享配置。
  showMiniProgramShareMenu();
  syncData();
});

onMounted(async () => {
  isLoading.value = true;
  syncData();
  try {
    const [noticeResult, solutionResult] = await Promise.allSettled([
      getNotices({ limit: 10 }),
      getSolutionList({ limit: 10 })
    ]);
    
    if (noticeResult.status === 'fulfilled' && noticeResult.value) {
      const resVal = noticeResult.value;
      const rawList = Array.isArray(resVal)
        ? resVal
        : (Array.isArray(resVal.data) ? resVal.data : (resVal.data?.data || []));
      
      notices.value = rawList.map(n => ({
        id: n.article_id || n.id,
        title: n.article_title || n.title,
        type: n.category_name || n.type || '通知',
        time: n.publish_time_text || n.time || '',
        image: n.cover_image || ''
      }));
    }
    
    if (solutionResult.status === 'fulfilled' && solutionResult.value) {
      const resVal = solutionResult.value;
      const rawSolutions = Array.isArray(resVal)
        ? resVal
        : (Array.isArray(resVal.data) ? resVal.data : (resVal.data?.data || []));
      
      solutions.value = rawSolutions.map(item => {
        const quoteNo = item.quote_no || '';
        // 优先展示有业务意义的项目标题或备注；若只有单纯单号，格式化为带业务前缀的标题
        const displayTitle = item.title && !item.title.startsWith('BJ')
          ? item.title
          : (item.remark || (quoteNo ? `空调方案报价 (${quoteNo.slice(-6)})` : '暖通空调报价方案'));

        return {
          id: item.quote_id || item.id,
          quoteNo,
          title: item.title || quoteNo || '暖通空调方案',
          displayTitle,
          items: item.items || Array(item.item_count || 1).fill({}),
          totalPrice: item.pay_amount || item.total_price || 0,
          status: item.quote_status || 'draft',
          customerName: item.contact_name_snapshot || '',
          date: item.create_time_text || ''
        };
      });
    }
  } catch(e) {
    console.warn('Load home error:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding: 0 24rpx;
  background: linear-gradient(180deg, #d2e4ff 0%, #e8f1fd 280rpx, #f4f7fc 500rpx, #f4f7fc 100%);
}

.home-safe {
  width: 100%;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-width: 0;
  flex-shrink: 1;
}

.brand__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.12);
  flex-shrink: 0;
}

.brand__logo {
  width: 40rpx;
  height: 40rpx;
}

.brand__text-box {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand__name {
  color: #132238;
  font-size: 32rpx;
  font-weight: 900;
  line-height: 38rpx;
  letter-spacing: 0.5rpx;
  white-space: nowrap;
}

.brand__sub {
  color: #78879b;
  font-size: 20rpx;
  line-height: 24rpx;
  margin-top: 2rpx;
  white-space: nowrap;
}

.home-header__status {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2rpx 12rpx rgba(23, 35, 61, 0.08);
  flex-shrink: 0;
  white-space: nowrap;
}

.home-header__status text {
  color: #10b981;
  font-size: 22rpx;
  font-weight: 700;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8rpx #10b981;
}

/* 问候与搜索整合卡片 */
.greeting-card {
  position: relative;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 24rpx;
  padding: 36rpx 36rpx 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(59, 130, 246, 0.2);
  overflow: hidden;
}
.greeting-card::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
}

.greeting-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.greeting-user {
  flex: 1;
  min-width: 0;
}

.greeting-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.greeting-name { font-size: 34rpx; font-weight: 700; color: #ffffff; margin-right: 12rpx; }

.greeting-badge { font-size: 20rpx; color: #1e3a8a; background: #e0f2fe; padding: 2rpx 12rpx; border-radius: 20rpx; }

.greeting-badge--unlogin { color: #ffffff; background: rgba(255,255,255,0.2); }

.greeting-company-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 6rpx;
}

.greeting-company { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-left: 8rpx; }

.greeting-avatar-box {
  flex-shrink: 0;
  margin-left: 16rpx;
}

.greeting-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 3rpx solid #fff;
  box-shadow: 0 4rpx 14rpx rgba(23, 35, 61, 0.08);
  display: block;
}

.greeting-avatar-placeholder {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 3rpx solid rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(8px);
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-row {
  display: flex;
  align-items: center;
  margin-top: 32rpx;
  height: 80rpx;
  background: rgba(255,255,255,0.9);
  border-radius: 40rpx;
  padding: 0 10rpx 0 28rpx;
}

.search-row__input {
  flex: 1;
  height: 76rpx;
  margin-left: 14rpx;
  color: #17233d;
  font-size: 26rpx;
}

.search-placeholder {
  color: #9aa5b5;
}

.search-row__btn {
  width: 108rpx;
  height: 56rpx;
  margin: 0;
  padding: 0;
  border-radius: 28rpx;
  background: #2468e8;
  color: #fff;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 56rpx;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.3);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 32rpx 0 18rpx;
}

.section-head--compact {
  margin-top: 10rpx;
}

.section-head--blue text:first-child {
  color: #2468e8;
}

.section-head text:first-child {
  display: inline-flex;
  align-items: center;
  color: #17233d;
  font-size: 30rpx;
  font-weight: 800;
}

.section-head text:first-child::before {
  content: '';
  display: inline-block;
  width: 6rpx;
  height: 26rpx;
  background: #2468e8;
  border-radius: 4rpx;
  margin-right: 12rpx;
}

.section-more {
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 600;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  padding: 26rpx 12rpx 22rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #4f5f78;
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
}

.tool-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  margin-bottom: 12rpx;
  border-radius: 22rpx;
  box-shadow: 0 2rpx 10rpx rgba(23, 35, 61, 0.04);
}

.notice-strip {
  display: flex;
  align-items: center;
  height: 80rpx;
  margin-top: 20rpx;
  padding: 0 22rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.03);
  border: 1rpx solid #edf2f9;
}

.notice-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 14rpx;
  padding: 6rpx 14rpx;
  border-radius: 10rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.notice-title {
  flex: 1;
  overflow: hidden;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 80rpx;
}

.notice-date {
  margin-left: 14rpx;
  color: #8b95a7;
  font-size: 22rpx;
  flex-shrink: 0;
  line-height: 80rpx;
}

/* 顶置报价单综合卡片（放高置顶） */
.hero-quote-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx 32rpx 26rpx;
  margin-bottom: 28rpx;
  box-shadow: 0 8rpx 28rpx rgba(23, 35, 61, 0.05);
  border: 1rpx solid rgba(226, 232, 240, 0.8);
  position: relative;
  transition: transform 0.12s ease;
}

.hero-quote-card:active {
  transform: scale(0.995);
}

.hero-quote-card__top {
  display: flex;
  flex-direction: column;
}

.hero-quote-card__badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-quote-badge {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
}

.hero-quote-badge__dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #2468e8;
  box-shadow: 0 0 8rpx rgba(36, 104, 232, 0.5);
}

.hero-quote-badge__text {
  color: #2468e8;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 32rpx;
}

.hero-quote-card__price-row {
  display: flex;
  align-items: baseline;
  margin-top: 14rpx;
}

.hero-quote-symbol {
  font-size: 32rpx;
  font-weight: 700;
  color: #17233d;
  margin-right: 8rpx;
}

.hero-quote-price {
  font-size: 54rpx;
  font-weight: 800;
  color: #17233d;
  line-height: 1.1;
  letter-spacing: -0.5rpx;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.hero-quote-card__desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8b95a7;
  font-weight: 500;
}

.hero-quote-card__divider {
  height: 1rpx;
  background: #f1f5f9;
  margin: 26rpx 0 22rpx;
}

.hero-quote-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-quote-card__history-label {
  font-size: 26rpx;
  color: #334155;
  font-weight: 600;
}

.hero-quote-card__history-right {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.hero-quote-card__history-count {
  font-size: 24rpx;
  color: #94a3b8;
}

.notice-mini {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-bottom: 14rpx;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.03);
}

.notice-mini__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 14rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 21rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.notice-mini__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #17233d;
  font-size: 25rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-mini__date {
  margin-left: 16rpx;
  color: #94a3b8;
  font-size: 22rpx;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.tabbar-space {
  height: 140rpx;
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
