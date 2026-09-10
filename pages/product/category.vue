<template>
  <view class="design-page category-page">
    <AppNavbar :title="currentRootName ? `${currentRootName}选型` : '产品选型'" />

    <view class="central-category-wrap">
      <!-- 顶部三大根大类快捷切换切换栏 (格力中央空调 / 格力生活电器 / 分体式空调) -->
      <view class="root-category-tabs">
        <view
          v-for="root in rootCategories"
          :key="root.id"
          class="root-tab-item"
          :class="{
            'active': currentRootId === root.id,
            'active--central': currentRootId === root.id && root.id === 58,
            'active--appliance': currentRootId === root.id && root.id === 87,
            'active--split': currentRootId === root.id && root.id === 86
          }"
          @click="selectRootCategory(root.id)"
        >
          <text class="root-tab-title">{{ root.category_name }}</text>
        </view>
      </view>

      <!-- 动态层级面包屑导航 -->
      <view class="crumb">
        <text class="crumb-root">{{ currentRootName }}</text>
        <text class="crumb-arrow"> › </text>
        <text class="crumb-l2">{{ activeL2Name }}</text>
        <template v-if="currentL3List.length > 0 && activeL3 !== '全部'">
          <text class="crumb-arrow"> › </text>
          <text class="crumb-l3">{{ activeL3Name }}</text>
        </template>
      </view>

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

      <!-- 分类主体：左侧二级品类导航 + 右侧(三级系列/品牌 + 商品列表) -->
      <view class="category-body">
        <!-- 左侧二级品类侧边栏 (Level 2) -->
        <scroll-view class="category-sidebar" scroll-y>
          <view
            class="sidebar-item"
            :class="{ active: activeL2 === '全部' }"
            @click="selectL2('全部')"
          >
            <view class="active-bar" />
            <text>全部设备</text>
          </view>
          <view
            v-for="item in currentL2List"
            :key="item.id"
            class="sidebar-item"
            :class="{ active: activeL2 === item.id }"
            @click="selectL2(item.id)"
          >
            <view class="active-bar" />
            <text>{{ item.category_name }}</text>
          </view>
        </scroll-view>

        <!-- 右侧主体内容 -->
        <view class="right-content">
          <!-- 右侧顶部三级分类胶囊栏 (Level 3，如系列或品牌；仅在二级有子分类时显示) -->
          <view v-if="currentL3List.length > 0" class="level3-panel" :class="{ 'is-expanded': isL3Expanded }">
            <!-- 展开状态：流式多行平铺网格，所有系列与品牌一览无余 -->
            <view v-if="isL3Expanded" class="level3-expanded-box">
              <view class="level3-expanded-head">
                <view class="expanded-head-left">
                  <text class="expanded-head-title">全部系列/品牌</text>
                  <text class="expanded-head-count">共 {{ currentL3List.length + 1 }} 项</text>
                </view>
                <view class="expanded-collapse-btn" @click="toggleL3Expand">
                  <text class="collapse-text">收起</text>
                  <up-icon name="arrow-up" size="14" color="#64748b" />
                </view>
              </view>
              <view class="level3-grid-container">
                <view
                  class="level3-item"
                  :class="{ active: activeL3 === '全部' }"
                  @click="selectL3('全部')"
                >
                  全部
                </view>
                <view
                  v-for="sub in currentL3List"
                  :key="sub.id"
                  class="level3-item"
                  :class="{ active: activeL3 === sub.id }"
                  @click="selectL3(sub.id)"
                >
                  {{ sub.category_name }}
                </view>
              </view>
            </view>

            <!-- 折叠状态：精简单行 + 右侧展开全览入口 -->
            <view v-else class="level3-collapsed-bar">
              <scroll-view class="level3-tabs" scroll-x :show-scrollbar="false">
                <view class="level3-tabs-inner">
                  <view
                    class="level3-item"
                    :class="{ active: activeL3 === '全部' }"
                    @click="selectL3('全部')"
                  >
                    全部
                  </view>
                  <view
                    v-for="sub in currentL3List"
                    :key="sub.id"
                    class="level3-item"
                    :class="{ active: activeL3 === sub.id }"
                    @click="selectL3(sub.id)"
                  >
                    {{ sub.category_name }}
                  </view>
                </view>
              </scroll-view>

              <!-- 右侧展开全览入口（当子项 >= 3 时显示） -->
              <view v-if="currentL3List.length >= 3" class="level3-expand-trigger" @click="toggleL3Expand">
                <view class="mask-fade" />
                <view class="trigger-pill">
                  <text class="trigger-label">更多</text>
                  <up-icon name="arrow-down" size="12" color="#2563eb" />
                </view>
              </view>
            </view>
          </view>

          <!-- 右侧商品滚动列表 -->
          <scroll-view class="product-scroll" scroll-y>
            <view v-if="filteredProducts.length" class="product-list-container">
              <view
                v-for="product in filteredProducts"
                :key="product.goods_id"
                class="series-product-card"
                @click="openPage('/pages/product/detail', { id: product.goods_id })"
              >
                <image
                  class="product-img"
                  :src="product.image || 'http://gh.starall.cn/static/resource/aircon/outdoor-unit.png'"
                  mode="aspectFit"
                />
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
              <text class="empty-title">当前分类下暂无匹配产品</text>
              <text class="empty-sub">可切换左侧分类或清除搜索关键词重试</text>
              <button class="btn-reset" @click="resetFilters">重置筛选</button>
            </view>
          </scroll-view>
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

