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

      <!-- 分类筛选区：全部平铺展开显示，字号与上方大分类一致，易于点按 -->
      <!-- 模式 1：中央空调（层级联动单选，全部平铺全展开） -->
      <view class="category-filters-container central-filters-box" v-if="isCentralAC">
        <view class="filter-rows-wrapper">
          <view class="filter-rows-inner">
            <!-- Level 2: 品牌 -->
            <view class="filter-level-row" v-if="currentL2List.length > 0">
              <view
                class="filter-tag"
                :class="{ active: activeL2 === '全部' }"
                @click="selectL2('全部')"
              >
                全部
              </view>
              <view
                v-for="item in currentL2List"
                :key="item.id"
                class="filter-tag"
                :class="{ active: activeL2 === item.id }"
                @click="selectL2(item.id)"
              >
                {{ item.category_name }}
              </view>
            </view>

            <!-- Level 3: 类型 -->
            <view class="filter-level-row" v-if="currentL3List.length > 0">
              <view
                class="filter-tag"
                :class="{ active: activeL3 === '全部' }"
                @click="selectL3('全部')"
              >
                全部
              </view>
              <view
                v-for="sub in currentL3List"
                :key="sub.id"
                class="filter-tag"
                :class="{ active: activeL3 === sub.id }"
                @click="selectL3(sub.id)"
              >
                {{ sub.category_name }}
              </view>
            </view>

            <!-- Level 4: 系列 -->
            <view class="filter-level-row" v-if="currentL4List.length > 0">
              <view
                class="filter-tag"
                :class="{ active: activeL4 === '全部' }"
                @click="selectL4('全部')"
              >
                全部
              </view>
              <view
                v-for="sub in currentL4List"
                :key="sub.id"
                class="filter-tag"
                :class="{ active: activeL4 === sub.id }"
                @click="selectL4(sub.id)"
              >
                {{ sub.category_name }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 模式 2：非中央空调：二级分类横向滚动，右侧固定“更多”入口。 -->
      <view class="category-filters-container non-central-filters-box" v-else>
        <view class="l2-scroll-wrapper" v-if="currentL2List.length > 0">
          <scroll-view
            class="l2-scroll-view"
            scroll-x
            :show-scrollbar="false"
            :scroll-into-view="currentL2ScrollInto"
            scroll-with-animation
          >
            <view class="l2-scroll-inner">
              <view
                id="l2-tag-all"
                class="l2-pill-tag"
                :class="{ active: activeL2 === '全部' }"
                @click="selectL2('全部')"
              >全部</view>
              <view
                v-for="item in currentL2List"
                :key="item.id"
                :id="'l2-tag-' + item.id"
                class="l2-pill-tag"
                :class="{ active: activeL2 === item.id }"
                @click="selectL2(item.id)"
              >{{ item.category_name }}</view>
            </view>
          </scroll-view>
          <view class="l2-more-fixed-btn" @click="showCategoryModal = true">
            <text class="more-label">更多</text>
            <up-icon name="arrow-down" size="11" color="#1d4ed8" />
          </view>
        </view>

        <!-- 三级子分类多选模式（默认全部勾选，全展开） -->
        <view class="subcat-multi-container" v-if="currentL3List.length > 0">
          <view class="subcat-multi-inner">
            <view
              v-for="sub in currentL3List"
              :key="sub.id"
              class="filter-tag multi-tag"
              :class="{ 'is-selected': selectedSubCatIds.includes(sub.id) }"
              @click="toggleSubCat(sub.id)"
            >
              <text class="tag-check-mark" v-if="selectedSubCatIds.includes(sub.id)">✓</text>
              <text class="tag-title">{{ sub.category_name }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- “更多”分类弹窗：保留完整分类选择，避免横向列表影响主页面高度。 -->
      <up-popup
        :show="showCategoryModal"
        mode="bottom"
        round="24"
        close-on-click-overlay
        safe-area-inset-bottom
        @close="showCategoryModal = false"
      >
        <view class="cat-modal-content">
          <view class="cat-modal-header">
            <text class="cat-modal-title">全部分类</text>
            <view class="cat-modal-close" @click="showCategoryModal = false">
              <up-icon name="close" size="18" color="#64748b" />
            </view>
          </view>
          <scroll-view class="cat-modal-scroll" scroll-y>
            <view class="cat-modal-grid">
              <view class="cat-modal-item" :class="{ active: activeL2 === '全部' }" @click="selectL2FromModal('全部')">全部</view>
              <view
                v-for="item in currentL2List"
                :key="item.id"
                class="cat-modal-item"
                :class="{ active: activeL2 === item.id }"
                @click="selectL2FromModal(item.id)"
              >{{ item.category_name }}</view>
            </view>
          </scroll-view>
        </view>
      </up-popup>

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

      <!-- 商品使用页面原生滚动，避免小程序 scroll-view 弹性高度失效导致列表截断。 -->
      <view class="product-scroll">
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
          <text class="empty-title">{{ !isCentralAC && currentL3List.length > 0 && selectedSubCatIds.length === 0 ? '已取消所有子分类筛选' : '暂无产品' }}</text>
          <text v-if="!isCentralAC && currentL3List.length > 0 && selectedSubCatIds.length === 0" class="empty-hint">点击上方分类标签或下方按钮重新选中</text>
          <view v-if="!isCentralAC && currentL3List.length > 0 && selectedSubCatIds.length === 0" class="select-all-btn" @click="selectAllSubCats">
            一键全选
          </view>
        </view>
      </view>

      <!-- 底部浮动购物车 -->
      <view class="mini-cart-bar">
        <view class="cart-left">
          <view class="cart-icon-box">
            <up-icon name="shopping-cart-fill" size="24" color="#fff" />
            <view class="badge" v-if="cartTotalQty > 0">{{ cartTotalQty }}</view>
          </view>
          <view class="cart-price-info">
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
import { computed, ref, watch, nextTick } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { getProductCategories, getProductList } from '@/api/product';
import { getCart, addCartItem, editCartItem, removeCartItem } from '@/api/solution';

// 分类数据
const allTree = ref([]);
const currentRootId = ref(null);
const activeL2 = ref('全部');
const activeL3 = ref('全部');
const activeL4 = ref('全部');

// 非中央空调子分类多选状态（默认全选）
const selectedSubCatIds = ref([]);
// 非中央空调二级分类采用横向滚动，完整分类通过“更多”弹窗选择。
const showCategoryModal = ref(false);

const searchKeyword = ref('');
const products = ref([]);
const cartData = ref(null);
const isLoading = ref(false);
// 初始化期间会连续设置多级分类，完成后再开放 watch 请求，避免重复加载商品列表。
const isPageReady = ref(false);

/**
 * 统一规格化购物车数据，确保数量为整型数字，避免字符串 "1.00" 导致的加减错乱与显示异常
 */
const normalizeServerCart = (serverCart) => {
  if (!serverCart || typeof serverCart !== 'object') return null;
  const rawItems = Array.isArray(serverCart.items) ? serverCart.items : [];
  const normalizedItems = rawItems.map(item => {
    const qty = Math.max(0, Math.round(Number(item.quantity) || 0));
    return {
      ...item,
      cart_item_id: item.cart_item_id || item.id,
      goods_id: item.goods_id,
      quantity: qty,
      price: Number(item.origin_price || item.quote_price || item.price || 0)
    };
  });

  return {
    ...serverCart,
    items: normalizedItems,
    goods_amount: Number(serverCart.goods_amount || 0),
    total_quantity: normalizedItems.reduce((acc, item) => acc + item.quantity, 0),
    pay_amount: Number(serverCart.pay_amount || 0)
  };
};

const loadCartData = async () => {
  // 1. 优先从本地存储秒级加载，提供流畅无白屏体验
  try {
    const localCart = uni.getStorageSync('solution_local_cart');
    if (localCart && Array.isArray(localCart.items)) {
      cartData.value = normalizeServerCart(localCart);
    }
  } catch(e) {}

  // 2. 从服务器读取最新购物车并规格化
  try {
    const res = await getCart({ showError: false });
    if (res && typeof res === 'object') {
      const normalized = normalizeServerCart(res);
      cartData.value = normalized;
      uni.setStorageSync('solution_local_cart', normalized);
    }
  } catch(e) {
    console.warn('loadCartData error:', e);
  }
};

const getCartQty = (goodsId) => {
  if (!cartData.value || !Array.isArray(cartData.value.items)) return 0;
  const item = cartData.value.items.find(i => 
    String(i.goods_id) === String(goodsId) || 
    String(i.id) === String(goodsId)
  );
  return item ? Math.max(0, Math.round(Number(item.quantity) || 0)) : 0;
};

const getCartItemId = (goodsId) => {
  if (!cartData.value || !Array.isArray(cartData.value.items)) return null;
  const item = cartData.value.items.find(i => 
    String(i.goods_id) === String(goodsId) || 
    String(i.id) === String(goodsId)
  );
  return item ? (item.cart_item_id || item.id) : null;
};

const cartTotalQty = computed(() => {
  if (!cartData.value || !Array.isArray(cartData.value.items)) return 0;
  return cartData.value.items.reduce((acc, item) => acc + Math.max(0, Math.round(Number(item.quantity) || 0)), 0);
});

// 操作防抖锁，避免狂点产生并发乱序
const updatingMap = ref({});

const updateCart = async (product, delta) => {
  if (!product || !product.goods_id) return;
  const gId = product.goods_id;
  if (updatingMap.value[gId]) return;
  updatingMap.value[gId] = true;

  const currentQty = getCartQty(gId);
  const newQty = Math.max(0, currentQty + delta);
  const existingCartItemId = getCartItemId(gId);

  // 1. 乐观更新：立刻更新本地状态，加减瞬间在 UI 上直接反馈，零延迟无卡顿
  const prevCartData = JSON.parse(JSON.stringify(cartData.value || { items: [] }));
  let currentItems = [...(prevCartData.items || [])];
  const itemIndex = currentItems.findIndex(i => 
    String(i.goods_id) === String(gId) || 
    String(i.id) === String(gId)
  );

  if (newQty <= 0) {
    if (itemIndex > -1) {
      currentItems.splice(itemIndex, 1);
    }
  } else if (itemIndex > -1) {
    currentItems[itemIndex].quantity = newQty;
  } else {
    currentItems.push({
      goods_id: gId,
      cart_item_id: null,
      quantity: newQty,
      price: Number(product.price || 0),
      goods_name: product.goods_name,
      model: product.model
    });
  }

  const optimisticCart = normalizeServerCart({
    ...prevCartData,
    items: currentItems
  });
  cartData.value = optimisticCart;
  uni.setStorageSync('solution_local_cart', optimisticCart);

  // 2. 异步同步到后端
  try {
    let serverRes;
    if (newQty <= 0) {
      if (existingCartItemId) {
        serverRes = await removeCartItem(existingCartItemId);
      }
    } else if (existingCartItemId) {
      serverRes = await editCartItem(existingCartItemId, { quantity: newQty });
    } else {
      serverRes = await addCartItem({ goods_id: gId, quantity: newQty });
    }

    if (serverRes && typeof serverRes === 'object') {
      const normalized = normalizeServerCart(serverRes);
      cartData.value = normalized;
      uni.setStorageSync('solution_local_cart', normalized);
    } else {
      await loadCartData();
    }
  } catch(e) {
    console.warn('updateCart failed, rollback:', e);
    cartData.value = prevCartData;
    uni.setStorageSync('solution_local_cart', prevCartData);
    uni.showToast({ title: e?.message || '操作失败，请重试', icon: 'none' });
    await loadCartData();
  } finally {
    updatingMap.value[gId] = false;
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

// 是否属于中央空调系列（中央空调保留单选层级，其他品类为多选模式）
const isCentralAC = computed(() => {
  return String(currentRootId.value) === '120' || Boolean(currentRoot.value?.category_name?.includes('中央空调'));
});

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

const currentL2ScrollInto = computed(() => (
  activeL2.value === '全部' ? 'l2-tag-all' : `l2-tag-${activeL2.value}`
));

const selectL2FromModal = (id) => {
  selectL2(id);
  showCategoryModal.value = false;
};

// 多选子分类初始化与操作（非中央空调模式下，去掉“全部”，默认全选）
const initSelectedSubCats = () => {
  if (!isCentralAC.value && currentL3List.value.length > 0) {
    selectedSubCatIds.value = currentL3List.value.map(c => c.id);
  } else {
    selectedSubCatIds.value = [];
  }
};

const toggleSubCat = (id) => {
  const index = selectedSubCatIds.value.indexOf(id);
  if (index > -1) {
    selectedSubCatIds.value = selectedSubCatIds.value.filter(item => item !== id);
  } else {
    selectedSubCatIds.value = [...selectedSubCatIds.value, id];
  }
};

const selectAllSubCats = () => {
  selectedSubCatIds.value = currentL3List.value.map(c => c.id);
};

const loadCategories = async (pageOptions = {}) => {
  try {
    const res = await getProductCategories();
    allTree.value = Array.isArray(res) ? res : (res?.data || []);
    
    const queryRootId = pageOptions.root_id ? Number(pageOptions.root_id) : null;
    const queryCategoryId = pageOptions.category_id ? Number(pageOptions.category_id) : null;
    
    // 优先同步产品页传入的根分类；只有参数缺失或分类不存在时才回退到第一项。
    const matchedRoot = queryRootId
      ? allTree.value.find((root) => String(root.id) === String(queryRootId))
      : null;
    if (matchedRoot) {
      currentRootId.value = matchedRoot.id;
      if (queryCategoryId && queryCategoryId !== queryRootId) {
        locateAnyCategory(queryCategoryId);
      } else {
        initSelectedSubCats();
      }
    } else if (queryCategoryId && locateAnyCategory(queryCategoryId)) {
      // category_id 可能是任意层级，定位成功后由 locateAnyCategory 同步完整选中路径。
    } else if (allTree.value.length > 0) {
      currentRootId.value = allTree.value[0].id;
      initSelectedSubCats();
      if (queryRootId || queryCategoryId) {
        console.warn('[产品分类] 未找到路由指定分类，已回退第一项：', pageOptions);
      }
    }
  } catch (e) {
    console.error('[产品分类] 分类树加载失败：', e);
  }
};

const locateAnyCategory = (targetId) => {
  for (const root of allTree.value) {
    if (String(root.id) === String(targetId)) {
      currentRootId.value = root.id; activeL2.value = '全部'; activeL3.value = '全部'; activeL4.value = '全部'; initSelectedSubCats(); return true;
    }
    for (const l2 of (root.children || [])) {
      if (String(l2.id) === String(targetId)) {
        currentRootId.value = root.id; activeL2.value = l2.id; activeL3.value = '全部'; activeL4.value = '全部'; initSelectedSubCats(); return true;
      }
      for (const l3 of (l2.children || [])) {
        if (String(l3.id) === String(targetId)) {
          currentRootId.value = root.id; activeL2.value = l2.id; activeL3.value = l3.id; activeL4.value = '全部';
          if (String(root.id) !== '120' && !root.category_name?.includes('中央空调')) {
            selectedSubCatIds.value = [l3.id];
          }
          return true;
        }
        for (const l4 of (l3.children || [])) {
           if (String(l4.id) === String(targetId)) {
             currentRootId.value = root.id; activeL2.value = l2.id; activeL3.value = l3.id; activeL4.value = l4.id; return true;
           }
        }
      }
    }
  }
  return false;
};

const selectRootCategory = (rootId) => {
  if (currentRootId.value === rootId) return;
  currentRootId.value = rootId;
  activeL2.value = '全部';
  activeL3.value = '全部';
  activeL4.value = '全部';
  searchKeyword.value = '';
  initSelectedSubCats();
};

const selectL2 = (l2Id) => {
  activeL2.value = l2Id;
  activeL3.value = '全部';
  activeL4.value = '全部';
  initSelectedSubCats();
};

const selectL3 = (l3Id) => {
  activeL3.value = l3Id;
  activeL4.value = '全部';
};

const selectL4 = (l4Id) => {
  activeL4.value = l4Id;
};

const loadProducts = async () => {
  isLoading.value = true;
  try {
    const params = { limit: 100 };
    if (isCentralAC.value) {
      if (activeL4.value !== '全部') params.category_id = activeL4.value;
      else if (activeL3.value !== '全部') params.category_id = activeL3.value;
      else if (activeL2.value !== '全部') params.category_id = activeL2.value;
      else if (currentRootId.value) params.category_id = currentRootId.value;
    } else {
      if (activeL2.value !== '全部') {
        params.category_id = activeL2.value;
      } else if (currentRootId.value) {
        params.category_id = currentRootId.value;
      }
    }

    if (searchKeyword.value) params.keyword = searchKeyword.value.trim();

    const res = await getProductList(params);
    let list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));

    // 智能兜底 1: 中央空调第四级系列（如颐居、star等）在后端暂未直接挂载 category_id 时，查询三级父类并根据系列名称智能匹配
    if (isCentralAC.value && list.length === 0 && activeL4.value !== '全部' && activeL3.value !== '全部') {
      const parentRes = await getProductList({ limit: 100, category_id: activeL3.value });
      const parentList = Array.isArray(parentRes) ? parentRes : (Array.isArray(parentRes.data) ? parentRes.data : (parentRes.data?.data || []));
      if (parentList.length > 0) {
        const l4Obj = currentL4List.value.find(c => c.id === activeL4.value);
        const l4Name = (l4Obj?.category_name || '').replace('系列', '').trim().toLowerCase();
        const matched = parentList.filter(g => {
          const info = ((g.goods_name || '') + ' ' + (g.model || '')).toLowerCase();
          return l4Name && info.includes(l4Name);
        });
        list = matched.length > 0 ? matched : parentList;
      }
    }

    // 智能兜底 2：若后台新分类树节点暂未绑定数据，但全量库存在对应商品，做平滑回显
    if (!isCentralAC.value && list.length === 0 && !searchKeyword.value) {
      const allRes = await getProductList({ limit: 100 });
      const rawAll = Array.isArray(allRes) ? allRes : (Array.isArray(allRes.data) ? allRes.data : (allRes.data?.data || []));
      
      if (currentRootId.value === 87) {
        // 生活电器：空气能、冰箱、洗衣机、净水
        list = rawAll.filter(g => 
          [33, 46, 49, 25].includes(g.category_id) || 
          ['冰箱', '洗衣机', '净水', '空气能', '电风扇', '电饭煲', '加湿器', '消毒液', '电火锅', '果汁机', '吸尘器'].some(k => (g.goods_name || '').includes(k))
        );
        if (activeL2.value !== '全部') {
          const l2Obj = currentL2List.value.find(c => c.id === activeL2.value);
          const l2Name = l2Obj?.category_name || '';
          if (l2Name.includes('空气能')) {
            list = list.filter(g => g.category_id === 33 || (g.goods_name || '').includes('空气能'));
          } else if (l2Name.includes('冰箱')) {
            list = list.filter(g => [46, 49].includes(g.category_id) || (g.goods_name || '').includes('冰箱'));
          } else if (l2Name.includes('洗衣机')) {
            list = list.filter(g => (g.goods_name || '').includes('洗衣机'));
          } else if (l2Name.includes('净水')) {
            list = list.filter(g => (g.goods_name || '').includes('净水') || (g.goods_name || '').includes('过滤'));
          }
        }
      } else if (currentRootId.value === 86) {
        // 分体式空调：挂机、柜机
        list = rawAll.filter(g => 
          [23, 21, 19, 17, 16].includes(g.category_id) ||
          ((g.goods_name || '').includes('挂机') || (g.goods_name || '').includes('柜机') || (g.goods_name || '').includes('GW') || (g.goods_name || '').includes('LW'))
        );
        if (activeL2.value !== '全部') {
          const l2Obj = currentL2List.value.find(c => c.id === activeL2.value);
          const l2Name = l2Obj?.category_name || '';
          if (l2Name.includes('挂机')) {
            list = list.filter(g => (g.goods_name || '').includes('挂机') || (g.goods_name || '').includes('GW') || (g.goods_name || '').includes('G('));
          } else if (l2Name.includes('柜机')) {
            list = list.filter(g => (g.goods_name || '').includes('柜机') || (g.goods_name || '').includes('LW') || (g.goods_name || '').includes('L('));
          }
        }
      }
    }

    products.value = list;
  } catch (e) {
    console.error('[产品分类] 加载商品失败:', e);
  } finally {
    isLoading.value = false;
  }
};

onLoad(async (pageOptions = {}) => {
  // 微信小程序页面参数应从 onLoad 获取，setup 阶段读取 getCurrentPages 可能得到上一页或空参数。
  await loadCategories(pageOptions);
  isPageReady.value = true;
  await Promise.all([loadProducts(), loadCartData()]);
});

onShow(async () => {
  if (isPageReady.value) {
    await loadCartData();
  }
});

watch([currentRootId, activeL2, activeL3, activeL4, searchKeyword], () => {
  if (isPageReady.value) loadProducts();
});

const filteredProducts = computed(() => {
  let list = products.value;

  // 搜索关键字过滤
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase().trim();
    list = list.filter(p => 
      (p.goods_name && p.goods_name.toLowerCase().includes(kw)) ||
      (p.model && p.model.toLowerCase().includes(kw))
    );
  }

  // 非中央空调子分类多选过滤（默认全部勾选；取消选中哪个，就不显示哪个）
  if (!isCentralAC.value && currentL3List.value.length > 0) {
    if (selectedSubCatIds.value.length === 0) {
      return [];
    }

    const deselectedItems = currentL3List.value.filter(
      item => !selectedSubCatIds.value.includes(item.id)
    );

    if (deselectedItems.length > 0) {
      list = list.filter(p => {
        // 1. 如果商品绑定的 category_id 正好在未选中的子分类中，排除
        if (deselectedItems.some(d => d.id === p.category_id)) {
          return false;
        }
        // 2. 如果商品名称或型号中含有未选中的子分类名称（如品牌名“美的”、“奥克斯”或“商用”等），排除
        const pInfo = ((p.goods_name || '') + ' ' + (p.model || '')).toLowerCase();
        for (const d of deselectedItems) {
          const dName = (d.category_name || '').toLowerCase();
          if (dName && pInfo.includes(dName)) {
            return false;
          }
        }
        return true;
      });
    }
  }

  return list;
});

const formatPrice = (val) => Number(val || 0).toLocaleString();
</script>

<style lang="scss" scoped>
.category-page {
  /* 页面整体滚动，底部只预留原有 110rpx 购物车高度。 */
  padding: 0 0 110rpx;
  min-height: 100vh;
  height: auto;
  box-sizing: border-box;
  background: #f8fafc;
}

.central-category-wrap {
  /* 不裁切商品内容，长列表交给小程序页面本身滚动。 */
  overflow: visible;
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
  height: 74rpx;
  border-radius: 37rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.25s ease;

  &.active {
    color: #ffffff;
    background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
    box-shadow: 0 4rpx 14rpx rgba(29, 78, 216, 0.28);
  }
}

/* 分类筛选区：全展开平铺显示，字号与上方大分类一致（28rpx），便于指尖点按 */
.category-filters-container {
  background: #ffffff;
  border-bottom: 1rpx solid #e2e8f0;
  padding: 14rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.central-filters-box {
  .filter-rows-wrapper {
    width: 100%;
  }

  .filter-rows-inner {
    display: flex;
    flex-direction: column;
    gap: 14rpx;
  }
}

.non-central-filters-box {
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

/* 二级分类只占一行并支持横向滑动，右侧“更多”始终可见。字号沿用当前 28rpx。 */
.l2-scroll-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  margin: -14rpx -24rpx 0;
  background: #ffffff;
  border-bottom: 1rpx solid #eef2f7;
}

.l2-scroll-view {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.l2-scroll-inner {
  display: inline-flex;
  align-items: center;
  gap: 14rpx;
  padding: 14rpx 16rpx 14rpx 24rpx;
}

.l2-pill-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 8rpx 24rpx;
  border-radius: 28rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 28rpx;
  white-space: nowrap;

  &.active {
    background: #e0e7ff;
    color: #1d4ed8;
    font-weight: 700;
  }
}

.l2-more-fixed-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  height: 68rpx;
  flex-shrink: 0;
  padding: 0 22rpx 0 16rpx;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.95) 26%, #fff 100%);
  z-index: 2;
}

