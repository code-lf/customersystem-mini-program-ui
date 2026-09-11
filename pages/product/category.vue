<template>
  <view class="design-page category-page">
    <AppNavbar :title="currentRootName ? `${currentRootName}选型` : '产品选型'" />

    <view class="central-category-wrap">
      <!-- Top Level 1 -->
      <view class="root-category-tabs">
        <view
          v-for="root in rootCategories"
          :key="root.id"
          class="root-tab-item"
          :class="{'active': currentRootId === root.id}"
          @click="selectRootCategory(root.id)"
        >
          <text class="root-tab-title">{{ root.category_name }}</text>
        </view>
      </view>

      <!-- Level 2 Horizontal Scroll -->
      <scroll-view class="l2-scroll-tabs" scroll-x :show-scrollbar="false" v-if="currentL2List.length > 0">
        <view class="l2-tabs-inner">
          <view
            class="l2-item"
            :class="{ active: activeL2 === '全部' }"
            @click="selectL2('全部')"
          >
            全部
          </view>
          <view
            v-for="item in currentL2List"
            :key="item.id"
            class="l2-item"
            :class="{ active: activeL2 === item.id }"
            @click="selectL2(item.id)"
          >
            {{ item.category_name }}
          </view>
        </view>
      </scroll-view>

      <!-- Level 3 Horizontal Scroll -->
      <scroll-view class="l3-scroll-tabs" scroll-x :show-scrollbar="false" v-if="currentL3List.length > 0">
        <view class="l3-tabs-inner">
          <view
            class="l3-item"
            :class="{ active: activeL3 === '全部' }"
            @click="selectL3('全部')"
          >
            全部
          </view>
          <view
            v-for="sub in currentL3List"
            :key="sub.id"
            class="l3-item"
            :class="{ active: activeL3 === sub.id }"
            @click="selectL3(sub.id)"
          >
            {{ sub.category_name }}
          </view>
        </view>
      </scroll-view>

      <!-- Level 4 Horizontal Scroll (if any) -->
      <scroll-view class="l4-scroll-tabs" scroll-x :show-scrollbar="false" v-if="currentL4List.length > 0">
        <view class="l4-tabs-inner">
          <view
            class="l4-item"
            :class="{ active: activeL4 === '全部' }"
            @click="selectL4('全部')"
          >
            全部
          </view>
          <view
            v-for="sub in currentL4List"
            :key="sub.id"
            class="l4-item"
            :class="{ active: activeL4 === sub.id }"
            @click="selectL4(sub.id)"
          >
            {{ sub.category_name }}
          </view>
        </view>
      </scroll-view>

      <!-- 搜索栏 -->
      <view class="category-search-box">
        <view class="design-search">
          <up-icon name="search" size="18" color="#9aa5b5" />
          <input
            v-model="searchKeyword"
            placeholder="搜索当前分类下的型号或产品名称..."
            placeholder-class="placeholder"
          />
          <up-icon
            v-if="searchKeyword"
            name="close-circle-fill"
            size="16"
            color="#9aa5b5"
            @click="searchKeyword = ''"
          />
        </view>
      </view>

      <scroll-view class="product-scroll" scroll-y>
        <view v-if="filteredProducts.length" class="product-list-container">
          <!-- Full width list view -->
          <view
            v-for="product in filteredProducts"
            :key="product.goods_id"
            class="list-product-card"
            @click="openPage('/pages/product/detail', { id: product.goods_id })"
          >
            <view class="product-info-col">
              <text class="model-name">{{ product.model }}</text>
              <text class="product-name">{{ product.goods_name }}</text>
              <text class="price-num">¥{{ formatPrice(product.price) }}</text>
            </view>
            <view class="product-action-col">
              <view class="stepper" v-if="getCartQty(product.goods_id) > 0" @click.stop>
                <view class="step-btn minus" @click.stop="updateCart(product, -1)">-</view>
                <text class="step-val">{{ getCartQty(product.goods_id) }}</text>
                <view class="step-btn plus" @click.stop="updateCart(product, 1)">+</view>
              </view>
              <view v-else class="add-btn" @click.stop="updateCart(product, 1)">
                加入
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <up-icon name="info-circle" size="48" color="#b7c5d8" />
          <text class="empty-title">暂无产品</text>
        </view>
        <!-- Bottom padding for mini cart -->
        <view style="height: 120rpx;"></view>
      </scroll-view>

      <!-- 底部浮动购物车 -->
      <view class="mini-cart-bar">
        <view class="cart-left">
          <view class="cart-icon-box">
            <up-icon name="shopping-cart-fill" size="24" color="#fff" />
            <view class="badge" v-if="cartTotalQty > 0">{{ cartTotalQty }}</view>
          </view>
          <view class="cart-price-info">
            <text class="cart-total-price">¥{{ formatPrice(cartTotalPrice) }}</text>
            <text class="cart-tip">已选 {{ cartTotalQty }} 件设备</text>
          </view>
        </view>
        <view class="cart-right" @click="goToCart">
          查看报价单
        </view>
      </view>

    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { getProductCategories, getProductList, CATEGORY_IDS } from '@/api/product';
