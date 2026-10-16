<template>
  <view class="login-wrapper">
    <AppWatermark />
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
        <!-- 登录页也使用小格形象，避免旧机器人图仍被用户看到。 -->
        <image class="logo-img" src="https://gehong-ai-knowledge-bj-20260829.oss-cn-beijing.aliyuncs.com/upload/attachment/image/202610/11/xiaoge-assistant.png" mode="aspectFit" />
        <view class="logo-glow" />
      </view>
      <text class="brand-name">格宏家电助手</text>
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

        <!-- 小程序端先取得微信手机号授权码，再与登录 code 一起提交后端。 -->
        <!-- #ifdef MP-WEIXIN -->
        <button
          class="wechat-submit-btn"
          :loading="loading"
          :open-type="isAgreed ? 'getPhoneNumber' : ''"
          @click="handleWechatButtonClick"
          @getphonenumber="handleWechatPhoneLogin"
        >
          <up-icon name="weixin-fill" size="20" color="#ffffff" />
          <text class="btn-text">微信一键登录 / 注册</text>
        </button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <button class="wechat-submit-btn" :loading="loading" @click="handleWechatLogin">
          <up-icon name="weixin-fill" size="20" color="#ffffff" />
          <text class="btn-text">微信一键登录 / 注册</text>
        </button>
        <!-- #endif -->
      </view>

      <!-- 2. 手机号快捷登录 / 注册 -->
      <view v-else-if="activeTab === 'mobile'" class="tab-pane">
        <text v-if="!mobileLoginEnabled" class="login-method-tip">{{ loginConfigError || (loginConfigLoading ? '正在读取登录配置…' : '后台暂未开启手机号验证码登录，请使用微信或账号登录') }}</text>
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
            v-model="mobileForm.mobile_code"
            type="number"
            maxlength="6"
            class="uni-input"
            placeholder="请输入短信验证码"
            placeholder-class="input-placeholder"
          />
          <button
            class="send-code-btn"
            :disabled="countdown > 0 || isSendingCode || !mobileLoginEnabled"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
          </button>
        </view>

        <button
          class="primary-submit-btn"
          :loading="loading"
          :disabled="loading || !mobileLoginEnabled"
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
      <text>格宏家电助手 浙江格宏电器有限公司</text>
    </view>

    <!-- 参考 niucloud：发送短信前先完成图形验证码校验，发送成功再开始倒计时。 -->
    <up-popup :show="showCaptcha" mode="center" round="20" :closeable="true" @close="showCaptcha = false">
      <view class="captcha-panel">
        <text class="captcha-title">图形验证码</text>
        <view class="captcha-row">
          <input v-model="captchaForm.captcha_code" class="captcha-input" placeholder="请输入图形验证码" maxlength="8" />
          <image v-if="captchaImage" class="captcha-image" :src="captchaImage" mode="aspectFit" @click="refreshCaptcha" />
          <button v-else class="captcha-refresh" @click="refreshCaptcha">点击加载</button>
        </view>
        <text class="captcha-hint">点击图片可更换验证码</text>
        <button class="primary-submit-btn" :loading="isSendingCode" :disabled="isSendingCode || captchaLoading" @click="confirmSendCode">确认发送短信</button>
      </view>
    </up-popup>
  </view>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { login, mobileLogin, weappLogin, sendMobileCode, getCaptcha, getLoginConfig } from '@/api/auth';
import { bindMemberMobile } from '@/api/member';
import { useUserStore } from '@/store/user';
import { openPage, replacePage } from '@/utils/pages';
import AppWatermark from '@/components/app-watermark.vue';

import { onLoad, onUnload } from '@dcloudio/uni-app';

const userStore = useUserStore();

const activeTab = ref('wechat'); // 默认微信一键登录：'wechat' | 'account' | 'mobile'
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
  loadLoginConfig();
});

const countdown = ref(0);
const isSendingCode = ref(false);
let timer = null;

// 表单数据
const mobileForm = reactive({
  mobile: '',
  mobile_code: '',
  mobile_key: ''
});
const loginConfig = ref(null);
const loginConfigLoading = ref(true);
const loginConfigError = ref('');
const mobileLoginEnabled = computed(() => Number(loginConfig.value?.is_mobile) === 1 || Number(loginConfig.value?.is_bind_mobile) === 1);
const showCaptcha = ref(false);
const captchaImage = ref('');
const captchaLoading = ref(false);
const captchaForm = reactive({ captcha_key: '', captcha_code: '' });
let smsMobile = '';

