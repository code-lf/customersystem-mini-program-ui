<template>
  <view class="crm-page my-page">
    <!-- 顶部状态栏与品牌标 -->
    <view class="brand-row" :style="{ paddingTop: safeTop + 'px' }">
      <view class="brand-left">
        <image src="/static/aircon/notice-cloud.png" mode="aspectFit" />
        <text>个人中心</text>
      </view>
      <view class="brand-setting-btn" @click="openPage('/pages/member/profile')">
        <up-icon name="setting" size="22" color="#586477" />
      </view>
    </view>

    <!-- 用户身份卡片 -->
    <view class="profile-card" @click="openPage('/pages/member/profile')">
      <image
        class="user-avatar"
        :src="userStore.userInfo.avatar || '/static/avatars/avatar-demo.png'"
        mode="aspectFill"
      />
      <view class="profile-info">
        <view class="name-line">
          <text class="user-name">{{ userStore.userInfo.nickname || '张工' }}</text>
          <text class="user-role-badge">认证服务商</text>
        </view>
        <text class="company-name">{{ userStore.userInfo.company_name || '格宏暖通科技有限公司' }}</text>
        <text class="user-mobile">{{ userStore.userInfo.mobile || '138 8888 8888' }}</text>
      </view>
      <up-icon name="arrow-right" size="18" color="#a0aec0" />
    </view>

    <!-- 资金与账户资产卡片 -->
    <view class="balance-card">
      <view class="balance-item" @click="openPage('/pages/member/balance')">
        <text class="b-label">账户可用余额</text>
        <view class="b-price-row">
          <text class="b-symbol">¥</text>
          <text class="b-val">{{ formatMoney(balance.money || 12850) }}</text>
        </view>
      </view>
      <view class="balance-divider" />
      <view class="balance-item" @click="openPage('/pages/member/balance')">
        <text class="b-label">待结算金额</text>
        <view class="b-price-row">
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
          <up-icon :name="item.icon" size="24" :color="item.color" />
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
        <view class="menu-icon-box">
          <up-icon :name="item.icon" size="22" :color="item.color || '#586477'" />
        </view>
        <view class="menu-center">
          <text class="menu-title">{{ item.title }}</text>
          <text v-if="item.desc" class="menu-desc">{{ item.desc }}</text>
        </view>
        <view class="menu-right">
          <text v-if="item.badge" class="menu-badge">{{ item.badge }}</text>
          <up-icon name="arrow-right" size="16" color="#b0bac7" />
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
  { title: '调阅资料', icon: 'folder-fill', color: '#10b981', bg: '#e6fcf5', path: '/pages/product/index' }
];

const menus = [
  { title: '官方公众号', desc: '获取最新产品选型手册与促销政策', icon: 'weixin-fill', color: '#07c160', path: '/pages/wechat/index' },
  { title: '消息通知', desc: '价格波动与系统升级提醒', icon: 'bell-fill', color: '#2468e8', path: '/pages/message/index', badge: '3' },
  { title: '意见与反馈', desc: '产品选型与功能建议', icon: 'edit-pen', color: '#8b5cf6', path: '/pages/feedback/index' },
  { title: '账号与安全设置', desc: '修改企业信息与密码', icon: 'setting-fill', color: '#647389', path: '/pages/member/profile' }
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
  background: #f4f7fc;
}

.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
}

.brand-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-left image {
  width: 44rpx;
  height: 44rpx;
}

.brand-left text {
  color: #17233d;
  font-size: 34rpx;
  font-weight: 900;
}

.brand-setting-btn {
  padding: 8rpx;
}

.profile-card {
  display: flex;
  align-items: center;
  padding: 28rpx;
  border-radius: 22rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.user-avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #edf4ff;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.user-name {
  color: #17233d;
  font-size: 34rpx;
  font-weight: 900;
}

.user-role-badge {
  padding: 2rpx 14rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 20rpx;
  font-weight: 700;
}

.company-name {
  display: block;
  margin-top: 6rpx;
  color: #586477;
  font-size: 24rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-mobile {
  display: block;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.balance-card {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  padding: 24rpx 28rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.balance-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.balance-divider {
  width: 1rpx;
  height: 60rpx;
  background: #eef2f8;
  margin: 0 20rpx;
}

.b-label {
  color: #8b95a7;
  font-size: 22rpx;
}

.b-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 4rpx;
  color: #ef543f;
}

.b-symbol {
  font-size: 24rpx;
  font-weight: 700;
}

.b-val {
  font-size: 36rpx;
  font-weight: 900;
  margin-left: 2rpx;
}

.withdraw-btn {
  height: 60rpx;
  padding: 0 28rpx;
  border-radius: 30rpx;
  background: #2468e8;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 60rpx;
  margin-left: 16rpx;
}

.shortcut-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-top: 20rpx;
  padding: 24rpx 16rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
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
  width: 78rpx;
  height: 78rpx;
  border-radius: 22rpx;
  margin-bottom: 12rpx;
}

.shortcut-title {
  color: #17233d;
  font-size: 24rpx;
  font-weight: 700;
}

.menu-card {
  margin-top: 20rpx;
  border-radius: 20rpx;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.menu-row {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #edf1f8;
}

.menu-row.border-none {
  border-bottom: none;
}

.menu-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-right: 18rpx;
  flex-shrink: 0;
}

.menu-center {
  flex: 1;
  min-width: 0;
}

.menu-title {
  display: block;
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
}

.menu-desc {
  display: block;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.menu-badge {
  padding: 2rpx 12rpx;
  border-radius: 16rpx;
  background: #ef543f;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
}

.tabbar-space {
  height: 160rpx;
}
</style>
