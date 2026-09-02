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
        <view class="avatar-img-wrap" @click="openEditModal">
          <image
            class="avatar-img"
            :src="userStore.userInfo.avatar || userStore.userInfo.headimg || '/static/avatars/avatar-demo.png'"
            mode="aspectFill"
          />
          <view class="avatar-edit-tag">
            <up-icon name="camera-fill" size="12" color="#fff" />
            <text>换头像</text>
          </view>
        </view>
        <view class="name-edit-row" @click="openEditModal">
          <text class="avatar-name">{{ userStore.userInfo.nickname || userStore.userInfo.username || '格宏用户' }}</text>
          <up-icon name="edit-pen" size="16" color="#2468e8" />
        </view>
        <text class="avatar-role">{{ userStore.userInfo.role_name || userStore.userInfo.member_level_name || '认证会员' }}</text>
        <button class="btn-quick-edit" @click="openEditModal">修改名称与头像资料</button>
      </view>

      <view class="info-list">
        <view class="info-row" @click="openEditModal">
          <text class="label">用户昵称</text>
          <view class="value-with-arrow">
            <text class="value highlight">{{ userStore.userInfo.nickname || userStore.userInfo.username || '未设置' }}</text>
            <up-icon name="arrow-right" size="14" color="#94a3b8" />
          </view>
        </view>
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
        <view class="info-row" @click="openEditModal">
          <text class="label">认证公司</text>
          <view class="value-with-arrow">
            <text class="value">{{ userStore.userInfo.company_name || '格宏电器科技有限公司' }}</text>
            <up-icon name="arrow-right" size="14" color="#94a3b8" />
          </view>
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

    <!-- 修改弹窗 -->
    <up-popup
      :show="showEditModal"
      mode="bottom"
      round="28"
      :closeable="false"
      @close="showEditModal = false"
    >
      <view class="edit-modal-panel">
        <view class="modal-header">
          <text class="modal-title">修改个人信息与资料</text>
          <view class="modal-close" @click="showEditModal = false">
            <up-icon name="close" size="18" color="#64748b" />
          </view>
        </view>

        <scroll-view scroll-y class="modal-scroll-body">
          <view class="modal-body">
            <view class="avatar-edit-box">
              <view class="preview-wrap-box" @click="chooseAvatar">
                <view class="preview-wrap">
                  <image class="preview-img" :src="form.avatar || '/static/avatars/avatar-demo.png'" mode="aspectFill" />
                </view>
                <view class="preview-camera-badge">
                  <up-icon name="camera-fill" size="12" color="#fff" />
                </view>
              </view>
              <text class="avatar-hint-text">点击头像或通过相册快速更换</text>
              <view class="avatar-action-row">
                <button class="btn-avatar-opt" @click="chooseAvatar">
                  <up-icon name="photo" size="14" color="#2468e8" />
                  <text>相册 / 拍照</text>
                </button>
              </view>
              
              <view class="preset-wrap">
                <view class="preset-header-row">
                  <text class="preset-title">精选风格头像</text>
                  <view class="preset-cat-tabs">
                    <view
                      v-for="cat in avatarCategories"
                      :key="cat.key"
                      class="cat-pill"
                      :class="{ active: currentAvatarCat === cat.key }"
                      @click="currentAvatarCat = cat.key"
                    >
                      <text>{{ cat.name }}</text>
                    </view>
                  </view>
                </view>

                <view class="preset-grid">
                  <view
                    v-for="item in currentPresetList"
                    :key="item.id"
                    class="preset-card"
                    :class="{ active: form.avatar === item.url }"
                    @click="form.avatar = item.url"
                  >
                    <image class="preset-avatar-img" :src="item.url" mode="aspectFill" />
                    <text class="preset-name">{{ item.name.split('·')[1] || item.name }}</text>
                    <view v-if="form.avatar === item.url" class="active-badge">
                      <up-icon name="checkmark" size="8" color="#fff" />
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <view class="form-list">
              <view class="input-block">
                <text class="input-label">用户昵称 / 姓名</text>
                <input v-model="form.nickname" type="nickname" class="custom-input" placeholder="请输入您的姓名或昵称" />
              </view>
              <view class="input-block">
                <text class="input-label">认证企业 / 暖通公司</text>
                <input v-model="form.company_name" class="custom-input" placeholder="请输入所属暖通公司名称" />
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="modal-footer">
          <button class="btn-modal-cancel" @click="showEditModal = false">取消</button>
          <button class="btn-modal-save" :loading="isSaving" @click="saveProfile">保存修改</button>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { useUserStore } from '@/store/user';
import { updateMemberInfo } from '@/api/member';
import { uploadFile } from '@/api/common';
import { openPage, replacePage } from '@/utils/pages';
import { AVATAR_CATEGORIES, PRESET_AVATAR_GROUPS } from '@/utils/avatar-presets';

const userStore = useUserStore();
const showEditModal = ref(false);
const isSaving = ref(false);
const currentAvatarCat = ref('guofeng');
const avatarCategories = AVATAR_CATEGORIES;

const currentPresetList = computed(() => {
  return PRESET_AVATAR_GROUPS[currentAvatarCat.value] || PRESET_AVATAR_GROUPS.guofeng || [];
});

const form = reactive({
  nickname: '',
  avatar: '',
  company_name: ''
});