/** 登录方式按服务端配置展示，读取失败允许用户再次点击重试，不推断开放状态。 */
const loadLoginConfig = async () => {
  loginConfigLoading.value = true;
  loginConfigError.value = '';
  try { loginConfig.value = await getLoginConfig(); }
  catch (error) { loginConfigError.value = error?.message || '登录配置加载失败，请重新进入登录页'; }
  finally { loginConfigLoading.value = false; }
};

/** 更换手机号后旧短信凭证失效，不能把上一号码的验证码提交给新号码。 */
watch(() => mobileForm.mobile, () => {
  mobileForm.mobile_key = '';
  mobileForm.mobile_code = '';
  if (timer) clearInterval(timer);
  timer = null;
  countdown.value = 0;
});
onUnload(() => { if (timer) clearInterval(timer); });

const refreshCaptcha = async () => {
  if (captchaLoading.value) return;
  captchaLoading.value = true;
  captchaForm.captcha_key = '';
  captchaForm.captcha_code = '';
  captchaImage.value = '';
  try {
    const result = await getCaptcha();
    if (!result?.captcha_key || !result.img) throw new Error('未获取到图形验证码');
    captchaForm.captcha_key = result.captcha_key;
    captchaImage.value = String(result.img).replace(/[\r\n]/g, '');
  } catch (error) { uni.showToast({ title: error?.message || '图形验证码加载失败', icon: 'none' }); }
  finally { captchaLoading.value = false; }
};

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

// 协议未同意时禁用微信手机号授权；拒绝授权时不悄悄降级为无手机号登录。
const handleWechatButtonClick = () => {
  if (!isAgreed.value) validateAgreement();
};

const handleWechatPhoneLogin = (event) => {
  if (!validateAgreement() || loading.value) return;
  const mobileCode = String(event?.detail?.code || '').trim();
  if (!mobileCode) {
    uni.showToast({ title: '请授权手机号后登录', icon: 'none' });
    return;
  }
  // 开发者工具的模拟凭证不能换取真实手机号，避免误送到正式接口。
  if (/mock/i.test(mobileCode)) {
    uni.showToast({ title: '模拟手机号不可用，请在真机预览', icon: 'none' });
    return;
  }
  handleWechatLogin(mobileCode);
};

