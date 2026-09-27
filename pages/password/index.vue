<template>
  <view class="function-page password-page">
    <AppNavbar title="密码查询" />

    <view class="top-tabs">
      <text :class="{ active: currentTab === 0 }" @click="currentTab = 0">扫码查询</text>
      <text :class="{ active: currentTab === 1 }" @click="currentTab = 1">输入条码</text>
    </view>

    <!-- 扫码查询 -->
    <view v-if="currentTab === 0" class="scan-panel">
      <view class="scan-frame">
        <view />
        <view />
        <view />
        <view />
      </view>
      <text>将条码置于扫码框内，即可自动识别</text>
      <button :disabled="querying" @click="handleScan">扫码查询</button>
    </view>

    <!-- 输入条码 -->
    <view v-if="currentTab === 1" class="input-panel">
      <input v-model="barcode" maxlength="64" placeholder="请输入内机条码" placeholder-class="placeholder" />
      <button class="primary-btn" :disabled="querying" @click="handleQuery()">查询密码</button>
    </view>

    <!-- 查询结果 -->
    <view v-if="showResult" class="result-card">
      <text class="result-card__title">查询结果</text>
      <view v-for="item in codes" :key="item.label" class="code-row">
        <text>{{ item.label }}</text>
        <text>{{ item.value }}</text>
        <button @click="copyCode(item.value)">复制</button>
      </view>
    </view>
    <text class="tips">密码仅供授权人员使用，请妥善保管，切勿泄露给他人。</text>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { queryBarcodePassword } from '@/api/password';

const currentTab = ref(1);
const barcode = ref('');
const showResult = ref(false);
const querying = ref(false);
const result = ref({});

// 查询结果完全取自后端，避免继续展示演示密码和虚构的商品资料。
const codes = computed(() => [
  { label: '内机条码', value: result.value.inner_barcode || '' },
  { label: '当前密码', value: result.value.password || '' },
  { label: '备用密码', value: result.value.backup_password || '无' }
]);

const handleQuery = async (scannedBarcode = '') => {
  const code = String(scannedBarcode || barcode.value || '').trim();
  showResult.value = false;
  if (!code) {
    uni.showToast({ title: '请输入内机条码', icon: 'none' });
    return;
  }
  querying.value = true;
  uni.showLoading({ title: '查询中...' });
  try {
    const data = await queryBarcodePassword(code);
    if (!data || !data.password) throw new Error('未查询到密码');
    result.value = data;
    barcode.value = code;
    showResult.value = true;
  } catch (error) {
    uni.showToast({ title: error?.message || '查询失败', icon: 'none' });
  } finally {
    querying.value = false;
    uni.hideLoading();
  }
};

/** 扫描内机条形码，扫码成功后直接提交真实查询接口。 */
const handleScan = () => {
  uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    success: (scan) => handleQuery(scan.result),
    fail: (error) => {
      if (!String(error?.errMsg || '').includes('cancel')) {
        uni.showToast({ title: '扫码失败，请手动输入条码', icon: 'none' });
      }
    }
  });
};

const copyCode = (value) => {
  if (!value || value === '无') return;
  uni.setClipboardData({ data: String(value) });
};
</script>

<style lang="scss" scoped>
.function-page {
  min-height: 100vh;
  padding: 60rpx 28rpx 50rpx;
  background: #f3f7fd;
  box-sizing: border-box;
}

.top-tabs {
  display: flex;
  height: 88rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.04);
}

.top-tabs text {
  flex: 1;
  text-align: center;
  color: #64748b;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 88rpx;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s ease;
}

.top-tabs text.active {
  color: #2468e8;
  font-weight: 800;
  border-bottom-color: #2468e8;
}

.scan-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 420rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(30, 58, 138, 0.2);
}

.scan-frame {
  position: relative;
  width: 190rpx;
  height: 140rpx;
  border-top: 4rpx solid #60a5fa;
  border-bottom: 4rpx solid #60a5fa;
}

.scan-frame view {
  position: absolute;
  width: 32rpx;
  height: 32rpx;
  border-color: #fff;
}

.scan-frame view:nth-child(1) { left: -4rpx; top: -4rpx; border-left: 4rpx solid; border-top: 4rpx solid; }
.scan-frame view:nth-child(2) { right: -4rpx; top: -4rpx; border-right: 4rpx solid; border-top: 4rpx solid; }
.scan-frame view:nth-child(3) { left: -4rpx; bottom: -4rpx; border-left: 4rpx solid; border-bottom: 4rpx solid; }
.scan-frame view:nth-child(4) { right: -4rpx; bottom: -4rpx; border-right: 4rpx solid; border-bottom: 4rpx solid; }

.scan-panel > text {
  margin-top: 36rpx;
  color: rgba(255,255,255,.9);
  font-size: 28rpx;
}

.scan-panel button {
  height: 88rpx;
  margin: 28rpx 0 0;
  padding: 0 68rpx;
  border-radius: 44rpx;
  background: rgba(255,255,255,0.22);
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 88rpx;
  border: 1rpx solid rgba(255,255,255,0.35);
  box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.15);
  transition: all 0.2s ease;

  &:active {
    opacity: 0.85;
    transform: scale(0.97);
  }
}

.input-panel {
  padding: 40rpx 30rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.05);
}

.input-panel input {
  height: 104rpx;
  padding: 0 30rpx;
  border: 2rpx solid #e2e8f0;
  border-radius: 18rpx;
  font-size: 32rpx;
  color: #1e293b;
  background: #f8fafc;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #3b82f6;
    background: #fff;
  }
}

.placeholder {
  color: #94a3b8;
  font-size: 30rpx;
}

.primary-btn {
  height: 98rpx;
  margin: 36rpx 0 0;
  padding: 0;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 98rpx;
  box-shadow: 0 8rpx 22rpx rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.result-card {
  margin-top: 28rpx;
  padding: 30rpx 28rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.05);
}

.result-card__title {
  display: block;
  color: #1e293b;
  font-size: 30rpx;
  font-weight: 800;
  margin-bottom: 16rpx;
}

.product-info {
  display: flex;
  align-items: center;
  margin-top: 18rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f7f9fc;
}

.product-info image {
  width: 100rpx;
  height: 100rpx;
  margin-right: 16rpx;
}

.product-info text {
  display: block;
}

.product-info text:first-child {
  color: #17233d;
  font-size: 24rpx;
  font-weight: 800;
}

.product-info text:last-child {
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 20rpx;
}

.code-row {
  display: flex;
  align-items: center;
  min-height: 72rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.code-row text:first-child {
  width: 150rpx;
  color: #586477;
  font-size: 23rpx;
}

.code-row text:nth-child(2) {
  flex: 1;
  color: #17233d;
  font-size: 24rpx;
}

.code-row button {
  width: 76rpx;
  height: 42rpx;
  margin: 0;
  padding: 0;
  border-radius: 21rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 20rpx;
  line-height: 42rpx;
}

.tips {
  display: block;
  margin-top: 20rpx;
  color: #b0bac7;
  font-size: 21rpx;
  line-height: 32rpx;
  text-align: center;
}
</style>
