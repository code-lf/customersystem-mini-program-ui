<template>
  <view class="crm-page my-page">
    <view class="my-safe-top" :style="{ height: (metrics.statusBarHeight + metrics.navBarHeight + 6) + 'px' }" />

    
      <template v-if="isLoading">
        <view class="skeleton-block" style="width: 100%; height: 200rpx; border-radius: 32rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 160rpx; border-radius: 24rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 380rpx; border-radius: 24rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 380rpx; border-radius: 24rpx; margin-bottom: 40rpx;"></view>
      </template>
      <template v-else>
  
    <!-- 用户身份卡片 -->
    <view class="profile-card">
      <view class="user-avatar-wrap" @click.stop="handleAvatarOrEditClick">
        <image
          v-if="userStore.isLoggedIn && (userStore.userInfo.avatar || userStore.userInfo.headimg)"
          class="user-avatar"
          :src="userStore.userInfo.avatar || userStore.userInfo.headimg"
          mode="aspectFill"
        />
        <view v-else class="avatar-placeholder">
          <up-icon name="account" size="32" color="#8c9cb0" />
        </view>
        <view v-if="userStore.isLoggedIn" class="avatar-camera-badge">
          <up-icon name="camera-fill" size="11" color="#fff" />
        </view>
        <view v-else class="avatar-verified-dot avatar-dot--unverified">
          <up-icon name="lock" size="10" color="#fff" />
        </view>
      </view>

      <view class="profile-info" @click="handleProfileClick">
        <view class="name-line">
          <text class="user-name">{{ userStore.isLoggedIn ? (userStore.userInfo.nickname || userStore.userInfo.username || '格宏用户') : '点击登录/注册' }}</text>
          <view class="vip-role-badge" :class="{ 'role-badge--unlogin': !userStore.isLoggedIn }">
            <text>{{ userStore.isLoggedIn ? (userStore.userInfo.role_name || userStore.userInfo.member_level_name || '认证会员') : '未登录' }}</text>
          </view>
        </view>
        <view class="meta-row">
          <up-icon :name="userStore.isLoggedIn ? 'home' : 'lock'" size="13" color="#7a8b9e" />
          <text class="company-name">{{ userStore.isLoggedIn ? (userStore.userInfo.company_name || '格宏电器科技有限公司') : '登录后查看专属经销商政策与报价' }}</text>
        </view>
        <view class="meta-row">
          <up-icon :name="userStore.isLoggedIn ? 'phone' : 'info-circle'" size="13" color="#9aa7b8" />
          <text class="user-mobile">{{ userStore.isLoggedIn ? (userStore.userInfo.mobile || userStore.userInfo.username || '已认证账号') : '账号密码 / 手机号一键登录' }}</text>
        </view>
      </view>

      <!-- 修改设置 / 个人资料设置 齿轮图标按钮 -->
      <view v-if="userStore.isLoggedIn" class="profile-setting-btn" @click.stop="openEditProfileModal">
        <up-icon name="setting" size="20" color="#627792" />
      </view>
      <view v-else class="profile-arrow" @click="handleProfileClick">
        <up-icon name="arrow-right" size="18" color="#9bb0cc" />
      </view>
    </view>

    <!-- 资金与账户资产卡片 -->
    <view class="balance-card">
      <view class="balance-item" @click="handleBalanceClick">
        <text class="b-label">账户可用余额 (元)</text>
        <view class="b-price-row">
          <text class="b-symbol">¥</text>
          <text class="b-val">{{ userStore.isLoggedIn ? formatMoney(displayBalance) : '--' }}</text>
        </view>
      </view>
      <view class="balance-divider" />
      <view class="balance-item" @click="handleBalanceClick">
        <text class="b-label">账户收益 / 零钱 (元)</text>
        <view class="b-price-row b-price-row--sub">
          <text class="b-symbol">¥</text>
          <text class="b-val">{{ userStore.isLoggedIn ? formatMoney(displayMoney) : '--' }}</text>
        </view>
      </view>
      <button class="withdraw-btn" @click="handleWithdrawClick">{{ userStore.isLoggedIn ? '提现' : '去登录' }}</button>
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

    <!-- 登录/退出操作按钮 -->
    <view class="auth-action-box">
      <button v-if="userStore.isLoggedIn" class="logout-btn" @click="handleLogout">
        <up-icon name="reload" size="16" color="#8b95a7" />
        <text>切换 / 重新登录账号</text>
      </button>
      <button v-else class="login-action-btn" @click="openPage('/pages/auth/login')">
        <up-icon name="weixin-fill" size="18" color="#ffffff" />
        <text>微信 / 手机号一键登录与注册</text>
      </button>
    </view>

    <!-- 修改用户资料 / 设置 底部抽屉弹窗 -->
    <up-popup
      :show="showEditProfileModal"
      mode="bottom"
      round="28"
      :closeable="false"
      @close="showEditProfileModal = false"
    >
      <view class="edit-profile-panel">
        <view class="edit-panel-header">
          <view class="edit-header-left">
            <text class="edit-panel-title">修改个人资料</text>
            <text class="edit-panel-subtitle">定制您在报价单与系统中的展示信息</text>
          </view>
          <view class="edit-close-btn" @click="showEditProfileModal = false">
            <up-icon name="close" size="18" color="#647389" />
          </view>
        </view>

        <scroll-view scroll-y class="edit-panel-scroll">
          <view class="edit-panel-body">
            <!-- 头像选择与上传 -->
            <view class="avatar-edit-section">
              <view class="avatar-preview-box" @click="chooseAvatarImage">
                <view class="avatar-preview-wrap">
                  <image
                    class="avatar-preview-img"
                    :src="editForm.avatar || '/static/avatars/avatar-demo.png'"
                    mode="aspectFill"
                  />
                </view>
                <view class="avatar-change-badge">
                  <up-icon name="camera-fill" size="12" color="#ffffff" />
                </view>
              </view>
              <text class="avatar-tip-text">点击头像或通过下方方式更换</text>

              <view class="avatar-action-btns">
                <!-- #ifdef MP-WEIXIN -->
                <button class="btn-avatar-source wx" open-type="chooseAvatar" @chooseavatar="onChooseWxAvatar">
                  <up-icon name="weixin-fill" size="14" color="#07c160" />
                  <text>微信头像</text>
                </button>
                <!-- #endif -->
                <button class="btn-avatar-source" @click="chooseAvatarImage">
                  <up-icon name="photo" size="14" color="#2468e8" />
                  <text>相册 / 拍照</text>
                </button>
              </view>

              <!-- 精选头像预设：支持国风/中国风、动漫二次元、商务暖通分类 -->
              <view class="preset-avatars-wrap">
                <view class="preset-header-row">
                  <text class="preset-label">精选头像风格：</text>
                  <view class="preset-category-tabs">
                    <view
                      v-for="cat in avatarCategories"
                      :key="cat.key"
                      class="cat-tab-item"
                      :class="{ active: currentAvatarCat === cat.key }"
                      @click="currentAvatarCat = cat.key"
                    >
                      <text>{{ cat.name }}</text>
                    </view>
                  </view>
                </view>

                <view class="preset-list">
                  <view
                    v-for="item in currentPresetList"
                    :key="item.id"
                    class="preset-item-wrap"
                    :class="{ active: editForm.avatar === item.url }"
                    @click="editForm.avatar = item.url"
                  >
                    <image class="preset-item-img" :src="item.url" mode="aspectFill" />
                    <view v-if="editForm.avatar === item.url" class="preset-check">
                      <up-icon name="checkmark" size="9" color="#fff" />
                    </view>
                    <text class="preset-item-name">{{ item.name.split('·')[1] || item.name }}</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 资料输入项 -->
            <view class="edit-form-group">
              <view class="form-item">
                <view class="form-item-label-row">
                  <text class="form-label">用户姓名 / 昵称</text>
                  <text class="form-required">*</text>
                </view>
                <view class="form-input-wrap">
                  <input
                    v-model="editForm.nickname"
                    type="nickname"
                    class="form-input"
                    placeholder="请输入您的姓名或昵称"
                    maxlength="20"
                  />
                  <view v-if="editForm.nickname" class="clear-btn" @click="editForm.nickname = ''">
                    <up-icon name="close-circle-fill" size="16" color="#cbd5e1" />
                  </view>
                </view>
              </view>

              <view class="form-item">
                <view class="form-item-label-row">
                  <text class="form-label">认证企业 / 经销商名称</text>
                </view>
                <view class="form-input-wrap">
                  <input
                    v-model="editForm.company_name"
                    class="form-input"
                    placeholder="请输入所属暖通公司或门店名称"
                    maxlength="30"
                  />
                  <view v-if="editForm.company_name" class="clear-btn" @click="editForm.company_name = ''">
                    <up-icon name="close-circle-fill" size="16" color="#cbd5e1" />
                  </view>
                </view>
              </view>

              <view class="form-item">
                <view class="form-item-label-row">
                  <text class="form-label">服务职位 / 身份</text>
                </view>
                <view class="form-input-wrap">
                  <input
                    v-model="editForm.position"
                    class="form-input"
                    placeholder="如：暖通工程师、销售总监、专属顾问"
                    maxlength="20"
                  />
                  <view v-if="editForm.position" class="clear-btn" @click="editForm.position = ''">
                    <up-icon name="close-circle-fill" size="16" color="#cbd5e1" />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 底部提交操作 -->
        <view class="edit-panel-footer">
          <button class="btn-cancel" @click="showEditProfileModal = false">取消</button>
          <button class="btn-save-profile" :disabled="isSaving" :loading="isSaving" @click="handleSaveProfile">
            保存个人信息
          </button>
        </view>
      </view>
    </up-popup>

    </template>
    <view class="tabbar-space" />
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { getBalance, updateMemberInfo } from '@/api/member';
import { uploadFile } from '@/api/common';
import { openPage, replacePage } from '@/utils/pages';
import { AVATAR_CATEGORIES, PRESET_AVATAR_GROUPS } from '@/utils/avatar-presets';
import { getNavMetrics } from '@/utils/system';

