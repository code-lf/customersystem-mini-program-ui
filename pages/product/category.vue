<template>
  <view class="design-page category-page">
    <AppNavbar :title="isHome ? '家用空调选型' : '中央空调选型'" />

    <!-- 家用空调选型入口 -->
    <view v-if="isHome" class="home-category">
      <view class="category-search-box">
        <view class="design-search">
          <up-icon name="search" size="18" color="#9aa5b5" />
          <input
            v-model="homeSearchKeyword"
            placeholder="搜索家用空调产品型号、系列..."
            placeholder-class="placeholder"
            @confirm="handleHomeSearch"
          />
          <up-icon
            v-if="homeSearchKeyword"
            name="close-circle-fill"
            size="16"
            color="#9aa5b5"
            @click="homeSearchKeyword = ''"
          />
          <button class="search-confirm-btn" @click="handleHomeSearch">搜索</button>
        </view>
      </view>

      <view
        v-for="item in homeCategories"
        :key="item.id"
        class="home-category__card"
        @click="openPage('/pages/product/list', { type: 'home', category: item.id, category_id: item.category_id })"
      >
        <view class="home-category__info">
          <text class="home-category__title">{{ item.category_name }}</text>
          <text class="home-category__desc">{{ item.desc }}</text>
          <view class="home-category__badge">
            <text>共 {{ item.count }} 款型号</text>
            <up-icon name="arrow-right" size="14" color="#2468e8" />
          </view>
        </view>
        <image :src="item.image" mode="aspectFit" />
      </view>
    </view>

    <!-- 中央空调专业选型 -->
    <view v-else class="central-category-wrap">
      <!-- 动态面包屑 -->
      <view class="crumb">
        <text>中央空调</text>
        <text> › </text>
        <text>{{ activeTypeName }}</text>
        <text v-if="activeSideCategory && activeSideCategory !== '全部' && activeSideCategoryName"> › {{ activeSideCategoryName }}</text>
      </view>

      <!-- 搜索与快捷筛选 -->
      <view class="category-search-box">
        <view class="design-search">
          <up-icon name="search" size="18" color="#9aa5b5" />
          <input
            v-model="searchKeyword"
            placeholder="搜索系列或型号 (如 VK8R、VM、室外机)..."
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

      <!-- 一级分类标签栏 (多行排列 + 默认一行 + 展开全部) -->
      <view class="type-tag-section">
        <view class="tag-section-header">
          <text class="tag-section-title">品牌 / 一级分类 ({{ categories.length }})</text>
          <view class="tag-expand-btn" @click="isTagExpanded = !isTagExpanded">
            <text>{{ isTagExpanded ? '收起' : '展开全部' }}</text>
            <up-icon :name="isTagExpanded ? 'arrow-up' : 'arrow-down'" size="13" color="#2468e8" />
          </view>
        </view>

        <view class="tag-container" :class="{ 'is-collapsed': !isTagExpanded, 'is-expanded': isTagExpanded }">
          <view
            v-for="item in categories"
            :key="item.id"
            class="type-tag-item"
            :class="{ active: activeType === item.id }"
            @click="selectType(item.id)"
          >
            <text class="type-tag-text">{{ item.category_name }}</text>
          </view>
        </view>
      </view>

      <!-- 左侧分类侧边栏 + 右侧商品列表 -->
      <view class="category-body">
        <!-- 左侧分类导航 -->
        <scroll-view class="category-sidebar" scroll-y>
          <view
            class="sidebar-item"
            :class="{ active: activeSideCategory === '全部' }"
            @click="activeSideCategory = '全部'"
          >
            <view class="active-bar" />
            <text>全部设备</text>
          </view>
          <view
            v-for="item in (categories.find(c => c.id === activeType)?.children || [])"
            :key="item.id"
            class="sidebar-item"
            :class="{ active: activeSideCategory === item.id }"
            @click="selectSideCategory(item.id)"
          >
            <view class="active-bar" />
            <text>{{ item.category_name }}</text>
          </view>
        </scroll-view>

        <!-- 右侧商品列表 -->
        <scroll-view class="product-scroll" scroll-y>
          <view v-if="filteredProducts.length" class="product-list-container">
            <view
              v-for="product in filteredProducts"
              :key="product.goods_id"
              class="series-product-card"
              @click="openPage('/pages/product/detail', { id: product.goods_id })"
            >
              <image class="product-img" :src="product.image || 'http://gh.starall.cn/static/resource/aircon/outdoor-unit.png'" mode="aspectFit" />
              <view class="product-info">
                <view class="model-row">
                  <text class="model-name">{{ product.model }}</text>
                  <text v-if="product.tag" class="tag-badge red">{{ product.tag }}</text>
                  <text v-if="product.greenTag" class="tag-badge green">{{ product.greenTag }}</text>
                </view>
                <text class="product-name-sub">{{ product.goods_name }}</text>
                <text class="spec-line">{{ (product.spec || []).slice(0, 2).join(' | ') || product.category_name }}</text>
                <view class="price-action-row">
                  <view class="price-wrap">
                    <text class="price-symbol">¥</text>
                    <text class="price-num">{{ formatPrice(product.price) }}</text>
                  </view>
                  <button class="btn-add" @click.stop="addToSolution(product)">+ 报价单</button>
                </view>
              </view>
            </view>
          </view>

          <view v-else class="empty-state">
            <up-icon name="info-circle" size="48" color="#b7c5d8" />
            <text class="empty-title">未找到匹配的型号</text>
            <text class="empty-sub">可尝试清除搜索词或切换左侧分类</text>
            <button class="btn-reset" @click="resetFilters">重置筛选</button>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { getProductCategories, getProductList } from '@/api/product';

