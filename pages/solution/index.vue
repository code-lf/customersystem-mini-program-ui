<template>
  <view class="quote-page">
    <view class="quote-header" :style="{ paddingTop: safeTop + 'px' }">
      <text class="quote-header-title">方案报价单</text>
    </view>

    <!-- 顶部大标签切换 -->
    <view class="tabs-card">
      <view
        class="tab-btn"
        :class="{ active: activeTab === 'current' }"
        @click="activeTab = 'current'"
      >
        <text>当前报价单 ({{ quoteItems.length }})</text>
      </view>
      <view
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        <text>历史报价记录 ({{ historySolutions.length }})</text>
      </view>
    </view>

    <!-- 当前报价单内容 -->
    <template v-if="activeTab === 'current'">
      <view v-if="quoteItems.length" class="quote-list">
        <view class="product-list-card">
          <view class="product-list-head">
            <text class="list-head-title">商品清单 ({{ quoteItems.length }} 款设备)</text>
            <view class="add-btn-small" @click="openAddPanel('search')">
              <up-icon name="plus" size="14" color="#2468e8" />
              <text>添加设备</text>
            </view>
          </view>

          <view v-for="item in quoteItems" :key="item.id" class="quote-product-row">
            <image class="quote-product-image" :src="item.image || '/static/aircon/outdoor-unit.png'" mode="aspectFit" />
            <view class="quote-product-info">
              <text class="quote-product-name">{{ item.name }}</text>
              <text class="quote-product-model">{{ item.model || item.type }}</text>
              <text class="quote-product-spec">{{ item.spec || (item.specs ? item.specs.slice(0, 2).join(' | ') : '一级能效 · 变频节能') }}</text>
              <view class="quote-product-price-row">
                <text class="price-symbol">¥</text>
                <text class="price-val">{{ formatPrice(item.price) }}</text>
                <text class="price-unit">/台</text>
              </view>
            </view>
            <view class="quote-product-actions">
              <view class="delete-icon-wrap" @click="removeItem(item.id)">
                <up-icon name="trash" size="18" color="#9aa5b5" />
              </view>
              <view class="custom-stepper">
                <button class="step-btn" @click="changeItemQty(item, -1)">-</button>
                <text class="step-num">{{ item.quantity }}</text>
                <button class="step-btn" @click="changeItemQty(item, 1)">+</button>
              </view>
            </view>
          </view>
        </view>

        <!-- 继续添加商品按钮 -->
        <button class="add-more-btn" @click="openAddPanel('search')">
          <up-icon name="plus-circle" size="16" color="#2468e8" />
          <text>继续添加空调设备 / 配件</text>
        </button>

        <view class="quote-tip">
          <up-icon name="info-circle" size="16" color="#2468e8" />
          <text>报价单先用于配置设备与数量。折扣率、税率和项目名称可在「导出报价」时统一核算生成方案。</text>
        </view>
      </view>

      <view v-else class="quote-empty-wrap">
        <up-icon name="shopping-cart" size="64" color="#b7c5d8" />
        <text class="empty-title">当前报价单暂无设备</text>
        <text class="empty-sub">您可以从产品中心、AI智能选型或点击下方按钮添加设备</text>
        <view class="empty-actions">
          <button class="empty-btn primary" @click="openAddPanel('search')">搜索添加设备</button>
          <button class="empty-btn outline" @click="openPage('/pages/product/category')">前往中央空调选型</button>
        </view>
      </view>
    </template>

    <!-- 历史报价单记录 -->
    <template v-else>
      <view class="history-container">
        <view
          v-for="sol in historySolutions"
          :key="sol.id"
          class="history-card"
          @click="openPage('/pages/solution/share', { id: sol.id })"
        >
          <view class="history-card-head">
            <text class="history-title">{{ sol.title }}</text>
            <text class="status-badge" :class="sol.status === 'shared' ? 'shared' : 'draft'">
              {{ sol.status === 'shared' ? '已分享客户' : '草稿方案' }}
            </text>
          </view>
          <text class="history-sub">{{ sol.subtitle }}</text>
          <view class="history-meta-row">
            <view class="history-count">包含 {{ (sol.items || []).length || sol.products }} 项设备</view>
            <view class="history-time">{{ sol.time }}</view>
          </view>
          <view class="history-footer">
            <view class="history-price-wrap">
              <text class="price-label">方案总价：</text>
              <text class="price-symbol">¥</text>
              <text class="price-num">{{ formatPrice(sol.total) }}</text>
            </view>
            <view class="history-btns">
              <button class="btn-history-edit" @click.stop="openPage('/pages/solution/edit', { id: sol.id })">编辑</button>
              <button class="btn-history-view" @click.stop="openPage('/pages/solution/share', { id: sol.id })">查看预览</button>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 底部固定面价合计与导出按钮 -->
    <view v-if="activeTab === 'current' && quoteItems.length" class="quote-footer">
      <view class="footer-left">
        <text class="footer-label">设备面价合计 (含税)</text>
        <view class="footer-price-row">
          <text class="footer-symbol">¥</text>
          <text class="footer-price">{{ formatPrice(totalPrice) }}</text>
          <text class="footer-count">· 共 {{ totalCount }} 台设备</text>
        </view>
      </view>
      <button class="export-main-btn" @click="showPricePanel = true">导出方案报价</button>
    </view>

    <!-- 导出报价单价格与折扣配置弹窗 -->
    <up-popup
      :show="showPricePanel"
      mode="bottom"
      round="20"
      close-on-click-overlay
      safe-area-inset-bottom
      @close="showPricePanel = false"
    >
      <view class="price-panel">
        <view class="price-panel__head">
          <view>
            <text class="popup-main-title">导出方案报价单</text>
            <text class="popup-sub-title">设置折扣率或总金额后，可生成精美方案分享给客户</text>
          </view>
          <view class="panel-close" @click="showPricePanel = false">
            <up-icon name="close" size="20" color="#8b95a7" />
          </view>
        </view>

        <!-- 折扣模式切换 -->
        <view class="pricing-mode-tabs">
          <view
            class="p-tab"
            :class="{ active: pricingMode === 'discount' }"
            @click="pricingMode = 'discount'"
          >
            <text>统一折扣率</text>
          </view>
          <view
            class="p-tab"
            :class="{ active: pricingMode === 'total' }"
            @click="pricingMode = 'total'"
          >
            <text>自定义一口价</text>
          </view>
        </view>

        <view class="price-form">
          <view class="form-row-summary">
            <text>设备面价总额 (含税)</text>
            <text class="val">¥{{ formatPrice(totalPrice) }}</text>
          </view>

          <!-- 统一折扣调节 -->
          <view v-if="pricingMode === 'discount'" class="form-section">
            <view class="setting-item">
              <text class="label">整单折扣率</text>
              <view class="discount-stepper">
                <button class="d-btn" @click="discountRate = Math.max(1, discountRate - 1)">-</button>
                <text class="d-val">{{ discountRate }}%</text>
                <button class="d-btn" @click="discountRate = Math.min(100, discountRate + 1)">+</button>
              </view>
            </view>
            <!-- 快捷折扣标签 -->
            <view class="quick-discount-chips">
              <view
                v-for="d in [95, 90, 88, 85, 80]"
                :key="d"
                class="d-chip"
                :class="{ active: discountRate === d }"
                @click="discountRate = d"
              >
                <text>{{ d }}折 ({{ d }}%)</text>
              </view>
            </view>
            <view class="setting-item">
              <text class="label">优惠减免金额</text>
              <text class="discount-val-text">- ¥{{ formatPrice(discountAmount) }}</text>
            </view>
          </view>

          <!-- 自定义一口价 -->
          <view v-else class="form-section">
            <view class="setting-item">
              <text class="label">方案成交总价</text>
              <input
                v-model="customTotalInput"
                type="digit"
                class="price-custom-input"
                placeholder="请输入客户最终报价"
              />
            </view>
            <view class="setting-item">
              <text class="label">相当于折扣</text>
              <text class="val-bold">{{ finalDiscount }}%</text>
            </view>
          </view>

          <!-- 税费与备注 -->
          <view class="form-section">
            <view class="setting-item">
              <text class="label">增值税专用发票</text>
              <text class="val-sub">13% (已含税)</text>
            </view>
            <view class="remark-box">
              <text class="label">报价备注 (选填)</text>
              <input
                v-model="quoteRemark"
                class="remark-input"
                placeholder="例如：含安装与铜管辅材费用、质保六年等..."
              />
            </view>
          </view>

          <!-- 最终核算价格 -->
          <view class="final-price-box">
            <text class="f-label">方案最终报价 (含税)</text>
            <text class="f-price">¥{{ formatPrice(finalTotal) }}</text>
          </view>
        </view>

        <button class="confirm-export-btn" @click="exportQuote">生成客户预览报价单</button>
      </view>
    </up-popup>

    <!-- 添加设备弹窗 (搜索 / 选型) -->
    <up-popup
      :show="showAddPanel"
      mode="bottom"
      round="24"
      close-on-click-overlay
      safe-area-inset-bottom
      @close="showAddPanel = false"
    >
      <view class="add-panel">
        <view class="panel-head">
          <view class="panel-head-left">
            <view class="panel-title-row">
              <text class="popup-main-title">添加空调设备到报价单</text>
              <text class="count-tag">已选 {{ quoteItems.length }} 款</text>
            </view>
            <text class="popup-sub-title">已选设备面价总额：¥{{ formatPrice(totalPrice) }}</text>
          </view>
          <view class="panel-close-btn" @click="showAddPanel = false">
            <up-icon name="close" size="18" color="#647389" />
          </view>
        </view>

        <!-- 弹窗搜索框 -->
        <view class="panel-search-wrap">
          <view class="panel-search-bar">
            <up-icon name="search" size="20" color="#9aa5b5" />
            <input
              v-model="addSearchKeyword"
              placeholder="搜索设备型号 (如 VK8R, VM, 室内机)..."
              placeholder-class="placeholder"
            />
            <up-icon
              v-if="addSearchKeyword"
              name="close-circle-fill"
              size="18"
              color="#9aa5b5"
              @click="addSearchKeyword = ''"
            />
          </view>
        </view>

        <!-- 候选商品列表 -->
        <scroll-view class="panel-product-list" scroll-y>
          <view
            v-for="item in candidateProducts"
            :key="item.id"
            class="panel-product-item"
          >
            <image class="panel-p-img" :src="item.image" mode="aspectFit" />
            <view class="panel-p-info">
              <view class="panel-p-model-row">
                <text class="panel-p-model">{{ item.model }}</text>
                <text v-if="item.series" class="panel-p-series">{{ item.series }}</text>
              </view>
              <text class="panel-p-name">{{ item.name }}</text>
              <text class="panel-p-spec">{{ (item.specs || []).slice(0, 2).join(' | ') }}</text>
              <text class="panel-p-price">¥{{ formatPrice(item.price) }}</text>
            </view>
            <button class="panel-btn-add" @click="addProductToQuote(item)">+ 加入</button>
          </view>
        </scroll-view>
      </view>
    </up-popup>
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { openPage } from '@/utils/pages';
import { uiProducts, uiSolutions } from '@/mock/ui-fixtures';