.more-label {
  font-size: 26rpx;
  color: #1d4ed8;
  font-weight: 600;
}

/* 更多分类弹窗 */
.cat-modal-content {
  background: #fff;
  padding: 28rpx 28rpx 40rpx;
  max-height: 70vh;
}

.cat-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.cat-modal-title {
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
}

.cat-modal-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
}

.cat-modal-scroll {
  max-height: 55vh;
}

.cat-modal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.cat-modal-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 76rpx;
  padding: 0 12rpx;
  border: 1.5rpx solid #e2e8f0;
  border-radius: 16rpx;
  background: #f8fafc;
  color: #334155;
  font-size: 24rpx;
  text-align: center;

  &.active {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #1d4ed8;
    font-weight: 700;
  }
}

.filter-level-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14rpx;
}

/* 统一分类药丸标签：字号28rpx，加大触摸热区 */
.filter-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 28rpx;
  min-height: 64rpx;
  border-radius: 34rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 28rpx;
  line-height: 1.35;
  box-sizing: border-box;
  transition: all 0.2s ease;
  
  &.active {
    background: #e0e7ff;
    color: #1d4ed8;
    font-weight: 700;
    box-shadow: 0 2rpx 8rpx rgba(29, 78, 216, 0.12);
  }
}

/* 子分类多选容器及标签：字号28rpx，全展开 */
.subcat-multi-container {
  width: 100%;
}