const pageOptions = getPageOptions();
const isHome = computed(() => pageOptions.type === 'home');

const categories = ref([]);
const activeType = ref(0);
const activeSideCategory = ref('全部');
const isTagExpanded = ref(false);

const searchKeyword = ref('');
const homeSearchKeyword = ref('');
const products = ref([]);
const allGoodsCount = ref(0);
const wallGoodsCount = ref(0);
const cabinetGoodsCount = ref(0);
const isLoading = ref(false);

const activeTypeName = computed(() => {
  const current = categories.value.find((item) => item.id === activeType.value);
  return current ? current.category_name : '分类';
});

const activeSideCategoryName = computed(() => {
  if (activeSideCategory.value === '全部') return '全部';
  const currentParent = categories.value.find((item) => item.id === activeType.value);
  const child = (currentParent?.children || []).find((c) => c.id === activeSideCategory.value);
  return child ? child.category_name : '';
});

// 家用空调动态卡片数量
const homeCategories = computed(() => {
  return [
    {
      id: 'wall',
      category_name: '壁挂式空调',
      category_id: 14,
      desc: '节能静音 / 快速冷暖',
      count: wallGoodsCount.value || 1,
      image: 'http://gh.starall.cn/static/resource/aircon/home-green.png'
    },
    {
      id: 'cabinet',
      category_name: '柜式空调',
      category_id: 19,
      desc: '大风量 / 快速制冷制热',
      count: cabinetGoodsCount.value || 1,
      image: 'http://gh.starall.cn/static/resource/aircon/home-cabinet-green.png'
    }
  ];
});

const handleHomeSearch = () => {
  openPage('/pages/product/list', {
    type: 'home',
    keyword: homeSearchKeyword.value
  });
};

const loadCategories = async () => {
  try {
    const res = await getProductCategories();
    const rawList = Array.isArray(res) ? res : (res?.data || []);
    categories.value = rawList;
    if (categories.value.length > 0) {
      if (pageOptions.category_id) {
        const targetId = Number(pageOptions.category_id);
        const exists = categories.value.find(c => c.id === targetId);
        if (exists) {
          activeType.value = targetId;
        } else {
          activeType.value = categories.value[0].id;
        }
      } else {
        activeType.value = categories.value[0].id;
      }
    }
  } catch(e) {
    console.warn('loadCategories error:', e);
  }
};