const safeTop = computed(() => {
  try {
    const windowInfo = typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : {};
    const systemInfo = typeof uni.getSystemInfoSync === 'function' ? uni.getSystemInfoSync() : {};
    return windowInfo.statusBarHeight || systemInfo.statusBarHeight || 20;
  } catch (error) {
    return 20;
  }
});

const activeTab = ref('current');
const showAddPanel = ref(false);
const showPricePanel = ref(false);
const addSearchKeyword = ref('');
const pricingMode = ref('discount');
const discountRate = ref(95);
const customTotalInput = ref('');
const taxRate = ref(13);
const quoteRemark = ref('');

// 默认真实暖通报价条目
const quoteItems = reactive([
  {
    id: 101,
    model: 'VK8R',
    name: 'VK8R 多联式空调室外机',
    spec: '8HP · 25.2kW · IPLV(C) 6.50',
    price: 26800,
    quantity: 2,
    image: '/static/aircon/outdoor-unit.png'
  },
  {
    id: 109,
    model: 'VK-IN36',
    name: 'VK系列 静音超薄风管室内机',
    spec: '1.5匹 · 3.6kW · 超薄190mm',
    price: 3600,
    quantity: 6,
    image: '/static/aircon/home-green.png'
  },
  {
    id: 111,
    model: 'XF-800',
    name: '全热交换新风处理机组',
    spec: '800m³/h风量 · PM2.5双向流',
    price: 8900,
    quantity: 1,
    image: '/static/aircon/central-default.png'
  }
]);

