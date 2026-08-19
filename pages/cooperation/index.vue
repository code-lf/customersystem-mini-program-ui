<template>
  <view class="function-page cooperation-page">
    <AppNavbar title="合作申请" />

    <view class="form-card">
      <view v-for="item in fields" :key="item.label" class="field-row">
        <text>{{ item.label }} <text>*</text></text>
        <input :placeholder="item.placeholder" placeholder-class="placeholder" />
      </view>
      <view class="field-row area-row">
        <text>公司介绍 <text>*</text></text>
        <textarea maxlength="200" placeholder="请简要介绍公司情况、主营业务、团队规模等（最多 200 字）" placeholder-class="placeholder" />
        <text class="counter">0/200</text>
      </view>
      <view class="agreement">
        <view />
        <text>我已阅读并同意《合作申请协议》</text>
      </view>
    </view>

    <button class="primary-btn">提交申请</button>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';

const fields = [
  { label: '联系人姓名', placeholder: '请输入联系人姓名' },
  { label: '联系电话', placeholder: '请输入联系电话' },
  { label: '公司名称', placeholder: '请输入公司名称' },
  { label: '经营区域', placeholder: '请选择经营区域' },
  { label: '公司地址', placeholder: '请输入公司地址' }
];
</script>

<style lang="scss" scoped>
.function-page {
  min-height: 100vh;
  padding: 0 24rpx 36rpx;
  background: #f3f7fd;
}

.form-card {
  padding: 10rpx 0 0;
  background: transparent;
}

.field-row {
  display: flex;
  align-items: center;
  min-height: 86rpx;
}

.field-row > text:first-child {
  width: 165rpx;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 800;
}

.field-row > text:first-child text {
  color: #ef543f;
}

.field-row input {
  flex: 1;
  height: 72rpx;
  padding: 0 22rpx;
  border: 1rpx solid #edf0f5;
  border-radius: 12rpx;
  background: #fff;
  color: #17233d;
  font-size: 24rpx;
}

.area-row {
  display: block;
  margin-top: 10rpx;
}

.area-row > text:first-child {
  display: block;
  width: auto;
  margin-bottom: 14rpx;
}

.area-row textarea {
  width: 100%;
  height: 190rpx;
  padding: 20rpx;
  border: 1rpx solid #edf0f5;
  border-radius: 12rpx;
  background: #fff;
  color: #17233d;
  font-size: 24rpx;
}

.placeholder {
  color: #b0bac7;
}

.counter {
  display: block;
  margin-top: -34rpx;
  padding-right: 18rpx;
  color: #b0bac7;
  font-size: 20rpx;
  text-align: right;
}

.agreement {
  display: flex;
  align-items: center;
  margin-top: 22rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.agreement view {
  width: 26rpx;
  height: 26rpx;
  margin-right: 12rpx;
  border: 1rpx solid #b0bac7;
  border-radius: 50%;
}

.agreement text {
  color: #2468e8;
}

.primary-btn {
  height: 78rpx;
  margin: 24rpx 0 0;
  padding: 0;
  border-radius: 12rpx;
  background: #2468e8;
  color: #fff;
  font-size: 27rpx;
  line-height: 78rpx;
}
</style>