const loadProducts = async () => {
  isLoading.value = true;
  try {
    const params = { limit: 100 };
    if (activeSideCategory.value && activeSideCategory.value !== '全部') {
      params.category_id = activeSideCategory.value;
    } else if (activeType.value) {
      params.category_id = activeType.value;
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }

    const res = await getProductList(params);
    const list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
    products.value = list;
  } catch(e) {
    console.warn('loadProducts error:', e);
  } finally {
    isLoading.value = false;
  }
};

const loadOverallGoodsCounts = async () => {
  try {
    const res = await getProductList({ limit: 100 });
    const list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
    allGoodsCount.value = list.length;
    
    // 计算真实壁挂式与柜式匹配数
    const wallItems = list.filter(g => (g.category_name || '').includes('家用') || (g.goods_name || '').includes('挂') || (g.model || '').includes('26') || (g.category_id === 14));
    const cabinetItems = list.filter(g => (g.category_name || '').includes('春兰') || (g.goods_name || '').includes('柜') || (g.model || '').includes('LF') || (g.category_id === 19));
    
    wallGoodsCount.value = wallItems.length || 1;
    cabinetGoodsCount.value = cabinetItems.length || 1;
  } catch(e) {}
};

onMounted(async () => {
  await loadCategories();
  await loadProducts();
  await loadOverallGoodsCounts();
});

watch([activeSideCategory, activeType], () => {
  loadProducts();
});

watch(searchKeyword, () => {
  loadProducts();
});

const selectType = (typeId) => {
  activeType.value = typeId;
  activeSideCategory.value = '全部';
};

const selectSideCategory = (id) => {
  activeSideCategory.value = id;
};

const resetFilters = () => {
  searchKeyword.value = '';
  activeSideCategory.value = '全部';
  loadProducts();
};

const filteredProducts = computed(() => {
  if (!searchKeyword.value) return products.value;
  const kw = searchKeyword.value.toLowerCase().trim();
  return products.value.filter(p => 
    (p.goods_name && p.goods_name.toLowerCase().includes(kw)) ||
    (p.model && p.model.toLowerCase().includes(kw)) ||
    (p.category_name && p.category_name.toLowerCase().includes(kw))
  );
});

const formatPrice = (val) => Number(val || 0).toLocaleString();

const addToSolution = (product) => {
  uni.setStorageSync('pendingSolutionProduct', {
    id: product.goods_id,
    name: product.goods_name,
    model: product.model,
    image: product.image,
    price: product.price,
    mockUnitPrice: product.price
  });
  uni.showToast({ title: '已加入报价单', icon: 'success' });
};
</script>

<style lang="scss" scoped>
.category-page {
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #eaf2ff 0%, #f4f7fc 240rpx, #f4f7fc 100%);
}

.home-category {
  padding: 0 24rpx;
}

.home-category__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(23, 35, 61, 0.05);

  &:first-of-type {
    background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
    border: 1px solid #dcebfe;
  }

  &:last-of-type {
    background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
    border: 1px solid #dcfce7;
  }

  image {
    width: 200rpx;
    height: 160rpx;
  }
}

.home-category__info {
  display: flex;
  flex-direction: column;
}

.home-category__title {
  color: #17233d;
  font-size: 34rpx;
  font-weight: 800;
}

.home-category__desc {
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.home-category__badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 18rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  background: #ffffff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
  box-shadow: 0 2rpx 8rpx rgba(36, 104, 232, 0.12);
  width: fit-content;
}

.central-category-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100vh - 88rpx);
  overflow: hidden;
}

.crumb {
  padding: 10rpx 28rpx 6rpx;
  color: #647389;
  font-size: 24rpx;
}

.crumb text:nth-child(even) {
  color: #a4b0c3;
  margin: 0 4rpx;
}

.category-search-box {
  padding: 6rpx 24rpx 12rpx;
}

.design-search {
  display: flex;
  align-items: center;
  height: 76rpx;
  padding: 0 20rpx 0 26rpx;
  border-radius: 38rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.05);
}

.design-search input {
  flex: 1;
  margin-left: 14rpx;
  font-size: 26rpx;
  color: #17233d;
}

