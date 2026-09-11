<template>
  <view class="design-page price-page">
    <AppWatermark />
    <AppNavbar title="价格与费用设置" />

    <view class="mode-tabs">
      <text :class="{ active: mode === 'discount' }" @click="mode = 'discount'">统一折扣率</text>
      <text :class="{ active: mode === 'total' }" @click="mode = 'total'">设置成交总价</text>
    </view>

    <!-- 设备价格与折扣卡片 -->
    <view class="price-card">
      <view class="total-line">
        <text>设备面价总计</text>
        <text class="num-bold">¥{{ money(productTotal) }}</text>
      </view>

      <!-- 统一折扣 -->
      <view v-if="mode === 'discount'" class="setting-box">
        <text>统一折扣率</text>
        <view class="stepper">
          <button class="step-btn" @click="discount = Math.max(1, discount - 1)">-</button>
          <text class="step-val">{{ discount }}%</text>
          <button class="step-btn" @click="discount = Math.min(100, discount + 1)">+</button>
        </view>
      </view>

      <!-- 设置自定义成交价 -->
      <view v-else class="setting-box">
        <view class="custom-label-wrap">
          <text>设备折后成交价</text>
          <text v-if="computedDiscountRate < 100" class="sub-rate">相当于 {{ computedDiscountRate }} 折</text>
        </view>
        <view class="input-inline">
          <text class="currency">¥</text>
          <input
            v-model="customGoodsTotal"
            type="digit"
            placeholder="输入折后总价"
            class="custom-input"
          />
        </view>
      </view>

      <view class="discount-line">
        <text>{{ mode === 'discount' ? '折扣让利' : '优惠让利' }}</text>
        <text class="discount-val">- ¥{{ money(discountAmount) }}</text>
      </view>
    </view>

    <!-- 安装与工程增项卡片 -->
    <view class="fee-card">
      <view class="fee-card__head">
        <text class="fee-head-txt">工程安装与增项</text>
        <text class="fee-head-sub">计入方案最终总价</text>
      </view>
      <view class="fee-row">
        <view class="fee-label-box">
          <text class="fee-label">安装费</text>
          <text class="fee-sub">安装人工及基础辅材</text>
        </view>
        <view class="fee-input-box">
          <text class="fee-symbol">¥</text>
          <input
            v-model="installFee"
            type="digit"
            placeholder="0.00"
            class="fee-input"
          />
        </view>
      </view>
      <view class="fee-row">
        <view class="fee-label-box">
          <text class="fee-label">增项费用</text>
          <text class="fee-sub">加长铜管、打孔打洞等</text>
        </view>
        <view class="fee-input-box">
          <text class="fee-symbol">¥</text>
          <input
            v-model="additionalFee"
            type="digit"
            placeholder="0.00"
            class="fee-input"
          />
        </view>
      </view>
    </view>

    <!-- 备注信息 -->
    <view class="remark-card">
      <view class="remark-head">
        <text>报价备注（选填）</text>
        <text class="count-txt">{{ (remark || '').length }}/100</text>
      </view>
      <textarea
        v-model="remark"
        maxlength="100"
        placeholder="可填写工期约定、付款条件或专属优惠等信息..."
        placeholder-class="placeholder"
        class="remark-textarea"
      />
    </view>

    <!-- 底部固定栏 -->
    <view class="bottom-bar">
      <view class="bottom-bar__left">
        <text class="b-label">方案最终报价</text>
        <text class="b-price">¥{{ money(finalTotal) }}</text>
        <text v-if="Number(installFee || 0) > 0 || Number(additionalFee || 0) > 0" class="b-breakdown">
          含设备 ¥{{ money(goodsDiscountedTotal) }} + 安装 ¥{{ money(installFee) }} + 增项 ¥{{ money(additionalFee) }}
        </text>
      </view>
      <button class="b-btn" @click="handleSaveAndShare">保存并查看</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import AppWatermark from '@/components/app-watermark.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { uiSolutions } from '@/mock/ui-fixtures';

const options = getPageOptions();
const draftKey = `solution_draft_${options.id || 1}`;
const cachedDraft = uni.getStorageSync(draftKey);
const baseSource = uiSolutions.find((item) => String(item.id) === String(options.id)) || uiSolutions[0];

const solution = reactive(
  cachedDraft
    ? { ...baseSource, ...cachedDraft }
    : {
        ...JSON.parse(JSON.stringify(baseSource)),
        install_fee: baseSource.install_fee !== undefined ? baseSource.install_fee : 0,
        additional_fee: baseSource.additional_fee !== undefined ? baseSource.additional_fee : 0
      }
);

const mode = ref('discount');
const discount = ref(solution.discount !== undefined ? solution.discount : 95);
const customGoodsTotal = ref(solution.custom_goods_total || '');
const installFee = ref(solution.install_fee !== undefined ? solution.install_fee : 0);
const additionalFee = ref(solution.additional_fee !== undefined ? solution.additional_fee : 0);
const remark = ref(solution.remark || '');

