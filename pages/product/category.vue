<template>
  <view class="design-page category-page">
    <AppNavbar :title="isHome ? '家用空调选型' : '中央空调选型'" />

    <!-- 家用空调选型入口 -->
    <view v-if="isHome" class="home-category">
      <view class="category-search-box">
        <view class="design-search">
          <up-icon name="search" size="18" color="#9aa5b5" />
          <input
            v-model="searchKeyword"
            placeholder="搜索家用空调产品型号、系列..."
            placeholder-class="placeholder"
          />
        </view>
      </view>
      <view
        v-for="item in uiCategories.home"
        :key="item.id"
        class="home-category__card"
        @click="openPage('/pages/product/list', { type: 'home', category: item.id })"
      >
        <view class="home-category__info">
          <text class="home-category__title">{{ item.name }}</text>
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
        <text v-if="activeSeries"> › {{ activeSeries }}</text>
        <text v-if="activeSideCategory && activeSideCategory !== '全部'"> › {{ activeSideCategory }}</text>
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

      <!-- 一级分类导航 -->
      <view class="type-tabs-scroll">
        <view
          v-for="item in uiCategories.central"
          :key="item.id"
          class="type-tab-item"
          :class="{ active: activeType === item.id }"
          @click="selectType(item.id)"
        >
          <text>{{ item.name }}</text>
        </view>
      </view>

      <!-- 二级系列横向标签 -->
      <view class="series-tabs-scroll">
        <view
          class="series-tab-item"
          :class="{ active: activeSeries === '' }"
          @click="activeSeries = ''"
        >
          <text>全部系列</text>
        </view>
        <view
          v-for="item in uiCategories.series"
          :key="item"
          class="series-tab-item"
          :class="{ active: activeSeries === item }"
          @click="selectSeries(item)"
        >
          <text>{{ item }}</text>
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
            v-for="name in uiCategories.centralSide"
            :key="name"
            class="sidebar-item"
            :class="{ active: activeSideCategory === name }"
            @click="activeSideCategory = name"
          >
            <view class="active-bar" />
            <text>{{ name }}</text>
          </view>
        </scroll-view>

        <!-- 右侧商品列表 -->
        <scroll-view class="product-scroll" scroll-y>
          <view v-if="filteredProducts.length" class="product-list-container">
            <view
              v-for="product in filteredProducts"
              :key="product.id"
              class="series-product-card"
              @click="openPage('/pages/product/detail', { id: product.id })"
            >
              <image class="product-img" :src="product.image" mode="aspectFit" />
              <view class="product-info">
                <view class="model-row">
                  <text class="model-name">{{ product.model }}</text>
                  <text v-if="product.tag" class="tag-badge red">{{ product.tag }}</text>
                  <text v-if="product.greenTag" class="tag-badge green">{{ product.greenTag }}</text>
                </view>
                <text class="product-name-sub">{{ product.name }}</text>
                <text class="spec-line">{{ (product.specs || []).slice(0, 2).join(' | ') }}</text>
                <view class="price-action-row">
                  <view class="price-wrap">
                    <text class="price-symbol">¥</text>
                    <text class="price-num">{{ formatPrice(product.price) }}</text>
                  </view>
                  <button class="btn-add" @click.stop="addToSolution(product)">+ 加入报价单</button>
                </view>
              </view>
            </view>
          </view>

          <view v-else class="empty-state">
            <up-icon name="info-circle" size="48" color="#b7c5d8" />
            <text class="empty-title">未找到匹配的型号</text>
            <text class="empty-sub">可尝试清除搜索词或切换系列与设备分类</text>
            <button class="btn-reset" @click="resetFilters">重置筛选</button>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { uiCategories, uiProducts } from '@/mock/ui-fixtures';

const pageOptions = getPageOptions();
const isHome = computed(() => pageOptions.type === 'home');
const searchKeyword = ref('');
const activeType = ref('multi');
const activeSeries = ref('');
const activeSideCategory = ref('全部');

const activeTypeName = computed(() => {
  const current = uiCategories.central.find((item) => item.id === activeType.value);
  return current ? current.name : '多联机';
});

const selectType = (typeId) => {
  activeType.value = typeId;
};

const selectSeries = (seriesName) => {
  activeSeries.value = activeSeries.value === seriesName ? '' : seriesName;
};

const resetFilters = () => {
  searchKeyword.value = '';
  activeSeries.value = '';
  activeSideCategory.value = '全部';
};

const filteredProducts = computed(() => {
  return uiProducts.filter((item) => {
    // 筛选只展示空调类
    if (item.category === 'wall' || item.category === 'cabinet') {
      return false;
    }

    // 系列筛选
    if (activeSeries.value && item.series && item.series !== activeSeries.value) {
      return false;
    }

    // 侧边栏设备类型筛选
    if (activeSideCategory.value && activeSideCategory.value !== '全部' && item.subCategory) {
      if (item.subCategory !== activeSideCategory.value) {
        return false;
      }
    }

    // 关键词搜索
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.trim().toLowerCase();
      const combined = `${item.model || ''} ${item.name || ''} ${item.series || ''} ${item.subCategory || ''} ${(item.specs || []).join(' ')}`.toLowerCase();
      if (!combined.includes(kw)) {
        return false;
      }
    }

    return true;
  });
});