// 1. 微信一键快捷登录 / 注册：手机号授权码由 getPhoneNumber 回调提供。
const handleWechatLogin = async (mobileCode = '') => {
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
      if (!loginRes?.code) throw new Error('微信登录未返回凭证');
      const res = await weappLogin({ code: loginRes.code, mobile_code: mobileCode });
      if (res && (res.token || res.access_token)) {
        userStore.setToken(res.token || res.access_token);
        userStore.setUserInfo(res.user || res.member || {
          nickname: '微信用户',
          mobile: res.mobile || ''
        });
        // 登录响应可能只有基础字段，立刻读取 /member 中实际保存的公司资料。
        const member = await userStore.fetchUserInfo();
        // 与 niucloud 原项目保持一致：登录未带出手机号时，用本次授权码绑定会员。
        let mobileBindFailed = false;
        if (mobileCode && !member?.mobile) {
          try {
            await bindMemberMobile(mobileCode);
            const refreshedMember = await userStore.fetchUserInfo();
            mobileBindFailed = !refreshedMember?.mobile;
          } catch (bindError) {
            console.warn('[微信登录] 手机号绑定失败：', bindError);
            mobileBindFailed = true;
          }
        }
        uni.showToast({ title: mobileBindFailed ? '登录成功，手机号未绑定' : '登录成功', icon: mobileBindFailed ? 'none' : 'success' });
        setTimeout(() => replacePage('/pages/index/index'), 600);
        return;
      }
    } catch (apiErr) {
      // 正式小程序接口失败时不能生成演示账号，否则会出现假公司名和假登录态。
      console.warn('weappLogin API error:', apiErr);
      throw apiErr;
    }
    // #endif

    throw new Error('请在微信小程序内使用微信登录，或选择其他登录方式');
  } catch (err) {
    uni.showToast({ title: err.message || '微信登录失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 2. 发送手机验证码
const handleSendCode = async () => {
  if (!validateAgreement() || countdown.value > 0 || isSendingCode.value) return;
  if (!mobileLoginEnabled.value) {
    uni.showToast({ title: '后台暂未开启手机号登录', icon: 'none' });
    return;
  }
  if (!mobileForm.mobile || !/^1\d{10}$/.test(mobileForm.mobile)) {
    uni.showToast({ title: '请输入正确的11位手机号', icon: 'none' });
    return;
  }

  smsMobile = mobileForm.mobile;
  showCaptcha.value = true;
  await refreshCaptcha();
};

/** 短信验证码只从用户手机读取；发送失败保留错误提示，不填入模拟码或启动倒计时。 */
const confirmSendCode = async () => {
  if (!validateAgreement() || isSendingCode.value || captchaLoading.value || countdown.value > 0) return;
  if (!mobileLoginEnabled.value) return;
  if (smsMobile !== mobileForm.mobile) {
    showCaptcha.value = false;
    return uni.showToast({ title: '手机号已变更，请重新获取验证码', icon: 'none' });
  }
  if (!captchaForm.captcha_key || !captchaForm.captcha_code.trim()) {
    return uni.showToast({ title: '请填写图形验证码', icon: 'none' });
  }
  isSendingCode.value = true;
  try {
    const result = await sendMobileCode({ mobile: smsMobile, type: 'login', ...captchaForm });
    if (!result?.key) throw new Error('短信接口未返回验证码凭证');
    if (smsMobile !== mobileForm.mobile) throw new Error('手机号已变更，请重新获取验证码');
    mobileForm.mobile_key = result.key;
    showCaptcha.value = false;
    uni.showToast({ title: '验证码已发送至您的手机', icon: 'none' });
    countdown.value = 60;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  } catch (e) {
    uni.showToast({ title: e?.message || '短信发送失败，请稍后重试', icon: 'none' });
    await refreshCaptcha();
  } finally {
    isSendingCode.value = false;
  }
};

// 3. 手机号快捷登录 / 注册
const handleMobileLogin = async () => {
  if (!validateAgreement() || loading.value) return;
  if (!mobileLoginEnabled.value) return uni.showToast({ title: '后台暂未开启手机号登录', icon: 'none' });

  if (!mobileForm.mobile || !/^1\d{10}$/.test(mobileForm.mobile)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  if (!mobileForm.mobile_key) return uni.showToast({ title: '请先获取手机验证码', icon: 'none' });
  if (!/^\d{4,6}$/.test(mobileForm.mobile_code)) {
    uni.showToast({ title: '请输入验证码', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    try {
      const res = await mobileLogin(mobileForm);
      const token = res?.token || res?.access_token || res?.data?.token;
      if (!token) throw new Error('登录接口未返回有效凭证');
      if (token) {
        userStore.setToken(token);
        userStore.setUserInfo(res.user || res.member || {
          nickname: '用户_' + mobileForm.mobile.slice(-4),
          mobile: mobileForm.mobile
        });
        await userStore.fetchUserInfo();
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => replacePage('/pages/index/index'), 600);
        return;
      }
    } catch (apiErr) {
      console.warn('mobileLogin API error:', apiErr);
      const errMsg = apiErr?.message || '手机快捷登录未开启';
      uni.showToast({
        title: errMsg,
        icon: 'none',
        duration: 2500
      });
      // 失败留在当前表单，用户可重填验证码；不假定新注册会员具有账号密码。
      return;
    }
  } finally {
    loading.value = false;
  }
};

// 4. 账号密码登录
const handleAccountLogin = async () => {
  if (!validateAgreement() || loading.value) return;

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
      if (!token) throw new Error('登录接口未返回有效凭证');
      if (token) {
        userStore.setToken(token);
        // 同步拉取后台完整会员资料
        const userInfo = await userStore.fetchUserInfo();
        if (!userInfo || !userInfo.nickname) {
          userStore.setUserInfo({
            nickname: res.mobile || accountForm.username,
            mobile: res.mobile || accountForm.username
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
      uni.showToast({ title: errorMsg, icon: 'none' });
      return;
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
.login-method-tip { display: block; margin-bottom: 24rpx; color: #64748b; font-size: 24rpx; line-height: 1.7; }
.captcha-panel { width: 580rpx; padding: 36rpx 28rpx; box-sizing: border-box; background: #fff; }
.captcha-title { display: block; margin-bottom: 28rpx; font-size: 30rpx; font-weight: 600; color: #17233d; }
.captcha-row { display: flex; align-items: center; gap: 16rpx; }
.captcha-input { flex: 1; min-width: 0; height: 78rpx; padding: 0 16rpx; background: #f4f7fc; font-size: 26rpx; }
.captcha-image { width: 200rpx; height: 78rpx; flex-shrink: 0; }
.captcha-refresh { width: 200rpx; padding: 0; font-size: 24rpx; }
.captcha-hint { display: block; margin: 18rpx 0 28rpx; font-size: 22rpx; color: #64748b; }
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
