<template>
  <view class="function-page feedback-page">
    <AppNavbar title="用户反馈" />

    <view class="form-card">
      <!-- 接口不要求填写分类，取消无法选择的分类入口，直接填写反馈。 -->
      <view class="form-row vertical">
        <text>反馈内容 <text>*</text></text>
        <textarea v-model="content" :disabled="submitting" maxlength="500" placeholder="请详细描述您遇到的问题或建议，我们将认真处理（最多 500 字）" placeholder-class="placeholder" />
        <text class="counter">{{ content.length }}/500</text>
      </view>
      <view class="form-row vertical">
        <text>上传图片（选填，最多 4 张）</text>
        <view class="upload-row">
          <view v-for="(picture, index) in pictures" :key="picture.preview" class="upload-item">
            <image :src="picture.preview" mode="aspectFill" @click="previewPicture(index)" />
            <text class="remove-picture" @click.stop="removePicture(index)">×</text>
          </view>
          <view v-if="pictures.length < 4" @click="choosePictures"><up-icon name="camera" size="24" color="#8b95a7" /><text>{{ uploading ? '上传中' : '上传图片' }}</text></view>
        </view>
      </view>
      <view class="form-row vertical">
        <text>联系方式 <text>*</text></text>
        <input v-model="mobile" :disabled="submitting" type="number" maxlength="11" placeholder="请输入手机号，便于我们与您联系" placeholder-class="placeholder" />
      </view>
    </view>

    <button class="primary-btn" :loading="submitting" :disabled="submitting || uploading" @click="submitFeedback">提交反馈</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { useUserStore } from '@/store/user';
import { uploadFile } from '@/api/common';
import { createFeedback } from '@/api/feedback';

const userStore = useUserStore();
const content = ref('');
const mobile = ref('');
const pictures = ref([]);
const uploading = ref(false);
const submitting = ref(false);
const toast = (title) => uni.showToast({ title, icon: 'none' });

// 默认带入会员手机号，返回页面时不覆盖用户已经填写的内容。
onShow(() => {
  if (!mobile.value) mobile.value = userStore.userInfo.mobile || '';
});

function requireLogin() {
  if (userStore.isLoggedIn) return true;
  uni.showModal({ title: '请先登录', content: '登录后可提交反馈和上传图片', success: ({ confirm }) => {
    if (confirm) uni.navigateTo({ url: '/pages/auth/login' });
  } });
  return false;
}

// 图片先上传到真实文件接口，提交时只发送服务端附件信息，不发送本地临时路径。
async function choosePictures() {
  if (uploading.value || submitting.value || !requireLogin()) return;
  uploading.value = true;
  try {
    const selection = await new Promise((resolve, reject) => uni.chooseImage({
      count: 4 - pictures.value.length, sizeType: ['compressed'], success: resolve, fail: reject
    }));
    for (const path of selection.tempFilePaths) {
      const result = await uploadFile(path, 'file', { showError: false });
      const url = result && (result.url || result.file_path);
      if (!url) throw new Error('上传未返回图片地址，请重试');
      pictures.value.push({ preview: path, attachment: { ...result, url } });
    }
  } catch (error) {
    // 主动取消选择不报错；已成功上传的图片仍保留，避免重复上传。
    if (!String(error.errMsg || '').includes('cancel')) toast(error.message || '图片上传失败，请重试');
  } finally {
    uploading.value = false;
  }
}

function previewPicture(index) {
  uni.previewImage({ current: index, urls: pictures.value.map((picture) => picture.preview) });
}

function removePicture(index) {
  if (!submitting.value && !uploading.value) pictures.value.splice(index, 1);
}

// 防止重复提交；仅服务端返回反馈编号后显示成功，失败时保留表单便于重试。
async function submitFeedback() {
  if (submitting.value || uploading.value || !requireLogin()) return;
  if (!content.value.trim()) return toast('请填写反馈内容');
  if (!/^1\d{10}$/.test(mobile.value.trim())) return toast('请输入正确的手机号');
  submitting.value = true;
  try {
    const result = await createFeedback({
      feedback_content: content.value.trim(),
      contact_mobile: mobile.value.trim(),
      contact_name: userStore.userInfo.real_name || userStore.userInfo.nickname || '',
      attachments: pictures.value.map((picture) => picture.attachment)
    });
    if (!(Number(result?.feedback_id) > 0)) throw new Error('未收到反馈编号，请核实提交结果后再试');
    content.value = '';
    pictures.value = [];
    uni.showModal({ title: '提交成功', content: '已收到您的反馈，我们会尽快处理。', showCancel: false });
  } catch (error) {
    toast(error.message || '提交失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
}
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

.form-row input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76rpx;
  padding: 0 22rpx;
  border: 1rpx solid #edf0f5;
  border-radius: 12rpx;
  color: #17233d;
  font-size: 24rpx;
}

.form-row textarea {
  box-sizing: border-box;
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
  margin-top: 8rpx;
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

.upload-row > view {
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

.upload-item {
  position: relative;
  image { width: 100%; height: 100%; border-radius: 12rpx; }
  .remove-picture {
    position: absolute; top: 0; right: 0; padding: 0 10rpx;
    background: rgba(0, 0, 0, 0.6); color: #fff; border-radius: 0 12rpx;
  }
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