import { getCart, addCartItem, editCartItem, removeCartItem } from '@/api/solution';

const pageOptions = getPageOptions();

// 分类数据
const allTree = ref([]);
const currentRootId = ref(null);
const activeL2 = ref('全部');
const activeL3 = ref('全部');
const activeL4 = ref('全部');

const searchKeyword = ref('');
const products = ref([]);
const cartData = ref(null);
const isLoading = ref(false);

const loadCartData = async () => {
  try {
    const res = await getCart({ showError: false });
    cartData.value = res;
  } catch(e) {
    console.warn(e);
  }
};

const getCartQty = (goodsId) => {
  if (!cartData.value || !cartData.value.items) return 0;
  const item = cartData.value.items.find(i => i.goods_id === goodsId);
  return item ? item.quantity : 0;
};

const getCartItemId = (goodsId) => {
  if (!cartData.value || !cartData.value.items) return null;
  const item = cartData.value.items.find(i => i.goods_id === goodsId);
  return item ? item.cart_item_id : null;
};

const cartTotalQty = computed(() => {
  if (!cartData.value || !cartData.value.items) return 0;
  return cartData.value.items.reduce((acc, item) => acc + item.quantity, 0);
});

const cartTotalPrice = computed(() => {
  if (!cartData.value || !cartData.value.items) return 0;
  return cartData.value.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
});

const updateCart = async (product, delta) => {
  const currentQty = getCartQty(product.goods_id);
  const newQty = currentQty + delta;
  const cartItemId = getCartItemId(product.goods_id);
  
  try {
    if (newQty <= 0) {
      if (cartItemId) await removeCartItem(cartItemId);
    } else if (cartItemId) {
      await editCartItem(cartItemId, { quantity: newQty });
    } else {
      await addCartItem({ goods_id: product.goods_id, quantity: newQty });
    }
    await loadCartData();
  } catch(e) {
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

const goToCart = () => {
  uni.switchTab({ url: '/pages/solution/index' });
};

// 根分类定义


const rootCategories = computed(() => {
  return allTree.value.map(r => ({
    id: r.id,
    category_name: r.category_name,
    children: r.children || []
  }));
});

const currentRoot = computed(() => {
  return rootCategories.value.find(r => r.id === currentRootId.value) || rootCategories.value[0];
});

const currentRootName = computed(() => currentRoot.value?.category_name || '产品分类');

const currentL2List = computed(() => {
  const root = allTree.value.find(c => c.id === currentRootId.value);
  return root?.children || [];
});

const currentL2Object = computed(() => {
  if (activeL2.value === '全部') return null;
  return currentL2List.value.find(c => c.id === activeL2.value) || null;
});

const currentL3List = computed(() => {
  if (!currentL2Object.value) return [];
  return currentL2Object.value.children || [];
});

const currentL3Object = computed(() => {
  if (activeL3.value === '全部') return null;
  return currentL3List.value.find(c => c.id === activeL3.value) || null;
});

const currentL4List = computed(() => {
  if (!currentL3Object.value) return [];
  return currentL3Object.value.children || [];
});

const loadCategories = async () => {
  try {
    const res = await getProductCategories();
    allTree.value = Array.isArray(res) ? res : (res?.data || []);
    
    const queryRootId = pageOptions.root_id ? Number(pageOptions.root_id) : null;
    const queryCategoryId = pageOptions.category_id ? Number(pageOptions.category_id) : null;
    
    // Set initial root to the first available root if nothing is passed or found yet
    if (allTree.value.length > 0) {
      currentRootId.value = allTree.value[0].id;
    }

    if (queryRootId && allTree.value.some(r => r.id === queryRootId)) {
      currentRootId.value = queryRootId;
      if (queryCategoryId && queryCategoryId !== queryRootId) locateAnyCategory(queryCategoryId);
    } else if (queryCategoryId) {
      locateAnyCategory(queryCategoryId);
    } else if (queryCategoryId) {
      locateAnyCategory(queryCategoryId);
    }
  } catch (e) {}
};

const locateAnyCategory = (targetId) => {
  for (const root of allTree.value) {
    if (root.id === targetId) {
      currentRootId.value = root.id; activeL2.value = '全部'; activeL3.value = '全部'; activeL4.value = '全部'; return;
    }
    for (const l2 of (root.children || [])) {
      if (l2.id === targetId) {
        currentRootId.value = root.id; activeL2.value = l2.id; activeL3.value = '全部'; activeL4.value = '全部'; return;
      }
      for (const l3 of (l2.children || [])) {
        if (l3.id === targetId) {
          currentRootId.value = root.id; activeL2.value = l2.id; activeL3.value = l3.id; activeL4.value = '全部'; return;
        }
        for (const l4 of (l3.children || [])) {
           if (l4.id === targetId) {
             currentRootId.value = root.id; activeL2.value = l2.id; activeL3.value = l3.id; activeL4.value = l4.id; return;
           }
        }
      }
    }
  }
};

const selectRootCategory = (rootId) => {
  if (currentRootId.value === rootId) return;
  currentRootId.value = rootId;
  activeL2.value = '全部';
  activeL3.value = '全部';
  activeL4.value = '全部';
  searchKeyword.value = '';
};
const selectL2 = (l2Id) => { activeL2.value = l2Id; activeL3.value = '全部'; activeL4.value = '全部'; };
const selectL3 = (l3Id) => { activeL3.value = l3Id; activeL4.value = '全部'; };
const selectL4 = (l4Id) => { activeL4.value = l4Id; };

const loadProducts = async () => {
  isLoading.value = true;
  try {
    const params = { limit: 100 };
    if (activeL4.value !== '全部') params.category_id = activeL4.value;
    else if (activeL3.value !== '全部') params.category_id = activeL3.value;
    else if (activeL2.value !== '全部') params.category_id = activeL2.value;
    else if (currentRootId.value) params.category_id = currentRootId.value;

    if (searchKeyword.value) params.keyword = searchKeyword.value.trim();

    const res = await getProductList(params);
    products.value = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
  } catch (e) {
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await loadCategories();
  await loadProducts();
  await loadCartData();
});

watch([currentRootId, activeL2, activeL3, activeL4, searchKeyword], () => loadProducts());

const filteredProducts = computed(() => {
  if (!searchKeyword.value) return products.value;
  const kw = searchKeyword.value.toLowerCase().trim();
  return products.value.filter(p => 
    (p.goods_name && p.goods_name.toLowerCase().includes(kw)) ||
    (p.model && p.model.toLowerCase().includes(kw))
  );
});

const formatPrice = (val) => Number(val || 0).toLocaleString();
</script>

<style lang="scss" scoped>
.category-page {
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.central-category-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100vh - 88rpx);
  overflow: hidden;
  position: relative;
}

/* 顶部根分类 */
.root-category-tabs {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #ffffff;
}

.root-tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  border-radius: 36rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.25s ease;

  &.active {
    color: #ffffff;
    background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
    box-shadow: 0 4rpx 14rpx rgba(29, 78, 216, 0.28);
  }
}