const historySolutions = reactive(JSON.parse(JSON.stringify(uiSolutions)));

const candidateProducts = computed(() => {
  if (!addSearchKeyword.value.trim()) return uiProducts;
  const kw = addSearchKeyword.value.trim().toLowerCase();
  return uiProducts.filter((p) => `${p.model} ${p.name} ${p.series || ''} ${p.subCategory || ''}`.toLowerCase().includes(kw));
});

const totalPrice = computed(() => quoteItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0));
const totalCount = computed(() => quoteItems.reduce((sum, item) => sum + (item.quantity || 1), 0));

const finalTotal = computed(() => {
  if (pricingMode.value === 'total') {
    const inputTotal = Number(customTotalInput.value || 0);
    return inputTotal > 0 ? inputTotal : totalPrice.value;
  }
  return Math.round(totalPrice.value * discountRate.value / 100);
});

const finalDiscount = computed(() => {
  if (!totalPrice.value) return 100;
  return Math.round(finalTotal.value / totalPrice.value * 10000) / 100;
});

const discountAmount = computed(() => Math.max(totalPrice.value - finalTotal.value, 0));

const formatPrice = (val) => Number(val || 0).toLocaleString();

const changeItemQty = (item, delta) => {
  item.quantity = Math.max(1, Number(item.quantity || 1) + delta);
};