const metrics = computed(() => getNavMetrics());
const isLoading = ref(true);
const isSaving = ref(false);
const userStore = useUserStore();
const balance = reactive({ money: 0, balance: 0 });

const showEditProfileModal = ref(false);
const currentAvatarCat = ref('guofeng');
const avatarCategories = AVATAR_CATEGORIES;

const currentPresetList = computed(() => {
  return PRESET_AVATAR_GROUPS[currentAvatarCat.value] || PRESET_AVATAR_GROUPS.guofeng || [];
});

const editForm = reactive({
  nickname: '',
  avatar: '',
  company_name: '',
  position: ''
});

const handleAvatarOrEditClick = () => {
  if (!userStore.isLoggedIn) {
    openPage('/pages/auth/login');
  } else {
    openEditProfileModal();
  }
};

const openEditProfileModal = () => {
  if (!userStore.isLoggedIn) {
    openPage('/pages/auth/login');
    return;
  }
  const u = userStore.userInfo || {};
  editForm.nickname = u.nickname || u.username || '张工';
  editForm.avatar = u.avatar || u.headimg || '/static/avatars/avatar-demo.png';
  editForm.company_name = u.company_name || '格宏电器科技有限公司';
  editForm.position = u.position || '销售工程师';
  showEditProfileModal.value = true;
};

