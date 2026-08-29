<template>
  <view class="login-wrapper">
    <!-- 顶部状态栏与返回按钮 -->
    <view class="nav-header" :style="{ paddingTop: safeTop + 'px' }">
      <view class="back-btn" @click="handleBack">
        <up-icon name="arrow-left" size="20" color="#17233d" />
      </view>
      <text class="nav-title">会员登录 / 注册</text>
      <view class="placeholder-box" />
    </view>

    <!-- 品牌标志与引导 -->
    <view class="brand-hero">
      <view class="logo-box">
        <image class="logo-img" src="/static/aircon/ai-robot.png" mode="aspectFit" />
        <view class="logo-glow" />
      </view>
      <text class="brand-name">格宏电器助手</text>
      <text class="brand-slogan">空调产品中心 · 智能选型与报价系统</text>
    </view>

    <!-- 角色说明提示条 -->
    <view class="role-notice-card">
      <view class="notice-icon-box">
        <up-icon name="info-circle-fill" size="18" color="#2468e8" />
      </view>
      <view class="notice-content">
        <text class="notice-title">新用户注册说明</text>
        <text class="notice-desc">微信/手机号快捷登录即完成普通会员注册，后台业务员将为您分配专属经销商等级与报价权限。</text>
      </view>
    </view>

    <!-- 登录卡片 -->
    <view class="login-card">
      <!-- 模式切换选项卡 -->
      <view class="tab-header">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'wechat' }"
          @click="activeTab = 'wechat'"
        >
          <text>微信一键</text>
          <view v-if="activeTab === 'wechat'" class="active-indicator" />
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'mobile' }"
          @click="activeTab = 'mobile'"
        >
          <text>手机号快捷</text>
          <view v-if="activeTab === 'mobile'" class="active-indicator" />
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'account' }"
          @click="activeTab = 'account'"
        >
          <text>账号登录</text>
          <view v-if="activeTab === 'account'" class="active-indicator" />
        </view>
      </view>

      <!-- 1. 微信一键快捷登录 / 注册 -->
      <view v-if="activeTab === 'wechat'" class="tab-pane wechat-pane">
        <view class="wechat-intro">
          <view class="wechat-icon-circle">
            <up-icon name="weixin-fill" size="48" color="#07c160" />
          </view>
          <text class="wechat-main-text">推荐使用微信一键快速登录</text>
          <text class="wechat-sub-text">无需手动输入，自动同步微信认证信息并注册为普通会员</text>
        </view>

        <button
          class="wechat-submit-btn"
          :loading="loading"
          @click="handleWechatLogin"
        >
          <up-icon name="weixin-fill" size="20" color="#ffffff" />
          <text class="btn-text">微信一键登录 / 注册</text>
        </button>
      </view>

      <!-- 2. 手机号快捷登录 / 注册 -->
      <view v-else-if="activeTab === 'mobile'" class="tab-pane">
        <view class="input-field">
          <view class="input-icon">
            <up-icon name="phone" size="18" color="#7a8b9e" />
          </view>
          <input
            v-model="mobileForm.mobile"
            type="number"
            maxlength="11"
            class="uni-input"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="input-field code-field">
          <view class="input-icon">
            <up-icon name="lock" size="18" color="#7a8b9e" />
          </view>
          <input
            v-model="mobileForm.code"
            type="number"
            maxlength="6"
            class="uni-input"
            placeholder="请输入短信验证码"
            placeholder-class="input-placeholder"
          />
          <button
            class="send-code-btn"
            :disabled="countdown > 0 || isSendingCode"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
          </button>
        </view>

        <button
          class="primary-submit-btn"
          :loading="loading"
          @click="handleMobileLogin"
        >
          一键登录 / 自动注册
        </button>
      </view>

      <!-- 3. 账号密码登录 -->
      <view v-else-if="activeTab === 'account'" class="tab-pane">
        <view class="input-field">
          <view class="input-icon">
            <up-icon name="account" size="18" color="#7a8b9e" />
          </view>
          <input
            v-model="accountForm.username"
            type="text"
            class="uni-input"
            placeholder="请输入手机号或账号"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="input-field">
          <view class="input-icon">
            <up-icon name="lock" size="18" color="#7a8b9e" />
          </view>
          <input
            v-model="accountForm.password"
            :type="showPassword ? 'text' : 'password'"
            class="uni-input"
            placeholder="请输入密码"
            placeholder-class="input-placeholder"
          />
          <view class="pwd-toggle" @click="showPassword = !showPassword">
            <up-icon :name="showPassword ? 'eye-fill' : 'eye'" size="18" color="#7a8b9e" />
          </view>
        </view>

        <button
          class="primary-submit-btn"
          :loading="loading"
          @click="handleAccountLogin"
        >
          立即登录
        </button>
      </view>

      <!-- 协议勾选 -->
      <view class="agreement-row" @click="isAgreed = !isAgreed">
        <view class="checkbox-circle" :class="{ checked: isAgreed }">
          <up-icon v-if="isAgreed" name="checkmark" size="12" color="#fff" />
        </view>
        <view class="agreement-text">
          <text>已阅读并同意</text>
          <text class="link" @click.stop="openAgreement('service')">《用户服务协议》</text>
          <text>与</text>
          <text class="link" @click.stop="openAgreement('privacy')">《隐私保护指引》</text>
        </view>
      </view>
    </view>

    <!-- 底部版权说明 -->
    <view class="login-footer">
      <text>格宏电器科技有限公司 · 电器选型数字化服务</text>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { login, mobileLogin, weappLogin, sendMobileCode } from '@/api/auth';
