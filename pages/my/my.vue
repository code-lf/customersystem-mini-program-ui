<template>
  <view class="crm-page my-page">
    <view class="my-safe-top" />

    <!-- 用户身份卡片 -->
    <view class="profile-card" @click="openPage('/pages/member/profile')">
      <view class="user-avatar-wrap">
        <image
          class="user-avatar"
          :src="userStore.userInfo.avatar || '/static/avatars/avatar-demo.png'"
          mode="aspectFill"
        />
        <view class="avatar-verified-dot">
          <up-icon name="checkmark" size="10" color="#fff" />
        </view>
      </view>
      <view class="profile-info">
        <view class="name-line">
          <text class="user-name">{{ userStore.userInfo.nickname || '张工' }}</text>
          <view class="vip-role-badge">
            <text>认证服务商</text>
          </view>
        </view>
        <view class="meta-row">
          <up-icon name="home" size="13" color="#7a8b9e" />
          <text class="company-name">{{ userStore.userInfo.company_name || '格宏暖通科技有限公司' }}</text>
        </view>
        <view class="meta-row">
          <up-icon name="phone" size="13" color="#9aa7b8" />
          <text class="user-mobile">{{ userStore.userInfo.mobile || '138 8888 8888' }}</text>
        </view>
      </view>
      <view class="profile-arrow">
        <up-icon name="arrow-right" size="18" color="#9bb0cc" />
      </view>
    </view>

    <!-- 资金与账户资产卡片 -->
    <view class="balance-card">
      <view class="balance-item" @click="openPage('/pages/member/balance')">
        <text class="b-label">账户可用余额 (元)</text>
        <view class="b-price-row">
          <text class="b-symbol">¥</text>
          <text class="b-val">{{ formatMoney(balance.money || 12850) }}</text>
        </view>
      </view>
      <view class="balance-divider" />
      <view class="balance-item" @click="openPage('/pages/member/balance')">
        <text class="b-label">待结算金额 (元)</text>
        <view class="b-price-row b-price-row--sub">
          <text class="b-symbol">¥</text>
          <text class="b-val">{{ formatMoney(balance.balance || 3600) }}</text>
        </view>
      </view>
      <button class="withdraw-btn" @click="openPage('/pages/member/balance')">提现</button>
    </view>

    <!-- 常用业务快捷入口 4 宫格 -->
    <view class="shortcut-card">
      <view
        v-for="item in shortcuts"
        :key="item.title"
        class="shortcut-item"
        @click="openPage(item.path)"
      >
        <view class="shortcut-icon-box" :style="{ background: item.bg }">
          <up-icon :name="item.icon" size="26" :color="item.color" />
        </view>
        <text class="shortcut-title">{{ item.title }}</text>
      </view>
    </view>

    <!-- 辅助功能列表 -->
    <view class="menu-card">
      <view
        v-for="(item, index) in menus"
        :key="item.title"
        class="menu-row"
        :class="{ 'border-none': index === menus.length - 1 }"
        @click="openPage(item.path)"
      >
        <view class="menu-icon-box" :style="{ background: item.bg }">
          <up-icon :name="item.icon" size="22" :color="item.color" />
        </view>
        <view class="menu-center">
          <text class="menu-title">{{ item.title }}</text>
          <text v-if="item.desc" class="menu-desc">{{ item.desc }}</text>
        </view>
        <view class="menu-right">
          <text v-if="item.badge" class="menu-badge">{{ item.badge }}</text>
          <up-icon name="arrow-right" size="18" color="#b0bac7" />
        </view>
      </view>
    </view>

    <view class="tabbar-space" />
  </view>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue';
import { useUserStore } from '@/store/user';
import { getBalance } from '@/api/member';
import { openPage } from '@/utils/pages';

const userStore = useUserStore();
const balance = reactive({ money: 12850, balance: 3600 });

const safeTop = computed(() => {
  try {
    const windowInfo = typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : {};
    const systemInfo = typeof uni.getSystemInfoSync === 'function' ? uni.getSystemInfoSync() : {};
    return windowInfo.statusBarHeight || systemInfo.statusBarHeight || 20;
  } catch (error) {
    return 20;
  }
});

const shortcuts = [
  { title: '我的报价单', icon: 'file-text-fill', color: '#2468e8', bg: '#edf4ff', path: '/pages/solution/index' },
  { title: '价格监控', icon: 'eye-fill', color: '#f59e0b', bg: '#fef7e7', path: '/pages/monitor/index' },
  { title: '我的收藏', icon: 'star-fill', color: '#ef543f', bg: '#fff0ed', path: '/pages/product/index' },
  { title: '调阅资料', icon: 'folder', color: '#10b981', bg: '#e6fcf5', path: '/pages/product/index' }
];