// 微信小程序 chooseAvatar 快速获取
const onChooseWxAvatar = (e) => {
  const avatarUrl = e?.detail?.avatarUrl;
  if (avatarUrl) {
    editForm.avatar = avatarUrl;
    uni.showToast({ title: '已选择微信头像', icon: 'none' });
  }
};

// 从手机相册或拍照选择
const chooseAvatarImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      if (!tempFilePath) return;

      editForm.avatar = tempFilePath;
      uni.showLoading({ title: '正在上传头像...' });
      try {
        const uploadRes = await uploadFile(tempFilePath).catch(() => null);
        if (uploadRes && (uploadRes.url || uploadRes.file_path)) {
          editForm.avatar = uploadRes.url || uploadRes.file_path;
        }
        uni.showToast({ title: '头像已就绪', icon: 'success' });
      } catch (err) {
        // 本地预览仍保留
        uni.showToast({ title: '已选择图片', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    }
  });
};

// 保存修改
const handleSaveProfile = async () => {
  const nickname = editForm.nickname.trim();
  if (!nickname) {
    uni.showToast({ title: '请输入姓名或昵称', icon: 'none' });
    return;
  }

  isSaving.value = true;
  uni.showLoading({ title: '正在保存资料...' });
  try {
    const payload = {
      nickname: nickname,
      headimg: editForm.avatar,
      avatar: editForm.avatar,
      company_name: editForm.company_name.trim() || '格宏电器科技有限公司',
      position: editForm.position.trim() || '销售工程师'
    };

    await updateMemberInfo(payload).catch((err) => {
      console.warn('updateMemberInfo API warn:', err);
    });

    // 同步更新 Pinia Store 与 Storage
    const updated = {
      ...userStore.userInfo,
      ...payload
    };
    userStore.setUserInfo(updated);

    uni.showToast({ title: '个人资料已更新', icon: 'success' });
    showEditProfileModal.value = false;
  } catch (error) {
    uni.showToast({ title: error?.message || '保存失败，请重试', icon: 'none' });
  } finally {
    isSaving.value = false;
    uni.hideLoading();
  }
};

