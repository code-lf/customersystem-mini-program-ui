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
      <view v-if="isLoading" class="quote-list">
        <view class="product-list-card">
          <view class="product-list-head" style="border-bottom: none;">
            <view class="skeleton-block" style="width: 200rpx; height: 32rpx; border-radius: 8rpx;"></view>
          </view>
          <view v-for="i in 3" :key="i" class="quote-product-row" style="border-bottom: 1rpx solid #f1f5f9;">
            <view class="skeleton-block" style="width: 140rpx; height: 140rpx; border-radius: 12rpx; margin-right: 20rpx;"></view>
            <view style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
              <view class="skeleton-block" style="width: 80%; height: 28rpx; margin-bottom: 12rpx; border-radius: 6rpx;"></view>
              <view class="skeleton-block" style="width: 60%; height: 24rpx; margin-bottom: 12rpx; border-radius: 6rpx;"></view>
              <view class="skeleton-block" style="width: 40%; height: 36rpx; border-radius: 6rpx;"></view>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="quoteItems.length" class="quote-list">
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
      <view v-if="isLoading" class="history-container">
        <view v-for="i in 3" :key="i" class="history-card">
          <view style="display: flex; justify-content: space-between; margin-bottom: 16rpx;">
            <view class="skeleton-block" style="width: 60%; height: 32rpx; border-radius: 8rpx;"></view>
            <view class="skeleton-block" style="width: 120rpx; height: 32rpx; border-radius: 8rpx;"></view>
          </view>
          <view class="skeleton-block" style="width: 80%; height: 24rpx; margin-bottom: 24rpx; border-radius: 6rpx;"></view>
          <view style="display: flex; gap: 16rpx;">
             <view class="skeleton-block" style="width: 100rpx; height: 24rpx; border-radius: 6rpx;"></view>
             <view class="skeleton-block" style="width: 100rpx; height: 24rpx; border-radius: 6rpx;"></view>
          </view>
        </view>
      </view>
      <view v-else class="history-container">
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
    <view v-if="activeTab === 'current' && quoteItems.length && !isLoading" class="quote-footer">
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
            :key="item.goods_id || item.id"
            class="panel-product-item"
          >
            <image class="panel-p-img" :src="item.image || '/static/aircon/outdoor-unit.png'" mode="aspectFit" />
            <view class="panel-p-info">
              <view class="panel-p-model-row">
                <text class="panel-p-model">{{ item.model || '标准型号' }}</text>
                <text v-if="item.category_name" class="panel-p-series">{{ item.category_name }}</text>
              </view>
              <text class="panel-p-name">{{ item.goods_name || item.name }}</text>
              <text class="panel-p-spec">{{ item.spec || '高效节能 · 变频冷暖' }}</text>
              <text class="panel-p-price">¥{{ formatPrice(item.price) }}</text>
            </view>
            <button
              class="panel-btn-add"
              :class="{ 'is-in-quote': isItemInQuote(item) }"
              @click="addProductToQuote(item)"
            >
              {{ isItemInQuote(item) ? '+ 再加1台' : '+ 加入' }}
            </button>
          </view>
        </scroll-view>
      </view>
    </up-popup>
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { openPage } from '@/utils/pages';
import { getCart, addCartItem, editCartItem, removeCartItem, setCartDiscount, exportCart, getSolutionList } from '@/api/solution';
import { getProductList } from '@/api/product';

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
const isLoading = ref(false);

const showAddPanel = ref(false);
const showPricePanel = ref(false);
const addSearchKeyword = ref('');
const pricingMode = ref('discount');
const discountRate = ref(95);
const customTotalInput = ref('');
const taxRate = ref(13);
const quoteRemark = ref('');

const quoteItems = ref([]);
const cartData = ref({
  goods_amount: 0,
  total_quantity: 0,
  pay_amount: 0,
  discount_amount: 0
});
const historySolutions = ref([]);
const candidateProducts = ref([]);