const removeItem = (id) => {
  const idx = quoteItems.findIndex((item) => item.id === id);
  if (idx >= 0) {
    quoteItems.splice(idx, 1);
    uni.showToast({ title: '已移除设备', icon: 'none' });
  }
};

const openAddPanel = (mode = 'search') => {
  addSearchKeyword.value = '';
  showAddPanel.value = true;
};

const addProductToQuote = (product) => {
  const existed = quoteItems.find((item) => item.model === product.model || item.id === product.id);
  if (existed) {
    existed.quantity += 1;
  } else {
    quoteItems.push({
      id: product.id || Date.now(),
      model: product.model,
      name: product.name,
      spec: Array.isArray(product.specs) ? product.specs.slice(0, 2).join(' · ') : product.name,
      price: product.price,
      quantity: 1,
      image: product.image || '/static/aircon/outdoor-unit.png'
    });
  }
  uni.showToast({ title: `已加入 ${product.model}`, icon: 'success' });
};

const exportQuote = () => {
  uni.setStorageSync('quoteExportSetting', {
    pricingMode: pricingMode.value,
    discountRate: finalDiscount.value,
    totalPrice: finalTotal.value,
    taxRate: taxRate.value,
    remark: quoteRemark.value,
    items: quoteItems
  });
  showPricePanel.value = false;
  openPage('/pages/solution/share', { id: 1 });
};

// 当从其他页面（如产品详情、产品列表、AI推荐）点击“加入报价单”时，自动同步
const checkPendingProduct = () => {
  try {
    const pending = uni.getStorageSync('pendingSolutionProduct');
    if (pending && pending.name) {
      addProductToQuote(pending);
      uni.removeStorageSync('pendingSolutionProduct');
    }
  } catch (e) {
    // ignore
  }
};