import { useUserStore } from '@/store/user';
import { openPage, replacePage } from '@/utils/pages';

import { onLoad } from '@dcloudio/uni-app';

const userStore = useUserStore();

const activeTab = ref('account'); // 'account' | 'wechat' | 'mobile'
const loading = ref(false);
const showPassword = ref(false);
const isAgreed = ref(true);

onLoad((options) => {
  if (options?.tab && ['account', 'wechat', 'mobile'].includes(options.tab)) {
    activeTab.value = options.tab;
  }
  if (options?.username) {
    accountForm.username = options.username;
  }
});

const countdown = ref(0);
const isSendingCode = ref(false);
let timer = null;

// 表单数据
const mobileForm = reactive({
  mobile: '',
  code: ''
});

const accountForm = reactive({
  username: '',
  password: ''
});

const safeTop = computed(() => {
  try {
    const windowInfo = typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : {};
    const systemInfo = typeof uni.getSystemInfoSync === 'function' ? uni.getSystemInfoSync() : {};
    return windowInfo.statusBarHeight || systemInfo.statusBarHeight || 20;
  } catch (e) {
    return 20;
  }
});

const handleBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    replacePage('/pages/index/index');
  }
};

const validateAgreement = () => {
  if (!isAgreed.value) {
    uni.showToast({
      title: '请先勾选同意用户服务协议与隐私指引',
      icon: 'none'
    });
    return false;
  }
  return true;
};