const displayBalance = computed(() => {
  if (!userStore.isLoggedIn) return '--';
  if (userStore.userInfo && userStore.userInfo.balance !== undefined && userStore.userInfo.balance !== null) {
    return userStore.userInfo.balance;
  }
  return balance.balance ?? 0;
});

const displayMoney = computed(() => {
  if (!userStore.isLoggedIn) return '--';
  if (userStore.userInfo && (userStore.userInfo.money !== undefined || userStore.userInfo.commission !== undefined)) {
    return userStore.userInfo.money ?? userStore.userInfo.commission ?? 0;
  }
  return balance.money ?? 0;
});

const handleBalanceClick = () => {
  if (!userStore.isLoggedIn) {
    openPage('/pages/auth/login');
  } else {
    openPage('/pages/member/balance');
  }
};

const handleWithdrawClick = () => {
  if (!userStore.isLoggedIn) {
    openPage('/pages/auth/login');
  } else {
    openPage('/pages/member/balance');
  }
};

const refreshMemberData = async () => {
  if (userStore.token) {
    await userStore.fetchUserInfo().catch(() => {});
    try {
      const res = await getBalance();
      if (res && (res.money !== undefined || res.balance !== undefined)) {
        Object.assign(balance, res);
      }
    } catch (e) {
      // ignore
    }
  }
};

onShow(() => {
  refreshMemberData();
});

onMounted(async () => {
  await refreshMemberData();
  setTimeout(() => { isLoading.value = false }, 300);
});

const handleProfileClick = () => {
  if (!userStore.isLoggedIn) {
    openPage('/pages/auth/login');
  } else {
    openPage('/pages/member/profile');
  }
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要切换或重新登录账号吗？',
    confirmText: '去登录',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
        openPage('/pages/auth/login');
      }
    }
  });
};

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
  { title: '密码查询', desc: '格力空调密码快捷查询', icon: 'lock-fill', color: '#10b981', bg: '#e6fcf5', path: '/pages/password/index' },
  { title: '合作申请', desc: '申请成为认证服务商', icon: 'account-fill', color: '#f59e0b', bg: '#fef7e7', path: '/pages/cooperation/index' },
  { title: '意见与反馈', desc: '产品选型与功能建议', icon: 'edit-pen', color: '#8b5cf6', bg: '#f3edff', path: '/pages/feedback/index' },
  { title: '账号与安全设置', desc: '修改企业信息与密码', icon: 'setting-fill', color: '#647389', bg: '#f0f3f8', path: '/pages/member/profile' }
];

const formatMoney = (value) => Number(value || 0).toLocaleString();
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  padding: 0 24rpx;
  background: linear-gradient(180deg, #d2e4ff 0%, #e8f1fd 260rpx, #f4f7fc 500rpx, #f4f7fc 100%);
}

.my-safe-top {
  width: 100%;
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
  display: block;
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #edf3fa;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 16rpx rgba(36, 104, 232, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
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

.avatar-camera-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #2b70f6 0%, #1555d4 100%);
  border: 3rpx solid #fff;
  box-shadow: 0 4rpx 10rpx rgba(36, 104, 232, 0.35);
}

.profile-setting-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1rpx solid #e2e8f0;
  margin-left: 12rpx;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:active {
    opacity: 0.8;
    transform: scale(0.92);
    background: #e2e8f0;
  }
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

.vip-role-badge.role-badge--unlogin {
  background: #e2e8f0;
  color: #64748b;
  box-shadow: none;
}

.vip-role-badge.role-badge--normal {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 2rpx 8rpx rgba(16, 185, 129, 0.25);
}

.avatar-verified-dot.avatar-dot--unverified {
  background: #9aa7b8;
}

.auth-action-box {
  margin-top: 28rpx;
  display: flex;
  flex-direction: column;
}

.logout-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #64748b;
  font-size: 26rpx;
  font-weight: 600;
}

.login-action-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #2b70f6 0%, #1555d4 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(36, 104, 232, 0.25);
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