onMounted(() => {
  checkPendingProduct();
});

onShow(() => {
  checkPendingProduct();
});
</script>

<style lang="scss" scoped>
.quote-page {
  min-height: 100vh;
  padding-bottom: 220rpx;
  background: linear-gradient(180deg, #d2e4ff 0%, #e8f1fd 280rpx, #f4f7fc 500rpx, #f4f7fc 100%);
}

.quote-header {
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 28rpx;
}

.quote-header-title {
  color: #15223a;
  font-size: 36rpx;
  font-weight: 900;
  letter-spacing: 0.5rpx;
}

.tabs-card {
  display: flex;
  margin: 0 24rpx 18rpx;
  padding: 8rpx;
  border-radius: 22rpx;
  background: #e5edf8;
}

.tab-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  color: #586882;
  font-size: 27rpx;
  font-weight: 700;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #fff;
  color: #2468e8;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.08);
}

.quote-list {
  padding: 0 24rpx;
}

.product-list-card {
  overflow: hidden;
  border-radius: 22rpx;
  background: #fff;
  box-shadow: 0 8rpx 28rpx rgba(23, 35, 61, 0.04);
}

.product-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84rpx;
  padding: 0 26rpx;
  border-bottom: 1rpx solid #edf1f8;
}

.list-head-title {
  color: #17233d;
  font-size: 29rpx;
  font-weight: 900;
}

.add-btn-small {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 22rpx;
  border-radius: 26rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 800;
}

.quote-product-row {
  display: flex;
  align-items: center;
  padding: 24rpx 26rpx;
  border-bottom: 1rpx solid #edf1f8;
}

.quote-product-row:last-child {
  border-bottom: none;
}

.quote-product-image {
  width: 130rpx;
  height: 130rpx;
  margin-right: 22rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
  flex-shrink: 0;
}

.quote-product-info {
  flex: 1;
  min-width: 0;
}

.quote-product-name {
  display: block;
  color: #17233d;
  font-size: 29rpx;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quote-product-model {
  display: block;
  margin-top: 4rpx;
  color: #2468e8;
  font-size: 25rpx;
  font-weight: 700;
}

.quote-product-spec {
  display: block;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 23rpx;
}

.quote-product-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 8rpx;
  color: #ef543f;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: 700;
}

.price-val {
  font-size: 32rpx;
  font-weight: 900;
  margin-left: 2rpx;
}

.price-unit {
  color: #8b95a7;
  font-size: 22rpx;
  margin-left: 4rpx;
}

.quote-product-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 114rpx;
  margin-left: 16rpx;
}

.delete-icon-wrap {
  padding: 6rpx 8rpx;
}

.custom-stepper {
  display: flex;
  align-items: center;
  border: 1rpx solid #dce4f0;
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
}

.step-btn {
  width: 54rpx;
  height: 50rpx;
  margin: 0;
  padding: 0;
  background: #f5f8fd;
  color: #586477;
  font-size: 30rpx;
  line-height: 50rpx;
  border-radius: 0;
}

.step-num {
  width: 56rpx;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 700;
  text-align: center;
}

.add-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 84rpx;
  margin: 20rpx 0 16rpx;
  border-radius: 20rpx;
  border: 2rpx dashed #bcd3fa;
  background: #edf4ff;
  color: #2468e8;
  font-size: 27rpx;
  font-weight: 800;
}

.quote-tip {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.03);
}

.quote-tip text {
  flex: 1;
  color: #6a788f;
  font-size: 24rpx;
  line-height: 1.5;
}

.quote-empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-title {
  margin-top: 24rpx;
  color: #17233d;
  font-size: 32rpx;
  font-weight: 800;
}

