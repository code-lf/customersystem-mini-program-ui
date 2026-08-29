<template>
  <view class="cooperation-page">
    <AppNavbar title="合作申请" />

    <!-- Hero Section -->
    <view class="hero-section">
      <view class="hero-content">
        <text class="hero-title">成为我们的合作伙伴</text>
        <text class="hero-subtitle">共享行业资源，开启合作共赢新篇章</text>
      </view>
    </view>

    <!-- Form Section -->
    <view class="form-container">
      <view class="form-card">
        <view class="form-header">
          <text class="form-header-title">基本信息登记</text>
          <text class="form-header-desc">请填写真实有效的合作信息</text>
        </view>

        <view class="field-group">
          <view class="field-item">
            <text class="field-label">联系人姓名 <text class="required">*</text></text>
            <input v-model="formData.name" placeholder="请输入您的姓名" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item">
            <text class="field-label">联系电话 <text class="required">*</text></text>
            <input v-model="formData.phone" type="number" maxlength="11" placeholder="请输入手机号码" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item">
            <text class="field-label">公司名称 <text class="required">*</text></text>
            <input v-model="formData.company" placeholder="请输入公司全称" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item">
            <text class="field-label">经营区域 <text class="required">*</text></text>
            <input v-model="formData.region" placeholder="如：广东省 深圳市" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item">
            <text class="field-label">公司地址 <text class="required">*</text></text>
            <input v-model="formData.address" placeholder="请输入详细办公地址" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item field-item-area">
            <text class="field-label">公司基本介绍 <text class="required">*</text></text>
            <view class="textarea-box">
              <textarea v-model="formData.intro" maxlength="200" placeholder="请简要介绍公司情况、主营业务、团队规模等（最多 200 字）" placeholder-class="placeholder" />
              <text class="counter">{{ formData.intro.length }}/200</text>
            </view>
          </view>
        </view>

        <button class="submit-btn" :loading="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? '提交中...' : '提交合作申请' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import request from '@/utils/request';

const formData = reactive({
  name: '',
  phone: '',
  company: '',
  region: '',
  address: '',
  intro: ''
});

const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!formData.name || !formData.phone || !formData.company || !formData.region || !formData.address || !formData.intro) {
    uni.showToast({ title: '请填写完整的带*必填项', icon: 'none' });
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: '手机号码格式不正确', icon: 'none' });
    return;
  }
  isSubmitting.value = true;
  try {
    const regionParts = formData.region.split(' ');
    await request.post('crm/dealer/apply', {
      dealer_name: formData.company,
      contact_name: formData.name,
      contact_phone: formData.phone,
      province: regionParts[0] || formData.region,
      city: regionParts[1] || '',
      district: regionParts[2] || '',
      address: formData.address,
      business_desc: formData.intro
    });
    uni.showToast({ title: '申请提交成功', icon: 'success' });
    Object.keys(formData).forEach(key => formData[key] = '');
  } catch(e) {}
  isSubmitting.value = false;
};

onShareAppMessage(() => ({ title: '诚邀合作 - 欢迎申请成为我们的合作伙伴', path: '/pages/cooperation/index' }));
onShareTimeline(() => ({ title: '诚邀合作 - 欢迎申请成为我们的合作伙伴', query: '' }));
</script>

<style lang="scss" scoped>
.cooperation-page {
  min-height: 100vh;
  background: #f3f7fd;
  padding-bottom: 60rpx;
}

/* 顶部视觉横幅 */
.hero-section {
  width: 100%;
  height: 320rpx;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-section::after {
  content: '';
  position: absolute;
  right: -50rpx;
  top: -50rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.hero-section::before {
  content: '';
  position: absolute;
  left: -80rpx;
  bottom: -80rpx;
  width: 300rpx;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
}

.hero-content {
  text-align: center;
  z-index: 1;
}

.hero-title {
  display: block;
  font-size: 44rpx;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 2rpx;
  margin-bottom: 16rpx;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.15);
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1rpx;
}

/* 表单主体区 */
.form-container {
  padding: 0 30rpx;
  margin-top: -60rpx;
  position: relative;
  z-index: 2;
}

.form-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.04);
}

.form-header {
  margin-bottom: 40rpx;
  text-align: center;
}

.form-header-title {
  display: block;
  font-size: 34rpx;
  color: #1a2233;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.form-header-desc {
  display: block;
  font-size: 24rpx;
  color: #8b95a7;
}

/* 表单字段样式 */
.field-group {
  margin-bottom: 40rpx;
}

.field-item {
  margin-bottom: 30rpx;
}

.field-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.required {
  color: #ff4d4f;
  margin-left: 6rpx;
}

.field-item input {
  width: 100%;
  height: 88rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1a2233;
  box-sizing: border-box;
  transition: all 0.3s;
}

.field-item input:focus {
  border-color: #2468e8;
  background: #ffffff;
}

.field-item-area .textarea-box {
  position: relative;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 24rpx;
  box-sizing: border-box;
}

.field-item-area textarea {
  width: 100%;
  height: 200rpx;
  font-size: 28rpx;
  color: #1a2233;
  line-height: 1.5;
}

.counter {
  position: absolute;
  right: 24rpx;
  bottom: 20rpx;
  font-size: 22rpx;
  color: #94a3b8;
}

.placeholder {
  color: #94a3b8;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #2468e8 0%, #1e58c8 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(36, 104, 232, 0.3);
}

.submit-btn::after {
  border: none;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(36, 104, 232, 0.2);
}
</style>
