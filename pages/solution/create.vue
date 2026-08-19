<template>
  <view class="design-page create-page">
    <AppNavbar title="创建报价单" />

    <view class="form-card">
      <view class="form-row">
        <view class="form-label">
          <text>报价单名称</text>
          <text>*</text>
        </view>
        <input v-model="form.title" placeholder="请输入报价单名称" placeholder-class="placeholder" />
      </view>

      <view class="form-row">
        <view class="form-label">
          <text>客户名称</text>
          <text class="optional">选填</text>
        </view>
        <input v-model="form.customerName" placeholder="请输入客户名称" placeholder-class="placeholder" />
      </view>

      <view class="form-row">
        <view class="form-label">
          <text>项目名称</text>
          <text class="optional">选填</text>
        </view>
        <input v-model="form.projectName" placeholder="请输入项目名称" placeholder-class="placeholder" />
      </view>

      <button class="create-btn" @click="create">创建报价单</button>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { saveSolution } from '@/api/solution';
import { replacePage } from '@/utils/pages';

// 中文说明：创建报价单页只负责生成一个空报价单骨架，真正的商品增删改价在“报价单编辑”页完成。
// 这样后续接真实接口时，只需要把 saveSolution 切到后台接口，页面表单结构不用重写。
const form = reactive({
  title: '',
  customerName: '',
  projectName: ''
});

const create = async () => {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入报价单名称', icon: 'none' });
    return;
  }

  const result = await saveSolution({
    title: form.title.trim(),
    customerName: form.customerName.trim(),
    projectName: form.projectName.trim(),
    items: []
  });

  replacePage('/pages/solution/edit', { id: result.id });
};
</script>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  background: #f3f7fd;
}

.form-card {
  margin-top: 18rpx;
  padding: 8rpx 22rpx 26rpx;
  border-radius: 18rpx;
  background: #fff;
}

.form-row {
  padding-top: 26rpx;
}

.form-label {
  display: flex;
  align-items: center;
  height: 34rpx;
  margin-bottom: 14rpx;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 800;
}

.form-label text:last-child {
  margin-left: 6rpx;
  color: #ef543f;
  font-size: 22rpx;
}

.form-label .optional {
  color: #8b95a7;
  font-size: 21rpx;
  font-weight: 500;
}

input {
  box-sizing: border-box;
  width: 100%;
  height: 74rpx;
  padding: 0 22rpx;
  border: 1rpx solid #dce4f0;
  border-radius: 10rpx;
  background: #fff;
  color: #17233d;
  font-size: 25rpx;
}

.placeholder {
  color: #b0bac7;
  font-size: 24rpx;
}

.create-btn {
  height: 76rpx;
  margin: 28rpx 0 0;
  padding: 0;
  border-radius: 38rpx;
  background: linear-gradient(135deg, #3aa5ff, #1d63e9);
  color: #fff;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 76rpx;
}

.create-btn::after {
  border: 0;
}
</style>