.empty-sub {
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 25rpx;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.empty-btn {
  height: 76rpx;
  padding: 0 32rpx;
  border-radius: 38rpx;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 76rpx;
}

.empty-btn.primary {
  background: #2468e8;
  color: #fff;
}

.empty-btn.outline {
  border: 1rpx solid #2468e8;
  background: #fff;
  color: #2468e8;
}

/* 历史记录 */
.history-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 0 24rpx;
}

.history-card {
  padding: 24rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.history-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-title {
  color: #17233d;
  font-size: 30rpx;
  font-weight: 800;
}

.status-badge {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.status-badge.shared {
  background: #e9f8f0;
  color: #2fa777;
}

.status-badge.draft {
  background: #edf4ff;
  color: #2468e8;
}

.history-sub {
  display: block;
  margin-top: 8rpx;
  color: #647389;
  font-size: 24rpx;
}

.history-meta-row {
  display: flex;
  justify-content: space-between;
  margin-top: 14rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.history-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f1f4f9;
}

.history-price-wrap {
  display: flex;
  align-items: baseline;
}

.price-label {
  color: #8b95a7;
  font-size: 24rpx;
}

.price-num {
  color: #ef543f;
  font-size: 34rpx;
  font-weight: 900;
  margin-left: 2rpx;
}

.history-btns {
  display: flex;
  gap: 12rpx;
}

.btn-history-edit {
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
  background: #f1f4f9;
  color: #586477;
  font-size: 24rpx;
  line-height: 56rpx;
}

.btn-history-view {
  height: 56rpx;
  padding: 0 26rpx;
  border-radius: 28rpx;
  background: #2468e8;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 56rpx;
}

/* 底部操作条 */
.quote-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--window-bottom, 0);
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -6rpx 24rpx rgba(23, 35, 61, 0.06);
}

.footer-left {
  flex: 1;
}

.footer-label {
  display: block;
  color: #8b95a7;
  font-size: 22rpx;
}

.footer-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 4rpx;
}

.footer-symbol {
  color: #ef543f;
  font-size: 24rpx;
  font-weight: 700;
}

.footer-price {
  color: #ef543f;
  font-size: 38rpx;
  font-weight: 900;
  margin-left: 2rpx;
}

.footer-count {
  color: #8b95a7;
  font-size: 22rpx;
  margin-left: 10rpx;
}

.export-main-btn {
  height: 80rpx;
  padding: 0 36rpx;
  border-radius: 40rpx;
  background: #2468e8;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 80rpx;
  box-shadow: 0 8rpx 22rpx rgba(36, 104, 232, 0.35);
}

/* 导出价格配置弹窗 */
.price-panel {
  padding: 24rpx 28rpx 36rpx;
  background: #fff;
}

.price-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20rpx;
}

.popup-main-title {
  display: block;
  color: #17233d;
  font-size: 34rpx;
  font-weight: 900;
}

.popup-sub-title {
  display: block;
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 24rpx;
}

.pricing-mode-tabs {
  display: flex;
  margin-top: 14rpx;
  padding: 6rpx;
  border-radius: 16rpx;
  background: #edf3fb;
}

.p-tab {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  color: #647389;
  font-size: 26rpx;
  font-weight: 700;
}

.p-tab.active {
  background: #fff;
  color: #2468e8;
  box-shadow: 0 2rpx 10rpx rgba(23, 35, 61, 0.08);
}

.price-form {
  margin-top: 18rpx;
}

.form-row-summary {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  color: #647389;
  font-size: 26rpx;
}

.form-row-summary .val {
  color: #17233d;
  font-weight: 800;
}

.form-section {
  margin-top: 16rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 68rpx;
}

.setting-item .label {
  color: #586477;
  font-size: 26rpx;
}

.discount-stepper {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #dce4f0;
}

.d-btn {
  width: 58rpx;
  height: 52rpx;
  margin: 0;
  padding: 0;
  background: #f5f8fd;
  color: #586477;
  font-size: 28rpx;
  line-height: 52rpx;
}

.d-val {
  width: 76rpx;
  text-align: center;
  color: #2468e8;
  font-size: 26rpx;
  font-weight: 800;
}

