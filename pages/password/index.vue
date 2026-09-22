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
  padding: 0 24rpx 36rpx;
  background: #f3f7fd;
}

.top-tabs {
  display: flex;
  height: 72rpx;
  border-radius: 12rpx;
  background: #fff;
  margin-bottom: 18rpx;
}

.top-tabs text {
  flex: 1;
  text-align: center;
  color: #667286;
  font-size: 25rpx;
  line-height: 72rpx;
  border-bottom: 4rpx solid transparent;
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
  height: 292rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #314c76, #172b4d);
  color: #fff;
}

.scan-frame {
  position: relative;
  width: 155rpx;
  height: 112rpx;
  border-top: 4rpx solid #5aa7ff;
  border-bottom: 4rpx solid #5aa7ff;
}

.scan-frame view {
  position: absolute;
  width: 28rpx;
  height: 28rpx;
  border-color: #fff;
}

.scan-frame view:nth-child(1) { left: -4rpx; top: -4rpx; border-left: 4rpx solid; border-top: 4rpx solid; }
.scan-frame view:nth-child(2) { right: -4rpx; top: -4rpx; border-right: 4rpx solid; border-top: 4rpx solid; }
.scan-frame view:nth-child(3) { left: -4rpx; bottom: -4rpx; border-left: 4rpx solid; border-bottom: 4rpx solid; }
.scan-frame view:nth-child(4) { right: -4rpx; bottom: -4rpx; border-right: 4rpx solid; border-bottom: 4rpx solid; }

.scan-panel > text {
  margin-top: 34rpx;
  color: rgba(255,255,255,.9);
  font-size: 23rpx;
}

.scan-panel button {
  height: 40rpx;
  margin: 18rpx 0 0;
  padding: 0 22rpx;
  border-radius: 20rpx;
  background: rgba(255,255,255,.14);
  color: #fff;
  font-size: 20rpx;
  line-height: 40rpx;
}

.input-panel {
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
}

.input-panel input {
  height: 80rpx;
  padding: 0 24rpx;
  border: 1rpx solid #edf0f5;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #17233d;
}

.placeholder {
  color: #b0bac7;
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

.result-card {
  margin-top: 18rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
}

.result-card__title {
  display: block;
  color: #17233d;
  font-size: 27rpx;
  font-weight: 900;
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