// 核心：计算与同步报价单价格与数量
const recalculateCart = (items, mode = pricingMode.value, rate = discountRate.value, customTotal = customTotalInput.value, remark = quoteRemark.value) => {
  const goods_amount = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0);
  const total_quantity = items.reduce((sum, it) => sum + Number(it.quantity || 1), 0);
  let pay_amount = goods_amount;
  let discount_amount = 0;
  
  if (mode === 'discount') {
    pay_amount = Math.round(goods_amount * (Number(rate || 100) / 100) * 100) / 100;
    discount_amount = Math.max(0, Math.round((goods_amount - pay_amount) * 100) / 100);
  } else if (mode === 'total' && customTotal) {
    pay_amount = Number(customTotal);
    discount_amount = Math.max(0, Math.round((goods_amount - pay_amount) * 100) / 100);
  }

  const updatedCart = {
    items,
    goods_amount,
    total_quantity,
    pay_amount,
    discount_amount,
    pricing_mode: mode,
    global_discount_rate: rate,
    remark
  };
  
  cartData.value = updatedCart;
  quoteItems.value = items;
  uni.setStorageSync('solution_local_cart', updatedCart);
  return updatedCart;
};

/**
 * 把 OpenAPI 的 Cart 对象转换成页面直接使用的结构。
 *
 * 中文说明：报价单的新增、修改数量、删除和设置折扣接口都会返回完整 Cart，
 * 因此每次写操作成功后直接使用后端计算结果，可以保证 cart_item_id、金额、
 * 折扣和装箱数量始终一致，避免前端自己计算后与后台产生偏差。
 */
const applyServerCart = (serverCart) => {
  if (!serverCart || !Array.isArray(serverCart.items)) return false;

  const normalizedItems = serverCart.items.map(item => ({
    ...item,
    // 编辑和删除接口要求 cart_item_id；id 仅作为模板渲染的统一键。
    id: item.cart_item_id || item.goods_id,
    goods_id: item.goods_id,
    name: item.goods_name_snapshot || item.goods_name,
    model: item.model_snapshot || item.model,
    image: item.image_snapshot || item.image || '/static/aircon/outdoor-unit.png',
    price: Number(item.origin_price || item.quote_price || item.price || 0),
    quantity: Number(item.quantity || 1)
  }));

  const normalizedCart = {
    ...serverCart,
    items: normalizedItems,
    goods_amount: Number(serverCart.goods_amount || 0),
    total_quantity: Number(serverCart.total_quantity || 0),
    pay_amount: Number(serverCart.pay_amount || 0),
    discount_amount: Number(serverCart.discount_amount || 0)
  };

  cartData.value = normalizedCart;
  quoteItems.value = normalizedItems;
  pricingMode.value = serverCart.pricing_mode || 'discount';
  discountRate.value = Number(serverCart.global_discount_rate ?? 100);
  quoteRemark.value = serverCart.remark || '';
  uni.setStorageSync('solution_local_cart', normalizedCart);
  return true;
};

const isItemInQuote = (item) => {
  const gId = item.goods_id || item.id;
  return quoteItems.value.some(i => (i.goods_id || i.id) === gId);
};

const loadCart = async () => {
  // 优先加载本地持久化数据
  const localCart = uni.getStorageSync('solution_local_cart');
  if (localCart && Array.isArray(localCart.items)) {
    quoteItems.value = localCart.items;
    cartData.value = localCart;
    pricingMode.value = localCart.pricing_mode || 'discount';
    discountRate.value = localCart.global_discount_rate || 95;
    quoteRemark.value = localCart.remark || '';
  }

  try {
    const res = await getCart();
    // 中文说明：utils/request.js 已经把 `{ code, msg, data }` 解包，
    // 所以这里的 res 就是 Cart，不能继续写成 res.code / res.data。
    // 服务端是报价单暂存清单的权威数据源，即使 items 为空也必须覆盖本地缓存，
    // 否则用户在其他设备清空报价单后，本机仍会显示过期商品。
    applyServerCart(res);
  } catch(e) {
    console.warn('loadCart backend info:', e);
  }
};