/* 水平滚动层级分类 */
.l2-scroll-tabs, .l3-scroll-tabs, .l4-scroll-tabs {
  width: 100%;
  background: #ffffff;
  border-bottom: 1rpx solid #eef2f7;
}

.l2-tabs-inner, .l3-tabs-inner, .l4-tabs-inner {
  display: inline-flex;
  padding: 16rpx 24rpx;
  gap: 20rpx;
}

.l2-item, .l3-item, .l4-item {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 24rpx;
  white-space: nowrap;
  
  &.active {
    background: #e0e7ff;
    color: #1d4ed8;
    font-weight: 600;
  }
}

.category-search-box {
  padding: 12rpx 24rpx;
  background: #ffffff;
}
.design-search {
  display: flex;
  align-items: center;
  height: 68rpx;
  padding: 0 20rpx;
  border-radius: 34rpx;
  background: #f1f5f9;
}
.design-search input {
  flex: 1;
  margin-left: 14rpx;
  font-size: 24rpx;
}

/* 商品列表（整行显示型号和名称，无图片） */
.product-scroll {
  flex: 1;
  overflow: hidden;
}

.product-list-container {
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.list-product-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}

.product-info-col {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-right: 20rpx;
}

.model-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8rpx;
  word-break: break-all;
}

.product-name {
  font-size: 24rpx;
  color: #64748b;
  margin-bottom: 12rpx;
}

.price-num {
  font-size: 32rpx;
  color: #ef4444;
  font-weight: 700;
}

.product-action-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn {
  background: #1d4ed8;
  color: #fff;
  font-size: 24rpx;
  padding: 12rpx 32rpx;
  border-radius: 26rpx;
  font-weight: 600;
}

/* 步进器 */
.stepper {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 30rpx;
  padding: 4rpx;
}

.step-btn {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #1e293b;
  background: #fff;
  border-radius: 26rpx;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.05);
}

.step-val {
  min-width: 48rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}
.empty-title {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #64748b;
}

/* 底部浮动购物车 */
.mini-cart-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 32rpx;
  z-index: 100;
}

.cart-left {
  display: flex;
  align-items: center;
}

.cart-icon-box {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  background: #334155;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  transform: translateY(-20rpx);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
}

.badge {
  position: absolute;
  top: -6rpx;
  right: -10rpx;
  background: #ef4444;
  color: #fff;
  font-size: 20rpx;
  font-weight: bold;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  border: 2rpx solid #1e293b;
}

.cart-price-info {
  display: flex;
  flex-direction: column;
}

.cart-total-price {
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
}

.cart-tip {
  color: #94a3b8;
  font-size: 22rpx;
}

.cart-right {
  height: 100%;
  background: #1d4ed8;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
}
</style>