const menus = [
  { title: '官方公众号', desc: '获取最新产品选型手册与促销政策', icon: 'weixin-fill', color: '#07c160', bg: '#e8f8ee', path: '/pages/wechat/index' },
  { title: '消息通知', desc: '价格波动与系统升级提醒', icon: 'bell-fill', color: '#2468e8', bg: '#edf4ff', path: '/pages/message/index', badge: '3' },
  { title: '意见与反馈', desc: '产品选型与功能建议', icon: 'edit-pen', color: '#8b5cf6', bg: '#f3edff', path: '/pages/feedback/index' },
  { title: '账号与安全设置', desc: '修改企业信息与密码', icon: 'setting-fill', color: '#647389', bg: '#f0f3f8', path: '/pages/member/profile' }
];

const formatMoney = (value) => Number(value || 0).toLocaleString();

onMounted(async () => {
  try {
    const res = await getBalance();
    if (res && res.money !== undefined) {
      Object.assign(balance, res);
    }
  } catch (e) {
    // ignore
  }
});
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  padding: 0 24rpx;
  background: linear-gradient(180deg, #d2e4ff 0%, #e8f1fd 260rpx, #f4f7fc 500rpx, #f4f7fc 100%);
}

.my-safe-top {
  height: 48rpx;
  height: calc(env(safe-area-inset-top) + 24rpx);
}

/* 用户卡片 */
.profile-card {
  display: flex;
  align-items: center;
  padding: 32rpx 30rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(243, 248, 255, 0.92) 100%);
  box-shadow: 0 8rpx 28rpx rgba(23, 35, 61, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.user-avatar-wrap {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  margin-right: 22rpx;
  flex-shrink: 0;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #edf4ff;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 16rpx rgba(36, 104, 232, 0.12);
}

.avatar-verified-dot {
  position: absolute;
  right: 2rpx;
  bottom: 2rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #2468e8;
  border: 3rpx solid #fff;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.user-name {
  color: #15223a;
  font-size: 36rpx;
  font-weight: 900;
}

.vip-role-badge {
  display: flex;
  align-items: center;
  padding: 3rpx 14rpx;
  border-radius: 8rpx;
  background: linear-gradient(135deg, #2b70f6 0%, #1555d4 100%);
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  box-shadow: 0 2rpx 8rpx rgba(36, 104, 232, 0.25);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 6rpx;
}

.company-name {
  color: #556579;
  font-size: 24rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-mobile {
  color: #8896a8;
  font-size: 23rpx;
}

.profile-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-left: 10rpx;
}

/* 资金卡片 */
.balance-card {
  display: flex;
  align-items: center;
  margin-top: 22rpx;
  padding: 28rpx 30rpx;
  border-radius: 22rpx;
  background: #fff;
  box-shadow: 0 8rpx 28rpx rgba(23, 35, 61, 0.04);
  border: 1rpx solid #f0f4fb;
}

.balance-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.balance-divider {
  width: 2rpx;
  height: 68rpx;
  background: #edf2f8;
  margin: 0 24rpx;
}

.b-label {
  color: #8391a5;
  font-size: 23rpx;
}

.b-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 6rpx;
  color: #ef543f;
}

.b-price-row--sub {
  color: #17233d;
}

.b-symbol {
  font-size: 26rpx;
  font-weight: 700;
}

.b-val {
  font-size: 38rpx;
  font-weight: 900;
  margin-left: 4rpx;
}

.withdraw-btn {
  height: 64rpx;
  padding: 0 34rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #2b70f6 0%, #1555d4 100%);
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 64rpx;
  margin-left: 18rpx;
  box-shadow: 0 4rpx 16rpx rgba(36, 104, 232, 0.28);
}

.shortcut-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-top: 22rpx;
  padding: 28rpx 16rpx;
  border-radius: 22rpx;
  background: #fff;
  box-shadow: 0 8rpx 28rpx rgba(23, 35, 61, 0.04);
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shortcut-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border-radius: 26rpx;
  margin-bottom: 14rpx;
}

.shortcut-title {
  color: #17233d;
  font-size: 25rpx;
  font-weight: 700;
}

.menu-card {
  margin-top: 22rpx;
  border-radius: 22rpx;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 8rpx 28rpx rgba(23, 35, 61, 0.04);
}

.menu-row {
  display: flex;
  align-items: center;
  padding: 26rpx 28rpx;
  border-bottom: 1rpx solid #edf1f8;
}

.menu-row.border-none {
  border-bottom: none;
}

.menu-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 58rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.menu-center {
  flex: 1;
  min-width: 0;
}

.menu-title {
  display: block;
  color: #17233d;
  font-size: 29rpx;
  font-weight: 800;
}

.menu-desc {
  display: block;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 24rpx;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-badge {
  padding: 2rpx 14rpx;
  border-radius: 16rpx;
  background: #ef543f;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}

.tabbar-space {
  height: 160rpx;
}
</style>
