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
import appConfig from '@/config/app';

// 中文说明：这个页面来自旧版 UI Mock，其 title/customerName/projectName 字段以及
// `/solution/save` 路径都不在当前 OpenAPI 中。真实后端的 POST /crm/quote 要求 items
// 至少有一项，所以不能从本页创建“空报价单”。真实 API 模式下应回到报价单 tab，
// 先选择商品，再生成正式报价单；Mock 模式仍保留旧交互，方便查看历史设计稿。
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

  if (appConfig.apiMode !== 'mock') {
    // 不再向真实服务器发送 OpenAPI 中不存在的 `/solution/save` 请求，
    // 也不把 title/customerName/projectName 错当成 QuoteCreateInput。
    uni.showModal({
      title: '请先选择商品',
      content: '当前接口不支持创建空报价单。请在报价单页面加入商品并确认价格后生成报价单。',
      showCancel: false,
      success: () => {
        uni.switchTab({ url: '/pages/solution/index' });
      }
    });
    return;
  }

  // 只有 Mock 模式会进入这里，调用旧版内存数据接口。
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