const productTotal = computed(() => {
  return (solution.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
});

const goodsDiscountedTotal = computed(() => {
  if (mode.value === 'discount') {
    return Math.round(productTotal.value * discount.value / 100);
  }
  const val = Number(customGoodsTotal.value);
  return !isNaN(val) && val > 0 ? val : productTotal.value;
});

const discountAmount = computed(() => {
  return Math.max(0, productTotal.value - goodsDiscountedTotal.value);
});

const computedDiscountRate = computed(() => {
  if (!productTotal.value) return 10;
  return ((goodsDiscountedTotal.value / productTotal.value) * 10).toFixed(1);
});

const finalTotal = computed(() => {
  return goodsDiscountedTotal.value + Number(installFee.value || 0) + Number(additionalFee.value || 0);
});

const money = (value) => Number(value || 0).toLocaleString();

const handleSaveAndShare = () => {
  solution.mode = mode.value;
  solution.discount = discount.value;
  solution.custom_goods_total = customGoodsTotal.value;
  solution.install_fee = Number(installFee.value || 0);
  solution.additional_fee = Number(additionalFee.value || 0);
  solution.remark = remark.value;
  solution.total = finalTotal.value;
  solution.goods_total = goodsDiscountedTotal.value;

  // 持久化到本地草稿缓存与 mock 源数据
  uni.setStorageSync(draftKey, JSON.parse(JSON.stringify(solution)));
  baseSource.install_fee = solution.install_fee;
  baseSource.additional_fee = solution.additional_fee;
  baseSource.total = solution.total;

  uni.showToast({ title: '价格设置已保存', icon: 'success' });
  setTimeout(() => {
    openPage('/pages/solution/share', { id: solution.id });
  }, 400);
};
</script>

<style lang="scss" scoped>
.price-page {
  padding: 0 24rpx 240rpx;
  background: #f4f7fc;
}

.mode-tabs {
  display: flex;
  height: 76rpx;
  padding: 6rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 14rpx rgba(23, 35, 61, 0.03);
}

.mode-tabs text {
  flex: 1;
  border-radius: 12rpx;
  color: #586477;
  font-size: 25rpx;
  line-height: 64rpx;
  text-align: center;
  transition: all 0.2s ease;
}

.mode-tabs text.active {
  background: #2468e8;
  color: #fff;
  font-weight: 800;
  box-shadow: 0 4rpx 12rpx rgba(36, 104, 232, 0.25);
}

.price-card,
.fee-card,
.remark-card {
  margin-bottom: 20rpx;
  padding: 24rpx 28rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.total-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #edf1f8;
  color: #586477;
  font-size: 26rpx;
}

.num-bold {
  color: #17233d;
  font-size: 30rpx;
  font-weight: 800;
}

.setting-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100rpx;
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
  border-bottom: 1rpx solid #edf1f8;
}

.custom-label-wrap {
  display: flex;
  flex-direction: column;
}

.sub-rate {
  font-size: 21rpx;
  color: #2468e8;
  font-weight: 600;
  margin-top: 4rpx;
}

.input-inline {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 0 16rpx;
  height: 64rpx;
}

.currency {
  color: #64748b;
  font-size: 24rpx;
  font-weight: 700;
  margin-right: 6rpx;
}

.custom-input {
  width: 180rpx;
  height: 60rpx;
  color: #0f172a;
  font-size: 26rpx;
  font-weight: 700;
  text-align: right;
}

.stepper {
  display: flex;
  align-items: center;
  border: 1rpx solid #dce4f0;
  border-radius: 10rpx;
  overflow: hidden;
  background: #fff;
}

.step-btn {
  width: 52rpx;
  height: 48rpx;
  margin: 0;
  padding: 0;
  background: #f5f8fd;
  color: #586477;
  font-size: 26rpx;
  line-height: 48rpx;
}

.step-val {
  width: 90rpx;
  color: #17233d;
  text-align: center;
  font-size: 25rpx;
  font-weight: 800;
}

.discount-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
  color: #586477;
  font-size: 24rpx;
}

.discount-val {
  color: #10b981;
  font-weight: 700;
}

.fee-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18rpx;
  border-bottom: 1rpx solid #edf1f8;
}

.fee-head-txt {
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
}

.fee-head-sub {
  color: #94a3b8;
  font-size: 22rpx;
}

.fee-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #edf1f8;
}

.fee-row:last-child {
  border-bottom: none;
  padding-bottom: 4rpx;
}

.fee-label-box {
  display: flex;
  flex-direction: column;
}

.fee-label {
  color: #17233d;
  font-size: 26rpx;
  font-weight: 700;
}

.fee-sub {
  color: #94a3b8;
  font-size: 21rpx;
  margin-top: 4rpx;
}

.fee-input-box {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 0 16rpx;
  height: 64rpx;
}

.fee-symbol {
  color: #64748b;
  font-size: 24rpx;
  font-weight: 700;
  margin-right: 6rpx;
}

.fee-input {
  width: 160rpx;
  height: 60rpx;
  color: #0f172a;
  font-size: 26rpx;
  font-weight: 700;
  text-align: right;
}

.remark-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #586477;
  font-size: 24rpx;
  margin-bottom: 14rpx;
}

.count-txt {
  color: #b0bac7;
  font-size: 22rpx;
}

.remark-textarea {
  width: 100%;
  height: 140rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  color: #17233d;
  font-size: 24rpx;
  box-sizing: border-box;
}

.placeholder {
  color: #b0bac7;
}

.bottom-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 28rpx;
  border-radius: 40rpx;
  background: #fff;
  box-shadow: 0 10rpx 32rpx rgba(23, 35, 61, 0.1);
}

.bottom-bar__left {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.b-label {
  color: #8b95a7;
  font-size: 22rpx;
}

.b-price {
  color: #ef543f;
  font-size: 36rpx;
  font-weight: 900;
  margin-top: 2rpx;
}

.b-breakdown {
  color: #94a3b8;
  font-size: 20rpx;
  margin-top: 2rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.b-btn {
  height: 72rpx;
  padding: 0 36rpx;
  border-radius: 36rpx;
  background: #2468e8;
  color: #fff;
  font-size: 26rpx;
  font-weight: 800;
  line-height: 72rpx;
  box-shadow: 0 6rpx 18rpx rgba(36, 104, 232, 0.35);
  flex-shrink: 0;
  margin-left: 20rpx;
}
</style>