const formatPrice = (val) => Number(val || 0).toLocaleString();

const addToSolution = (product) => {
  uni.setStorageSync('pendingSolutionProduct', {
    id: product.id,
    name: product.name,
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

.crumb {
  padding: 14rpx 28rpx 10rpx;
  color: #647389;
  font-size: 25rpx;
}

.crumb text:nth-child(even) {
  color: #a4b0c3;
  margin: 0 4rpx;
}

.category-search-box {
  padding: 8rpx 24rpx 16rpx;
}

.design-search {
  display: flex;
  align-items: center;
  height: 76rpx;
  padding: 0 26rpx;
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

.placeholder {
  color: #9aa5b5;
}

.type-tabs-scroll {
  display: flex;
  padding: 0 24rpx 16rpx;
  gap: 16rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.type-tab-item {
  padding: 14rpx 30rpx;
  border-radius: 32rpx;
  background: #fff;
  color: #556275;
  font-size: 27rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 14rpx rgba(23, 35, 61, 0.04);
  transition: all 0.2s ease;
}

.type-tab-item.active {
  background: #2468e8;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 6rpx 20rpx rgba(36, 104, 232, 0.32);
}

.series-tabs-scroll {
  display: flex;
  padding: 0 24rpx 18rpx;
  gap: 14rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.series-tab-item {
  padding: 10rpx 24rpx;
  border-radius: 26rpx;
  background: #e8eff8;
  color: #556379;
  font-size: 24rpx;
  font-weight: 600;
  transition: all 0.2s ease;
}

.series-tab-item.active {
  background: #dbe8ff;
  color: #2468e8;
  font-weight: 700;
}

.central-category-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.category-body {
  flex: 1;
  display: flex;
  min-height: 0;
  background: #fff;
  border-top: 1rpx solid #eef2f8;
}

.category-sidebar {
  width: 196rpx;
  background: #f7f9fc;
  border-right: 1rpx solid #edf1f7;
  height: 100%;
}

.sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 98rpx;
  padding-left: 28rpx;
  color: #556275;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sidebar-item.active {
  background: #fff;
  color: #2468e8;
  font-weight: 700;
}

.sidebar-item .active-bar {
  display: none;
  position: absolute;
  left: 0;
  top: 24rpx;
  bottom: 24rpx;
  width: 8rpx;
  border-radius: 0 6rpx 6rpx 0;
  background: #2468e8;
}

.sidebar-item.active .active-bar {
  display: block;
}

.product-scroll {
  flex: 1;
  height: 100%;
  background: #f4f7fc;
}

.product-list-container {
  padding: 18rpx 20rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.series-product-card {
  display: flex;
  align-items: center;
  padding: 22rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.product-img {
  width: 148rpx;
  height: 148rpx;
  margin-right: 20rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.model-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.model-name {
  color: #17233d;
  font-size: 31rpx;
  font-weight: 900;
}

.tag-badge {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 21rpx;
  font-weight: 700;
}

.tag-badge.red {
  background: #fff0ed;
  color: #ef543f;
}

.tag-badge.green {
  background: #e9f8f0;
  color: #2fa777;
}

.product-name-sub {
  display: block;
  margin-top: 6rpx;
  color: #5c6a80;
  font-size: 25rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.spec-line {
  display: block;
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 23rpx;
}

.price-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  color: #ef543f;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: 700;
}

.price-num {
  font-size: 34rpx;
  font-weight: 900;
  margin-left: 2rpx;
}

.btn-add {
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
  background: #2468e8;
  color: #fff;
  font-size: 23rpx;
  font-weight: 700;
  line-height: 56rpx;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.28);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  text-align: center;
}

.empty-title {
  margin-top: 24rpx;
  color: #586477;
  font-size: 30rpx;
  font-weight: 700;
}

.empty-sub {
  margin-top: 10rpx;
  color: #929fb2;
  font-size: 24rpx;
  line-height: 36rpx;
}

.btn-reset {
  margin-top: 32rpx;
  padding: 0 36rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: #2468e8;
  color: #fff;
  font-size: 24rpx;
  line-height: 64rpx;
}

/* 家用空调选型入口样式 */
.home-category {
  padding: 18rpx 24rpx;
}

.home-category__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 260rpx;
  margin-top: 24rpx;
  padding: 36rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 28rpx rgba(23, 35, 61, 0.05);
}

.home-category__card:first-of-type {
  background: linear-gradient(135deg, #e4f2ff 0%, #f1f8ff 100%);
}

.home-category__card:last-of-type {
  background: linear-gradient(135deg, #e4f8ed 0%, #f2fcf6 100%);
}

.home-category__info {
  flex: 1;
}

.home-category__title {
  display: block;
  color: #17233d;
  font-size: 36rpx;
  font-weight: 900;
}

.home-category__desc {
  display: block;
  margin-top: 12rpx;
  color: #647389;
  font-size: 25rpx;
}

.home-category__badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 36rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.85);
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
}

.home-category__card image {
  width: 220rpx;
  height: 220rpx;
  margin-left: 20rpx;
}
</style>