.search-confirm-btn {
  height: 52rpx;
  line-height: 52rpx;
  padding: 0 22rpx;
  border-radius: 26rpx;
  background: #2468e8;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  margin: 0;
  border: none;
}

/* 一级分类标签栏 (多行排列 + 默认一行 + 展开全部) */
.type-tag-section {
  padding: 0 24rpx 14rpx;
}

.tag-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.tag-section-title {
  color: #64748b;
  font-size: 22rpx;
  font-weight: 600;
}

.tag-expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
  padding: 4rpx 8rpx;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  transition: max-height 0.3s ease;

  &.is-collapsed {
    max-height: 60rpx;
    overflow: hidden;
  }

  &.is-expanded {
    max-height: 420rpx;
    overflow-y: auto;
    padding-bottom: 8rpx;
  }
}

.type-tag-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 24rpx;
  border-radius: 28rpx;
  background: #ffffff;
  color: #475569;
  font-size: 24rpx;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2rpx 6rpx rgba(15, 23, 42, 0.04);
  transition: all 0.2s ease;

  &.active {
    background: linear-gradient(135deg, #2b70f6 0%, #1555d4 100%);
    color: #ffffff;
    font-weight: 700;
    border-color: #2468e8;
    box-shadow: 0 6rpx 16rpx rgba(36, 104, 232, 0.3);
  }
}

.type-tag-text {
  white-space: nowrap;
}

.category-body {
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
  background: #fff;
  border-top: 1rpx solid #eef2f7;
}

.category-sidebar {
  width: 190rpx;
  height: 100%;
  background: #f7f9fc;
  border-right: 1rpx solid #edf1f7;
}

.sidebar-item {
  position: relative;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16rpx;
  color: #64748b;
  font-size: 25rpx;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;

  &.active {
    background: #ffffff;
    color: #2468e8;
    font-weight: 800;
  }
}

.active-bar {
  display: none;
  position: absolute;
  left: 0;
  top: 24rpx;
  bottom: 24rpx;
  width: 8rpx;
  border-radius: 0 4rpx 4rpx 0;
  background: #2468e8;
}

.sidebar-item.active .active-bar {
  display: block;
}

.product-scroll {
  flex: 1;
  height: 100%;
  padding: 16rpx 20rpx;
  box-sizing: border-box;
}

.product-list-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.series-product-card {
  display: flex;
  padding: 20rpx;
  border-radius: 18rpx;
  background: #ffffff;
  border: 1px solid #f1f4f9;
  box-shadow: 0 4rpx 14rpx rgba(23, 35, 61, 0.04);
}

.product-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 14rpx;
  background: #f8fafc;
  margin-right: 18rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.model-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.model-name {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 800;
}

.tag-badge {
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: 700;

  &.red {
    background: #fef2f2;
    color: #ef4444;
  }
  &.green {
    background: #f0fdf4;
    color: #10b981;
  }
}

.product-name-sub {
  color: #64748b;
  font-size: 22rpx;
  margin-top: 4rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spec-line {
  color: #94a3b8;
  font-size: 20rpx;
  margin-top: 4rpx;
}

.price-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
  padding-top: 10rpx;
  border-top: 1rpx solid #f8fafc;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  color: #ef4444;
  font-weight: 800;
}

.price-symbol {
  font-size: 20rpx;
}

.price-num {
  font-size: 28rpx;
  margin-left: 2rpx;
}

.btn-add {
  height: 48rpx;
  line-height: 48rpx;
  padding: 0 20rpx;
  margin: 0;
  border-radius: 24rpx;
  background: #2468e8;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  border: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 30rpx;
  text-align: center;
}

.empty-title {
  margin-top: 20rpx;
  color: #1e293b;
  font-size: 28rpx;
  font-weight: 700;
}

.empty-sub {
  margin-top: 8rpx;
  color: #94a3b8;
  font-size: 22rpx;
}

.btn-reset {
  margin-top: 28rpx;
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 32rpx;
  border-radius: 30rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
  border: none;
}

.placeholder {
  color: #9aa5b5;
}
</style>