const pageOptions = getPageOptions();

// 分类数据
const allTree = ref([]);
const currentRootId = ref(58); // 默认选中央空调 58
const activeL2 = ref('全部');
const activeL3 = ref('全部');

const searchKeyword = ref('');
const products = ref([]);
const isLoading = ref(false);
const isL3Expanded = ref(false);

const toggleL3Expand = () => {
  isL3Expanded.value = !isL3Expanded.value;
};

// 三大根分类定义
const ROOT_DEFS = [
  { id: 58, defaultName: '格力中央空调', alias: 'central' },
  { id: 87, defaultName: '格力生活电器', alias: 'appliance' },
  { id: 86, defaultName: '分体式空调', alias: 'split', legacyAlias: 'home' }
];

// 获取根分类列表
const rootCategories = computed(() => {
  if (!allTree.value.length) {
    return ROOT_DEFS.map(r => ({ id: r.id, category_name: r.defaultName }));
  }
  return ROOT_DEFS.map(r => {
    const found = allTree.value.find(c => c.id === r.id);
    return {
      id: r.id,
      category_name: found ? found.category_name : r.defaultName,
      children: found ? (found.children || []) : []
    };
  });
});

// 当前选中的根分类对象
const currentRoot = computed(() => {
  return rootCategories.value.find(r => r.id === currentRootId.value) || rootCategories.value[0];
});

const currentRootName = computed(() => {
  return currentRoot.value?.category_name || '产品分类';
});

// 当前大类下的二级分类列表
const currentL2List = computed(() => {
  const root = allTree.value.find(c => c.id === currentRootId.value);
  return root?.children || [];
});

// 当前二级分类对象
const currentL2Object = computed(() => {
  if (activeL2.value === '全部') return null;
  return currentL2List.value.find(c => c.id === activeL2.value) || null;
});

const activeL2Name = computed(() => {
  if (activeL2.value === '全部') return '全部设备';
  return currentL2Object.value ? currentL2Object.value.category_name : '全部设备';
});

// 当前选中的二级分类下的三级分类列表 (Level 3)
const currentL3List = computed(() => {
  if (!currentL2Object.value) return [];
  return currentL2Object.value.children || [];
});

const activeL3Name = computed(() => {
  if (activeL3.value === '全部') return '全部';
  const found = currentL3List.value.find(c => c.id === activeL3.value);
  return found ? found.category_name : '全部';
});