/* 个人资料修改设置弹窗 */
.edit-profile-panel {
  background: #ffffff;
  padding: 32rpx 32rpx calc(env(safe-area-inset-bottom) + 32rpx);
  border-top-left-radius: 36rpx;
  border-top-right-radius: 36rpx;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.edit-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
  flex-shrink: 0;
}

.edit-header-left {
  display: flex;
  flex-direction: column;
}

.edit-panel-title {
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 800;
}

.edit-panel-subtitle {
  color: #94a3b8;
  font-size: 23rpx;
  margin-top: 4rpx;
}

.edit-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f1f5f9;
}

.edit-panel-scroll {
  max-height: 62vh;
  flex: 1;
}

.edit-panel-body {
  padding: 24rpx 0 10rpx;
}

/* 头像编辑区域 */
.avatar-edit-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 24rpx;
  border-bottom: 1rpx dashed #e2e8f0;
}

.avatar-preview-box {
  position: relative;
  width: 144rpx;
  height: 144rpx;
  cursor: pointer;
}

.avatar-preview-wrap {
  width: 144rpx;
  height: 144rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #2468e8;
  box-shadow: 0 8rpx 24rpx rgba(36, 104, 232, 0.18);
  background: #f8fafc;
}

.avatar-preview-img {
  width: 100%;
  height: 100%;
  display: block;
}

.avatar-change-badge {
  position: absolute;
  right: -4rpx;
  bottom: -4rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #2b70f6 0%, #1555d4 100%);
  border: 4rpx solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(36, 104, 232, 0.35);
}

.avatar-tip-text {
  color: #94a3b8;
  font-size: 21rpx;
  margin-top: 14rpx;
}

.avatar-action-btns {
  display: flex;
  gap: 16rpx;
  margin-top: 18rpx;
}

.btn-avatar-source {
  display: flex;
  align-items: center;
  gap: 8rpx;
  height: 54rpx;
  padding: 0 24rpx;
  border-radius: 27rpx;
  background: #f1f5f9;
  color: #334155;
  font-size: 23rpx;
  font-weight: 600;
  line-height: 54rpx;
  border: none;

  &.wx {
    background: #e8f8ee;
    color: #07c160;
  }
}

.preset-avatars-wrap {
  width: 100%;
  margin-top: 24rpx;
  background: #f8fafc;
  padding: 20rpx 20rpx 16rpx;
  border-radius: 20rpx;
  border: 1rpx solid #f1f5f9;
}

.preset-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.preset-label {
  color: #334155;
  font-size: 23rpx;
  font-weight: 700;
}

.preset-category-tabs {
  display: flex;
  gap: 8rpx;
  background: #e2e8f0;
  padding: 4rpx;
  border-radius: 24rpx;
}

.cat-tab-item {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s ease;

  &.active {
    background: #ffffff;
    color: #2468e8;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
}

.preset-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  justify-items: center;
}

.preset-item-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;

  &.active {
    border-color: #2468e8;
    background: #edf4ff;
    box-shadow: 0 4rpx 12rpx rgba(36, 104, 232, 0.18);
  }
}

.preset-item-img {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background: #ffffff;
}

.preset-item-name {
  color: #64748b;
  font-size: 19rpx;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.preset-check {
  position: absolute;
  right: 12rpx;
  top: 60rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #2468e8;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
}

/* 资料表单区域 */
.edit-form-group {
  margin-top: 20rpx;
}

.form-item {
  margin-bottom: 22rpx;
}

.form-item-label-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.form-label {
  color: #334155;
  font-size: 25rpx;
  font-weight: 700;
}

.form-required {
  color: #ef4444;
  margin-left: 6rpx;
  font-size: 24rpx;
}

.form-input-wrap {
  display: flex;
  align-items: center;
  height: 76rpx;
  padding: 0 24rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 18rpx;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #2468e8;
    background: #ffffff;
    box-shadow: 0 0 0 4rpx rgba(36, 104, 232, 0.08);
  }
}

.form-input {
  flex: 1;
  font-size: 26rpx;
  color: #0f172a;
}

.clear-btn {
  padding: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 弹窗底部操作条 */
.edit-panel-footer {
  display: flex;
  gap: 20rpx;
  margin-top: 36rpx;
}

.btn-cancel {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 80rpx;
  border: none;
}

.btn-save-profile {
  flex: 2;
  height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #2b70f6 0%, #1555d4 100%);
  color: #ffffff;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 80rpx;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(36, 104, 232, 0.3);
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