const loadHistory = async () => {
  const localRecords = uni.getStorageSync('solution_history_records') || [];
  try {
    const res = await getSolutionList({ limit: 100 });
    // 报价列表解包后是 QuotePageData，其中 data 才是当前页的数组。
    const serverList = Array.isArray(res?.data) ? res.data : [];
    if (serverList.length > 0) {
      const serverMapped = serverList.map(item => ({
        ...item,
        id: item.quote_id || item.id,
        title: item.quote_no ? `方案报价单 (${item.quote_no})` : '方案报价单',
        subtitle: item.remark || `共 ${item.item_count || (item.items || []).length} 项设备`,
        customerName: item.contact_name_snapshot || '贵宾客户',
        date: item.create_time_text || item.create_time || '今日',
        status: item.quote_status || 'draft',
        items: item.items || Array(item.item_count || 1).fill({}),
        totalPrice: item.pay_amount || item.total_price || 0
      }));
      historySolutions.value = [...localRecords, ...serverMapped.filter(s => !localRecords.some(l => l.id === s.id))];
      return;
    }
  } catch(e) {
    // 历史列表失败时允许展示本地缓存，但保留日志便于联调排查。
    console.warn('loadHistory backend info:', e);
  }

  historySolutions.value = localRecords;
};

const loadCandidates = async () => {
  try {
    const res = await getProductList({ keyword: addSearchKeyword.value, limit: 30 });
    const list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
    candidateProducts.value = list.map(item => ({
      ...item,
      id: item.goods_id || item.id,
      goods_id: item.goods_id || item.id,
      name: item.goods_name || item.name,
      model: item.model || item.type || '标准型号',
      category_name: item.category_name,
      spec: item.spec || '高效节能 · 变频冷暖',
      image: item.image || '/static/aircon/outdoor-unit.png',
      price: Number(item.price || 0)
    }));
  } catch(e) {
    console.error('loadCandidates error:', e);
  }
};

watch(addSearchKeyword, () => {
  loadCandidates();
});

onShow(() => {
  loadCart();
  loadHistory();
  checkPendingProduct();
});

const totalPrice = computed(() => cartData.value.goods_amount || 0);
const totalCount = computed(() => cartData.value.total_quantity || 0);
const finalTotal = computed(() => cartData.value.pay_amount || 0);
const finalDiscount = computed(() => {
  if (!totalPrice.value) return 100;
  return Math.round(finalTotal.value / totalPrice.value * 10000) / 100;
});
const discountAmount = computed(() => cartData.value.discount_amount || 0);

const formatPrice = (val) => Number(val || 0).toLocaleString();

const changeItemQty = async (item, delta) => {
  const currentList = [...quoteItems.value];
  const target = currentList.find(i => (i.goods_id || i.id) === (item.goods_id || item.id));
  if (!target) return;
  const newQty = Number(target.quantity || 1) + delta;
  if (newQty < 1) return;
  target.quantity = newQty;
  recalculateCart(currentList);

  try {
    const updatedCart = await editCartItem(item.cart_item_id || item.id, { quantity: newQty });
    applyServerCart(updatedCart);
  } catch(e) {
    // 乐观更新失败时重新读取后端，撤销界面中的临时数量。
    console.warn('editCartItem error:', e);
    await loadCart();
  }
};

const removeItem = async (id) => {
  const currentList = quoteItems.value.filter(i => (i.goods_id || i.id) !== id && i.id !== id);
  recalculateCart(currentList);
  uni.showToast({ title: '已移除设备', icon: 'none' });

  try {
    const updatedCart = await removeCartItem(id);
    applyServerCart(updatedCart);
  } catch(e) {
    console.warn('removeCartItem error:', e);
    await loadCart();
  }
};

const openAddPanel = (mode = 'search') => {
  if (mode === 'select') {
    openPage('/pages/product/category');
    return;
  }
  showAddPanel.value = true;
  loadCandidates();
};

const addProductToQuote = async (product) => {
  const gId = product.goods_id || product.id;
  const currentList = [...quoteItems.value];
  const existingIndex = currentList.findIndex(i => (i.goods_id || i.id) === gId);
  
  if (existingIndex > -1) {
    currentList[existingIndex].quantity = (Number(currentList[existingIndex].quantity) || 1) + 1;
  } else {
    currentList.push({
      id: gId,
      goods_id: gId,
      cart_item_id: gId,
      name: product.goods_name || product.name || '空调设备',
      model: product.model || product.type || '标准型号',
      spec: product.spec || (Array.isArray(product.specs) ? product.specs.slice(0, 2).join(' | ') : '高效节能 · 变频冷暖'),
      image: product.image || '/static/aircon/outdoor-unit.png',
      price: Number(product.price || 0),
      quantity: 1
    });
  }

  // 1. 立即触发本地响应与UI实时刷新
  recalculateCart(currentList);
  uni.showToast({ title: '已加入报价单', icon: 'success' });

  // 2. 异步同步到后端API
  try {
    const updatedCart = await addCartItem({ goods_id: gId, quantity: 1 });
    applyServerCart(updatedCart);
  } catch(e) {
    console.warn('addCartItem error:', e);
    await loadCart();
  }
};