.subcat-multi-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14rpx;
}

.multi-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 26rpx;
  min-height: 64rpx;
  border-radius: 34rpx;
  background: #ffffff;
  border: 2rpx solid #cbd5e1;
  color: #64748b;
  font-size: 28rpx;
  line-height: 1.35;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &.is-selected {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #1d4ed8;
    font-weight: 700;
    box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.14);
  }

  .tag-check-mark {
    font-size: 26rpx;
    margin-right: 8rpx;
    font-weight: 800;
    color: #1d4ed8;
  }

  .tag-title {
    font-size: 28rpx;
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
  // 搜索文字和占位提示适当放大，提升真机上的可读性。
  font-size: 28rpx;
  line-height: 68rpx;
}

/* 商品列表（整行显示型号和名称，无图片） */
.product-scroll {
  width: 100%;
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
  font-size: 26rpx;
  padding: 14rpx 36rpx;
  border-radius: 32rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    opacity: 0.85;
    transform: scale(0.96);
  }
}

/* 步进器：加大触控区域与按压动效 */
.stepper {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 36rpx;
  padding: 4rpx;
  touch-action: manipulation;
  user-select: none;
}

.step-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #1e293b;
  background: #ffffff;
  border-radius: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.12s ease, opacity 0.12s ease;

  &:active {
    transform: scale(0.9);
    opacity: 0.75;
  }
}

.step-val {
  min-width: 56rpx;
  padding: 0 8rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
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
.empty-hint {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #94a3b8;
}
.select-all-btn {
  margin-top: 24rpx;
  padding: 12rpx 36rpx;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 24rpx;
  border-radius: 28rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(29, 78, 216, 0.2);
}

/* 购物车始终固定在屏幕底部，页面底部内边距保证末尾商品可完整滚出。 */
.mini-cart-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 110rpx;
  box-sizing: border-box;
  background: #1e293b;
  display: flex;
  align-items: center;
  align-items: stretch;
  padding-left: 32rpx;
  z-index: 100;
}

.cart-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
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

.cart-tip {
  font-size: 22rpx;
}

.cart-right {
  /* 蓝色点击区只占原有 110rpx 高度。 */
  flex: 0 0 32%;
  min-width: 0;
  background: #1d4ed8;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12rpx;
  box-sizing: border-box;
}
</style>