.quick-discount-chips {
  display: flex;
  gap: 12rpx;
  margin: 14rpx 0 10rpx;
}

.d-chip {
  flex: 1;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  background: #fff;
  color: #647389;
  font-size: 22rpx;
  border: 1rpx solid #e1e7f0;
}

.d-chip.active {
  background: #edf4ff;
  color: #2468e8;
  font-weight: 700;
  border-color: #2468e8;
}

.discount-val-text {
  color: #ef543f;
  font-size: 26rpx;
  font-weight: 800;
}

.price-custom-input {
  width: 280rpx;
  height: 60rpx;
  padding: 0 16rpx;
  text-align: right;
  border-radius: 10rpx;
  background: #fff;
  color: #17233d;
  font-size: 28rpx;
  font-weight: 800;
  border: 1rpx solid #dce4f0;
}

.val-bold {
  color: #2468e8;
  font-size: 28rpx;
  font-weight: 900;
}

.val-sub {
  color: #647389;
  font-size: 25rpx;
}

.remark-box {
  margin-top: 12rpx;
}

.remark-box .label {
  display: block;
  color: #586477;
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.remark-input {
  height: 64rpx;
  padding: 0 18rpx;
  border-radius: 12rpx;
  background: #fff;
  font-size: 24rpx;
  color: #17233d;
  border: 1rpx solid #dce4f0;
}

.final-price-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: #fff0ed;
}

.f-label {
  color: #ef543f;
  font-size: 26rpx;
  font-weight: 700;
}

.f-price {
  color: #ef543f;
  font-size: 40rpx;
  font-weight: 900;
}

.confirm-export-btn {
  height: 84rpx;
  margin-top: 28rpx;
  border-radius: 42rpx;
  background: #2468e8;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 84rpx;
  box-shadow: 0 8rpx 24rpx rgba(36, 104, 232, 0.35);
}

/* 弹窗添加设备 */
.add-panel {
  max-height: 80vh;
  padding: 28rpx 30rpx 40rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 22rpx;
  border-bottom: 1rpx solid #edf1f8;
}

.panel-head-left {
  flex: 1;
  min-width: 0;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.count-tag {
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
}

.panel-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f1f4f9;
  margin-left: 16rpx;
  flex-shrink: 0;
}

.panel-search-wrap {
  margin: 22rpx 0 16rpx;
}

.panel-search-bar {
  display: flex;
  align-items: center;
  height: 76rpx;
  padding: 0 24rpx;
  border-radius: 38rpx;
  background: #f4f7fc;
  border: 1rpx solid #e2ebf7;
}

.panel-search-bar input {
  flex: 1;
  margin-left: 14rpx;
  font-size: 26rpx;
  color: #17233d;
}

.panel-product-list {
  max-height: 620rpx;
  overflow-y: auto;
}

.panel-product-item {
  display: flex;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #edf1f8;
}

.panel-p-img {
  width: 124rpx;
  height: 124rpx;
  margin-right: 20rpx;
  border-radius: 14rpx;
  background: #f7f9fc;
  flex-shrink: 0;
}

.panel-p-info {
  flex: 1;
  min-width: 0;
}

.panel-p-model-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.panel-p-model {
  color: #17233d;
  font-size: 29rpx;
  font-weight: 900;
}

.panel-p-series {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
}

.panel-p-name {
  display: block;
  margin-top: 4rpx;
  color: #556275;
  font-size: 25rpx;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-p-spec {
  display: block;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 23rpx;
}

.panel-p-price {
  display: block;
  margin-top: 6rpx;
  color: #ef543f;
  font-size: 30rpx;
  font-weight: 900;
}

.panel-btn-add {
  height: 58rpx;
  padding: 0 28rpx;
  margin: 0 0 0 16rpx;
  border-radius: 29rpx;
  background: #2468e8;
  color: #fff;
  font-size: 25rpx;
  font-weight: 800;
  line-height: 58rpx;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.25);
  flex-shrink: 0;
}
</style>