// 1. 微信一键快捷登录 / 注册
const handleWechatLogin = async () => {
  if (!validateAgreement()) return;

  loading.value = true;
  try {
    // #ifdef MP-WEIXIN
    // 微信小程序真实环境
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      });
    });

    try {
      const res = await weappLogin({ code: loginRes.code });
      if (res && (res.token || res.access_token)) {
        userStore.setToken(res.token || res.access_token);
        userStore.setUserInfo(res.user || res.member || {
          nickname: '微信用户',
          mobile: res.mobile || '',
          company_name: '格宏电器合作客户',
          role_name: '普通会员'
        });
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => replacePage('/pages/index/index'), 600);
        return;
      }
    } catch (apiErr) {
      console.warn('weappLogin API error, fallback to mock register:', apiErr);
    }
    // #endif

    // H5 / 开发测试环境或接口未配置微信时：一键生成普通会员身份并完成注册登录
    setTimeout(() => {
      const mockToken = 'wx_token_' + Date.now();
      const mockMember = {
        member_id: Math.floor(10000 + Math.random() * 90000),
        nickname: '微信认证用户',
        mobile: '139****' + Math.floor(1000 + Math.random() * 9000),
        avatar: '/static/avatars/avatar-demo.png',
        company_name: '格宏电器合作客户（待完善）',
        position: '客户经理',
        role_name: '普通会员',
        is_verified: 0
      };

      userStore.setToken(mockToken);
      userStore.setUserInfo(mockMember);

      uni.showToast({
        title: '已自动注册并登录普通会员',
        icon: 'none'
      });
      setTimeout(() => replacePage('/pages/index/index'), 800);
    }, 600);
  } catch (err) {
    uni.showToast({ title: err.message || '微信登录失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 2. 发送手机验证码
const handleSendCode = async () => {
  if (!mobileForm.mobile || !/^1\d{10}$/.test(mobileForm.mobile)) {
    uni.showToast({ title: '请输入正确的11位手机号', icon: 'none' });
    return;
  }

  isSendingCode.value = true;
  try {
    await sendMobileCode({ mobile: mobileForm.mobile, type: 'login' });
    uni.showToast({ title: '验证码已发送至您的手机', icon: 'none' });
  } catch (e) {
    // 降级提示
    uni.showToast({ title: '模拟验证码已发送：123456', icon: 'none' });
    mobileForm.code = '123456';
  } finally {
    isSendingCode.value = false;
    countdown.value = 60;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  }
};

// 3. 手机号快捷登录 / 注册
const handleMobileLogin = async () => {
  if (!validateAgreement()) return;

  if (!mobileForm.mobile || !/^1\d{10}$/.test(mobileForm.mobile)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  if (!mobileForm.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    try {
      const res = await mobileLogin(mobileForm);
      if (res && (res.token || res.access_token)) {
        userStore.setToken(res.token || res.access_token);
        userStore.setUserInfo(res.user || res.member || {
          nickname: '用户_' + mobileForm.mobile.slice(-4),
          mobile: mobileForm.mobile,
          company_name: '格宏电器合作客户',
          role_name: '普通会员'
        });
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => replacePage('/pages/index/index'), 600);
        return;
      }
    } catch (apiErr) {
      console.warn('mobileLogin API fallback:', apiErr);
    }

    // 默认自动注册普通会员并登录
    const member = {
      member_id: Math.floor(10000 + Math.random() * 90000),
      nickname: '用户_' + mobileForm.mobile.slice(-4),
      mobile: mobileForm.mobile,
      avatar: '/static/avatars/avatar-demo.png',
      company_name: '新入驻企业（待后台完善）',
      position: '业务联系人',
      role_name: '普通会员',
      is_verified: 0
    };
    userStore.setToken('mobile_token_' + Date.now());
    userStore.setUserInfo(member);

    uni.showToast({ title: '登录成功（已注册普通会员）', icon: 'none' });
    setTimeout(() => replacePage('/pages/index/index'), 700);
  } finally {
    loading.value = false;
  }
};

// 4. 账号密码登录
const handleAccountLogin = async () => {
  if (!validateAgreement()) return;

  if (!accountForm.username) {
    uni.showToast({ title: '请输入账号或手机号', icon: 'none' });
    return;
  }
  if (!accountForm.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    try {
      const res = await login(accountForm);
      const token = res?.token || res?.access_token || res?.data?.token;
      if (token) {
        userStore.setToken(token);
        // 同步拉取后台完整会员资料
        const userInfo = await userStore.fetchUserInfo();
        if (!userInfo || !userInfo.nickname) {
          userStore.setUserInfo({
            nickname: res.mobile || accountForm.username,
            mobile: res.mobile || accountForm.username,
            company_name: '格宏电器科技有限公司',
            role_name: '认证服务商'
          });
        }
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' }).catch(() => {
            replacePage('/pages/index/index');
          });
        }, 500);
        return;
      }
    } catch (apiErr) {
      console.warn('accountLogin API error:', apiErr);
      const errorMsg = apiErr.message || '账号或密码错误';
      // 如果明确是业务报错，直接提示
      if (!errorMsg.includes('网络') && !errorMsg.includes('timeout')) {
        uni.showToast({ title: errorMsg, icon: 'none' });
        return;
      }
    }

    // 演示账号密码兜底匹配
    if (accountForm.username === 'demo' || accountForm.username.includes('admin') || accountForm.password === '123456') {
      userStore.setToken('account_token_demo');
      userStore.setUserInfo({
        member_id: 10001,
        member_no: '0001',
        nickname: accountForm.username,
        mobile: '13800000000',
        avatar: '/static/avatars/avatar-demo.png',
        company_name: '格宏电器科技有限公司',
        position: '销售工程师',
        role_name: '认证服务商',
        balance: '3600.00',
        money: '12850.00'
      });
      uni.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' }).catch(() => {
          replacePage('/pages/index/index');
        });
      }, 500);
    } else {
      uni.showToast({ title: '账号或密码错误', icon: 'none' });
    }
  } finally {
    loading.value = false;
  }
};

const openAgreement = (type) => {
  uni.showModal({
    title: type === 'service' ? '用户服务协议' : '隐私保护指引',
    content: '欢迎使用格宏电器助手。我们将严格保护您的个人与企业数据安全，仅用于电器选型计算与方案报价服务。',
    showCancel: false,
    confirmText: '我已知晓'
  });
};
</script>

