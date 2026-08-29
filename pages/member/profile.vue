<template>
  <view class="crm-page profile-page">
    <app-navbar title="个人资料" />

    <view v-if="!userStore.isLoggedIn" class="unlogin-box">
      <view class="unlogin-icon">
        <up-icon name="account" size="48" color="#9aa7b8" />
      </view>
      <text class="unlogin-tip">当前尚未登录，请先登录账号</text>
      <button class="unlogin-btn" @click="openPage('/pages/auth/login')">立即登录</button>
    </view>

    <view v-else class="profile-card">
      <view class="avatar-center">
        <image
          class="avatar-img"
          :src="userStore.userInfo.avatar || userStore.userInfo.headimg || '/static/avatars/avatar-demo.png'"
          mode="aspectFill"
        />
        <text class="avatar-name">{{ userStore.userInfo.nickname || userStore.userInfo.username || '格宏用户' }}</text>
        <text class="avatar-role">{{ userStore.userInfo.role_name || userStore.userInfo.member_level_name || '认证会员' }}</text>
      </view>

      <view class="info-list">
        <view class="info-row">
          <text class="label">会员编号</text>
          <text class="value">{{ userStore.userInfo.member_no || userStore.userInfo.member_id || '--' }}</text>
        </view>
        <view class="info-row">
          <text class="label">登录账号</text>
          <text class="value">{{ userStore.userInfo.username || '--' }}</text>
        </view>
        <view class="info-row">
          <text class="label">手机号码</text>
          <text class="value">{{ userStore.userInfo.mobile || '--' }}</text>
        </view>
        <view class="info-row">
          <text class="label">认证公司</text>
          <text class="value">{{ userStore.userInfo.company_name || '格宏电器科技有限公司' }}</text>
        </view>
        <view class="info-row">
          <text class="label">注册渠道</text>
          <text class="value">{{ userStore.userInfo.register_channel || '系统认证' }}</text>
        </view>
        <view class="info-row border-none">
          <text class="label">注册时间</text>
          <text class="value">{{ userStore.userInfo.create_time || '--' }}</text>
        </view>
      </view>

      <button class="logout-action-btn" @click="handleLogout">退出当前账号</button>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { useUserStore } from '@/store/user';
import { openPage, replacePage } from '@/utils/pages';

const userStore = useUserStore();

const refresh = async () => {
  if (userStore.isLoggedIn) {
    await userStore.fetchUserInfo().catch(() => {});
  }
};

onShow(() => {
  refresh();
});

onMounted(() => {
  refresh();
});

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    confirmText: '确定退出',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
        uni.showToast({ title: '已退出登录', icon: 'none' });
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' }).catch(() => {
            replacePage('/pages/index/index');
          });
        }, 400);
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f4f7fb;
  padding: 24rpx;
}

.unlogin-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  background: #fff;
  border-radius: 24rpx;
  margin-top: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.unlogin-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #edf2f8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.unlogin-tip {
  color: #64748b;
  font-size: 28rpx;
  margin-bottom: 36rpx;
}

.unlogin-btn {
  width: 280rpx;
  height: 76rpx;
  background: #2468e8;
  color: #fff;
  border-radius: 38rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 36rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  margin-top: 20rpx;
}

.avatar-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.avatar-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 70rpx;
  border: 4rpx solid #edf4ff;
  box-shadow: 0 4rpx 16rpx rgba(36, 104, 232, 0.15);
}

.avatar-name {
  color: #15223a;
  font-size: 34rpx;
  font-weight: 800;
  margin-top: 18rpx;
}

.avatar-role {
  margin-top: 8rpx;
  padding: 4rpx 18rpx;
  border-radius: 20rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
}

.info-list {
  margin-top: 10rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 26rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.info-row.border-none {
  border-bottom: none;
}

.info-row .label {
  color: #64748b;
  font-size: 26rpx;
}

.info-row .value {
  color: #15223a;
  font-size: 26rpx;
  font-weight: 600;
  max-width: 60%;
  text-align: right;
  word-break: break-all;
}

.logout-action-btn {
  margin-top: 40rpx;
  width: 100%;
  height: 84rpx;
  border-radius: 42rpx;
  background: #fff;
  border: 1rpx solid #e2e8f0;
  color: #ef4444;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
