<template>
  <view class="function-page feedback-page">
    <AppNavbar title="用户反馈" />

    <view class="form-card">
      <view class="form-row vertical">
        <text>反馈类型 <text>*</text></text>
        <view class="input-like">请选择反馈类型 <up-icon name="arrow-right" size="16" color="#b0bac7" /></view>
      </view>
      <view class="form-row vertical">
        <text>反馈内容 <text>*</text></text>
        <textarea maxlength="500" placeholder="请详细描述您遇到的问题或建议，我们将认真处理（最多 500 字）" placeholder-class="placeholder" />
        <text class="counter">0/500</text>
      </view>
      <view class="form-row vertical">
        <text>上传图片（选填，最多 4 张）</text>
        <view class="upload-row">
          <view><up-icon name="camera" size="24" color="#8b95a7" /><text>上传图片</text></view>
          <view>+</view>
          <view>+</view>
          <view>+</view>
        </view>
      </view>
      <view class="form-row vertical">
        <text>联系方式 <text>*</text></text>
        <input placeholder="请输入手机号，便于我们与您联系" placeholder-class="placeholder" />
      </view>
    </view>

    <button class="primary-btn">提交反馈</button>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';
</script>

<style lang="scss" scoped>
.function-page {
  min-height: 100vh;
  padding: 0 24rpx 36rpx;
  background: #f3f7fd;
}

.form-card {
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
}

.form-row {
  margin-bottom: 24rpx;
}

.form-row > text:first-child {
  display: block;
  margin-bottom: 14rpx;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 800;
}

.form-row > text:first-child text {
  color: #ef543f;
}

.input-like,
.form-row input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76rpx;
  padding: 0 22rpx;
  border: 1rpx solid #edf0f5;
  border-radius: 12rpx;
  color: #b0bac7;
  font-size: 24rpx;
}

.form-row textarea {
  width: 100%;
  height: 190rpx;
  padding: 20rpx;
  border: 1rpx solid #edf0f5;
  border-radius: 12rpx;
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

.upload-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14rpx;
}

.upload-row view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 112rpx;
  border: 1rpx solid #edf0f5;
  border-radius: 12rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.primary-btn {
  height: 78rpx;
  margin: 30rpx 0 0;
  padding: 0;
  border-radius: 12rpx;
  background: #2468e8;
  color: #fff;
  font-size: 27rpx;
  line-height: 78rpx;
}
</style>
