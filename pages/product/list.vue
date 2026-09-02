<template>
  <view class="design-page list-page">
    <AppNavbar :title="pageTitle" />

    <!-- 顶部搜索栏 -->
    <view class="list-search-box">
      <view class="design-search">
        <up-icon name="search" size="18" color="#9aa5b5" />
        <input
          v-model="keywordInput"
          placeholder="搜索型号、系列、名称 (如 7890、GMV)..."
          placeholder-class="placeholder"
          @confirm="onSearchConfirm"
        />
        <up-icon
          v-if="keywordInput"
          name="close-circle-fill"
          size="16"
          color="#9aa5b5"
          @click="clearKeyword"
        />
      </view>
    </view>

    <!-- 面包屑导航 & 商品数量 -->
    <view class="meta-status-bar">
      <view class="crumb-line">
        <text>{{ isHome ? '家用空调' : '中央空调' }}</text>
        <text class="divider">/</text>
        <text>{{ currentCategoryName }}</text>
      </view>
      <text class="count-badge">共 {{ displayProducts.length }} 款产品</text>
    </view>

    <!-- 筛选横条 -->
    <view class="filter-row">
      <view
        v-for="item in currentFilterTabs"
        :key="item.key"
        class="filter-tab"
        :class="{ active: activeFilterKey === item.key || selectedFilters[item.key] }"
        @click="toggleDropdown(item.key)"
      >
        <text class="filter-label-text">{{ getTabDisplayLabel(item) }}</text>
        <up-icon
          :name="activeFilterKey === item.key ? 'arrow-up-fill' : 'arrow-down-fill'"
          size="10"
          :color="(activeFilterKey === item.key || selectedFilters[item.key]) ? '#2468e8' : '#8b95a7'"
        />
      </view>

      <view class="filter-sort" :class="{ 'sort-active': true }" @click="toggleSort">
        <up-icon :name="sortAsc ? 'arrow-up' : 'arrow-down'" size="14" color="#2468e8" />
        <text>价格 {{ sortAsc ? '升序' : '降序' }}</text>
      </view>
    </view>

    <!-- 下拉筛选弹层 -->
    <view v-if="activeFilterKey" class="dropdown-mask" @click="closeDropdown">
      <view class="dropdown-menu-card" @click.stop>
        <view class="dropdown-header">
          <text class="dropdown-title">选择{{ getCurrentTabName }}</text>
          <text class="dropdown-reset" @click="resetCurrentFilter">重置</text>
        </view>
        <view class="dropdown-options-grid">
          <view
            v-for="opt in currentOptions"
            :key="opt.value"
            class="dropdown-option-pill"
            :class="{ active: isOptionSelected(opt.value) }"
            @click="onSelectOption(opt.value)"
          >
            <text>{{ opt.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 家用空调网格布局 -->
    <view v-if="isHome" class="home-grid">
      <view
        v-for="product in displayProducts"
        :key="(product.goods_id || product.id)"
        class="home-product-card"
        @click="openPage('/pages/product/detail', { id: (product.goods_id || product.id) })"
      >
        <text v-if="product.comment" class="hot-tag">{{ product.comment }}</text>
        <image class="home-product-img" :src="product.image || 'http://gh.starall.cn/static/resource/aircon/home-green.png'" mode="aspectFit" />
        <view class="home-product-info">
          <text class="home-product__name">{{ product.goods_name }}</text>
          <text class="home-product__model">{{ product.model || '-' }}</text>
          <view class="home-product-bottom">
            <view class="home-product__price">
              <text class="symbol">¥</text>
              <text class="num">{{ money(product.price) }}</text>
            </view>
            <button class="home-add-btn" @click.stop="addToSolution(product)">+ 报价单</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 中央空调列表布局 -->
    <view v-else class="central-list">
      <view
        v-for="product in displayProducts"
        :key="(product.goods_id || product.id)"
        class="list-product-card"
        @click="openPage('/pages/product/detail', { id: (product.goods_id || product.id) })"
      >
        <image class="list-product-img" :src="product.image || 'http://gh.starall.cn/static/resource/aircon/outdoor-unit.png'" mode="aspectFit" />
        <view class="list-product__body">
          <view class="list-product__title-row">
            <text class="list-product__model">{{ product.model || '标准型号' }}</text>
            <text v-if="product.comment" class="red-tag">{{ product.comment }}</text>
            <text v-if="product.greenTag" class="green-tag">{{ product.greenTag }}</text>
          </view>
          <text class="list-product__name-sub">{{ product.goods_name }}</text>
          <text class="list-product__spec">{{ (product.spec ? product.spec.split(" ") : [product.category_name || '空调设备']).slice(0, 2).join(' | ') }}</text>
          <view class="list-product__bottom">
            <view class="price-box">
              <text class="price-label">参考价</text>
              <text class="price-val">¥{{ money(product.price) }}</text>
            </view>
            <button class="btn-quote" @click.stop="addToSolution(product)">+ 加入报价单</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!isLoading && displayProducts.length === 0" class="empty-state">
      <up-icon name="search" size="48" color="#b8c5d6" />
      <text class="empty-title">未找到匹配的产品</text>
      <text class="empty-sub">可尝试清除关键词或重置筛选条件</text>
      <button class="btn-reset-all" @click="resetAllFilters">清空所有筛选</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { getProductList } from '@/api/product';

const pageOptions = getPageOptions();
const isHome = computed(() => pageOptions.type === 'home' || ['wall', 'cabinet'].includes(pageOptions.category));
const currentCategoryName = computed(() => {
  if (pageOptions.category === 'cabinet') return '柜式空调';
  if (pageOptions.category === 'wall') return '壁挂式空调';
  return '全系列设备';
});

const keywordInput = ref(pageOptions.keyword || '');
const activeFilterKey = ref('');
const sortAsc = ref(true);
const products = ref([]);
const isLoading = ref(false);

const selectedFilters = reactive({
  horse: '',
  cooling: '',
  energy: '',
  area: '',
  power: '',
  brand: ''
});

const homeFilterTabs = [
  { key: 'horse', name: '匹数' },
  { key: 'energy', name: '能效' },
  { key: 'area', name: '适用面积' },
  { key: 'brand', name: '品牌' }
];

const centralFilterTabs = [
  { key: 'cooling', name: '冷量' },
  { key: 'energy', name: '能效' },
  { key: 'power', name: '电源' },
  { key: 'brand', name: '更多' }
];

const currentFilterTabs = computed(() => isHome.value ? homeFilterTabs : centralFilterTabs);

const pageTitle = computed(() => {
  if (!isHome.value) return '中央空调产品列表';
  return pageOptions.category === 'cabinet' ? '柜式空调' : '壁挂式空调';
});

// 下拉选项定义
const filterOptionsMap = {
  horse: [
    { label: '全部匹数', value: '' },
    { label: '大1匹 (26机)', value: '26' },
    { label: '1.5匹 (35机)', value: '35' },
    { label: '2匹 (50机)', value: '50' },
    { label: '3匹 (72机)', value: '72' },
    { label: '5匹 (120机)', value: '120' },
    { label: '10匹及以上', value: '10P' }
  ],
  cooling: [
    { label: '全部冷量', value: '' },
    { label: '5.6kW - 9.0kW', value: '90' },
    { label: '9.0kW - 14.0kW', value: '140' },
    { label: '14.0kW - 28.0kW', value: '28' },
    { label: '28.0kW 以上', value: 'large' }
  ],
  energy: [
    { label: '全部能效', value: '' },
    { label: '新一级能效', value: '1' },
    { label: '二级能效', value: '2' },
    { label: '三级能效', value: '3' }
  ],
  area: [
    { label: '全部面积', value: '' },
    { label: '10 - 15㎡', value: '15' },
    { label: '16 - 24㎡', value: '24' },
    { label: '25 - 35㎡', value: '35' },
    { label: '36 - 55㎡', value: '55' },
    { label: '55㎡ 以上', value: 'large' }
  ],
  power: [
    { label: '全部电源', value: '' },
    { label: '220V 单相电', value: '220' },
    { label: '380V 三相电', value: '380' }
  ],
  brand: [
    { label: '全部品牌', value: '' },
    { label: '格力', value: '格力' },
    { label: '春兰', value: '春兰' },
    { label: '美的', value: '美的' },
    { label: '大金', value: '大金' },
    { label: '三菱电机', value: '三菱' },
    { label: '辅材类', value: '辅材' }
  ]
};

const getCurrentTabName = computed(() => {
  const tab = currentFilterTabs.value.find(t => t.key === activeFilterKey.value);
  return tab ? tab.name : '筛选';
});

const currentOptions = computed(() => {
  return filterOptionsMap[activeFilterKey.value] || [];
});

const getTabDisplayLabel = (item) => {
  const currentVal = selectedFilters[item.key];
  if (!currentVal) return item.name;
  const optList = filterOptionsMap[item.key] || [];
  const matched = optList.find(o => o.value === currentVal);
  return matched ? matched.label.replace(/\(.*\)/, '') : item.name;
};

const toggleDropdown = (key) => {
  activeFilterKey.value = activeFilterKey.value === key ? '' : key;
};

const closeDropdown = () => {
  activeFilterKey.value = '';
};

const isOptionSelected = (val) => {
  return selectedFilters[activeFilterKey.value] === val;
};

const onSelectOption = (val) => {
  selectedFilters[activeFilterKey.value] = val;
  closeDropdown();
};

const resetCurrentFilter = () => {
  selectedFilters[activeFilterKey.value] = '';
  closeDropdown();
};

const resetAllFilters = () => {
  keywordInput.value = '';
  Object.keys(selectedFilters).forEach(k => {
    selectedFilters[k] = '';
  });
  activeFilterKey.value = '';
  loadProducts();
};

const toggleSort = () => {
  sortAsc.value = !sortAsc.value;
};

const clearKeyword = () => {
  keywordInput.value = '';
};

const onSearchConfirm = () => {
  loadProducts();
};

const loadProducts = async () => {
  isLoading.value = true;
  try {
    const params = { limit: 100 };
    if (pageOptions.category_id) params.category_id = pageOptions.category_id;
    if (keywordInput.value) params.keyword = keywordInput.value;
    const res = await getProductList(params);
    const list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
    products.value = list;
  } catch(e) {
    console.warn('loadProducts error:', e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (pageOptions.filter_horse) {
    selectedFilters.horse = pageOptions.filter_horse;
  }
  if (pageOptions.filter_brand) {
    selectedFilters.brand = pageOptions.filter_brand;
  }
  loadProducts();
});

const displayProducts = computed(() => {
  let list = [...products.value];

  // 1. 关键词过滤
  if (keywordInput.value) {
    const kw = keywordInput.value.toLowerCase().trim();
    list = list.filter(p =>
      (p.goods_name && p.goods_name.toLowerCase().includes(kw)) ||
      (p.model && p.model.toLowerCase().includes(kw)) ||
      (p.category_name && p.category_name.toLowerCase().includes(kw)) ||
      (p.comment && p.comment.toLowerCase().includes(kw))
    );
  }

  // 2. 匹数/冷量/品牌等下拉过滤
  if (selectedFilters.horse) {
    list = list.filter(p =>
      (p.goods_name && p.goods_name.includes(selectedFilters.horse)) ||
      (p.model && p.model.includes(selectedFilters.horse)) ||
      (p.spec && p.spec.includes(selectedFilters.horse))
    );
  }

  if (selectedFilters.cooling) {
    list = list.filter(p =>
      (p.goods_name && p.goods_name.includes(selectedFilters.cooling)) ||
      (p.model && p.model.includes(selectedFilters.cooling))
    );
  }

  if (selectedFilters.brand) {
    list = list.filter(p =>
      (p.category_name && p.category_name.includes(selectedFilters.brand)) ||
      (p.goods_name && p.goods_name.includes(selectedFilters.brand))
    );
  }

  // 3. 价格排序
  return list.sort((a, b) => sortAsc.value ? (Number(a.price) - Number(b.price)) : (Number(b.price) - Number(a.price)));
});

const money = (value) => Number(value || 0).toLocaleString();

const addToSolution = (product) => {
  uni.setStorageSync('pendingSolutionProduct', {
    id: (product.goods_id || product.id),
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
.list-page {
  position: relative;
  min-height: 100vh;
  padding: 0 24rpx 100rpx;
  background: linear-gradient(180deg, #eaf2ff 0%, #f4f7fc 240rpx, #f4f7fc 100%);
}

.list-search-box {
  padding: 10rpx 0 12rpx;
}

.design-search {
  display: flex;
  align-items: center;
  height: 76rpx;
  padding: 0 24rpx;
  border-radius: 38rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.05);

  input {
    flex: 1;
    margin-left: 14rpx;
    font-size: 26rpx;
    color: #17233d;
  }
}

.meta-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6rpx 4rpx 12rpx;
}

.crumb-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #7b889d;
  font-size: 24rpx;

  .divider {
    color: #bac4d4;
  }
}

.count-badge {
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
  background: #edf4ff;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84rpx;
  margin-bottom: 20rpx;
  padding: 0 16rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.04);
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: #586477;
  font-size: 25rpx;
  font-weight: 500;
  padding: 10rpx 8rpx;

  &.active {
    color: #2468e8;
    font-weight: 700;
  }
}

.filter-label-text {
  max-width: 130rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-sort {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
}

/* 下拉菜单浮层 */
.dropdown-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 290rpx;
}

.dropdown-menu-card {
  margin: 0 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, 0.15);
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.dropdown-title {
  color: #1e293b;
  font-size: 28rpx;
  font-weight: 700;
}

.dropdown-reset {
  color: #64748b;
  font-size: 24rpx;
}

.dropdown-options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.dropdown-option-pill {
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 24rpx;
  font-weight: 500;
  transition: all 0.2s ease;

  &.active {
    background: #edf4ff;
    border-color: #2468e8;
    color: #2468e8;
    font-weight: 700;
  }
}

.central-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.list-product-card {
  display: flex;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.list-product-img {
  width: 168rpx;
  height: 168rpx;
  margin-right: 22rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
  flex-shrink: 0;
}

.list-product__body {
  flex: 1;
  min-width: 0;
}

.list-product__title-row {
  display: flex;
  align-items: center;
}

.list-product__model {
  color: #17233d;
  font-size: 32rpx;
  font-weight: 900;
}

.red-tag,
.green-tag {
  margin-left: 12rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.red-tag {
  background: #fff0ed;
  color: #ef543f;
}

.green-tag {
  background: #e9f8f0;
  color: #2fa777;
}

.list-product__name-sub {
  display: block;
  margin-top: 4rpx;
  color: #647389;
  font-size: 24rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-product__spec {
  display: block;
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.list-product__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
  padding-top: 14rpx;
  border-top: 1rpx solid #f1f4f9;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.price-label {
  color: #8b95a7;
  font-size: 22rpx;
}

.price-val {
  color: #ef543f;
  font-size: 32rpx;
  font-weight: 900;
}

.btn-quote {
  height: 56rpx;
  padding: 0 26rpx;
  border-radius: 28rpx;
  background: #2468e8;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 56rpx;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.25);
  border: none;
}

/* 家用空调网格 */
.home-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.home-product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.04);
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
}

.hot-tag {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  z-index: 2;
  max-width: calc(100% - 24rpx);
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  background: #ef543f;
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.home-product-img {
  width: 100%;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f7f9fc;
  box-sizing: border-box;
}

.home-product-info {
  margin-top: 10rpx;
  min-width: 0;
}

.home-product__name {
  display: block;
  color: #17233d;
  font-size: 24rpx;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-product__model {
  display: block;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 20rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
  min-width: 0;
}

.home-product__price {
  color: #ef543f;
  font-weight: 900;
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
}

.home-product__price .symbol {
  font-size: 20rpx;
}

.home-product__price .num {
  font-size: 26rpx;
  margin-left: 2rpx;
}

.home-add-btn {
  height: 44rpx;
  padding: 0 14rpx;
  margin: 0;
  border-radius: 22rpx;
  background: #2468e8;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 44rpx;
  box-sizing: border-box;
  white-space: nowrap;
  flex-shrink: 0;
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

.btn-reset-all {
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