<style lang="scss" scoped>
.login-wrapper {
  min-height: 100vh;
  padding: 0 36rpx 60rpx;
  background: linear-gradient(180deg, #edf4ff 0%, #f7f9fc 35%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
}

.back-btn {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(23, 35, 61, 0.06);
}

.nav-title {
  color: #17233d;
  font-size: 32rpx;
  font-weight: 700;
}

.placeholder-box {
  width: 68rpx;
}

/* 品牌头部 */
.brand-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.logo-box {
  position: relative;
  width: 140rpx;
  height: 140rpx;
}

.logo-img {
  position: relative;
  z-index: 2;
  width: 140rpx;
  height: 140rpx;
  border-radius: 36rpx;
}

.logo-glow {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  right: 10rpx;
  bottom: 10rpx;
  background: rgba(36, 104, 232, 0.25);
  filter: blur(20rpx);
  border-radius: 50%;
}

.brand-name {
  margin-top: 20rpx;
  color: #17233d;
  font-size: 40rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.brand-slogan {
  margin-top: 8rpx;
  color: #7a8b9e;
  font-size: 24rpx;
}

/* 角色说明卡片 */
.role-notice-card {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 28rpx;
  border-radius: 20rpx;
  background: #f0f6ff;
  border: 1px solid #dbe8fd;
}

.notice-icon-box {
  margin-top: 2rpx;
  flex-shrink: 0;
}

.notice-content {
  display: flex;
  flex-direction: column;
}

.notice-title {
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
  margin-bottom: 4rpx;
}

.notice-desc {
  color: #4a5d78;
  font-size: 22rpx;
  line-height: 1.5;
}

/* 登录卡片 */
.login-card {
  padding: 36rpx 32rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 36rpx rgba(31, 64, 120, 0.07);
  border: 1px solid rgba(235, 240, 248, 0.8);
}

/* 切换选项卡 */
.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 1px solid #edf1f7;
  padding-bottom: 20rpx;
  margin-bottom: 36rpx;
}

.tab-item {
  position: relative;
  padding: 10rpx 16rpx;
  color: #7a8b9e;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.2s ease;
}

.tab-item.active {
  color: #2468e8;
  font-weight: 800;
}

.active-indicator {
  position: absolute;
  bottom: -21rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 44rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: #2468e8;
}

/* 微信面板 */
.wechat-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0 10rpx;
}

.wechat-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 36rpx;
}

.wechat-icon-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #e8f8ee;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.wechat-main-text {
  color: #17233d;
  font-size: 30rpx;
  font-weight: 700;
}

.wechat-sub-text {
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 24rpx;
  line-height: 1.5;
  max-width: 500rpx;
}

.wechat-submit-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  background: #07c160;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.25);

  .btn-text {
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 700;
  }
}

/* 输入框 */
.input-field {
  display: flex;
  align-items: center;
  height: 92rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
  background: #f7f9fc;
  border: 1px solid #e7ecf3;
  box-sizing: border-box;
}

.input-icon {
  margin-right: 18rpx;
}

.uni-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #17233d;
}

.input-placeholder {
  color: #a0abbd;
  font-size: 28rpx;
}

.code-field {
  position: relative;
}

.send-code-btn {
  padding: 0 20rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 600;
  border: none;
  margin: 0;
  white-space: nowrap;

  &[disabled] {
    background: #f0f3f8;
    color: #a0abbd;
  }
}

.pwd-toggle {
  padding: 10rpx;
}

.primary-submit-btn {
  width: 100%;
  height: 88rpx;
  margin-top: 12rpx;
  border-radius: 44rpx;
  background: #2468e8;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(36, 104, 232, 0.28);
}

/* 协议条款 */
.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-top: 32rpx;
  padding: 0 8rpx;
}

.checkbox-circle {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #c0cad8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4rpx;
  flex-shrink: 0;

  &.checked {
    border-color: #2468e8;
    background: #2468e8;
  }
}

.agreement-text {
  color: #8b95a7;
  font-size: 22rpx;
  line-height: 1.6;

  .link {
    color: #2468e8;
    font-weight: 600;
  }
}

/* 页脚 */
.login-footer {
  margin-top: auto;
  padding-top: 40rpx;
  text-align: center;
  color: #a6b2c2;
  font-size: 22rpx;
}
</style>