// 加载分类树
const loadCategories = async () => {
  try {
    const res = await getProductCategories();
    const rawList = Array.isArray(res) ? res : (res?.data || []);
    allTree.value = rawList;

    // 解析入参：可能是 root_id, category_id 或 type
    const queryRootId = pageOptions.root_id ? Number(pageOptions.root_id) : null;
    const queryCategoryId = pageOptions.category_id ? Number(pageOptions.category_id) : null;
    const queryType = pageOptions.type;

    if (queryRootId && ROOT_DEFS.some(r => r.id === queryRootId)) {
      currentRootId.value = queryRootId;
      if (queryCategoryId && queryCategoryId !== queryRootId) {
        // 检查是二级还是三级
        locateSubCategory(queryCategoryId);
      }
    } else if (queryCategoryId) {
      // 判断传入的是根分类、二级分类还是三级分类
      if (ROOT_DEFS.some(r => r.id === queryCategoryId)) {
        currentRootId.value = queryCategoryId;
      } else {
        locateAnyCategory(queryCategoryId);
      }
    } else if (queryType) {
      const match = ROOT_DEFS.find(r => r.alias === queryType || r.legacyAlias === queryType);
      if (match) currentRootId.value = match.id;
    }
  } catch (e) {
    console.warn('loadCategories error:', e);
  }
};

// 在当前根分类下定位子分类
const locateSubCategory = (targetId) => {
  const l2List = currentL2List.value;
  const l2Match = l2List.find(c => c.id === targetId);
  if (l2Match) {
    activeL2.value = targetId;
    activeL3.value = '全部';
    return;
  }
  // 查找是否属于某个三级
  for (const l2 of l2List) {
    const l3Match = (l2.children || []).find(sub => sub.id === targetId);
    if (l3Match) {
      activeL2.value = l2.id;
      activeL3.value = targetId;
      return;
    }
  }
};

// 在全局树中查找传入的任意分类 ID
const locateAnyCategory = (targetId) => {
  for (const root of allTree.value) {
    if (root.id === targetId) {
      currentRootId.value = root.id;
      activeL2.value = '全部';
      activeL3.value = '全部';
      return;
    }
    for (const l2 of (root.children || [])) {
      if (l2.id === targetId) {
        currentRootId.value = root.id;
        activeL2.value = l2.id;
        activeL3.value = '全部';
        return;
      }
      for (const l3 of (l2.children || [])) {
        if (l3.id === targetId) {
          currentRootId.value = root.id;
          activeL2.value = l2.id;
          activeL3.value = l3.id;
          return;
        }
      }
    }
  }
};

// 切换大类
const selectRootCategory = (rootId) => {
  if (currentRootId.value === rootId) return;
  currentRootId.value = rootId;
  activeL2.value = '全部';
  activeL3.value = '全部';
  searchKeyword.value = '';
  isL3Expanded.value = false;
};

// 切换二级分类
const selectL2 = (l2Id) => {
  activeL2.value = l2Id;
  activeL3.value = '全部';
  isL3Expanded.value = false;
};

// 切换三级分类
const selectL3 = (l3Id) => {
  activeL3.value = l3Id;
};

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = '';
  activeL2.value = '全部';
  activeL3.value = '全部';
  loadProducts();
};

// 加载商品数据
const loadProducts = async () => {
  isLoading.value = true;
  try {
    const params = { limit: 100 };
    if (activeL3.value && activeL3.value !== '全部') {
      params.category_id = activeL3.value;
    } else if (activeL2.value && activeL2.value !== '全部') {
      params.category_id = activeL2.value;
    } else if (currentRootId.value) {
      params.category_id = currentRootId.value;
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value.trim();
    }

    const res = await getProductList(params);
    const list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
    products.value = list;
  } catch (e) {
    console.warn('loadProducts error:', e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await loadCategories();
  await loadProducts();
});

watch([currentRootId, activeL2, activeL3], () => {
  loadProducts();
});

watch(searchKeyword, () => {
  loadProducts();
});

// 计算属性：前端模糊搜索匹配
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
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f7fc;
}

.central-category-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100vh - 88rpx);
  overflow: hidden;
}

