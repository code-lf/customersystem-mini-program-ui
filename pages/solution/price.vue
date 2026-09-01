<template>
  <view class="design-page price-page">
    <AppNavbar title="价格核算与方案生成" />

    <!-- 方案基本信息 -->
    <view class="card form-card">
      <view class="card-head">
        <text class="card-title">方案基本信息</text>
      </view>

      <view class="form-item">
        <text class="form-label">方案/项目名称</text>
        <input v-model="form.title" class="form-input" placeholder="例如：杭州·未来科技大厦多联机方案" />
      </view>

      <view class="form-item">
        <text class="form-label">客户名称</text>
        <input v-model="form.customerName" class="form-input" placeholder="请输入客户或单位名称" />
      </view>

      <view class="form-item">
        <text class="form-label">客户联系电话</text>
        <input v-model="form.contactPhone" class="form-input" type="number" placeholder="选填，便于方案联系" />
      </view>
    </view>

    <!-- 价格核算模式 -->
    <view class="card pricing-card">
      <view class="card-head">
        <text class="card-title">价格核算模式</text>
      </view>

      <view class="mode-tabs">
        <view
          class="mode-tab"
          :class="{ active: form.pricingMode === 'discount' }"
          @click="form.pricingMode = 'discount'"
        >
          <text>整单折扣模式</text>
        </view>
        <view
          class="mode-tab"
          :class="{ active: form.pricingMode === 'total' }"
          @click="form.pricingMode = 'total'"
        >
          <text>指定总价模式</text>
        </view>
      </view>

      <view v-if="form.pricingMode === 'discount'" class="discount-section">
        <view class="discount-header">
          <text class="label">方案折扣率</text>
          <text class="val">{{ form.discount }}% 折扣</text>
        </view>
        <view class="quick-discounts">
          <button
            v-for="d in [100, 95, 90, 85, 80]"
            :key="d"
            class="discount-pill"
            :class="{ selected: form.discount === d }"
            @click="form.discount = d"
          >
            {{ d === 100 ? '原价(无折)' : d + '折' }}
          </button>
        </view>
      </view>

      <view v-else class="custom-total-section">
        <text class="label">最终整单总价 (¥)</text>
        <input v-model.number="form.customTotal" type="digit" class="form-input custom-price-input" placeholder="请输入客户最终核算总额" />
      </view>

      <!-- 附加费用 -->
      <view class="extra-fees">
        <view class="fee-row">
          <text class="fee-label">辅材及辅料费 (¥)</text>
          <input v-model.number="form.extraAmount" type="digit" class="fee-input" placeholder="0" />
        </view>
        <view class="fee-row">
          <text class="fee-label">安装调试与运费 (¥)</text>
          <input v-model.number="form.installAmount" type="digit" class="fee-input" placeholder="0" />
        </view>
      </view>
    </view>

    <!-- 方案备注 -->
    <view class="card remark-card">
      <view class="card-head">
        <text class="card-title">方案备注及说明</text>
      </view>
      <textarea
        v-model="form.remark"
        class="remark-textarea"
        placeholder="请输入方案施工工期、包含的保修期、付款方式等备注..."
        maxlength="200"
      />
    </view>

    <!-- 价格明细汇总卡 -->
    <view class="card summary-card">
      <view class="summary-line">
        <text class="lbl">设备面价合计：</text>
        <text class="val">¥{{ money(productTotal) }}</text>
      </view>
      <view v-if="discountAmount > 0" class="summary-line discount-line">
        <text class="lbl">折扣优惠减免：</text>
        <text class="val">- ¥{{ money(discountAmount) }}</text>
      </view>
      <view v-if="extraTotal > 0" class="summary-line">
        <text class="lbl">附加费用合计：</text>
        <text class="val">+ ¥{{ money(extraTotal) }}</text>
      </view>
      <view class="divider" />
      <view class="summary-final-row">
        <text class="final-lbl">方案核算总额：</text>
        <view class="final-price-box">
          <text class="symbol">¥</text>
          <text class="price">{{ money(finalTotal) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <button class="btn btn-outline" @click="goBack">返回修改设备</button>
      <button class="btn btn-primary" @click="saveAndPreview">生成报价单预览</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage, replacePage } from '@/utils/pages';
import { uiSolutions } from '@/mock/ui-fixtures';
import { state as mockState } from '@/mock/index';

const options = getPageOptions();
const solutionId = options.id || options.quote_id || 1;

const form = reactive({
  id: solutionId,
  title: '空调暖通方案报价单',
  customerName: '未来科技大厦',
  contactPhone: '',
  projectName: '',
  pricingMode: 'discount',
  discount: 95,
  customTotal: 0,
  extraAmount: 0,
  installAmount: 0,
  remark: '本报价包含原厂设备提供、正品发票及标准质保服务。',
  items: []
});

const money = (value) => Number(value || 0).toLocaleString();

// 加载当前报价单已有商品与信息
onMounted(() => {
  let found = null;
  if (mockState && mockState.solutions) {
    found = mockState.solutions.find((s) => String(s.id) === String(solutionId));
  }
  if (!found) {
    found = uiSolutions.find((s) => String(s.id) === String(solutionId)) || uiSolutions[0];
  }

  if (found) {
    form.title = found.title || found.projectName || form.title;
    form.customerName = found.customerName || form.customerName;
    form.discount = found.discount || 95;
    form.pricingMode = found.pricingMode || 'discount';
    form.remark = found.remark || form.remark;
    form.items = found.items || [];
  }
});

const productTotal = computed(() => {
  return (form.items || []).reduce((sum, item) => {
    const p = Number(item.price ?? item.unitPrice ?? 0);
    const q = Number(item.quantity ?? 1);
    return sum + p * q;
  }, 0);
});

const extraTotal = computed(() => {
  return (Number(form.extraAmount) || 0) + (Number(form.installAmount) || 0);
});

const discountAmount = computed(() => {
  if (form.pricingMode === 'discount') {
    const rate = Math.max(0, Math.min(100, Number(form.discount) || 100));
    return Math.round(productTotal.value * (100 - rate) / 100);
  }
  return Math.max(0, productTotal.value - (Number(form.customTotal) || 0));
});

const finalTotal = computed(() => {
  if (form.pricingMode === 'discount') {
    const rate = Math.max(0, Math.min(100, Number(form.discount) || 100));
    return Math.round(productTotal.value * rate / 100) + extraTotal.value;
  }
  return (Number(form.customTotal) || productTotal.value) + extraTotal.value;
});

const goBack = () => {
  uni.navigateBack({
    fail: () => {
      openPage('/pages/solution/edit', { id: solutionId });
    }
  });
};

const saveAndPreview = () => {
  const payload = {
    id: solutionId,
    title: form.title.trim() || '空调暖通方案报价单',
    customerName: form.customerName.trim(),
    contact_name_snapshot: form.customerName.trim(),
    contact_mobile_snapshot: form.contactPhone.trim(),
    pricingMode: form.pricingMode,
    discount: form.discount,
    discount_rate: form.discount,
    productTotal: productTotal.value,
    goods_amount: productTotal.value,
    discount_amount: discountAmount.value,
    extra_amount: extraTotal.value,
    totalPrice: finalTotal.value,
    pay_amount: finalTotal.value,
    remark: form.remark,
    items: form.items,
    status: 'shared',
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };

  // 同步保存至 mockState 与 本地历史记录
  if (mockState && mockState.solutions) {
    const idx = mockState.solutions.findIndex((s) => String(s.id) === String(solutionId));
    if (idx >= 0) mockState.solutions[idx] = { ...mockState.solutions[idx], ...payload };
    else mockState.solutions.unshift(payload);
  }

  const localHistory = uni.getStorageSync('solution_history_records') || [];
  const historyIdx = localHistory.findIndex((s) => String(s.id) === String(solutionId));
  if (historyIdx >= 0) localHistory[historyIdx] = payload;
  else localHistory.unshift(payload);
  uni.setStorageSync('solution_history_records', localHistory);

  uni.showToast({ title: '报价核算完成', icon: 'success' });
  setTimeout(() => {
    openPage('/pages/solution/share', { id: solutionId });
  }, 400);
};
</script>

<style lang="scss" scoped>
.price-page {
  min-height: 100vh;
  padding: 0 24rpx 180rpx;
  background: #f4f7fc;
}

.card {
  border-radius: 20rpx;
  background: #fff;
  padding: 24rpx 28rpx;
  margin-top: 18rpx;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.04);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.card-title {
  color: #17233d;
  font-size: 30rpx;
  font-weight: 800;
}

.form-item {
  margin-bottom: 18rpx;
}

.form-label {
  display: block;
  color: #586477;
  font-size: 24rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.form-input {
  box-sizing: border-box;
  width: 100%;
  height: 74rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  border: 1rpx solid #dce4f0;
  background: #fff;
  color: #17233d;
  font-size: 26rpx;
}

.mode-tabs {
  display: flex;
  border-radius: 14rpx;
  background: #f1f4f9;
  padding: 6rpx;
  margin-bottom: 22rpx;
}

.mode-tab {
  flex: 1;
  text-align: center;
  padding: 14rpx 0;
  border-radius: 10rpx;
  color: #586477;
  font-size: 25rpx;
  font-weight: 600;
  transition: all 0.2s ease;
}

.mode-tab.active {
  background: #fff;
  color: #2468e8;
  font-weight: 800;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.discount-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.discount-header .label {
  color: #586477;
  font-size: 26rpx;
}

.discount-header .val {
  color: #2468e8;
  font-size: 28rpx;
  font-weight: 800;
}

.quick-discounts {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.discount-pill {
  flex: 1;
  height: 60rpx;
  padding: 0;
  margin: 0;
  border-radius: 12rpx;
  background: #f4f7fc;
  color: #586477;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 60rpx;
  border: 1rpx solid #e2e8f0;
}

.discount-pill.selected {
  background: #edf4ff;
  color: #2468e8;
  border-color: #2468e8;
  font-weight: 800;
}

.extra-fees {
  border-top: 1rpx solid #edf1f8;
  padding-top: 18rpx;
  margin-top: 18rpx;
}

.fee-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.fee-label {
  color: #586477;
  font-size: 24rpx;
}

.fee-input {
  width: 200rpx;
  height: 64rpx;
  padding: 0 16rpx;
  text-align: right;
  border-radius: 10rpx;
  border: 1rpx solid #dce4f0;
  color: #17233d;
  font-size: 26rpx;
}

.remark-textarea {
  box-sizing: border-box;
  width: 100%;
  height: 140rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  border: 1rpx solid #dce4f0;
  color: #17233d;
  font-size: 25rpx;
}

.summary-card {
  background: #f8fafc;
  border: 1rpx solid #eef3fa;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 24rpx;
}

.summary-line .lbl {
  color: #8b95a7;
}

.summary-line .val {
  color: #17233d;
  font-weight: 700;
}

.summary-line.discount-line .val {
  color: #ef543f;
}

.divider {
  height: 1rpx;
  background: #e2e8f0;
  margin: 16rpx 0;
}

.summary-final-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.final-lbl {
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
}

.final-price-box {
  display: flex;
  align-items: baseline;
  color: #ef543f;
}

.final-price-box .symbol {
  font-size: 28rpx;
  font-weight: 800;
  margin-right: 4rpx;
}

.final-price-box .price {
  font-size: 44rpx;
  font-weight: 900;
}

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(23, 35, 61, 0.08);
  display: flex;
  gap: 20rpx;
  z-index: 50;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 800;
  line-height: 80rpx;
  text-align: center;
}

.btn-outline {
  background: #f1f4f9;
  color: #586477;
  border: 1rpx solid #dce4f0;
}

.btn-primary {
  background: #2468e8;
  color: #fff;
  box-shadow: 0 6rpx 20rpx rgba(36, 104, 232, 0.35);
}
</style>