const openEditModal = () => {
  const u = userStore.userInfo || {};
  form.nickname = u.nickname || u.username || '';
  form.avatar = u.avatar || u.headimg || '/static/avatars/avatar-demo.png';
  form.company_name = u.company_name || '格宏电器科技有限公司';
  showEditModal.value = true;
};

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempPath = res.tempFilePaths[0];
      if (!tempPath) return;
      form.avatar = tempPath;
      try {
        const uploadRes = await uploadFile(tempPath).catch(() => null);
        if (uploadRes && (uploadRes.url || uploadRes.file_path)) {
          form.avatar = uploadRes.url || uploadRes.file_path;
        }
      } catch(e) {}
    }
  });
};

const saveProfile = async () => {
  const name = form.nickname.trim();
  if (!name) {
    uni.showToast({ title: '请输入昵称', icon: 'none' });
    return;
  }
  isSaving.value = true;
  try {
    const payload = {
      nickname: name,
      avatar: form.avatar,
      headimg: form.avatar,
      company_name: form.company_name.trim() || '格宏电器科技有限公司'
    };
    await updateMemberInfo(payload).catch(() => {});
    userStore.setUserInfo({ ...userStore.userInfo, ...payload });
    uni.showToast({ title: '修改成功', icon: 'success' });
    showEditModal.value = false;
  } catch(e) {
    uni.showToast({ title: '保存失败', icon: 'none' });
  } finally {
    isSaving.value = false;
  }
};

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

.avatar-img-wrap {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  cursor: pointer;
}

.avatar-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 70rpx;
  border: 4rpx solid #edf4ff;
  box-shadow: 0 4rpx 16rpx rgba(36, 104, 232, 0.15);
}

.avatar-edit-tag {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 40rpx;
  background: rgba(15, 23, 42, 0.7);
  border-bottom-left-radius: 70rpx;
  border-bottom-right-radius: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;

  text {
    color: #fff;
    font-size: 18rpx;
    font-weight: 600;
  }
}

.name-edit-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 18rpx;
  cursor: pointer;
  max-width: 100%;
  min-width: 0;
}

.avatar-name {
  /* 资料页昵称与首页保持一致：固定一行，超长内容显示省略号。 */
  display: block;
  max-width: 430rpx;
  min-width: 0;
  color: #15223a;
  font-size: 34rpx;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.btn-quick-edit {
  margin-top: 18rpx;
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 26rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 23rpx;
  font-weight: 700;
  line-height: 52rpx;
  border: 1rpx solid #c7dcff;
}

.value-with-arrow {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
  max-width: 60%;
}

.value.highlight {
  color: #2468e8;
}

/* 弹窗样式 */
.edit-modal-panel {
  background: #fff;
  padding: 32rpx 32rpx calc(env(safe-area-inset-bottom) + 32rpx);
  border-top-left-radius: 36rpx;
  border-top-right-radius: 36rpx;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.modal-scroll-body {
  max-height: 60vh;
  flex: 1;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
  flex-shrink: 0;
}

.modal-title {
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 800;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f1f5f9;
}

.avatar-edit-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 24rpx;
  border-bottom: 1rpx dashed #e2e8f0;
}

.preview-wrap-box {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  cursor: pointer;
}

.preview-wrap {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #2468e8;
  background: #f8fafc;
  box-shadow: 0 8rpx 20rpx rgba(36, 104, 232, 0.18);
}

.preview-img {
  width: 100%;
  height: 100%;
  display: block;
}

.preview-camera-badge {
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

.avatar-hint-text {
  color: #94a3b8;
  font-size: 21rpx;
  margin-top: 12rpx;
}

.avatar-action-row {
  margin-top: 14rpx;
}

.btn-avatar-opt {
  display: flex;
  align-items: center;
  gap: 6rpx;
  height: 50rpx;
  padding: 0 24rpx;
  border-radius: 25rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 50rpx;
  border: none;
}

.preset-wrap {
  width: 100%;
  margin-top: 20rpx;
  background: #f8fafc;
  padding: 20rpx;
  border-radius: 20rpx;
  border: 1rpx solid #f1f5f9;
}

.preset-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.preset-title {
  color: #334155;
  font-size: 23rpx;
  font-weight: 700;
}

.preset-cat-tabs {
  display: flex;
  gap: 8rpx;
  background: #e2e8f0;
  padding: 4rpx;
  border-radius: 24rpx;
}

.cat-pill {
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

.preset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  justify-items: center;
}

.preset-card {
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

.preset-avatar-img {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #ffffff;
}

.preset-name {
  color: #64748b;
  font-size: 19rpx;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.active-badge {
  position: absolute;
  right: 8rpx;
  top: 56rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #2468e8;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
}

.form-list {
  margin-top: 24rpx;
}

.input-block {
  margin-bottom: 20rpx;
}

.input-label {
  display: block;
  color: #334155;
  font-size: 25rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.custom-input {
  height: 76rpx;
  padding: 0 24rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 18rpx;
  font-size: 26rpx;
  color: #0f172a;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.btn-modal-cancel {
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

.btn-modal-save {
  flex: 2;
  height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #2b70f6 0%, #1555d4 100%);
  color: #fff;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 80rpx;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(36, 104, 232, 0.3);
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
  display: block;
  color: #15223a;
  font-size: 26rpx;
  font-weight: 600;
  max-width: 60%;
  text-align: right;
  /* 账号、昵称和公司名称均不换行，列表高度不会因长名称发生变化。 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value-with-arrow .value {
  max-width: none;
  min-width: 0;
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