const applyPricing = async () => {
  recalculateCart(quoteItems.value, pricingMode.value, discountRate.value, customTotalInput.value, quoteRemark.value);
  showPricePanel.value = false;
  uni.showToast({ title: '价格配置已更新', icon: 'success' });

  try {
    const updatedCart = await setCartDiscount({
      pricing_mode: pricingMode.value,
      global_discount_rate: pricingMode.value === 'discount' ? discountRate.value : 100
    });
    applyServerCart(updatedCart);
  } catch(e) {
    console.warn('setCartDiscount error:', e);
    await loadCart();
  }
};

const exportQuote = async () => {
  if (!quoteItems.value.length) {
    uni.showToast({ title: '请先添加产品', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '正在生成报价单...' });

  try {
    // exportCart 的返回值已经解包为 QuoteExportData：
    // `{ quote_id, quote_no, pay_amount }`。只有后端真正创建成功后，
    // 才能清空本地报价单暂存数据并提示成功，不能再用随机编号伪造成功记录。
    const createdQuote = await exportCart({
      extra_amount: 0,
      remark: quoteRemark.value,
      clear_cart: 1
    });

    if (!createdQuote?.quote_id) {
      throw new Error('后端未返回 quote_id，无法确认报价单是否创建成功');
    }

    const nowText = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newQuoteRecord = {
      id: createdQuote.quote_id,
      quote_id: createdQuote.quote_id,
      quote_no: createdQuote.quote_no || '',
      title: createdQuote.quote_no ? `方案报价单 (${createdQuote.quote_no})` : '方案报价单',
      subtitle: `${totalCount.value} 项设备 · 享受 ${discountRate.value}% 折扣`,
      contact_name_snapshot: '贵宾客户',
      customerName: '贵宾客户',
      date: nowText,
      create_time_text: nowText,
      status: 'draft',
      quote_status: 'draft',
      items: JSON.parse(JSON.stringify(quoteItems.value)),
      totalPrice: Number(createdQuote.pay_amount ?? finalTotal.value),
      pay_amount: Number(createdQuote.pay_amount ?? finalTotal.value),
      goods_amount: totalPrice.value,
      discount_amount: discountAmount.value,
      discount_rate: discountRate.value,
      pricing_mode: pricingMode.value,
      remark: quoteRemark.value
    };

    // 保存一份本地快照，让接口列表刷新前也能立即看到刚创建的报价单。
    const localHistory = uni.getStorageSync('solution_history_records') || [];
    localHistory.unshift(newQuoteRecord);
    uni.setStorageSync('solution_history_records', localHistory);

    // clear_cart=1 已要求后端清空报价单暂存数据，这里同步清理本地缓存和界面。
    recalculateCart([]);
    showPricePanel.value = false;
    uni.showToast({ title: '报价单生成成功', icon: 'success' });

    await loadHistory();
    activeTab.value = 'history';
  } catch (error) {
    // 请求层已经负责展示后端错误；这里仅记录上下文，并保留当前报价单供用户重试。
    console.error('exportQuote error:', error);
  } finally {
    uni.hideLoading();
  }
};

const checkPendingProduct = async () => {
  try {
    const pending = uni.getStorageSync('pendingSolutionProduct');
    if (pending && (pending.name || pending.goods_name || pending.id || pending.goods_id)) {
      uni.removeStorageSync('pendingSolutionProduct');
      await addProductToQuote(pending);
    }
  } catch (e) {
    console.error(e);
  }
};
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
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 14rpx 0 10rpx;
}

.d-chip {
  padding: 0 16rpx;
  white-space: nowrap;
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
  border: none;

  &.is-in-quote {
    background: #edf4ff;
    color: #2468e8;
    box-shadow: none;
    border: 1rpx solid #c7dcff;
  }
}
.skeleton-block {
  background: #e2e8f0;
  background-image: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 37%, #e2e8f0 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>