/* 顶部三大根大类切换栏 */
.root-category-tabs {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx 10rpx;
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
    font-weight: 800;
  }

  &.active--central {
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
    box-shadow: 0 4rpx 14rpx rgba(29, 78, 216, 0.28);
  }

  &.active--appliance {
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
    box-shadow: 0 4rpx 14rpx rgba(234, 88, 12, 0.28);
  }

  &.active--split {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    box-shadow: 0 4rpx 14rpx rgba(5, 150, 105, 0.28);
  }
}

.crumb {
  display: flex;
  align-items: center;
  padding: 8rpx 28rpx 10rpx;
  color: #647389;
  font-size: 23rpx;
  background: #ffffff;
}

.crumb-root {
  font-weight: 700;
  color: #17233d;
}

.crumb-arrow {
  color: #94a3b8;
  margin: 0 6rpx;
}

.crumb-l2 {
  color: #2468e8;
  font-weight: 600;
}

.crumb-l3 {
  color: #6366f1;
  font-weight: 600;
}

.category-search-box {
  padding: 10rpx 24rpx 14rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #eef2f7;
}

.design-search {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 20rpx 0 24rpx;
  border-radius: 36rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
}

.design-search input {
  flex: 1;
  margin-left: 14rpx;
  font-size: 25rpx;
  color: #17233d;
}

.placeholder {
  color: #9aa5b5;
}

.category-body {
  display: flex;
  flex: 1;
  height: calc(100% - 210rpx);
  overflow: hidden;
  background: #fff;
}

/* 左侧二级侧边栏 */
.category-sidebar {
  width: 196rpx;
  height: 100%;
  background: #f8fafc;
  border-right: 1rpx solid #eef2f7;
}

.sidebar-item {
  position: relative;
  min-height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18rpx 16rpx;
  color: #64748b;
  font-size: 25rpx;
  font-weight: 500;
  text-align: center;
  line-height: 1.35;
  box-sizing: border-box;

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

/* 右侧主体 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
}

/* 三级胶囊切换栏及展开多行容器 */
.level3-panel {
  width: 100%;
  background: #ffffff;
  border-bottom: 1rpx solid #eef2f7;
  flex-shrink: 0;
  transition: all 0.25s ease;

  &.is-expanded {
    background: #fbfdff;
    box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.05);
  }
}

.level3-collapsed-bar {
  position: relative;
  width: 100%;
  height: 84rpx;
  display: flex;
  align-items: center;
}

.level3-tabs {
  width: 100%;
  height: 100%;
}

.level3-tabs-inner {
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  padding-right: 120rpx;
  height: 100%;
}

.level3-item {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #64748b;
  padding: 10rpx 22rpx;
  margin-right: 14rpx;
  border-radius: 24rpx;
  background: #f1f5f9;
  transition: all 0.2s ease;
  white-space: nowrap;

  &.active {
    color: #2468e8;
    background: #edf4ff;
    font-weight: 700;
  }
}

/* 折叠态右侧“更多”展开触发按钮与渐变遮罩 */
.level3-expand-trigger {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  z-index: 10;
}

.mask-fade {
  width: 44rpx;
  height: 100%;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), #ffffff 80%);
}

.trigger-pill {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx 8rpx 12rpx;
  background: #ffffff;
  border-left: 1rpx solid #f1f5f9;
  height: 100%;
}

.trigger-label {
  font-size: 22rpx;
  font-weight: 600;
  color: #2563eb;
}

/* 展开态：多行流式网格 */
.level3-expanded-box {
  padding: 16rpx 20rpx 20rpx;
}

.level3-expanded-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.expanded-head-left {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.expanded-head-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #1e293b;
}

.expanded-head-count {
  font-size: 20rpx;
  color: #94a3b8;
}

.expanded-collapse-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 14rpx;
  background: #f1f5f9;
  border-radius: 20rpx;
}

.collapse-text {
  font-size: 22rpx;
  color: #64748b;
  font-weight: 600;
}

.level3-grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  max-height: 360rpx;
  overflow-y: auto;

  .level3-item {
    margin-right: 0;
    padding: 10rpx 24rpx;
  }
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
  border: 1rpx solid #edf2f7;
  box-shadow: 0 4rpx 14rpx rgba(23, 35, 61, 0.03);
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
</style>
